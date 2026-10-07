import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModel from './models/UserModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in backend/.env");
  process.exit(1);
}

async function seedDemoUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // 1. Seed Demo Admin
    let adminUser = await UserModel.findOne({ email: 'admin@demo.com' });
    if (adminUser) {
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      adminUser.isEmailVerified = true;
      adminUser.isApproved = true;
      await adminUser.save();
      console.log("🔄 Demo Admin account updated successfully");
    } else {
      adminUser = await UserModel.create({
        name: 'Demo Administrator',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
        stream: 'Management',
        year: 1,
        isEmailVerified: true,
        isApproved: true
      });
      console.log("✨ Demo Admin created: admin@demo.com");
    }

    // 2. Seed Demo Student
    let studentUser = await UserModel.findOne({ email: 'student@demo.com' });
    if (studentUser) {
      studentUser.password = hashedPassword;
      studentUser.role = 'student';
      studentUser.isEmailVerified = true;
      studentUser.isApproved = true;
      await studentUser.save();
      console.log("🔄 Demo Student account updated successfully");
    } else {
      studentUser = await UserModel.create({
        name: 'Demo Student',
        email: 'student@demo.com',
        password: hashedPassword,
        role: 'student',
        stream: 'Computer Science',
        year: 3,
        isEmailVerified: true,
        isApproved: true
      });
      console.log("✨ Demo Student created: student@demo.com");
    }

    console.log("\n🎉 Both demo accounts are now VERIFIED & APPROVED in Database!");
    console.log("---------------------------------------------------------");
    console.log("Admin:   admin@demo.com   | Password@123");
    console.log("Student: student@demo.com | Password@123");
    console.log("---------------------------------------------------------");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding demo users:", error);
    process.exit(1);
  }
}

seedDemoUsers();
