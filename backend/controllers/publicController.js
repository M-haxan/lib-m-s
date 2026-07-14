import BookModel from '../models/BookModel.js';
import UserModel from '../models/UserModel.js';
import TransactionModel from '../models/TransactionModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import { errorHandler } from '../utils/error.js';

// @desc    Get public statistics for About Page
// @route   GET /api/public/stats
// @access  Public
export const getPublicStats = async (req, res, next) => {
    try {
        const totalBooks = await BookModel.countDocuments();
        const activeStudents = await UserModel.countDocuments({ role: 'student' });
        const activeBorrows = await TransactionModel.countDocuments({ status: 'Issued' });

        res.status(200).json({
            totalBooks,
            activeStudents,
            activeBorrows
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get admin email for Contact Page
// @route   GET /api/public/contact-info
// @access  Public
export const getContactInfo = async (req, res, next) => {
    try {
        const admin = await UserModel.findOne({ role: 'admin' });
        const email = admin ? admin.email : (process.env.EMAIL_USER || 'support@librolibrary.com');
        res.status(200).json({ email });
    } catch (error) {
        next(error);
    }
};

// @desc    Submit inquiry contact form
// @route   POST /api/public/contact
// @access  Public
export const submitContactForm = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return next(errorHandler(400, 'Please fill in all fields.'));
        }

        // Find admin email
        const admin = await UserModel.findOne({ role: 'admin' });
        const adminEmail = admin ? admin.email : process.env.EMAIL_USER;

        if (!adminEmail) {
            return next(errorHandler(500, 'Admin email configuration not found.'));
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">New Contact Inquiry</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 30%; color: #475569;">Name:</td>
                        <td style="padding: 8px 0; color: #1e293b;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                        <td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #475569;">Subject:</td>
                        <td style="padding: 8px 0; color: #1e293b;">${subject}</td>
                    </tr>
                </table>
                <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                    ${message}
                </div>
                <p style="color: #64748b; font-size: 11px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
                    This query was submitted via the Libro Library Contact Form.
                </p>
            </div>
        `;

        await sendEmail(adminEmail, `[Contact Form] ${subject}`, emailHtml);

        res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (error) {
        next(error);
    }
};
