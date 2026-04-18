import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true, // giúp tối ưu truy vấn tin nhắn theo conversationId. Ex: Message.find({ conversationId: "abc" })
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            trim: true,
        },
        imgUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ conversationId: 1, createdAt: -1 }); // tạo index để truy vấn tin nhắn theo conversationId và sắp xếp theo createdAt mới nhất lên đầu

const Message = mongoose.model("Message", messageSchema);

export default Message;