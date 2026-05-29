import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
    emitNewMessage,
    updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";

export const sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content, conversationId } = req.body;
        const senderId = req.user._id;

        let conversation;

        if (!content) {
            return res.status(400).json({ message: "Thiếu nội dung" });
        }

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }
        if (!conversation) {
            conversation = await Conversation.create({
                type: "direct",
                participants: [
                    { userId: senderId, joinedAt: new Date() },
                    { userId: recipientId, joinedAt: new Date() },
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map(), // khởi tạo unreadCounts là một Map rỗng, sẽ được cập nhật sau khi tạo tin nhắn đầu tiên
            });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId,
            content,
            deleted_at: null,
            deleted_by: null
        });

        // để đảm bảo tính nhất quán, sau khi tạo tin nhắn mới, sẽ cập nhật lại thông tin của conversation như lastMessage, lastMessageAt và seenBy, đồng thời tăng số lượng tin nhắn chưa đọc cho tất cả người tham gia trừ người gửi. Sau đó lưu lại conversation để cập nhật vào cơ sở dữ liệu
        updateConversationAfterCreateMessage(conversation, message, senderId);
        await conversation.save();
        // sau khi đã cập nhật xong conversation, sẽ phát sự kiện "newMessage" qua socket.io để thông báo cho tất cả người tham gia trong conversation về tin nhắn mới vừa được tạo
        emitNewMessage(io, conversation, message);

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user._id;
        const conversation = req.conversation;

        if (!content) {
            return res.status(400).json("Thiếu nội dung");
        }

        const message = await Message.create({
            conversationId,
            senderId,
            content,
            delete_at: null,
            delete_by: null

        });

        updateConversationAfterCreateMessage(conversation, message, senderId);

        await conversation.save();
        emitNewMessage(io, conversation, message); // sau khi đã cập nhật xong conversation, sẽ phát sự kiện "newMessage" qua socket.io để thông báo cho tất cả người tham gia trong conversation về tin nhắn mới vừa được tạo

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
export const retrieveMessage = async (req, res) => {
    try {
        const messageId = req.body.messageId
        const userId = req.user._id;
        if (!messageId) {
            return res.status(400).json({ message: "Thiếu id message", id: messageId })
        }
        // Tìm tin nhắn
        const message = await Message.findById(messageId)
        if (!message) {
            return res.status(404).json({ message: "Tin nhắn không tồn tại" })
        }


        // Kiểm tra đã bị thu hồi chưa
        if (message.deleted_at && message.deleted_at !== null) {
            return res.status(400).json({ message: "Tin nhắn đã được thu hồi trước đó" })
        }

        // Chỉ người gửi mới được thu hồi
        if (message.senderId?.toString() !== userId?.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền thu hồi tin nhắn này" })
        }

        // Soft delete
        message.deleted_at = new Date()
        message.deleted_by = userId
        await message.save()
        console.log("message: ", message)

        const conversation = await Conversation.findOneAndUpdate(
            {
                _id: message.conversationId,
                "lastMessage._id": message._id,
            },
            {
                $set: {
                    "lastMessage.deleted_at": message.deleted_at,
                    "lastMessage.deleted_by": message.deleted_by,

                },
            },
            { new: true }
        )
        // TODO: emit socket event để người nhận thấy tin bị thu hồi realtime
        const convoId = message.conversationId.toString()
        const isRevokeLastMessage = conversation ? true : false
        io.to(message.conversationId.toString()).emit("retrieve-message", { message, lastMessage: conversation?.lastMessage ?? null, isRevokeLastMessage })

        return res.status(200).json({ message: "Thu hồi tin nhắn thành công" })
    } catch (error) {
        console.log("error: ", error)
        return res.status(500).json({ message: "Lỗi hệ thống" });

    }
}