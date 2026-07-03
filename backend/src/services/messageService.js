import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
    updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../core/error.response.js";


export const sendDirectMessage = async (data) => {
    const { recipientId, content, conversationId, senderId } = data;

    let conversation;

    if (!content) {
        throw new BadRequestError("Thiếu nội dung")
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

    return { message, conversation };
}
export const sendDirectImageMessage = async (data) => {
    const { recipientId, conversationId, senderId, file } = data;

    const result = await uploadImageFromBuffer(file.buffer); // Sử dụng hàm uploadImageFromBuffer để upload ảnh từ buffer

    let conversation;

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
        content: '',  // text có thể rỗng
        imgUrl: result.secure_url,
        deleted_at: null,
        deleted_by: null
    });
    // để đảm bảo tính nhất quán, sau khi tạo tin nhắn mới, sẽ cập nhật lại thông tin của conversation như lastMessage, lastMessageAt và seenBy, đồng thời tăng số lượng tin nhắn chưa đọc cho tất cả người tham gia trừ người gửi. Sau đó lưu lại conversation để cập nhật vào cơ sở dữ liệu
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    return { message, conversation };
}
export const sendGroupMessage = async (data) => {
    const { conversationId, content, senderId, conversation } = data;

    const message = await Message.create({
        conversationId,
        senderId,
        content,
        delete_at: null,
        delete_by: null

    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    return { message, conversation };
}
export const sendGroupImageMessage = async (data) => {
    const { conversationId, senderId, conversation, file } = data;
    const result = await uploadImageFromBuffer(file.buffer);

    const message = await Message.create({
        conversationId,
        senderId,
        content: '',
        imgUrl: result.secure_url,
        deleted_at: null,
        deleted_by: null
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    return { message, conversation };
}
export const retrieveMessage = async (data) => {
    const { messageId, userId } = data;

    if (!messageId) {
        throw new BadRequestError("Thiếu id message")
    }
    // Tìm tin nhắn
    const message = await Message.findById(messageId)
    if (!message) {
        throw new NotFoundError("Tin nhắn không tồn tại")
    }


    // Kiểm tra đã bị thu hồi chưa
    if (message.deleted_at && message.deleted_at !== null) {
        throw new BadRequestError("Tin nhắn đã được thu hồi trước đó")
    }

    // Chỉ người gửi mới được thu hồi
    if (message.senderId?.toString() !== userId?.toString()) {
        throw new ForbiddenError("Bạn không có quyền thu hồi tin nhắn này")
    }

    // Soft delete
    message.deleted_at = new Date()
    message.deleted_by = userId
    await message.save()

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
    return { message, conversation, convoId, isRevokeLastMessage };
}