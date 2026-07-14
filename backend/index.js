import express from 'express'; 
import cors from 'cors'; 
import mongoose from 'mongoose';
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
import authRouter from './routes/authroutes.js'
import bookRouter from './routes/bookRoutes.js'
import transactionRouter from './routes/transactionRoutes.js'
import reservationRouter from './routes/reservationRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import userRouter from './routes/userRoutes.js'
import publicRouter from './routes/publicRoutes.js'
import { startCronJobs } from './cronJobs.js'

dotenv.config();
const app = express();

connectDB();
startCronJobs();

app.use(express.json());
app.use(cookieParser());

// Custom robust CORS middleware to allow credentials in production
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = origin === 'http://localhost:5173' || 
                      origin.endsWith('.vercel.app') || 
                      origin === 'https://lib-m-s.vercel.app';
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/users', userRouter);
app.use('/api/public', publicRouter);
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