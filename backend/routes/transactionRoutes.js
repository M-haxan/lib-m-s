import express from 'express';
import { 
    requestIssue, 
    approveIssue, 
    rejectIssue,
    requestReturn, 
    approveReturn, 
    collectFine,
    getTransactions, 
    getRequests,
    getMyTransactions 
} from '../controllers/transactionController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

// Student Routes
router.post('/request-issue', verifyToken, requestIssue);
router.post('/request-return', verifyToken, requestReturn);
router.get('/my-transactions', verifyToken, getMyTransactions);

// Admin Routes
router.post('/approve-issue', verifyToken, verifyAdmin, approveIssue);
router.post('/reject-issue', verifyToken, verifyAdmin, rejectIssue);
router.post('/approve-return', verifyToken, verifyAdmin, approveReturn);
router.post('/collect-fine', verifyToken, verifyAdmin, collectFine);
router.get('/requests', verifyToken, verifyAdmin, getRequests);
router.get('/', verifyToken, verifyAdmin, getTransactions);

export default router;
