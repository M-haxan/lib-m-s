import express from 'express'
import { registerUser, loginUser, logoutUser, verifyEmail, forgotPassword, resetPassword } from "../controllers/authController.js";
const router = express.Router()

router.post("/register", registerUser );
router.post ("/login", loginUser)
router.get("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;