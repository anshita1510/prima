"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoCheckoutController = void 0;
const attendanceService_1 = require("../../services/attendanceService");
class AutoCheckoutController {
    // Manual trigger for auto-checkout (for testing)
    async triggerAutoCheckout(req, res) {
        try {
            console.log('🕕 Manual auto-checkout trigger initiated');
            const result = await attendanceService_1.attendanceService.performAutoCheckout();
            res.status(200).json({
                success: true,
                message: 'Auto-checkout process completed',
                data: result
            });
        }
        catch (error) {
            console.error('❌ Auto-checkout error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Auto-checkout failed'
            });
        }
    }
    // Scheduled auto-checkout (called by cron job)
    async scheduledAutoCheckout(req, res) {
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
            const result = await attendanceService_1.attendanceService.performAutoCheckout();
            res.status(200).json({
                success: true,
                message: 'Scheduled auto-checkout completed',
                data: result
            });
        }
        catch (error) {
            console.error('❌ Scheduled auto-checkout error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Scheduled auto-checkout failed'
            });
        }
    }
}
exports.autoCheckoutController = new AutoCheckoutController();
