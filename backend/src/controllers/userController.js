
export const authMe = async (req, res) => {
    try {
        const user = req.user; // Thông tin người dùng đã được xác thực từ middleware
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }

}