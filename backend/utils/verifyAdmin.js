import { errorHandler } from './error.js';
import UserModel from '../models/UserModel.js';

export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        if (user.role !== 'admin') {
            return next(errorHandler(403, 'Forbidden: Admin access required'));
        }
        next();
    } catch (error) {
        next(error);
    }
};
