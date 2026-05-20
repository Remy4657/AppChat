import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";


export const fetchMe = async (req, res) => {
    try {
        const user = req.user; // Thông tin người dùng đã được xác thực từ middleware
        const accessToken = req.cookies?.accessToken
        return res.status(200).json({ user, accessToken });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}
export const searchUserByUsername = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username || username.trim() === "") {
            return res.status(400).json({ message: "Cần cung cấp username trong query." });
        }

        const user = await User.findOne({ username }).select(
            "_id displayname username avatarUrl"
        );

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Lỗi xảy ra khi searchUserByUsername", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
export const uploadAvatar = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user._id;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await uploadImageFromBuffer(file.buffer); // Sử dụng hàm uploadImageFromBuffer để upload ảnh từ buffer

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                avatarUrl: result.secure_url,
                avatarId: result.public_id,
            },
            {
                new: true,
            }
        ).select("avatarUrl");

        if (!updatedUser.avatarUrl) {
            return res.status(400).json({ message: "Avatar trả về null" });
        }

        return res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
    } catch (error) {
        console.error("Lỗi xảy ra khi upload avatar", error);
        return res.status(500).json({ message: "Upload failed" });
    }
};
