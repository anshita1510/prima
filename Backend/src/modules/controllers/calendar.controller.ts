import { Request, Response } from 'express';
import { CalendarService } from '../services/calendar.service';

export class CalendarController {
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();
  }

  createEvent = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const event = await this.calendarService.createEvent(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create event'
      });
    }
  };

  getEvents = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate, eventType } = req.query;

      const events = await this.calendarService.getEvents(userId, {
        startDate: startDate as string,
        endDate: endDate as string,
        eventType: eventType as string
      });

      res.status(200).json({
        success: true,
        data: events
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch events'
      });
    }
  };

  getEventById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const event = await this.calendarService.getEventById(parseInt(id));

      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Event not found'
      });
    }
  };

  updateEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const event = await this.calendarService.updateEvent(parseInt(id), userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update event'
      });
    }
  };

  deleteEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      await this.calendarService.deleteEvent(parseInt(id), userId);

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete event'
      });
    }
  };

  addAttendees = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { attendeeIds } = req.body;

      const attendees = await this.calendarService.addAttendees(parseInt(id), attendeeIds);

      res.status(200).json({
        success: true,
        message: 'Attendees added successfully',
        data: attendees
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add attendees'
      });
    }
  };

  updateAttendeeStatus = async (req: Request, res: Response) => {
    try {
      const { id, attendeeId } = req.params;
      const { status } = req.body;

      const attendee = await this.calendarService.updateAttendeeStatus(
        parseInt(id),
        parseInt(attendeeId),
        status
      );

      res.status(200).json({
        success: true,
        message: 'Attendee status updated',
        data: attendee
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update attendee status'
      });
    }
  };
}
