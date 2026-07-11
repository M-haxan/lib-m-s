import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import UserModel from './models/UserModel.js';

dotenv.config();

const resetPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hash = await bcrypt.hash('password123', 10);
    
    const emails = ['admin@test.com', 'test@gmail,com', 'waleed@gmail.com'];
    for (const email of emails) {
      const user = await UserModel.findOne({ email });
      if (user) {
        user.password = hash;
        await user.save();
        console.log(`Password reset successfully for ${email}`);
      } else {
        console.log(`User not found for email ${email}`);
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

resetPasswords();
