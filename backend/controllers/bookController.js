import BookModel from '../models/BookModel.js';
import UserModel from '../models/UserModel.js';
import TransactionModel from '../models/TransactionModel.js';
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

// @desc    Get top 5 recommended books based on user preferences
// @route   GET /api/books/recommended
// @access  Private
export const getRecommendedBooks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        let query = {};
        const hasPreferences = user.preferences && user.preferences.length > 0;
        if (hasPreferences) {
            query.category = { $in: user.preferences };
        }

        // Get 5 books matching preferences
        let books = await BookModel.find(query).limit(5);

        // If less than 5 books and user has no specific preferences, pad with other books
        if (books.length < 5 && !hasPreferences) {
            const padCount = 5 - books.length;
            const existingIds = books.map(b => b._id);
            const padBooks = await BookModel.find({ _id: { $nin: existingIds } }).limit(padCount);
            books = [...books, ...padBooks];
        }

        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

// @desc    Get top 5 most issued books
// @route   GET /api/books/most-issued
// @access  Public
export const getMostIssuedBooks = async (req, res, next) => {
    try {
        // Aggregate transactions to find most issued books
        const issuedCounts = await TransactionModel.aggregate([
            { $match: { status: { $in: ['Issued', 'Returned'] } } },
            { $group: { _id: '$book', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const bookIds = issuedCounts.map(item => item._id);
        let books = [];
        
        if (bookIds.length > 0) {
            // Find books matching the aggregated IDs
            const fetchedBooks = await BookModel.find({ _id: { $in: bookIds } });
            // Sort them to match aggregation order
            books = bookIds.map(id => fetchedBooks.find(b => b._id.toString() === id.toString())).filter(Boolean);
        }

        // If less than 5 books, pad with other latest books
        if (books.length < 5) {
            const padCount = 5 - books.length;
            const existingIds = books.map(b => b._id);
            const padBooks = await BookModel.find({ _id: { $nin: existingIds } }).sort({ createdAt: -1 }).limit(padCount);
            books = [...books, ...padBooks];
        }

        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};
