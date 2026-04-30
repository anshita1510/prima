import { Router } from 'express';
import { NotificationController } from '../controller/notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(authenticate);

// Notification CRUD routes
router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.put('/mark-read', notificationController.markAsRead);
router.get('/unread-count', notificationController.getUnreadCount);

export default router;