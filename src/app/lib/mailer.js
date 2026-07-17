import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // you can change to another service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
      <h2 style="color: #28a745;">Your duoexchange Verification Code</h2>
      <p>Use the code below to verify your email address:</p>
      <h1 style="font-size: 48px; color: #28a745;">${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
        © 2025 duoexchange. All rights reserved.
      </footer>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Your duoexchange Verification Code',
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};
