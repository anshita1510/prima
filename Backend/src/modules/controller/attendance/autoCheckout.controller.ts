import { Request, Response } from 'express';
import { attendanceService } from '../../services/attendanceService';

class AutoCheckoutController {
  // Manual trigger for auto-checkout (for testing)
  async triggerAutoCheckout(req: Request, res: Response) {
    try {
      console.log('🕕 Manual auto-checkout trigger initiated');
      
      const result = await attendanceService.performAutoCheckout();
      
      res.status(200).json({
        success: true,
        message: 'Auto-checkout process completed',
        data: result
      });
    } catch (error: any) {
      console.error('❌ Auto-checkout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Auto-checkout failed'
      });
    }
  }

  // Scheduled auto-checkout (called by cron job)
  async scheduledAutoCheckout(req: Request, res: Response) {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Only run at 6:30 PM (18:30)
      if (currentHour !== 18 || currentMinute !== 30) {
        return res.status(400).json({
          success: false,
          message: 'Auto-checkout only runs at 6:30 PM'
        });
      }
      
      console.log('🕕 Scheduled auto-checkout initiated at 6:30 PM');
      
      const result = await attendanceService.performAutoCheckout();
      
      res.status(200).json({
        success: true,
        message: 'Scheduled auto-checkout completed',
        data: result
      });
    } catch (error: any) {
      console.error('❌ Scheduled auto-checkout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Scheduled auto-checkout failed'
      });
    }
  }
}

export const autoCheckoutController = new AutoCheckoutController();