import express from 'express';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../controllers/notificationController.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getMyNotifications);
router.put('/read-all', verifyToken, markAllAsRead);
router.put('/:id/read', verifyToken, markAsRead);
router.delete('/clear-all', verifyToken, clearAllNotifications);
router.delete('/:id', verifyToken, deleteNotification);

export default router;
