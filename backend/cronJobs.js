import cron from 'node-cron';
import TransactionModel from './models/TransactionModel.js';
import ReservationModel from './models/ReservationModel.js';
import BookModel from './models/BookModel.js';
import { sendEmail } from './utils/sendEmail.js';

export const startCronJobs = () => {
    // Run every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily cron job for notifications and fines...');
        try {
            const today = new Date();
            
            // 1. Calculate fines for overdue books (FR7.1, FR7.2)
            // and 2. Send overdue notifications daily (FR6.2)
            const activeTransactions = await TransactionModel.find({ status: 'Issued' }).populate('user book');
            
            for (const txn of activeTransactions) {
                if (today > txn.dueDate) {
                    // Overdue
                    const diffTime = Math.abs(today - txn.dueDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    txn.fineAmount = diffDays * 1; // e.g., $1 per day
                    await txn.save();

                    // Send email
                    if (txn.user.email) {
                       await sendEmail(
                           txn.user.email,
                           'Overdue Book Notice',
                           `<p>Dear ${txn.user.name},</p><p>Your book "<b>${txn.book.title}</b>" is overdue by ${diffDays} days. Please return it to avoid further fines.</p>`
                       );
                    }
                } else {
                    // 3. Send reminders 3 days before due date (FR6.1)
                    const diffTimeBefore = txn.dueDate - today;
                    const diffDaysBefore = Math.ceil(diffTimeBefore / (1000 * 60 * 60 * 24));
                    
                    if (diffDaysBefore === 3) {
                         if (txn.user.email) {
                            await sendEmail(
                                txn.user.email,
                                'Book Return Reminder',
                                `<p>Dear ${txn.user.name},</p><p>This is a reminder that your book "<b>${txn.book.title}</b>" is due in 3 days. Please return it on time.</p>`
                            );
                         }
                    }
                }
            }

            // 4. Automatically cancel reservations after a specified period (e.g. 7 days) (FR5.4)
            const pendingReservations = await ReservationModel.find({ status: 'Pending' });
            for (const res of pendingReservations) {
                 const resAgeTime = today - res.reservationDate;
                 const resAgeDays = Math.ceil(resAgeTime / (1000 * 60 * 60 * 24));
                 if (resAgeDays > 7) {
                     res.status = 'Cancelled';
                     await res.save();
                 }
            }

            console.log('Daily cron job finished successfully.');
        } catch (error) {
            console.error('Error in daily cron job:', error);
        }
    });
};
