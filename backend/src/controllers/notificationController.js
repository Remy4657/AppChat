import SuccessResponse from "../core/success.response.js";
import Notification from "../models/Notification.js";


export const markReadNotification = async (req, res) => {

    const userId = req.user._id;

    // Cập nhật nhiều document
    const result = await Notification.updateMany(
        { userId: userId, is_read: false },   // điều kiện: đúng user và chưa đọc
        { $set: { is_read: true } }            // cập nhật
    );


    SuccessResponse.ok(res, null, 'Đã đánh dấu tất cả thông báo là đã đọc', {
        modifiedCount: result.modifiedCount,   // số lượng thông báo thực sự được cập nhật
        matchedCount: result.matchedCount      // số lượng thông báo thỏa điều kiện
    });

}
export const getAllNotification = async (req, res) => {
    const userId = req.user._id;

    // Phân trang: page bắt đầu từ 1, mỗi trang 20 bản ghi
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Lọc: chỉ lấy thông báo của user
    const filter = {
        userId: userId,
        type: "friend_accept"
    };

    // Thực hiện query
    const listAccept = await Notification.find(filter)
        .sort({ createdAt: -1 })          // mới nhất lên đầu
        .skip(skip)
        .limit(limit).lean(); // chuyển thành plain JS object để dễ thao tác

    // Đổi tên field content -> message cho từng object
    const transformedList = listAccept.map(notif => {
        const { content, ...rest } = notif;
        return {
            ...rest,
            message: content
        };
    });

    // Đếm tổng số thông báo (để biết có trang tiếp không)
    const total = await Notification.countDocuments(filter);
    SuccessResponse.ok(res, null, 'Lấy danh sách thông báo thành công', {
        listAccept: transformedList,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit)
        }
    });


}
