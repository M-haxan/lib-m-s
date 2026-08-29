import UserModel from '../models/UserModel.js';
import { errorHandler } from '../utils/error.js';

// @desc    Get all registered users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find({}, '-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};
