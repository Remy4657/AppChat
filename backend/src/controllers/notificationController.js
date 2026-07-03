import SuccessResponse from "../core/success.response.js";

import * as notificationService from "../services/notificationService.js";

export const markReadNotification = async (req, res) => {

    const userId = req.user._id;

    const result = await notificationService.markReadNotification(userId);

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

    const { transformedList, total } = await notificationService.getAllNotification({ userId, skip, limit });

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
