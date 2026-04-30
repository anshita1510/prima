/**
 * Personal & team alert preferences — wire to REST when available.
 * Intended: GET /api/notifications/preferences, PATCH /api/notifications/preferences
 */
export const NOTIFICATIONS_API = {
  preferences: '/api/notifications/preferences',
} as const;

export const notificationsService = {
  async getPreferences(): Promise<{ success: true; data: unknown | null }> {
    return { success: true, data: null };
  },
};
