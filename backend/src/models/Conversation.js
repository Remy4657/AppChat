import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        _id: false,
    }
);

const lastMessageSchema = new mongoose.Schema(
    {
        _id: { type: String },
        content: {
            type: String,
            default: null,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        createdAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false, // không tạo _id cho subdocument này vì nó chỉ lưu thông tin tóm tắt của tin nhắn cuối cùng, không cần thiết phải có _id riêng biệt
    }
);

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["direct", "group"],
            required: true,
        },
        participants: {
            type: [participantSchema],
            required: true,
        },
        group: {
            type: groupSchema,
        },
        lastMessageAt: {
            type: Date,
        },
        // đây là mảng userId của những người đã xem tin nhắn cuối cùng, dùng để xác định xem người dùng nào đã đọc tin nhắn mới nhất và cập nhật số lượng tin nhắn chưa đọc cho từng người tham gia
        seenBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: lastMessageSchema, // 
            default: null,
        },
        // lưu số lượng tin nhắn chưa đọc của từng người tham gia, key là userId và value là số lượng tin nhắn chưa đọc. Mỗi khi có tin nhắn mới, sẽ tăng số lượng này lên 1 cho tất cả người tham gia trừ người gửi, và khi người dùng xem tin nhắn, sẽ reset về 0
        unreadCounts: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({
    "participant.userId": 1,
    lastMessageAt: -1,
}); // tạo index để tối ưu truy vấn conversation theo participant.userId và sắp xếp theo lastMessageAt mới nhất lên đầu

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;