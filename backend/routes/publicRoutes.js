import express from 'express';
import { getPublicStats, getContactInfo, submitContactForm } from '../controllers/publicController.js';

const router = express.Router();

router.get('/stats', getPublicStats);
router.get('/contact-info', getContactInfo);
router.post('/contact', submitContactForm);

export default router;
