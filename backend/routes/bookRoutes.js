import express from 'express';
import { addBook, updateBook, deleteBook, getBooks } from '../controllers/bookController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.get('/', getBooks);
router.post('/', verifyToken, verifyAdmin, addBook);
router.put('/:id', verifyToken, verifyAdmin, updateBook);
router.delete('/:id', verifyToken, verifyAdmin, deleteBook);

export default router;
