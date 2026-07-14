import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import UserModel from '../models/UserModel.js'
import { errorHandler } from '../utils/error.js';
import { sendEmail } from '../utils/sendEmail.js';
import NotificationModel from '../models/NotificationModel.js';


export const registerUser = async(req, res, next)=>{
    console.log("Frontend se data aaya:", req.body);
    try {
        const {name, email, password, role, stream, year, preferences} = req.body;
        
        // Enforce password strength rules on backend
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\-_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return next(errorHandler(400, "Password must be at least 8 characters long and contain a mix of uppercase letters, numbers, and special characters"));
        }

        const existingUser= await UserModel.findOne({email});
        if(existingUser){
            if (existingUser.isEmailVerified) {
                return next(errorHandler(400, "Email Already Exist"));
            } else {
                // Delete existing unverified registration so they can re-register
                await UserModel.findByIdAndDelete(existingUser._id);
            }
        }

        const hashPass = await bcrypt.hash(password, 10);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        const user = new UserModel ({
            name: name, 
            email: email, 
            password: hashPass,
            role: role, 
            stream: stream,
            year: year,
            isEmailVerified: false,
            isApproved: false,
            emailVerificationToken: emailVerificationToken,
            preferences: preferences || []
        });

        await user.save();

        // Send email verification link
        const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationLink = `${frontendUrl}/verify-email/${emailVerificationToken}`;
        
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; text-align: center;">Verify Your Email Address</h2>
                <p>Dear ${name},</p>
                <p>Thank you for signing up at Libro Library. To complete your registration and request admin approval, please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Verify Email Address</a>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
                <p>After your email is verified, your registration request will be forwarded to the system administrator for approval.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    If you did not request this, please ignore this email.
                </p>
            </div>
        `;
        
        console.log(`[EMAIL DISPATCH] Verification Link for ${email}: ${verificationLink}`);
        sendEmail(email, 'Verify Your Email - Library Administration', emailHtml);

        // Send request notification to admins
        const admins = await UserModel.find({ role: 'admin' });
        for (const admin of admins) {
            await NotificationModel.create({
                user: admin._id,
                message: `New student registration: ${name} (${email}) has signed up and is pending approval.`,
                type: 'request'
            });
        }

        res.status(201).json({ message: "User registered successfully. A verification email has been sent." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

export const loginUser = async (req, res, next)=>{
    const {email, password} = req.body;
    try{
        const user = await UserModel.findOne({email})
    if(!user){
        return next(errorHandler(404, 'invalid Email Address'))
    }
     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch){
        return next(errorHandler(401, 'invalidPassword'))
     }

     // Enforce email verification and admin approval for student role
     if (user.role === 'student') {
         if (!user.isEmailVerified) {
             return next(errorHandler(403, 'Please verify your email address before logging in. A verification link has been sent to your email.'));
         }
         if (!user.isApproved) {
             return next(errorHandler(403, 'Your account is pending admin approval. Please wait for the admin to approve your account.'));
         }
     }

     const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, { expiresIn: '1d' });
     const {password: pass, ...rest} = user._doc;

     const isProduction = process.env.NODE_ENV === 'production';
     res.cookie('access_token', token, {
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? 'none' : 'lax'
     }).status(200).json(rest);
    }catch(error){
        next(error);
    }
} 

export const logoutUser = (req, res, next) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        res.status(200).json({ message: 'User has been logged out successfully!' });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify user email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await UserModel.findOne({ emailVerificationToken: token });
        
        if (!user) {
            return next(errorHandler(400, "Invalid or expired verification token."));
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Email verified successfully! Your account is now waiting for administrator approval." 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        
        if (!user) {
            return next(errorHandler(404, "No account found with this email address."));
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
        await user.save();

        const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
        
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; text-align: center;">Reset Your Password</h2>
                <p>Dear ${user.name},</p>
                <p>You requested to reset your password for your Libro Library account. Please click the button below to update your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Reset Password</a>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
                <p style="color: #dc2626; font-weight: bold;">IMPORTANT: This link is valid for 5 minutes only. After 5 minutes, you will need to request a new link.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    If you did not request a password reset, please ignore this email and your password will remain unchanged.
                </p>
            </div>
        `;
        
        console.log(`[EMAIL DISPATCH] Password Reset Link for ${email}: ${resetLink}`);
        sendEmail(email, 'Reset Password Request - Libro Library', emailHtml);

        res.status(200).json({ 
            success: true, 
            message: "A password reset link has been sent to your email. It will expire in 5 minutes." 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password - Update password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(errorHandler(400, "Password reset token is invalid or has expired. Please request a new link."));
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>\-_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return next(errorHandler(400, "Password must be at least 8 characters long and contain a mix of uppercase letters, numbers, and special characters"));
        }

        const hashPass = await bcrypt.hash(password, 10);
        user.password = hashPass;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "Your password has been reset successfully! You can now log in with your new password." 
        });
    } catch (error) {
        next(error);
    }
};