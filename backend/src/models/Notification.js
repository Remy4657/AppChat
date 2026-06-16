import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
    // người nhận thông báo
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // người thực hiện hành động
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    type: {
        type: String,
        enum: ['friend_request', 'friend_accept'],
        required: true,
    },
    content: {
        type: String,
        required: false,
    },
    is_read: {
        type: Boolean,
        default: false,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false } // tự động quản lý createdAt, không cần updatedAt
});

// Compound index cho truy vấn thông báo chưa đọc của một user
notificationSchema.index({ userId: 1, is_read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);