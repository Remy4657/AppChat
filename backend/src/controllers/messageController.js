import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
    emitNewMessage,
    updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";
import SuccessResponse from "../core/success.response.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../core/error.response.js";

export const sendDirectMessage = async (req, res) => {

    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;

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
    // sau khi đã cập nhật xong conversation, sẽ phát sự kiện "newMessage" qua socket.io để thông báo cho tất cả người tham gia trong conversation về tin nhắn mới vừa được tạo
    emitNewMessage(io, conversation, message);

    SuccessResponse.created(res, null, null, { message });

};
export const sendDirectImageMessage = async (req, res) => {

    const { recipientId, conversationId } = req.body;
    const senderId = req.user._id
    const file = req.file;

    if (!file) {
        throw new BadRequestError("Vui lòng chọn ảnh để gửi")
    }

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
    // sau khi đã cập nhật xong conversation, sẽ phát sự kiện "newMessage" qua socket.io để thông báo cho tất cả người tham gia trong conversation về tin nhắn mới vừa được tạo
    emitNewMessage(io, conversation, message);

    SuccessResponse.created(res, null, null, { message });

};

export const sendGroupMessage = async (req, res) => {

    const { conversationId, content } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content) {
        throw new BadRequestError("Thiếu nội dung");
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

    SuccessResponse.created(res, null, null, { message });

};
export const sendGroupImageMessage = async (req, res) => {
    const { conversationId } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    const file = req.file;

    if (!file) {
        throw new BadRequestError("Vui lòng chọn ảnh để gửi");
    }

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
    emitNewMessage(io, conversation, message); // sau khi đã cập nhật xong conversation, sẽ phát sự kiện "newMessage" qua socket.io để thông báo cho tất cả người tham gia trong conversation về tin nhắn mới vừa được tạo

    SuccessResponse.created(res, null, null, { message });

}
export const retrieveMessage = async (req, res) => {

    const messageId = req.body.messageId
    const userId = req.user._id;
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
    io.to(message.conversationId.toString()).emit("retrieve-message", { message, lastMessage: conversation?.lastMessage ?? null, isRevokeLastMessage })

    SuccessResponse.ok(res, null, "Thu hồi tin nhắn thành công")
}