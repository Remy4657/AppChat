import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; // thuờng là dưới 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const registerUser = async (data) => {
    const { username, email } = data;

    // check duplicate
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new Error("Username or email already exists");
    }

    // create user (password sẽ được hash trong schema)
    const user = await User.create(data);

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

    await Session.create({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // 7 ngày
    });

    // không trả password về client
    user.password = undefined;

    return {
        user,
        accessToken,
        refreshToken
    };
};
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
