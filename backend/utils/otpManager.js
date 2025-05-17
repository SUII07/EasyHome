import nodemailer from 'nodemailer';

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'EasyHome - Email Verification OTP',
    html: `
      <h2>Welcome to EasyHome!</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 1 minute.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Store OTP with expiration
export const storeOTP = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 60 * 1000 // 1 minute
  });
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired' };
  }

  if (storedData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  // Clear OTP after successful verification
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully' };
}; 