import Notification from "../models/Notification.js";

export const markReadNotification = async (userId) => {
    // Cập nhật nhiều document
    const result = await Notification.updateMany(
        { userId: userId, is_read: false },   // điều kiện: đúng user và chưa đọc
        { $set: { is_read: true } }            // cập nhật
    );
    return result;
}
export const getAllNotification = async (data) => {
    const { userId, skip, limit } = data;
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
    return { transformedList, total };
}