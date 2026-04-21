import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        firstName: {
            type: String,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
        },
        avatarUrl: {
            type: String, // link CDN để hiển thị hình
        },
        avatarId: {
            type: String, // Cloudinary public_id để xoá hình
        },
        bio: {
            type: String,
            maxlength: 500, // tuỳ
        },
        phone: {
            type: String,
            sparse: true, // cho phép null, nhưng không được trùng
        },
    },
    {
        timestamps: true, // thêm createdAt, updatedAt
    }
);

// hash password
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;