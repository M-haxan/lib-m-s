import TransactionModel from '../models/TransactionModel.js';
import BookModel from '../models/BookModel.js';
import UserModel from '../models/UserModel.js';
import NotificationModel from '../models/NotificationModel.js';
import ReservationModel from '../models/ReservationModel.js';
import { errorHandler } from '../utils/error.js';
import nodemailer from 'nodemailer';
import { sendEmail } from '../utils/sendEmail.js';

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @desc    Request to issue a book (Student)
// @route   POST /api/transactions/request-issue
// @access  Private
export const requestIssue = async (req, res, next) => {
    try {
        const { bookId, fromDate, toDate } = req.body;
        const userId = req.user.id;

        const start = new Date(fromDate);
        const end = new Date(toDate);
        
        // Validate duration (max 10 days)
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0 || diffDays > 10) {
            return next(errorHandler(400, 'Invalid duration. Maximum borrowing period is 10 days.'));
        }

        const book = await BookModel.findById(bookId);
        if (!book) return next(errorHandler(404, 'Book not found'));
        
        if (book.availableCopies <= 0) {
            return next(errorHandler(400, 'Book is currently out of stock.'));
        }

        // Check borrowing limit (max 4 active books: Pending_Issue or Issued or Pending_Return)
        const activeTransactions = await TransactionModel.countDocuments({ 
            user: userId, 
            status: { $in: ['Pending_Issue', 'Issued', 'Pending_Return'] } 
        });
        
        if (activeTransactions >= 4) {
            return next(errorHandler(400, 'You have reached the maximum limit of 4 active books/requests.'));
        }

        // Check if user already requested or has this book
        const alreadyHas = await TransactionModel.findOne({ 
            user: userId, 
            book: bookId, 
            status: { $in: ['Pending_Issue', 'Issued', 'Pending_Return'] } 
        });
        
        if (alreadyHas) {
            return next(errorHandler(400, 'You already have an active request or issue for this book.'));
        }

        const newReq = new TransactionModel({
            book: bookId,
            user: userId,
            issueDate: start,
            dueDate: end,
            status: 'Pending_Issue'
        });

        await newReq.save();

        // Notify Admins
        const admins = await UserModel.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            user: admin._id,
            message: `New book issue request for "${book.title}" from user.`,
            type: 'request'
        }));
        if (notifications.length > 0) {
            await NotificationModel.insertMany(notifications);
        }

        res.status(201).json({ message: 'Book issue requested successfully', transaction: newReq });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve Issue Request (Admin)
// @route   POST /api/transactions/approve-issue
// @access  Private/Admin
export const approveIssue = async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        const transaction = await TransactionModel.findById(transactionId);
        
        if (!transaction || transaction.status !== 'Pending_Issue') {
            return next(errorHandler(404, 'Invalid issue request'));
        }

        const book = await BookModel.findById(transaction.book);
        if (!book) {
            return next(errorHandler(404, 'Book no longer exists in catalog.'));
        }
        if (book.availableCopies <= 0) {
            return next(errorHandler(400, 'Book is no longer available.'));
        }

        transaction.status = 'Issued';
        await transaction.save();

        book.availableCopies -= 1;
        await book.save();

        // Notify Student
        await NotificationModel.create({
            user: transaction.user,
            message: `Your issue request for "${book.title}" has been approved!`,
            type: 'alert'
        });

        res.status(200).json({ message: 'Issue approved successfully', transaction });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject Issue Request (Admin)
// @route   POST /api/transactions/reject-issue
// @access  Private/Admin
export const rejectIssue = async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        const transaction = await TransactionModel.findById(transactionId);
        
        if (!transaction || transaction.status !== 'Pending_Issue') {
            return next(errorHandler(404, 'Invalid issue request'));
        }

        transaction.status = 'Rejected';
        await transaction.save();

        res.status(200).json({ message: 'Issue rejected', transaction });
    } catch (error) {
        next(error);
    }
};

// @desc    Request Return (Student)
// @route   POST /api/transactions/request-return
// @access  Private
export const requestReturn = async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        const transaction = await TransactionModel.findOne({ _id: transactionId, user: req.user.id });
        
        if (!transaction || transaction.status !== 'Issued') {
            return next(errorHandler(400, 'Valid issued book not found.'));
        }

        transaction.status = 'Pending_Return';
        await transaction.save();

        // Notify Admins
        const admins = await UserModel.find({ role: 'admin' });
        const notifications = admins.map(admin => ({
            user: admin._id,
            message: `User requested to return the book.`,
            type: 'request'
        }));
        if (notifications.length > 0) {
            await NotificationModel.insertMany(notifications);
        }

        res.status(200).json({ message: 'Return request submitted.', transaction });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve Return (Admin)
// @route   POST /api/transactions/approve-return
// @access  Private/Admin
export const approveReturn = async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        const transaction = await TransactionModel.findById(transactionId).populate('user').populate('book');
        
        if (!transaction || transaction.status !== 'Pending_Return') {
            return next(errorHandler(400, 'Invalid return request.'));
        }

        transaction.status = 'Returned';
        transaction.returnDate = new Date();

        // Check for fine
        let fineMsg = '';
        if (transaction.returnDate > transaction.dueDate) {
            const diffTime = transaction.returnDate.getTime() - transaction.dueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Assume PKR 100 per day fine
            transaction.fineAmount = diffDays * 100; 
            transaction.finePaid = false;
            fineMsg = `A fine of PKR ${transaction.fineAmount} was applied.`;

            // Send notification
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS && transaction.user && transaction.book) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: transaction.user.email,
                    subject: 'Overdue Book Fine Notice',
                    text: `Dear ${transaction.user.name},\n\nYou have returned "${transaction.book.title}" late by ${diffDays} days.\nA fine of PKR ${transaction.fineAmount} has been charged to your account.\nPlease clear your dues at the library desk.\n\nRegards,\nLibro Library`
                };
                transporter.sendMail(mailOptions).catch(err => console.log('Mail error:', err));
            }
        }

        await transaction.save();

        if (transaction.book) {
            const book = await BookModel.findById(transaction.book._id);
            if (book) {
                book.availableCopies += 1;
                await book.save();

                const pendingReservations = await ReservationModel.find({ book: book._id, status: 'Pending' })
                    .sort({ createdAt: 1 })
                    .populate('user');

                let remainingCopies = book.availableCopies;
                for (const reservation of pendingReservations) {
                    if (remainingCopies <= 0) break;

                    reservation.status = 'Fulfilled';
                    await reservation.save();

                    const reservationMessage = `A copy of "${book.title}" is now available for pickup.`;
                    await NotificationModel.create({
                        user: reservation.user._id,
                        message: reservationMessage,
                        type: 'alert'
                    });

                    if (reservation.user?.email) {
                        await sendEmail(
                            reservation.user.email,
                            'Reserved Book Available',
                            `<p>Dear ${reservation.user.name},</p><p>${reservationMessage}</p><p>Please collect it from the library desk.</p>`
                        );
                    }

                    remainingCopies -= 1;
                }
            }
        }

        // Notify Student
        if (transaction.user) {
            await NotificationModel.create({
                user: transaction.user._id,
                message: `Your return request for "${transaction.book?.title || 'Unknown Book'}" is approved. ${fineMsg}`,
                type: 'alert'
            });
        }

        res.status(200).json({ message: `Return approved successfully. ${fineMsg}`, transaction });
    } catch (error) {
        next(error);
    }
};

// @desc    Collect Fine (Admin)
// @route   POST /api/transactions/collect-fine
// @access  Private/Admin
export const collectFine = async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        const transaction = await TransactionModel.findById(transactionId);
        
        if (!transaction) return next(errorHandler(404, 'Transaction not found.'));
        if (transaction.fineAmount === 0 || transaction.finePaid) {
            return res.status(400).json({ message: 'No pending fine for this transaction.' });
        }

        transaction.finePaid = true;
        await transaction.save();

        res.status(200).json({ message: 'Fine collected successfully.', transaction });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all transactions (Admin view)
// @route   GET /api/transactions
// @access  Private/Admin
export const getTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionModel.find().populate('book').populate('user', '-password').sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all requests (Pending Issue/Return) for Admin
// @route   GET /api/transactions/requests
// @access  Private/Admin
export const getRequests = async (req, res, next) => {
    try {
        const requests = await TransactionModel.find({ status: { $in: ['Pending_Issue', 'Pending_Return'] } })
                                               .populate('book').populate('user', '-password')
                                               .sort({ createdAt: 1 });
        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user transactions
// @route   GET /api/transactions/my-transactions
// @access  Private
export const getMyTransactions = async (req, res, next) => {
    try {
        const transactions = await TransactionModel.find({ user: req.user.id }).populate('book').sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a transaction (Admin)
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
export const deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await TransactionModel.findById(req.params.id);
        if (!transaction) {
            return next(errorHandler(404, 'Transaction not found'));
        }
        await TransactionModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Transaction record deleted successfully' });
    } catch (error) {
        next(error);
    }
};
