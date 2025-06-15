// backend/src/utils/mailer.ts

import nodemailer from 'nodemailer';
import { env } from './env';

// ✅ Define transporter here
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  logger: true,
  debug: false, // Set to true for detailed SMTP logs
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"FishChain" <${env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your FishChain Password',
    html: `<p>We received a request to reset your password. Click the link below:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>If you did not request this, ignore the email.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions); // ✅ Now transporter is defined
    console.log('✅ Reset password email sent:', email);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Failed to send password reset email');
  }
};