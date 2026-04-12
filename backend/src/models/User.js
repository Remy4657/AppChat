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

        firstName: {
            type: String,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true, // thêm createdAt, updatedAt
    }
);

// hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;