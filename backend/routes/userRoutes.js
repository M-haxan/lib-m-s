import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, getUsers);

export default router;
