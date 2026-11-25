import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function kirimOtpEmail(email, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Konfigurasi Gmail SMTP belum lengkap');
  }

  return transporter.sendMail({
    from: `"Frozzy" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Kode OTP Reset Password Frozzy',
    text: `Kode OTP kamu adalah ${otp}. Kode berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2>Reset Password Frozzy</h2>
        <p>Gunakan kode OTP berikut untuk mengatur ulang password:</p>
        <h1 style="letter-spacing:8px;color:#0052CC">${otp}</h1>
        <p>Kode berlaku selama 5 menit.</p>
        <p>Jangan bagikan kode ini kepada siapa pun.</p>
      </div>
    `,
  });
}
