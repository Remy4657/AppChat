import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

const pair = (a, b) => (a < b ? [a, b] : [b, a]);

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();
        const recipientId = req.body?.recipientId ?? null;
        const memberIds = req.body?.memberIds ?? [];
        // kiểm tra xem có cung cấp recipientId (trường hợp gửi tin nhắn trực tiếp) hoặc memberIds (trường hợp tạo nhóm) hay không.
        //  nếu cả recipientId và memberIds đều không được cung cấp, trả về lỗi yêu cầu
        if (!recipientId && memberIds.length === 0) {
            return res
                .status(400)
                .json({ message: "Cần cung cấp recipientId hoặc memberIds" });
        }

        if (recipientId) {
            const [userA, userB] = pair(me, recipientId);

            const isFriend = await Friend.findOne({ userA, userB });

            if (!isFriend) {
                return res.status(403).json({ message: "Bạn chưa kết bạn với người này" });
            }

            return next();
        }
        // middleware cho trường hợp tạo nhóm, sẽ kiểm tra tất cả memberId trong memberIds để đảm bảo rằng tất cả đều là bạn bè của người dùng hiện tại.
        // đối với memberIds, sẽ tạo một mảng các Promise để kiểm tra từng memberId xem có phải là bạn bè của người dùng hiện tại hay không. Mỗi Promise sẽ trả về null nếu là bạn bè hoặc trả về memberId nếu không phải là bạn bè.
        const friendChecks = memberIds.map(async (memberId) => {
            const [userA, userB] = pair(me, memberId);
            const friend = await Friend.findOne({ userA, userB });
            return friend ? null : memberId;
        });
        // thực hiện tất cả các truy vấn kiểm tra bạn bè song song bằng Promise.all để tối ưu hiệu suất
        const results = await Promise.all(friendChecks);

        // lọc ra những memberId nào không phải là bạn bè (có giá trị khác null)
        const notFriends = results.filter(Boolean);
        //         nếu có bất kỳ memberId nào không phải là bạn bè, trả về lỗi với danh sách những memberId đó
        if (notFriends.length > 0) {
            return res
                .status(403)
                .json({ message: "Bạn chỉ có thể thêm bạn bè vào nhóm.", notFriends });
        }

        next();
    } catch (error) {
        console.error("Lỗi xảy ra khi checkFriendship:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const checkGroupMembership = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
        }

        const isMember = conversation.participants.some(
            (p) => p.userId.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: "Bạn không ở trong group này." });
        }

        req.conversation = conversation;

        next();
    } catch (error) {
        console.error("Lỗi checkGroupMembership:", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};