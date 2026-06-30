import BookModel from '../models/BookModel.js';
import { errorHandler } from '../utils/error.js';

// @desc    Add a new book
// @route   POST /api/books
// @access  Private/Admin
export const addBook = async (req, res, next) => {
    try {
        const { title, author, isbn, category, publisher, year, quantity, imageUrl } = req.body;
        
        const existingBook = await BookModel.findOne({ isbn });
        if (existingBook) {
            return next(errorHandler(400, 'Book with this ISBN already exists'));
        }

        const newBook = new BookModel({
            title,
            author,
            isbn,
            category,
            publisher,
            year,
            quantity,
            availableCopies: quantity, // Initially, available copies = total quantity
            imageUrl,
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
export const updateBook = async (req, res, next) => {
    try {
        const bookId = req.params.id;
        const book = await BookModel.findById(bookId);

        if (!book) {
            return next(errorHandler(404, 'Book not found'));
        }

        // Handle availableCopies update if quantity is modified
        let updatedData = { ...req.body };
        if (updatedData.quantity !== undefined) {
            const difference = updatedData.quantity - book.quantity;
            updatedData.availableCopies = book.availableCopies + difference;
            
            if (updatedData.availableCopies < 0) {
                 return next(errorHandler(400, 'Cannot reduce quantity below currently issued copies'));
            }
        }

        const updatedBook = await BookModel.findByIdAndUpdate(
            bookId,
            { $set: updatedData },
            { new: true }
        );

        res.status(200).json(updatedBook);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = async (req, res, next) => {
    try {
        const book = await BookModel.findById(req.params.id);
        if (!book) {
            return next(errorHandler(404, 'Book not found'));
        }

        // Optionally, check if copies are currently issued before deleting. For now, simple delete.
        if (book.quantity !== book.availableCopies) {
            return next(errorHandler(400, 'Cannot delete book. Some copies are currently issued.'));
        }

        await BookModel.findByIdAndDelete(req.params.id);
        res.status(200).json('Book has been deleted');
    } catch (error) {
        next(error);
    }
};

// @desc    Get all books (with search & filters)
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
    try {
        const { search, category, availability, year } = req.query;
        let query = {};

        // Search by title or author
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category && category !== 'All') {
            query.category = category;
        }

        // Filter by year
        if (year) {
            query.year = year;
        }

        // Filter by availability
        if (availability === 'true') {
            query.availableCopies = { $gt: 0 };
        } else if (availability === 'false') {
            query.availableCopies = 0;
        }

        const books = await BookModel.find(query).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};
