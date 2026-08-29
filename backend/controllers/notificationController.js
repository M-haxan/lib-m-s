import NotificationModel from '../models/NotificationModel.js';
import { errorHandler } from '../utils/error.js';

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await NotificationModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await NotificationModel.findOne({ _id: req.params.id, user: req.user.id });
        if (!notification) return next(errorHandler(404, 'Notification not found'));

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ message: 'Marked as read', notification });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
    try {
        await NotificationModel.updateMany(
            { user: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};
