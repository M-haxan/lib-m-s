import TransactionModel from '../models/TransactionModel.js';
import BookModel from '../models/BookModel.js';
import UserModel from '../models/UserModel.js';
import { errorHandler } from '../utils/error.js';
import nodemailer from 'nodemailer';

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
        if (book.availableCopies <= 0) {
            return next(errorHandler(400, 'Book is no longer available.'));
        }

        transaction.status = 'Issued';
        await transaction.save();

        book.availableCopies -= 1;
        await book.save();

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
            
            // Assume $2 per day fine
            transaction.fineAmount = diffDays * 2; 
            transaction.finePaid = false;
            fineMsg = `A fine of $${transaction.fineAmount} was applied.`;

            // Send notification
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: transaction.user.email,
                    subject: 'Overdue Book Fine Notice',
                    text: `Dear ${transaction.user.name},\n\nYou have returned "${transaction.book.title}" late by ${diffDays} days.\nA fine of $${transaction.fineAmount} has been charged to your account.\nPlease clear your dues at the library desk.\n\nRegards,\nLibro Library`
                };
                transporter.sendMail(mailOptions).catch(err => console.log('Mail error:', err));
            }
        }

        await transaction.save();

        const book = await BookModel.findById(transaction.book._id);
        if (book) {
            book.availableCopies += 1;
            await book.save();
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
