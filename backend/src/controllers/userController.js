import { BadRequestError } from "../core/error.response.js";
import SuccessResponse from "../core/success.response.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import User from "../models/User.js";

export const fetchMe = async (req, res) => {

    const user = req.user; // Thông tin người dùng đã được xác thực từ middleware
    const accessToken = req.headers.authorization?.split(" ")[1];
    //const accessToken = req.cookies?.accessToken
    SuccessResponse.ok(res, null, null, { user, accessToken });
}
export const searchUserByUsername = async (req, res) => {

    const { username } = req.query;

    if (!username || username.trim() === "") {
        throw new BadRequestError("Cần cung cấp username trong query.");
    }

    const user = await User.findOne({ username }).select(
        "_id displayname username avatarUrl"
    );
    SuccessResponse.ok(res, null, null, { user });
};
export const uploadAvatar = async (req, res) => {
    const file = req.file;
    const userId = req.user._id;

    if (!file) {
        throw new BadRequestError("No file uploaded");
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
        throw new BadRequestError("Avatar trả về null");
    }

    SuccessResponse.ok(res, null, null, { avatarUrl: updatedUser.avatarUrl });

};
