import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { CalendarController } from '../controllers/calendar.controller';

const router = Router();
const calendarController = new CalendarController();

router.use(authenticate);

router.post('/events', calendarController.createEvent);
router.get('/events', calendarController.getEvents);
router.get('/events/:id', calendarController.getEventById);
router.put('/events/:id', calendarController.updateEvent);
router.delete('/events/:id', calendarController.deleteEvent);

router.post('/events/:id/attendees', calendarController.addAttendees);
router.put('/events/:id/attendees/:attendeeId/status', calendarController.updateAttendeeStatus);

export default router;
