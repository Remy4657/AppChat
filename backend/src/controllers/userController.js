


export const fetchMe = async (req, res) => {
    try {
        const user = req.user; // Thông tin người dùng đã được xác thực từ middleware
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            message: "Lỗi hệ thống"
        });
    }
}
export const searchUserByUsername = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username || username.trim() === "") {
            return res.status(400).json({ message: "Cần cung cấp username trong query." });
        }

        const user = await User.findOne({ username }).select(
            "_id displayName username avatarUrl"
        );

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Lỗi xảy ra khi searchUserByUsername", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};
