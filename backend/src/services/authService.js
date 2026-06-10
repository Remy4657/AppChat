import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "1d"; // thuờng là dưới 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const registerUser = async (data) => {

    const { username, email, firstname, lastname } = data;
    // check duplicate
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new Error("Username or email already exists");
    }

    // create user (password sẽ được hash trong schema)
    const user = await User.create({ ...data, displayname: `${lastname} ${firstname}` });

    // không trả password về client
    user.password = undefined;

    return user;
};
export const loginUser = async (data) => {

    const { username, password } = data;

    // check required fields
    if (!username || !password) {
        throw new Error("Missing username or password");
    }

    // find user by username
    const user = await User.findOne({ username });

    if (!user) {
        throw new Error("Invalid username or password");
    }

    // check password
    const isMatch = await bycrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid username or password");
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = crypto.randomBytes(64).toString("hex");
    // lưu refreshToken vào database để quản lý phiên đăng nhập
    await Session.create({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // 7 ngày
    });

    // không trả password về client
    user.password = undefined;

    return {
        accessToken,
        refreshToken
    };
};
export const loginGoogleUser = async (googleIdToken) => {
    //  Verify Google ID token
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await googleClient.verifyIdToken({
        idToken: googleIdToken,
        audience: process.env.GOOGLE_CLIENT_ID,  // đảm bảo token được cấp 
    });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Invalid Google token")
    }
    const { sub: googleId, email, name, given_name, picture } = payload;

    // Tìm hoặc tạo user
    const user = await findOrCreateUser({ googleId, email, name, picture });

    // Tạo access token 
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL,
    });
    const refreshToken = crypto.randomBytes(64).toString("hex");
    // lưu refreshToken vào database để quản lý phiên đăng nhập
    await Session.create({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // 7 ngày
    });

    return {
        accessToken,
        refreshToken
    };
}
export const logoutUser = async (refreshToken) => {
    await Session.findOneAndDelete({ refreshToken });
}

export const refreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Token không tồn tại");
    }
    const session = await Session.findOne({ refreshToken });

    if (!session || session.expiresAt < new Date()) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    const newAccessToken = jwt.sign({ userId: session.userId }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_TTL,
    });
    return { newAccessToken };

}
const findOrCreateUser = async ({ googleId, email, name, picture }) => {
    //  Tìm user bằng googleId (nhanh nhất)
    let user = await User.findOne({ googleId });
    if (user) {
        // Cập nhật thông tin mới nếu có thay đổi
        let updated = false;
        if (picture && user.avatarUrl !== picture) {
            user.avatarUrl = picture;
            updated = true;
        }
        if (name && user.displayname !== name) {
            user.displayname = name;
            updated = true;
        }
        if (updated) await user.save();
        return user;
    }

    //  Tìm bằng email (phòng trường hợp user đã đăng ký trước đó bằng email này)
    user = await User.findOne({ email });
    if (user) {
        // Nếu user chưa có googleId, gán vào (liên kết tài khoản)
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        return user;
    }

    //  Tạo user mới
    // Tạo username duy nhất từ email
    let baseUsername = email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .substring(0, 30);
    let username = baseUsername;
    let counter = 1;
    while (await User.exists({ username })) {
        username = `${baseUsername}_${counter}`;
        counter++;
    }

    // Tách firstname/lastname từ name
    const nameParts = name ? name.split(' ') : [];
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    user = new User({
        username,
        email,
        displayname: name || email.split('@')[0],
        firstname,
        lastname,
        avatarUrl: picture || '',
        googleId,
    });

    await user.save();
    return user;
}
