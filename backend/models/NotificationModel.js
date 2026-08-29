import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['system', 'request', 'alert'],
        default: 'alert'
    }
}, { timestamps: true });

const NotificationModel = mongoose.model('Notification', notificationSchema);
export default NotificationModel;
