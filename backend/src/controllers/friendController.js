import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body;

        const from = req.user._id;

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

        const request = await FriendRequest.create({
            from,
            to,
            message,
        });

        return res
            .status(201)
            .json({ message: "Gửi lời mời kết bạn thành công", request });
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
        }
        // kiểm tra xem người dùng hiện tại có phải là người nhận lời mời kết bạn hay không, nếu không phải thì trả về lỗi 403 Forbidden
        if (request.to.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ message: "Bạn không có quyền chấp nhận lời mời này" });
        }

        const friend = await Friend.create({
            userA: request.from,
            userB: request.to,
        });

        await FriendRequest.findByIdAndDelete(requestId);

        const from = await User.findById(request.from)
            .select("_id displayName avatarUrl")
            .lean();

        return res.status(200).json({
            message: "Chấp nhận lời mời kết bạn thành công",
            newFriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl,
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

        const request = await FriendRequest.findById(requestId);

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

        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi từ chối lời mời kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id;
        // tìm tất cả các mối quan hệ bạn bè mà người dùng hiện tại tham gia, bất kể họ là userA hay userB trong mô hình Friend. 
        // Sau đó, sử dụng phương thức populate để lấy thông tin chi tiết của cả hai người dùng trong mỗi mối quan hệ bạn bè, nhưng chỉ lấy những trường cần thiết như _id, displayName, avatarUrl và username.
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
            .populate("userA", "_id displayName avatarUrl username") // pôplate để lấy thông tin chi tiết của người dùng trong mỗi mối quan hệ bạn bè, nhưng chỉ lấy những trường cần thiết như _id, displayName, avatarUrl và username. 
            .populate("userB", "_id displayName avatarUrl username")
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

        const populateFields = "_id username displayName avatarUrl";

        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate("to", populateFields), // populate để lấy thông tin chi tiết của người nhận lời mời kết bạn, nhưng chỉ lấy những trường cần thiết như _id, displayName, avatarUrl và username.
            FriendRequest.find({ to: userId }).populate("from", populateFields),
        ]);

        res.status(200).json({ sent, received });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu kết bạn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};