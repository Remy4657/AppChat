import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            maxlength: 300,
        },
    },
    {
        timestamps: true,
    }
);
// dùng để đảm bảo rằng mỗi cặp yêu cầu kết bạn chỉ được lưu trữ một lần trong cơ sở dữ liệu, bất kể thứ tự của from và to.
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
// tạo index để tối ưu hóa hiệu suất truy vấn khi tìm kiếm yêu cầu kết bạn dựa trên trường from hoặc to, giúp tăng tốc độ truy vấn khi người dùng muốn xem danh sách yêu cầu kết bạn đã gửi.
friendRequestSchema.index({ from: 1 });
// tạo index để tối ưu hóa hiệu suất truy vấn khi tìm kiếm yêu cầu kết bạn dựa trên trường to, giúp tăng tốc độ truy vấn khi người dùng muốn xem danh sách yêu cầu kết bạn đã nhận.
friendRequestSchema.index({ to: 1 });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
export default FriendRequest;