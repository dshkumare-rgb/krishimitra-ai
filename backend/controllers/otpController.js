import nodemailer from 'nodemailer';
import axios from 'axios';
import User from '../models/User.js';
import { db } from '../config/db.js';

// Ephemeral in-memory store for OTPs
// Key: email, Value: { otp, expiresAt }
const otpStore = new Map();

// Helper to create mail transporter
const getTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: parseInt(port || '587'),
      secure: port === '465',
      auth: { user, pass }
    });
  }
  return null;
};

// 1. GENERATE AND SEND 6-DIGIT OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  // Save in store
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  console.log('\n=================== 🔐 OTP DISPATCH CENTER ===================');
  console.log(`TO: ${email}`);
  console.log(`CODE: ${otp}`);
  console.log(`EXPIRE: 10 Minutes (${new Date(expiresAt).toLocaleTimeString()})`);
  console.log('STATUS: Active for Verification');
  console.log('==============================================================\n');

  // OPTION A: Resend API Key Integration
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('📡 [RESEND GATEWAY] Initiating API dispatch...');
      const response = await axios.post('https://api.resend.com/emails', {
        from: 'KrishiMitra AI <onboarding@resend.dev>',
        to: email,
        subject: 'KrishiMitra AI Login Code / 🔐 ओटीपी कोड',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 450px;">
            <h2 style="color: #16a34a; margin-top: 0;">🌱 KrishiMitra AI</h2>
            <p>Hello Farmer / नमस्ते किसान,</p>
            <p>Use the following 6-digit verification code to access your KrishiMitra AI account:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #f0fdf4; color: #16a34a; padding: 12px; text-align: center; border-radius: 8px; letter-spacing: 4px; margin: 15px 0;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #64748b;">This OTP code is valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
        `
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ [RESEND GATEWAY] Delivery successful:', response.data);
      return res.status(200).json({ 
        success: true, 
        message: 'OTP delivered to your Gmail account successfully via Resend.' 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Resend transmission failed';
      console.error('❌ [RESEND GATEWAY] Dispatch failed:', errorMsg);
      return res.status(500).json({ 
        error: 'Resend API Dispatch Failed', 
        details: `${errorMsg}. Check if your Resend API Key is active or if your recipient email is verified on your Resend Sandbox.`
      });
    }
  }

  // OPTION B: SMTP Transporter Integration
  if (process.env.SMTP_HOST) {
    try {
      console.log('📡 [SMTP GATEWAY] Connecting to server...');
      const transporter = await getTransporter();
      if (!transporter) throw new Error('Could not establish SMTP connection.');

      const mailOptions = {
        from: '"KrishiMitra AI Security" <no-reply@krishimitra.com>',
        to: email,
        subject: 'KrishiMitra AI Login Code / 🔐 ओटीपी कोड',
        text: `Your KrishiMitra AI verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 450px;">
            <h2 style="color: #16a34a; margin-top: 0;">🌱 KrishiMitra AI</h2>
            <p>Hello Farmer / नमस्ते किसान,</p>
            <p>Use the following 6-digit verification code to access your KrishiMitra AI account:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #f0fdf4; color: #16a34a; padding: 12px; text-align: center; border-radius: 8px; letter-spacing: 4px; margin: 15px 0;">
              ${otp}
            </div>
            <p style="font-size: 11px; color: #64748b;">This OTP code is valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ [SMTP GATEWAY] Mail delivered successfully.');
      return res.status(200).json({ 
        success: true, 
        message: 'OTP delivered to your Gmail account successfully via SMTP.' 
      });
    } catch (err) {
      console.error('❌ [SMTP GATEWAY] Mail delivery error:', err.message);
      return res.status(500).json({ 
        error: 'SMTP Mail Delivery Failed', 
        details: err.message || 'Check your SMTP host credentials and secure ports.' 
      });
    }
  }

  // OPTION C: Fallback error explaining what variables to set
  return res.status(500).json({
    error: 'Email Provider Not Configured',
    details: 'No email service is active on the server. Please open backend/.env and add: RESEND_API_KEY=your_key_here'
  });
};

// 2. VERIFY OTP AND SIGN IN / SIGN UP USER
export const verifyOtp = async (req, res) => {
  const { email, otp, displayName } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required' });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({ error: 'No active OTP found. Please click resend.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'OTP code has expired. Please request a new one.' });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
  }

  // Clear OTP on success
  otpStore.delete(email.toLowerCase());

  try {
    // Search or create user profile
    let user = await db.findOne(User, { email: email.toLowerCase() });
    
    if (user) {
      // Sync login
      if (displayName) {
        user = await db.findOneAndUpdate(User, { email: email.toLowerCase() }, { displayName });
      }
    } else {
      // Create user
      user = await db.create(User, {
        firebaseId: `otp-${Math.random().toString(36).substring(2, 11)}`,
        email: email.toLowerCase(),
        displayName: displayName || email.split('@')[0],
        role: email.toLowerCase() === 'admin@krishimitra.com' ? 'admin' : 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        language: 'en',
        theme: 'light',
        phoneNumber: ''
      });
    }

    console.log(`🔐 [OTP SERVICE] User ${email} authenticated successfully.`);
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ error: 'Database session initialization failed', details: err.message });
  }
};
