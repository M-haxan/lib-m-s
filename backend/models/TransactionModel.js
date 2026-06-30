import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
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
    issueDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending_Issue', 'Issued', 'Pending_Return', 'Returned', 'Rejected'],
        default: 'Pending_Issue'
    },
    fineAmount: {
        type: Number,
        default: 0
    },
    finePaid: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const TransactionModel = mongoose.model('Transaction', transactionSchema);
export default TransactionModel;
