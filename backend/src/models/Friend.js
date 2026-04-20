import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        userA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userB: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
// dùng để đảm bảo rằng userA luôn có _id nhỏ hơn userB, giúp tránh việc lưu trữ trùng lặp (userA, userB) và (userB, userA) trong cơ sở dữ liệu.
friendSchema.pre("save", function async() {
    const a = this.userA.toString();
    const b = this.userB.toString();

    if (a > b) {
        this.userA = new mongoose.Types.ObjectId(b);
        this.userB = new mongoose.Types.ObjectId(a);
    }
});
// tạo index để đảm bảo rằng mỗi cặp bạn bè chỉ được lưu trữ một lần trong cơ sở dữ liệu, bất kể thứ tự của userA và userB.
friendSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;