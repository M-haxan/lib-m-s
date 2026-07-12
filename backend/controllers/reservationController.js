import ReservationModel from '../models/ReservationModel.js';
import BookModel from '../models/BookModel.js';
import { errorHandler } from '../utils/error.js';

// @desc    Reserve a book
// @route   POST /api/reservations/reserve
// @access  Private
export const reserveBook = async (req, res, next) => {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        const book = await BookModel.findById(bookId);
        if (!book) return next(errorHandler(404, 'Book not found'));

        if (book.availableCopies > 0) {
            return next(errorHandler(400, 'Book is currently available. You can just issue it instead of reserving.'));
        }

        // Check if user already has an active reservation for this book
        const existingReservation = await ReservationModel.findOne({ book: bookId, user: userId, status: 'Pending' });
        if (existingReservation) {
            return next(errorHandler(400, 'You have already reserved this book.'));
        }

        const reservation = new ReservationModel({
            book: bookId,
            user: userId,
        });

        await reservation.save();
        res.status(201).json({ message: 'Book reserved successfully', reservation });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel a reservation
// @route   POST /api/reservations/cancel
// @access  Private
export const cancelReservation = async (req, res, next) => {
    try {
        const { reservationId } = req.body;
        const userId = req.user.id;

        const reservation = await ReservationModel.findById(reservationId);
        if (!reservation) return next(errorHandler(404, 'Reservation not found'));

        // Check ownership
        if (reservation.user.toString() !== userId && req.user.role !== 'admin') {
            return next(errorHandler(403, 'Unauthorized to cancel this reservation'));
        }

        if (reservation.status !== 'Pending') {
            return next(errorHandler(400, 'Only pending reservations can be cancelled'));
        }

        reservation.status = 'Cancelled';
        await reservation.save();

        res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reservations (Admin)
// @route   GET /api/reservations
// @access  Private/Admin
export const getReservations = async (req, res, next) => {
    try {
        const reservations = await ReservationModel.find().populate('book').populate('user', '-password').sort({ createdAt: -1 });
        
        const reservationsWithQueue = await Promise.all(reservations.map(async (resObj) => {
            const resJson = resObj.toObject();
            if (resJson.status === 'Pending') {
                const queuePosition = await ReservationModel.countDocuments({
                    book: resJson.book._id || resJson.book,
                    status: 'Pending',
                    createdAt: { $lte: resObj.createdAt }
                });
                resJson.queuePosition = queuePosition;
            }
            return resJson;
        }));

        res.status(200).json(reservationsWithQueue);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
export const getMyReservations = async (req, res, next) => {
    try {
        const reservations = await ReservationModel.find({ user: req.user.id }).populate('book').sort({ createdAt: -1 });
        
        const reservationsWithQueue = await Promise.all(reservations.map(async (resObj) => {
            const resJson = resObj.toObject();
            if (resJson.status === 'Pending') {
                const queuePosition = await ReservationModel.countDocuments({
                    book: resJson.book._id || resJson.book,
                    status: 'Pending',
                    createdAt: { $lte: resObj.createdAt }
                });
                resJson.queuePosition = queuePosition;
            }
            return resJson;
        }));

        res.status(200).json(reservationsWithQueue);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a reservation (Admin)
// @route   DELETE /api/reservations/:id
// @access  Private/Admin
export const deleteReservation = async (req, res, next) => {
    try {
        const reservation = await ReservationModel.findById(req.params.id);
        if (!reservation) {
            return next(errorHandler(404, 'Reservation not found'));
        }
        await ReservationModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Reservation record deleted successfully' });
    } catch (error) {
        next(error);
    }
};
