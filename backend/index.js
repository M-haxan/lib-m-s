import express from 'express'; 
import cors from 'cors'; 
import mongoose from 'mongoose';
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authroutes.js'

dotenv.config();
const app = express();

connectDB();
app.use (cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);

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