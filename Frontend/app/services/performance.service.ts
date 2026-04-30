/**
 * Goals, ratings, progress — wire to REST when available.
 * Intended: GET /api/performance/goals, GET /api/performance/reviews, GET /api/performance/progress
 */
export const PERFORMANCE_API = {
  goals: '/api/performance/goals',
  reviews: '/api/performance/reviews',
  progress: '/api/performance/progress',
} as const;

export const performanceService = {
  async listGoals(): Promise<{ success: true; data: unknown[] }> {
    return { success: true, data: [] };
  },
};
