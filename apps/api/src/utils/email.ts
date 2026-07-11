import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: Number(process.env.MAIL_PORT) || 2525,
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn('[EMAIL] Mailtrap credentials not set. Skipping email send.');
    return { message: 'Email credentials not configured', to, subject };
  }
  const info = await transporter.sendMail({
    from: `"StayEase" <${process.env.MAIL_FROM || 'noreply@stayease.com'}>`,
    to,
    subject,
    html,
  });
  return { messageId: info.messageId, to, subject };
}

export function verificationEmailTemplate(name: string, token: string) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #222;">
      <h2 style="color: #ff385c;">Verifikasi Akun StayEase</h2>
      <p>Halo ${name || ''},</p>
      <p>Terima kasih telah mendaftar. Klik tombol di bawah untuk verifikasi akun dan mengatur password:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#ff385c;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;">Verifikasi Akun</a>
      <p style="margin-top:16px;font-size:0.85rem;color:#666;">Token berlaku selama 1 jam. Jika tombol tidak berfungsi, salin link berikut:</p>
      <p style="font-size:0.8rem;word-break:break-all;color:#444;">${link}</p>
    </div>
  `;
}

export function resetPasswordEmailTemplate(name: string, token: string) {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #222;">
      <h2 style="color: #ff385c;">Reset Password StayEase</h2>
      <p>Halo ${name || ''},</p>
      <p>Kami menerima permintaan reset password. Klik tombol di bawah untuk mengatur password baru:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#ff385c;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;">Reset Password</a>
      <p style="margin-top:16px;font-size:0.85rem;color:#666;">Token berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>
    </div>
  `;
}
