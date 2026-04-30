/**
 * Attendance summaries & productivity reports — wire to REST when available.
 * Intended: GET /api/reports/attendance, GET /api/reports/productivity
 */
export const REPORTS_API = {
  attendance: '/api/reports/attendance',
  productivity: '/api/reports/productivity',
} as const;

export const reportsService = {
  async getAttendanceSummary(): Promise<{ success: true; data: unknown | null }> {
    return { success: true, data: null };
  },
};
