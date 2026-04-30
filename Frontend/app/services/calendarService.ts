import axios from '@/lib/axios';

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay?: boolean;
  eventType: string;
  referenceId?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  attendeeIds?: number[];
  location?: string;
  organizer?: any;
  attendees?: any[];
}

export interface GetEventsParams {
  startDate?: string;
  endDate?: string;
  eventType?: string;
}

class CalendarService {
  private baseURL = '/api/calendar';

  async createEvent(eventData: CalendarEvent) {
    const response = await axios.post(`${this.baseURL}/events`, eventData);
    return response.data;
  }

  async getEvents(params?: GetEventsParams) {
    const response = await axios.get(`${this.baseURL}/events`, { params });
    return response.data;
  }

  async getEventById(eventId: number) {
    const response = await axios.get(`${this.baseURL}/events/${eventId}`);
    return response.data;
  }

  async updateEvent(eventId: number, eventData: Partial<CalendarEvent>) {
    const response = await axios.put(`${this.baseURL}/events/${eventId}`, eventData);
    return response.data;
  }

  async deleteEvent(eventId: number) {
    const response = await axios.delete(`${this.baseURL}/events/${eventId}`);
    return response.data;
  }

  async addAttendees(eventId: number, attendeeIds: number[]) {
    const response = await axios.post(`${this.baseURL}/events/${eventId}/attendees`, {
      attendeeIds
    });
    return response.data;
  }

  async updateAttendeeStatus(eventId: number, attendeeId: number, status: string) {
    const response = await axios.put(
      `${this.baseURL}/events/${eventId}/attendees/${attendeeId}/status`,
      { status }
    );
    return response.data;
  }
}

export const calendarService = new CalendarService();
