import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reservationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Fulfilled', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

const ReservationModel = mongoose.model('Reservation', reservationSchema);
export default ReservationModel;
