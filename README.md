
# Lib-M-S

A full-stack Library Management System built for managing books, student accounts, reservations, borrowing activity, and admin operations in a modern web application.

This project contains:
- a React + Vite frontend for the student/admin experience
- an Express + MongoDB backend for API logic, authentication, and data persistence

## Overview

Lib-M-S is designed to support a digital library workflow where:
- students can browse the catalog, view book details, and request/track borrowing activity
- admins can manage books, users, transactions, and system analytics
- users can create accounts, verify email addresses, reset passwords, and receive notifications
- the system includes automated scheduled jobs for library-related tasks

## Features

### Student Features
- Sign up, sign in, and session management
- Email verification for new accounts
- Password reset flow
- Request approval after registration
- Browse library catalog
- View book details
- Borrowing and return tracking
- Reservation support
- Notifications and account updates

### Admin Features
- Admin-only dashboard
- Manage books
- Manage users
- View transactions
- Review analytics
- Approve student registrations
- Monitor library activity

### System Features
- JWT-based authentication
- Cookie-based session handling
- Secure password hashing with bcrypt
- Email integration for verification/reset flows
- MongoDB data models for users, books, transactions, reservations, and notifications
- Cron-based background jobs

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Redux Toolkit
- React Query
- Axios
- React Hot Toast
- XLSX / jsPDF support for export/reporting tasks

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcryptjs
- nodemailer
- cookie-parser
- node-cron
- CORS

## Project Structure

```bash
lib-m-s/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .gitignore
│   ├── Dockerfile
│   ├── Procfile
│   ├── cronJobs.js
│   ├── index.js
│   ├── package.json
│   ├── seedDemoUsers.js
│   ├── triggerCron.js
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── README.md
├── package.json
├── package-lock.json
├── Procfile
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB instance
- A working email service for verification and reset emails

### 1. Install dependencies

Root project:
```bash
npm install
```

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file inside the `backend` directory and set values such as:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

If your email integration is configured via environment variables, add your mail credentials as required by the project setup.

### 3. Run the app

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend:
```bash
cd frontend
npm run dev
```

The frontend is usually served on:
```bash
http://localhost:5173
```

The backend API runs on:
```bash
http://localhost:5000
```

## Production Notes

This repository includes deployment-related files such as:
- root `Procfile`
- backend `Procfile`
- frontend `vercel.json`

The app is structured to support a split deployment model:
- frontend deployed on Vercel
- backend deployed on a Node hosting service or server environment

## Authentication and Security

The backend uses:
- JWT tokens for authenticated access
- cookie-based session storage
- password hashing via bcrypt
- role-based checks for admin/student access
- email verification and approval gates for student accounts

