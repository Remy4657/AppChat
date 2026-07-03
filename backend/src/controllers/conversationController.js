import { io } from "../socket/index.js";
import Conversation from "../models/Conversation.js";
import { BadRequestError } from "../core/error.response.js";
import SuccessResponse from "../core/success.response.js";
import * as conversationService from "../services/conversationService.js";

export const createConversation = async (req, res) => {

    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
        !type ||
        (type === "group" && !name) ||
        !memberIds ||
        !Array.isArray(memberIds) ||
        memberIds.length === 0
    ) {
        throw new BadRequestError("Tên nhóm và danh sách thành viên là bắt buộc")
    }

    const { conversation, isExistConversation } = await conversationService.createConversation({
        type,
        name,
        memberIds,
        userId,
    });
    if (type === "group") {
        memberIds.forEach((userId) => {
            io.to(userId).emit("new-group", conversation); // sau khi tạo xong cuộc trò chuyện nhóm mới, sẽ phát sự kiện "new-group" qua Socket.IO đến tất cả thành viên trong nhóm (bao gồm cả người tạo nhóm) để thông báo về cuộc trò chuyện nhóm mới vừa được tạo và gửi kèm thông tin chi tiết của conversation đã được format để các client có thể cập nhật giao diện người dùng tương ứng.
        });
    }
    if (type === "direct") {
        io.to(userId).emit("new-group", conversation);
        io.to(memberIds[0]).emit("new-group", conversation);
    }
    SuccessResponse.created(res, null, null, { conversation, isExistConversation });

};

export const getConversations = async (req, res) => {
    const userId = req.user._id;
    const { conversations } = await conversationService.getConversations(userId);
    SuccessResponse.ok(res, null, null, { conversations });

};

export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const { messages, nextCursor } = await conversationService.getMessages({ conversationId, limit, cursor });

    SuccessResponse.ok(res, null, null, { messages, nextCursor });

};


export const markAsSeen = async (req, res) => {

    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId).lean();

    if (!conversation) {
        throw new BadRequestError("Conversation không tồn tại")
    }

    const last = conversation.lastMessage;

    if (!last) {
        throw new BadRequestError("Không có tin nhắn để mark as seen")
    }
    // cái event socket "new-mesage" được phát ra mỗi khi có một tin nhắn mới được tạo trong một cuộc trò chuyện thì tất cả người tham gia nên nhận được kể cả bản thân người gửi nên cần kiểm tra nếu người gửi là chính họ (chính là người xem) thì không cần phải mark as seen
    if (last.senderId.toString() === userId) {
        throw new BadRequestError("Sender không cần mark as seen")
    }

    const updated = await Conversation.findByIdAndUpdate(
        conversationId,
        {
            $addToSet: { seenBy: userId },
            $set: { [`unreadCounts.${userId}`]: 0 },
        },
        {
            new: true,
        },
    );
    const { conversationUpdated } = await conversationService.markAsSeen({ conversationId, userId });
    // sau khi đã cập nhật thông tin seenBy và unreadCounts trong conversation, sẽ phát sự kiện "read-message" qua Socket.IO đến tất cả người tham gia trong conversation để thông báo rằng tin nhắn đã được xem. Sự kiện này sẽ bao gồm thông tin về conversation đã được cập nhật và thông tin về lastMessage để các client có thể cập nhật giao diện người dùng tương ứng.
    io.to(conversationId).emit("read-message", {
        conversation: conversationUpdated,
        lastMessage: {
            _id: conversationUpdated?.lastMessage._id,
            content: conversationUpdated?.lastMessage.content,
            createdAt: conversationUpdated?.lastMessage.createdAt,
            sender: {
                _id: conversationUpdated?.lastMessage.senderId,
            },
        },
    });

    SuccessResponse.ok(res, null, "Marked as seen", {
        seenBy: conversationUpdated?.seenBy || [],
        myUnreadCount: conversationUpdated?.unreadCounts[userId] || 0,
    });

};