import express from 'express';
import { getUsers, deleteUser, updateProfile, approveUser } from '../controllers/userController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, getUsers);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/:id/approve', verifyToken, verifyAdmin, approveUser);

export default router;
