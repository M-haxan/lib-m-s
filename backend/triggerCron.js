import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TransactionModel from './models/TransactionModel.js';
import ReservationModel from './models/ReservationModel.js';
import NotificationModel from './models/NotificationModel.js';
import UserModel from './models/UserModel.js';
import BookModel from './models/BookModel.js';
import { sendEmail } from './utils/sendEmail.js';

dotenv.config();

const triggerCron = async () => {
    console.log('Connecting to database...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully!');

        console.log('Starting manual execution of library notification cron job...');
        const today = new Date();
        console.log(`Current server reference time: ${today.toISOString()}`);
        
        // 1. Overdue transactions daily (FR6.2)
        const activeTransactions = await TransactionModel.find({ status: 'Issued' }).populate('user book');
        console.log(`Found ${activeTransactions.length} active (Issued) transactions to process.`);
        
        let overdueCount = 0;
        let reminderCount = 0;

        for (const txn of activeTransactions) {
            if (!txn.user) {
                console.log(`Warning: Transaction ${txn._id} has no populated user.`);
                continue;
            }
            if (!txn.book) {
                console.log(`Warning: Transaction ${txn._id} has no populated book.`);
                continue;
            }

            if (today > txn.dueDate) {
                // Overdue
                overdueCount++;
                const diffTime = Math.abs(today - txn.dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                txn.fineAmount = diffDays * 1; // $1 per day
                await txn.save();

                const overdueMessage = `Your book "${txn.book.title}" is overdue by ${diffDays} day(s). Please return it to avoid further fines.`;
                console.log(`Processing OVERDUE for user: ${txn.user.email} (${txn.book.title}). Delay: ${diffDays} days.`);

                await NotificationModel.create({
                    user: txn.user._id,
                    message: overdueMessage,
                    type: 'alert'
                });

                if (txn.user.email) {
                    await sendEmail(
                        txn.user.email,
                        'Overdue Book Notice',
                        `<p>Dear ${txn.user.name},</p><p>${overdueMessage}</p>`
                    );
                } else {
                    console.log(`No email found for user: ${txn.user.name}`);
                }
            } else {
                // 3. Send reminders 3 days before due date (FR6.1)
                const diffTimeBefore = txn.dueDate - today;
                const diffDaysBefore = Math.ceil(diffTimeBefore / (1000 * 60 * 60 * 24));
                console.log(`Book "${txn.book.title}" for user: ${txn.user.name} is due in ${diffDaysBefore} day(s) (approx).`);
                
                if (diffDaysBefore === 3) {
                    reminderCount++;
                    const reminderMessage = `This is a reminder that your book "${txn.book.title}" is due in 3 days. Please return it on time.`;
                    console.log(`Sending 3-day reminder for user: ${txn.user.email} (${txn.book.title}).`);

                    await NotificationModel.create({
                        user: txn.user._id,
                        message: reminderMessage,
                        type: 'alert'
                    });

                    if (txn.user.email) {
                        await sendEmail(
                            txn.user.email,
                            'Book Return Reminder',
                            `<p>Dear ${txn.user.name},</p><p>${reminderMessage}</p>`
                        );
                    }
                }
            }
        }

        // 4. Automatically cancel reservations after a specified period (e.g. 7 days) (FR5.4)
        const pendingReservations = await ReservationModel.find({ status: 'Pending' });
        console.log(`Found ${pendingReservations.length} pending reservations to check for auto-cancellation.`);
        let cancelledReservationsCount = 0;
        
        for (const res of pendingReservations) {
            const resAgeTime = today - res.reservationDate;
            const resAgeDays = Math.ceil(resAgeTime / (1000 * 60 * 60 * 24));
            if (resAgeDays > 7) {
                res.status = 'Cancelled';
                await res.save();
                cancelledReservationsCount++;
                console.log(`Cancelled reservation ${res._id} (Age: ${resAgeDays} days).`);
            }
        }

        console.log('\n--- Manual Cron Execution Summary ---');
        console.log(`- Overdue books processed & notified: ${overdueCount}`);
        console.log(`- 3-day return reminders sent: ${reminderCount}`);
        console.log(`- Reservations auto-cancelled (older than 7 days): ${cancelledReservationsCount}`);
        console.log('-------------------------------------\n');

    } catch (error) {
        console.error('Error during manual cron execution:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
        process.exit(0);
    }
};

triggerCron();
