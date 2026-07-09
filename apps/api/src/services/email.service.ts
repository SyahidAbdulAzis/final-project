// Email service for sending notifications using Nodemailer
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create transporter using environment variables
const createTransporter = () => {
  const emailHost = process.env.MAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.MAIL_PORT || '587');
  const emailUser = process.env.MAIL_USER;
  const emailPass = process.env.MAIL_PASS;
  const emailFrom = process.env.MAIL_FROM || emailUser;

  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return;
  }

  try {
    const emailFrom = process.env.MAIL_FROM || process.env.MAIL_USER;
    
    await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendPaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  bookingDetails: any
): Promise<void> {
  const subject = 'Pembayaran Booking Dikonfirmasi';
  const html = `
    <h2>Pembayaran Booking Dikonfirmasi</h2>
    <p>Halo ${userName},</p>
    <p>Pembayaran booking Anda telah dikonfirmasi. Berikut adalah detail booking Anda:</p>
    
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h3>Detail Booking</h3>
      <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
      <p><strong>Nama Kamar:</strong> ${bookingDetails.room.name}</p>
      <p><strong>Properti:</strong> ${bookingDetails.room.property.name}</p>
      <p><strong>Check-in:</strong> ${new Date(bookingDetails.checkIn).toLocaleDateString('id-ID')}</p>
      <p><strong>Check-out:</strong> ${new Date(bookingDetails.checkOut).toLocaleDateString('id-ID')}</p>
      <p><strong>Total Harga:</strong> Rp ${bookingDetails.totalPrice.toLocaleString('id-ID')}</p>
    </div>
    
    <p>Terima kasih telah melakukan pembayaran. Kami menantikan kedatangan Anda!</p>
    <p>Salam,</p>
    <p>Tim Villa Stay Indonesia</p>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
}

export async function sendPaymentRejectionEmail(
  userEmail: string,
  userName: string,
  bookingDetails: any
): Promise<void> {
  const subject = 'Pembayaran Booking Ditolak';
  const html = `
    <h2>Pembayaran Booking Ditolak</h2>
    <p>Halo ${userName},</p>
    <p>Maaf, pembayaran booking Anda telah <strong>ditolak</strong> oleh tenant. Berikut adalah detail booking Anda:</p>
    
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h3>Detail Booking</h3>
      <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
      <p><strong>Nama Kamar:</strong> ${bookingDetails.room.name}</p>
      <p><strong>Properti:</strong> ${bookingDetails.room.property.name}</p>
      <p><strong>Check-in:</strong> ${new Date(bookingDetails.checkIn).toLocaleDateString('id-ID')}</p>
      <p><strong>Check-out:</strong> ${new Date(bookingDetails.checkOut).toLocaleDateString('id-ID')}</p>
      <p><strong>Total Harga:</strong> Rp ${bookingDetails.totalPrice.toLocaleString('id-ID')}</p>
      <p><strong>Status:</strong> DITOLAK</p>
    </div>
    
    <p>Silakan hubungi tenant untuk informasi lebih lanjut atau lakukan booking ulang.</p>
    <p>Salam,</p>
    <p>Tim Villa Stay Indonesia</p>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
}

import prisma from '../lib/prisma.js';

export async function sendCheckInReminders(): Promise<number> {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: 'DIKONFIRMASI',
      reminderSentAt: null,
      checkIn: {
        gte: now,
        lte: in24Hours,
      },
    },
    include: {
      user: {
        select: { email: true, fullName: true },
      },
      room: {
        include: {
          property: { select: { name: true, address: true } },
        },
      },
    },
  });

  let sentCount = 0;
  for (const booking of bookings) {
    try {
      await sendCheckInReminderEmail(
        booking.user.email,
        booking.user.fullName,
        booking,
      );
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: new Date() },
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, error);
    }
  }

  return sentCount;
}

export async function sendCheckInReminderEmail(
  userEmail: string,
  userName: string,
  bookingDetails: any
): Promise<void> {
  const subject = 'Pengingat Check-in Besok';
  const html = `
    <h2>Pengingat Check-in Besok</h2>
    <p>Halo ${userName},</p>
    <p>Ini adalah pengingat bahwa check-in untuk booking Anda akan dilakukan besok.</p>
    
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h3>Detail Booking</h3>
      <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
      <p><strong>Nama Kamar:</strong> ${bookingDetails.room.name}</p>
      <p><strong>Properti:</strong> ${bookingDetails.room.property.name}</p>
      <p><strong>Check-in:</strong> ${new Date(bookingDetails.checkIn).toLocaleDateString('id-ID')}</p>
      <p><strong>Check-out:</strong> ${new Date(bookingDetails.checkOut).toLocaleDateString('id-ID')}</p>
      <p><strong>Alamat:</strong> ${bookingDetails.room.property.address}</p>
    </div>
    
    <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
      <h3>Tata Cara Penggunaan dan Aturan</h3>
      <ul>
        <li>Check-in dimulai pukul 14:00 WIB</li>
        <li>Check-out dilakukan sebelum pukul 12:00 WIB</li>
        <li>Silakan bawa KTP atau identitas yang valid saat check-in</li>
        <li>Dilarang membawa hewan peliharaan kecuali ada izin khusus</li>
        <li>Jaga kebersihan dan ketertiban selama menginap</li>
        <li>Hubungi pihak properti jika ada kendala atau pertanyaan</li>
      </ul>
    </div>
    
    <p>Kami menantikan kedatangan Anda!</p>
    <p>Salam,</p>
    <p>Tim Villa Stay Indonesia</p>
  `;
  
  await sendEmail({ to: userEmail, subject, html });
}
