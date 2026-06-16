import { io } from "../socket/index.js";
import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body;

        const from = req.user._id.toString();

        if (from === to) {
            return res
                .status(400)
                .json({ message: "Không thể gửi lời mời kết bạn cho chính mình" });
        }

        const userExists = await User.exists({ _id: to });

        if (!userExists) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        let userA = from.toString();
        let userB = to.toString();

        // đảm bảo userA luôn có _id nhỏ hơn userB để tránh trùng lặp trong cơ sở dữ liệu
        if (userA > userB) {
            [userA, userB] = [userB, userA];
        }

        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({ userA, userB }),
            // kiểm tra xem đã tồn tại lời mời kết bạn nào giữa hai người dùng hay chưa, bất kể thứ tự của from và to
            FriendRequest.findOne({
                $or: [
                    { from, to },
                    { from: to, to: from },
                ],
            }),
        ]);

        if (alreadyFriends) {
            return res.status(400).json({ message: "Hai người đã là bạn bè" });
        }
        if (existingRequest) {
            return res.status(400).json({ message: "Đã có lời mời kết bạn đang chờ" });
        }

        const detailedTo = await User.findById(to)
            .lean();
        const detailedFrom = await User.findById(from)
            .lean();

        const notificationContent = `${detailedFrom.displayname || detailedFrom.username} đã gửi lời mời kết bạn.`;

        const notication = await Notification.create({
            userId: to,
            actorId: from,
            content: notificationContent,
            type: 'friend_request',
            is_read: false
        });

        const createdRequest = await FriendRequest.create({
            from,
            to,
            notification_id: notication._id,
            message,
        });

        const resultRequestTo = await FriendRequest.findById(createdRequest._id)
            .populate("to", "_id username displayname avatarUrl")
            .lean();

        const resultRequestFrom = await FriendRequest.findById(createdRequest._id)
            .populate("from", "_id username displayname avatarUrl")
            .lean();

        io.to(to.toString()).emit("send-request-friend", { ...resultRequestFrom, is_read: false, message: notificationContent })

        return res
            .status(201)
            .json({ message: "Gửi lời mời kết bạn thành công", resultRequestTo });
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId)
            .populate("from", "_id displayname username")
            .populate("to", "_id displayname username")

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
        }
        // kiểm tra xem người dùng hiện tại có phải là người nhận lời mời kết bạn hay không, nếu không phải thì trả về lỗi 403 Forbidden
        if (request.to._id.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ message: "Bạn không có quyền chấp nhận lời mời này" });
        }

        await Friend.create({
            userA: request.from._id,
            userB: request.to._id,
        });
        const notificationContent = `${request.to.displayname || request.to.username} đã chấp nhận lời mời kết bạn của bạn.`;

        const notification = await Notification.create({
            userId: request.from._id,
            actorId: request.to._id,
            type: 'friend_accept',
            content: notificationContent,
            is_read: false
        });
        const { userId: x, actorId: y, ...rest } = notification.toObject()


        await FriendRequest.findByIdAndDelete(requestId);

        io.to(request.from._id.toString()).emit("accept-request-friend", userId.toString(), { ...rest, message: rest.content })

        return res.status(200).json({
            message: "Chấp nhận lời mời kết bạn thành công",
            newFriend: {
                _id: request.from?._id,
                displayname: request.from?.displayname,
                avatarUrl: request.from?.avatarUrl,
            },
        });
    } catch (error) {
        console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId).populate("from", "_id username displayname avatarUrl").lean()

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
        }
        // kiểm tra xem người dùng hiện tại có phải là người nhận lời mời kết bạn hay không, nếu không phải thì trả về lỗi 403 Forbidden
        if (request.to.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ message: "Bạn không có quyền từ chối lời mời này" });
        }

        await FriendRequest.findByIdAndDelete(requestId);
        // thông báo cho người gửi là từ chối kết bạn
        io.to(request.from._id.toString()).emit("decline-request-friend", userId.toString())

        return res.status(200).json({ requestFrom: { ...request.from, _id: request.from._id.toString() } });
    } catch (error) {
        console.error("Lỗi khi từ chối lời mời kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        // tìm tất cả các mối quan hệ bạn bè mà người dùng hiện tại tham gia, bất kể họ là userA hay userB trong mô hình Friend. 
        // Sau đó, sử dụng phương thức populate để lấy thông tin chi tiết của cả hai người dùng trong mỗi mối quan hệ bạn bè, nhưng chỉ lấy những trường cần thiết như _id, displayname, avatarUrl và username.
        const friendships = await Friend.find({
            $or: [
                {
                    userA: userId,
                },
                {
                    userB: userId,
                },
            ],
        })
            .populate("userA", "_id displayname avatarUrl username") // pôplate để lấy thông tin chi tiết của người dùng trong mỗi mối quan hệ bạn bè, nhưng chỉ lấy những trường cần thiết như _id, displayname, avatarUrl và username. 
            .populate("userB", "_id displayname avatarUrl username")
            .lean(); // trả về plain JavaScript objects thay vì Mongoose documents

        if (!friendships.length) {
            return res.status(200).json({ friends: [] });
        }

        const friends = friendships.map((f) =>
            f.userA._id.toString() === userId.toString() ? f.userB : f.userA // xác định người bạn trong mỗi mối quan hệ bạn bè bằng cách so sánh _id của userA và userB với _id của người dùng hiện tại. Nếu userA có _id trùng với người dùng hiện tại, thì người bạn sẽ là userB, ngược lại sẽ là userA.
        );

        return res.status(200).json({ friends });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const populateFields = "_id username displayname avatarUrl";

        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate("to", populateFields), // populate để lấy thông tin chi tiết của người nhận lời mời kết bạn, nhưng chỉ lấy những trường cần thiết như _id, displayname, avatarUrl và username.
            FriendRequest.find({ to: userId })
                .populate("from", populateFields).populate("notification_id", "content is_read")
                .lean()
                .then(requests => {
                    return requests.map(r => {
                        const { notification_id, ...rest } = r;
                        return {
                            ...rest,
                            message: notification_id?.content,
                            is_read: notification_id?.is_read,
                        };
                    })
                })
        ]);

        // Lấy danh sách bạn bè hiện tại của userId
        const friendships = await Friend.find({
            $or: [{ userA: userId }, { userB: userId }]
        });

        // Tạo Set chứa _id của những người là bạn với userId
        const friendSet = new Set(
            friendships.map(f =>
                f.userA.toString() === userId.toString() ? f.userB.toString() : f.userA.toString()
            )
        );

        // Lấy tất cả user, trừ chính userId
        const allUsers = await User.find({ _id: { $ne: userId } }).select(populateFields).lean();

        // Tạo Map để tra cứu nhanh
        const sentMap = new Map(); // key = to userId, value = true

        sent.forEach(req => sentMap.set(req.to._id.toString(), true));

        const receivedMap = new Map(); // key = from userId, value = true
        received.forEach(req => receivedMap.set(req.from._id.toString(), true));

        // Gắn flag cho từng user
        const usersWithFlags = allUsers.map(user => ({
            ...user, // since we're using .lean(), 'user' is already a plain object
            isSentRequest: sentMap.has(user._id.toString()) || false,
            isReceivedRequest: receivedMap.has(user._id.toString()) || false,
            isFriend: friendSet.has(user._id.toString()) || false // kiểm tra xem user có phải là bạn của userId hay không bằng cách kiểm tra xem _id của user có tồn tại trong friendSet hay không. Nếu tồn tại, thì gắn isFriend là true, ngược lại là false.
        }));

        res.status(200).json({ sent, received, allUsers: usersWithFlags });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};