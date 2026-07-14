import UserModel from '../models/UserModel.js';
import { errorHandler } from '../utils/error.js';
import { sendEmail } from '../utils/sendEmail.js';

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

// @desc    Approve a student registration
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
export const approveUser = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }
        user.isApproved = true;
        await user.save();

        if (user.email) {
            const subject = 'Your Account has been Approved!';
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #2563eb; text-align: center;">Account Approved!</h2>
                    <p>Dear ${user.name},</p>
                    <p>We are pleased to inform you that your registration at Libro Library has been approved by the Administrator.</p>
                    <p>You can now sign in to your dashboard and access all student services.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/signin" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Login to Your Account</a>
                    </div>
                    <p style="color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        This is an automated message. Please do not reply directly to this email.
                    </p>
                </div>
            `;
            sendEmail(user.email, subject, html);
        }

        res.status(200).json({ success: true, message: 'Student account has been approved successfully' });
    } catch (error) {
        next(error);
    }
};

