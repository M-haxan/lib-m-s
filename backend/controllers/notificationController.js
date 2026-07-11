import NotificationModel from '../models/NotificationModel.js';
import { errorHandler } from '../utils/error.js';

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await NotificationModel.find({ user: req.user.id })
            .sort({ createdAt: -1 });
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

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await NotificationModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!notification) return next(errorHandler(404, 'Notification not found'));

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete all notifications for the user
// @route   DELETE /api/notifications/clear-all
// @access  Private
export const clearAllNotifications = async (req, res, next) => {
    try {
        await NotificationModel.deleteMany({ user: req.user.id });
        res.status(200).json({ message: 'All notifications cleared successfully' });
    } catch (error) {
        next(error);
    }
};

