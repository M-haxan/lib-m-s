import express from 'express'; 
import cors from 'cors'; 
import mongoose from 'mongoose';
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authroutes.js'
import bookRouter from './routes/bookRoutes.js'
import transactionRouter from './routes/transactionRoutes.js'
import reservationRouter from './routes/reservationRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import userRouter from './routes/userRoutes.js'
import { startCronJobs } from './cronJobs.js'

dotenv.config();
const app = express();

connectDB();
startCronJobs();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true, // Dynamically reflects the request origin (allows all origins while supporting credentials: true)
  credentials: true, // Yeh true karna lazmi hai cookies ko allow karne k liye
}));

app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/users', userRouter);
const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  });


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});