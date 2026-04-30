/**
 * Team announcements — wire to REST when available.
 * Intended: GET /api/announcements, POST /api/announcements
 */
export const ANNOUNCEMENTS_API = {
  base: '/api/announcements',
} as const;

export const announcementsService = {
  async list(): Promise<{ success: true; data: unknown[] }> {
    return { success: true, data: [] };
  },
};
