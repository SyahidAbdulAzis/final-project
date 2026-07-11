import cron from 'node-cron';
import { expirePendingConfirmations } from '../services/booking-payment.service.js';
import { sendCheckInReminders } from '../services/email.service.js';

export function setupScheduler() {
  // Run every 5 minutes to expire bookings past 2-day confirmation window
  cron.schedule('*/5 * * * *', async () => {
    try {
      await expirePendingConfirmations();
    } catch (error) {
      console.error('Scheduler error (expirePendingConfirmations):', error);
    }
  });

  // Run every 30 minutes to send check-in reminders for bookings within 24h
  cron.schedule('*/30 * * * *', async () => {
    try {
      await sendCheckInReminders();
    } catch (error) {
      console.error('Scheduler error (sendCheckInReminders):', error);
    }
  });
}
