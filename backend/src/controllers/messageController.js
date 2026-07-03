import {
    emitNewMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";
import SuccessResponse from "../core/success.response.js";
import { BadRequestError } from "../core/error.response.js";
import * as messageService from "../services/messageService.js";

export const sendDirectMessage = async (req, res) => {
    const { recipientId, content, conversationId } = req.body;
    const senderId = req.user._id;
    const { message, conversation } = await messageService.sendDirectMessage({ recipientId, content, conversationId, senderId });

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

    const { message, conversation } = await messageService.sendDirectImageMessage({ recipientId, conversationId, senderId, file });
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

    const { message } = await messageService.sendGroupMessage({ conversationId, content, senderId, conversation });

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

    const { message } = await messageService.sendGroupImageMessage({ conversationId, senderId, conversation, file });
    emitNewMessage(io, conversation, message); // sau khi đã cập nhật xong conversation, sẽ phát sự kiện "newMessage" qua socket.io để thông báo cho tất cả người tham gia trong conversation về tin nhắn mới vừa được tạo

    SuccessResponse.created(res, null, null, { message });

}
export const retrieveMessage = async (req, res) => {

    const messageId = req.body.messageId
    const userId = req.user._id;

    const { message, conversation, isRevokeLastMessage } = await messageService.retrieveMessage({ messageId, userId });
    io.to(message.conversationId.toString()).emit("retrieve-message", { message, lastMessage: conversation?.lastMessage ?? null, isRevokeLastMessage })

    SuccessResponse.ok(res, null, "Thu hồi tin nhắn thành công")
}