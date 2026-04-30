/**
 * 1:1s and team meetings — wire to REST when available.
 * Intended: GET /api/meetings, POST /api/meetings, GET /api/meetings/:id
 */
export const MEETINGS_API = {
  base: '/api/meetings',
  byId: (id: number | string) => `/api/meetings/${id}`,
} as const;

export const meetingsService = {
  async listUpcoming(): Promise<{ success: true; data: unknown[] }> {
    return { success: true, data: [] };
  },
};
