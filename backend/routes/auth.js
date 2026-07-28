import express from 'express';
import { registerOrUpdateUser } from '../controllers/adminController.js';
import { sendOtp, verifyOtp } from '../controllers/otpController.js';

const router = express.Router();

// Synchronize Firebase user details with MongoDB/local storage profile
router.post('/sync', registerOrUpdateUser);

// OTP Authentication Endpoints
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
