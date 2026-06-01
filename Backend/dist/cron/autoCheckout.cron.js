"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleAutoCheckout = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5004';
const scheduleAutoCheckout = () => {
    node_cron_1.default.schedule('30 18 * * *', async () => {
        try {
            console.log('🕕 Running scheduled auto-checkout at 6:30 PM...');
            const response = await axios_1.default.post(`${API_BASE_URL}/api/attendance/auto-checkout/scheduled`, {}, { timeout: 15000 });
            if (response.data.success) {
                const result = response.data.data;
                console.log(`✅ Auto-checkout completed: ${result.successCount}/${result.processedCount}`);
                if (result.failureCount > 0) {
                    console.warn(`⚠️ ${result.failureCount} employees failed`);
                }
            }
            else {
                console.error('❌ Auto-checkout failed:', response.data.message);
            }
        }
        catch (error) {
            console.error('❌ Cron job error:', {
                message: error.message,
                status: error?.response?.status,
                data: error?.response?.data
            });
        }
    }, { timezone: 'Asia/Kolkata' });
    console.log('📅 Auto-checkout cron scheduled at 6:30 PM IST');
};
exports.scheduleAutoCheckout = scheduleAutoCheckout;
