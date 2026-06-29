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

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        if (user.role === 'admin') {
            return next(errorHandler(403, 'Admin accounts cannot be deleted'));
        }
        await UserModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User has been deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile (Student)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, email, stream, year, password } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        // Only students can update their data
        if (user.role !== 'student') {
            return next(errorHandler(403, 'Only students can update their profile data'));
        }

        // Email check if changed
        if (email && email !== user.email) {
            const existingEmail = await UserModel.findOne({ email });
            if (existingEmail) {
                return next(errorHandler(400, 'Email already in use'));
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (stream) user.stream = stream;
        if (year) user.year = year;

        if (password) {
            const hashPass = await UserModel.hashPassword ? await UserModel.hashPassword(password) : await import('bcryptjs').then(async (b) => b.default.hash(password, 10));
            user.password = hashPass;
        }

        await user.save();

        // Omit password from the response
        const { password: pass, ...updatedUser } = user._doc;
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

