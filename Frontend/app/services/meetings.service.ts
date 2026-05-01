/**
 * Admin meetings — backed by /api/calendar/events with eventType=MEETING.
 */
import { calendarService } from '@/app/services/calendarService';

export const SEED_MEETING_TAG = '[[seed:meeting:v1]]';

export type MeetingAttendeeRow = {
  id: number;
  attendeeId: number;
  status: string;
  attendee?: {
    id: number;
    name: string;
    user?: { email?: string; firstName?: string; lastName?: string };
  };
};

export type MeetingEvent = {
  id: number;
  title: string;
  description?: string | null;
  startDateTime: string;
  endDateTime: string;
  isAllDay?: boolean;
  eventType: string;
  organizer?: {
    id: number;
    user?: { firstName?: string; lastName?: string; email?: string };
  };
  attendees?: MeetingAttendeeRow[];
};

function rangeIso(daysBack: number, daysForward: number): { startDate: string; endDate: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysBack);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() + daysForward);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export function stripSeedMeetingFooter(description?: string | null): string {
  if (!description) return '';
  return description.replace(/\n\n\[\[seed:meeting:v1\]\]\s*$/i, '').trim();
}

export const meetingsService = {
  async listMeetings(daysBack = 90, daysForward = 180): Promise<{ success: boolean; data: MeetingEvent[]; message?: string }> {
    try {
      const { startDate, endDate } = rangeIso(daysBack, daysForward);
      const res = await calendarService.getEvents({
        startDate,
        endDate,
        eventType: 'MEETING',
      });
      if (res?.success && Array.isArray(res.data)) {
        return { success: true, data: res.data as MeetingEvent[] };
      }
      return { success: false, data: [], message: res?.message || 'Unexpected response' };
    } catch (e: any) {
      return {
        success: false,
        data: [],
        message: e.response?.data?.message || e.message || 'Failed to load meetings',
      };
    }
  },

  async deleteMeeting(id: number) {
    return calendarService.deleteEvent(id);
  },
};
