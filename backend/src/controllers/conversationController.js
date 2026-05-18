import { io } from "../socket/index.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const createConversation = async (req, res) => {
    try {
        const { type, name, memberIds } = req.body;
        const userId = req.user._id;

        if (
            !type ||
            (type === "group" && !name) ||
            !memberIds ||
            !Array.isArray(memberIds) ||
            memberIds.length === 0
        ) {
            return res
                .status(400)
                .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" });
        }

        let conversation;

        if (type === "direct") {
            const participantId = memberIds[0]; // đối với cuộc trò chuyện trực tiếp, chỉ có một participantId duy nhất trong mảng memberIds, đại diện cho người mà người dùng hiện tại muốn trò chuyện cùng
            // kiểm tra xem đã tồn tại cuộc trò chuyện nào giữa hai người dùng hay chưa trước khi tạo mới. 
            //Nếu đã tồn tại, sẽ sử dụng lại cuộc trò chuyện đó thay vì tạo một cuộc trò chuyện mới.
            conversation = await Conversation.findOne({
                type: "direct",
                "participants.userId": { $all: [userId, participantId] },
            });
            // đối với cuộc trò chuyện trực tiếp, sẽ kiểm tra xem đã tồn tại cuộc trò chuyện nào giữa hai người dùng hay chưa
            // bằng cách tìm kiếm trong cơ sở dữ liệu với điều kiện type là "direct" và participants.userId chứa cả userId và 
            //participantId. Nếu đã tồn tại, sẽ sử dụng lại cuộc trò chuyện đó, nếu chưa tồn tại, 
            //sẽ tạo một cuộc trò chuyện mới với hai người tham gia và lưu vào cơ sở dữ liệu.
            if (!conversation) {
                conversation = new Conversation({
                    type: "direct",
                    participants: [{ userId }, { userId: participantId }],
                    lastMessageAt: new Date(),
                });

                await conversation.save();
            }
        }

        if (type === "group") {
            conversation = new Conversation({
                type: "group",
                participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))],// đối với cuộc trò chuyện nhóm, sẽ tạo một cuộc trò chuyện mới với tất cả memberId trong memberIds cộng thêm userId của người tạo nhóm làm participants, đồng thời lưu thông tin tên nhóm và người tạo nhóm vào trường group của conversation, sau đó lưu vào cơ sở dữ liệu.
                group: {
                    name,
                    createdBy: userId,
                },
                lastMessageAt: new Date(),
            });

            await conversation.save();
        }

        if (!conversation) {
            return res.status(400).json({ message: "Conversation type không hợp lệ" });
        }
        // populate để lấy thông tin chi tiết của participants, seenBy và lastMessage.senderId trong conversation trước khi trả về cho client.
        await conversation.populate([
            { path: "participants.userId", select: "username displayname avatarUrl" },
            {
                path: "seenBy",
                select: "username displayname avatarUrl",
            },
            { path: "lastMessage.senderId", select: "username displayname avatarUrl" },
        ]);

        const participants = (conversation.participants || []).map((p) => ({
            _id: p.userId?._id,
            displayname: p.userId?.displayname,
            username: p.userId?.username,
            avatarUrl: p.userId?.avatarUrl ?? null,
            joinedAt: p.joinedAt,
        }));

        const formatted = { ...conversation.toObject(), participants };
        if (type === "group") {
            memberIds.forEach((userId) => {
                io.to(userId).emit("new-group", formatted); // sau khi tạo xong cuộc trò chuyện nhóm mới, sẽ phát sự kiện "new-group" qua Socket.IO đến tất cả thành viên trong nhóm (bao gồm cả người tạo nhóm) để thông báo về cuộc trò chuyện nhóm mới vừa được tạo và gửi kèm thông tin chi tiết của conversation đã được format để các client có thể cập nhật giao diện người dùng tương ứng.
            });
        }

        if (type === "direct") {
            io.to(userId).emit("new-group", formatted);
            io.to(memberIds[0]).emit("new-group", formatted);
        }
        return res.status(201).json({ conversation: formatted });
    } catch (error) {
        console.error("Lỗi khi tạo conversation", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Conversation.find({
            "participants.userId": userId,
        })
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .populate({
                path: "participants.userId",
                select: "username displayname avatarUrl",
            })
            .populate({
                path: "lastMessage.senderId",
                select: "username displayname avatarUrl",
            })
            .populate({
                path: "seenBy",
                select: "username displayname avatarUrl",
            });

        const formatted = conversations.map((convo) => {
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId?._id,
                displayname: p.userId?.displayname,
                username: p.userId?.username,
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt,
            }));

            return {
                ...convo.toObject(),
                unreadCounts: convo.unreadCounts || {},
                participants,
            };
        });

        return res.status(200).json({ conversations: formatted });
    } catch (error) {
        console.error("Lỗi xảy ra khi lấy conversations", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, cursor } = req.query;

        const query = { conversationId };
        // nếu có cursor được cung cấp trong query parameters, sẽ thêm điều kiện createdAt < cursor vào truy vấn để chỉ lấy những tin nhắn cũ hơn so với thời điểm được chỉ định bởi cursor
        if (cursor) {
            query.createdAt = { $lt: new Date(cursor) };
        }
        // để hỗ trợ phân trang, sẽ kiểm tra nếu có cursor được cung cấp trong query parameters, sẽ thêm điều kiện createdAt < cursor vào truy vấn để chỉ lấy những tin nhắn cũ hơn so với thời điểm được chỉ định bởi cursor. Điều này giúp client có thể tải thêm tin nhắn cũ hơn khi cuộn lên trên giao diện chat.
        let messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) + 1);

        let nextCursor = null;
        // để hỗ trợ phân trang, sẽ kiểm tra xem số lượng tin nhắn trả về có vượt quá limit đã định hay không. Nếu có, sẽ lấy createdAt của tin nhắn cuối cùng trong danh sách để làm nextCursor và loại bỏ tin nhắn đó khỏi kết quả trả về cho client. Điều này giúp client biết được nếu còn tin nhắn cũ hơn để tải thêm và sử dụng nextCursor để truy vấn tiếp tục.
        if (messages.length > Number(limit)) {
            const nextMessage = messages[messages.length - 1];
            nextCursor = nextMessage.createdAt.toISOString();
            messages.pop();
        }
        // để đảm bảo rằng các tin nhắn được trả về theo thứ tự từ cũ nhất đến mới nhất, sau khi truy vấn và sắp xếp các tin nhắn theo createdAt giảm dần (mới nhất trước), sẽ đảo ngược lại thứ tự của mảng messages trước khi trả về cho client. Điều này giúp client nhận được các tin nhắn theo đúng thứ tự thời gian mà chúng được tạo ra, từ cũ nhất đến mới nhất.
        messages = messages.reverse();

        return res.status(200).json({
            messages,
            nextCursor,
        });
    } catch (error) {
        console.error("Lỗi xảy ra khi lấy messages", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
// lấy danh sách tất cả các cuộc hộ thoại mà người dùng tham gia, trả về mảng các conversationId để sử dụng trong Socket.IO khi người dùng kết nối để tự động join vào các phòng tương ứng với các conversationId đó, giúp người dùng nhận được thông báo về tin nhắn mới hoặc cập nhật liên quan đến các cuộc hộ thoại mà họ tham gia.
export const getUserConversationsForSocketIO = async (userId) => {
    try {
        const conversations = await Conversation.find(
            { "participants.userId": userId },
            { _id: 1 }, // chỉ lấy trường _id của conversation 
        );

        return conversations.map((c) => c._id.toString()); // chuyển ObjectId thành string để dễ sử dụng trong Socket.IO
    } catch (error) {
        console.error("Lỗi khi fetch conversations: ", error);
        return [];
    }
};

export const markAsSeen = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id.toString();

        const conversation = await Conversation.findById(conversationId).lean();

        if (!conversation) {
            return res.status(404).json({ message: "Conversation không tồn tại" });
        }

        const last = conversation.lastMessage;

        if (!last) {
            return res.status(200).json({ message: "Không có tin nhắn để mark as seen" });
        }
        // cái event socket "new-mesage" được phát ra mỗi khi có một tin nhắn mới được tạo trong một cuộc trò chuyện thì tất cả người tham gia nên nhận được kể cả bản thân người gửi nên cần kiểm tra nếu người gửi là chính họ (chính là người xem) thì không cần phải mark as seen 
        if (last.senderId.toString() === userId) {
            return res.status(200).json({ message: "Sender không cần mark as seen" });
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
        // sau khi đã cập nhật thông tin seenBy và unreadCounts trong conversation, sẽ phát sự kiện "read-message" qua Socket.IO đến tất cả người tham gia trong conversation để thông báo rằng tin nhắn đã được xem. Sự kiện này sẽ bao gồm thông tin về conversation đã được cập nhật và thông tin về lastMessage để các client có thể cập nhật giao diện người dùng tương ứng.
        io.to(conversationId).emit("read-message", {
            conversation: updated,
            lastMessage: {
                _id: updated?.lastMessage._id,
                content: updated?.lastMessage.content,
                createdAt: updated?.lastMessage.createdAt,
                sender: {
                    _id: updated?.lastMessage.senderId,
                },
            },
        });

        return res.status(200).json({
            message: "Marked as seen",
            seenBy: updated?.seenBy || [],
            myUnreadCount: updated?.unreadCounts[userId] || 0,
        });
    } catch (error) {
        console.error("Lỗi khi mark as seen", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};