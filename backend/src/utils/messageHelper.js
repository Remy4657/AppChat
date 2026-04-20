export const updateConversationAfterCreateMessage = (
    conversation,
    message,
    senderId
) => {
    conversation.set({
        seenBy: [], // cập nhật seenBy thành một mảng rỗng, có nghĩa là tất cả người tham gia đều chưa xem tin nhắn mới nhất
        lastMessageAt: message.createdAt,
        lastMessage: {
            _id: message._id,
            content: message.content,
            senderId,
            createdAt: message.createdAt,
        },
    });

    conversation.participants.forEach((p) => {
        const memberId = p.userId.toString();
        const isSender = memberId === senderId.toString();
        const prevCount = conversation.unreadCounts.get(memberId) || 0; // lấy số lượng tin nhắn chưa đọc hiện tại của người tham gia, nếu chưa có thì mặc định là 0
        conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1); // nếu người tham gia là người gửi thì reset về 0, ngược lại tăng lên 1 để phản ánh tin nhắn mới chưa được xem bởi người đó
    });
};

export const emitNewMessage = (io, conversation, message) => {
    io.to(conversation._id.toString()).emit("new-message", {
        message,
        conversation: {
            _id: conversation._id,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
        },
        unreadCounts: conversation.unreadCounts,
    });
};