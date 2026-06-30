import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    availableCopies: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150',
    }
}, { timestamps: true });

const BookModel = mongoose.model('Book', bookSchema);
export default BookModel;
