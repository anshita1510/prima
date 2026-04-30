import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notification.service';
import { 
  CreateNotificationDto, 
  NotificationQueryDto,
  MarkNotificationReadDto
} from '../dto/notification.dto';

const prisma = new PrismaClient();

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  createNotification = async (req: Request, res: Response) => {
    try {
      const validatedData = CreateNotificationDto.parse(req.body);
      const { employeeId } = req.user as any;

      const notification = await this.notificationService.createNotification({
        ...validatedData,
        createdById: employeeId
      });

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create notification'
      });
    }
  };

  getNotifications = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.user as any;
      const { unreadOnly } = req.query;

      const notifications = await this.notificationService.getNotifications(
        employeeId,
        unreadOnly === 'true'
      );

      res.json({
        success: true,
        data: notifications
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch notifications'
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const { notificationId } = req.body;
      const { employeeId } = req.user as any;

      if (notificationId) {
        await this.notificationService.markAsRead(notificationId, employeeId);
      } else {
        await this.notificationService.markAllAsRead(employeeId);
      }

      res.json({
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark notifications as read'
      });
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.user as any;

      const count = await this.notificationService.getUnreadCount(employeeId);

      res.json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch unread count'
      });
    }
  };
}