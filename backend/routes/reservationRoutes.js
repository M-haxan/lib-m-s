import express from 'express';
import { reserveBook, cancelReservation, getReservations, getMyReservations } from '../controllers/reservationController.js';
import { verifyToken } from '../utils/verifyUser.js';
import { verifyAdmin } from '../utils/verifyAdmin.js';

const router = express.Router();

router.post('/reserve', verifyToken, reserveBook);
router.post('/cancel', verifyToken, cancelReservation);
router.get('/', verifyToken, verifyAdmin, getReservations);
router.get('/my-reservations', verifyToken, getMyReservations);

export default router;
