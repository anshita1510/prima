import cron from 'node-cron';
import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5004';

export const scheduleAutoCheckout = () => {
  cron.schedule(
    '30 18 * * *',
    async () => {
      try {
        console.log('🕕 Running scheduled auto-checkout at 6:30 PM...');

        const response = await axios.post(
          `${API_BASE_URL}/api/attendance/auto-checkout/scheduled`,
          {},
          { timeout: 15000 }
        );

        if (response.data.success) {
          const result = response.data.data;
          console.log(
            `✅ Auto-checkout completed: ${result.successCount}/${result.processedCount}`
          );

          if (result.failureCount > 0) {
            console.warn(`⚠️ ${result.failureCount} employees failed`);
          }
        } else {
          console.error('❌ Auto-checkout failed:', response.data.message);
        }
      } catch (error: any) {
        console.error('❌ Cron job error:', {
          message: error.message,
          status: error?.response?.status,
          data: error?.response?.data
        });
      }
    },
    { timezone: 'Asia/Kolkata' }
  );

  console.log('📅 Auto-checkout cron scheduled at 6:30 PM IST');
};
