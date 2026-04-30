/**
 * Team timesheets — wire to REST when available.
 * Intended: GET /api/timesheets, GET /api/timesheets/pending, PATCH /api/timesheets/:id/approve
 */
export const TIMESHEETS_API = {
  base: '/api/timesheets',
  pending: '/api/timesheets/pending',
  approve: (id: number | string) => `/api/timesheets/${id}/approve`,
} as const;

export const timesheetsService = {
  async listPending(): Promise<{ success: true; data: unknown[] }> {
    return { success: true, data: [] };
  },
};
