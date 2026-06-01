"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const calendar_service_1 = require("../services/calendar.service");
class CalendarController {
    constructor() {
        this.createEvent = async (req, res) => {
            try {
                const userId = req.user.id;
                const event = await this.calendarService.createEvent(userId, req.body);
                res.status(201).json({
                    success: true,
                    message: 'Event created successfully',
                    data: event
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create event'
                });
            }
        };
        this.getEvents = async (req, res) => {
            try {
                const userId = req.user.id;
                const { startDate, endDate, eventType } = req.query;
                const events = await this.calendarService.getEvents(userId, {
                    startDate: startDate,
                    endDate: endDate,
                    eventType: eventType
                });
                res.status(200).json({
                    success: true,
                    data: events
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch events'
                });
            }
        };
        this.getEventById = async (req, res) => {
            try {
                const { id } = req.params;
                const event = await this.calendarService.getEventById(parseInt(id));
                res.status(200).json({
                    success: true,
                    data: event
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: error.message || 'Event not found'
                });
            }
        };
        this.updateEvent = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.id;
                const event = await this.calendarService.updateEvent(parseInt(id), userId, req.body);
                res.status(200).json({
                    success: true,
                    message: 'Event updated successfully',
                    data: event
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update event'
                });
            }
        };
        this.deleteEvent = async (req, res) => {
            try {
                const { id } = req.params;
                const userId = req.user.id;
                await this.calendarService.deleteEvent(parseInt(id), userId);
                res.status(200).json({
                    success: true,
                    message: 'Event deleted successfully'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to delete event'
                });
            }
        };
        this.addAttendees = async (req, res) => {
            try {
                const { id } = req.params;
                const { attendeeIds } = req.body;
                const attendees = await this.calendarService.addAttendees(parseInt(id), attendeeIds);
                res.status(200).json({
                    success: true,
                    message: 'Attendees added successfully',
                    data: attendees
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to add attendees'
                });
            }
        };
        this.updateAttendeeStatus = async (req, res) => {
            try {
                const { id, attendeeId } = req.params;
                const { status } = req.body;
                const attendee = await this.calendarService.updateAttendeeStatus(parseInt(id), parseInt(attendeeId), status);
                res.status(200).json({
                    success: true,
                    message: 'Attendee status updated',
                    data: attendee
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update attendee status'
                });
            }
        };
        this.calendarService = new calendar_service_1.CalendarService();
    }
}
exports.CalendarController = CalendarController;
