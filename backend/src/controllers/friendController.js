import { io } from "../socket/index.js";
import SuccessResponse from "../core/success.response.js";
import { BadRequestError } from "../core/error.response.js";
import * as friendService from "../services/friendService.js";

export const sendFriendRequest = async (req, res) => {

    const { to, message } = req.body;
    const from = req.user._id.toString();

    if (from === to) {
        throw new BadRequestError("Không thể gửi lời mời kết bạn cho chính mình")
    }


    const { resultRequestTo, resultRequestFrom, notificationContent } = await friendService.sendFriendRequest({ to, from, message });

    io.to(to.toString()).emit("send-request-friend", { ...resultRequestFrom, is_read: false, message: notificationContent })
    SuccessResponse.created(res, null, "Gửi lời mời kết bạn thành công", { resultRequestTo });

};

export const acceptFriendRequest = async (req, res) => {

    const { requestId } = req.params;
    const userId = req.user._id;

    const { friendRequest, formatedNotification } = await friendService.acceptFriendRequest({ requestId, userId });

    io.to(friendRequest.from._id.toString()).emit("accept-request-friend", userId.toString(), { ...formatedNotification, message: formatedNotification.content })

    SuccessResponse.ok(res, null, "Chấp nhận lời mời kết bạn thành công", {
        newFriend: {
            _id: friendRequest.from._id,
            displayname: friendRequest.from.displayname,
            avatarUrl: friendRequest.from.avatarUrl,
        },
    });
};

export const declineFriendRequest = async (req, res) => {

    const { requestId } = req.params;
    const userId = req.user._id;

    const { friendRequest } = await friendService.declineFriendRequest({ requestId, userId });
    // thông báo cho người gửi là từ chối kết bạn
    io.to(friendRequest.from._id.toString()).emit("decline-request-friend", userId.toString())

    SuccessResponse.ok(res, null, null, { requestFrom: { ...friendRequest.from, _id: friendRequest.from._id.toString() } });
};

export const getAllFriends = async (req, res) => {

    const userId = req.user._id;

    const { friends } = await friendService.getAllFriends(userId);

    SuccessResponse.ok(res, null, null, { friends });

};

export const getFriendRequests = async (req, res) => {

    const userId = req.user._id;

    const { sent, received, allUsers } = await friendService.getFriendRequests(userId);
    SuccessResponse.ok(res, null, null, { sent, received, allUsers });

};