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