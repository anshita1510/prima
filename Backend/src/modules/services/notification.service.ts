import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateNotificationDTO {
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number;
  referenceType?: string;
  createdById: number;
  recipientIds: number[];
  metadata?: any;
}

export class NotificationService {
  async createNotification(data: CreateNotificationDTO) {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        metadata: data.metadata,
        createdById: data.createdById,
        recipients: {
          create: data.recipientIds.map(recipientId => ({
            recipientId,
            isRead: false
          }))
        }
      },
      include: {
        recipients: {
          include: {
            recipient: {
              include: { user: true }
            }
          }
        }
      }
    });

    return notification;
  }

  async getNotifications(employeeId: number, unreadOnly: boolean = false) {
    const where: any = {
      recipientId: employeeId
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notificationRecipient.findMany({
      where,
      include: {
        notification: {
          include: {
            createdBy: {
              include: { user: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return notifications;
  }

  async markAsRead(notificationId: number, employeeId: number) {
    const notification = await prisma.notificationRecipient.updateMany({
      where: {
        notificationId,
        recipientId: employeeId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return notification;
  }

  async markAllAsRead(employeeId: number) {
    const notifications = await prisma.notificationRecipient.updateMany({
      where: {
        recipientId: employeeId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return notifications;
  }

  async getUnreadCount(employeeId: number) {
    const count = await prisma.notificationRecipient.count({
      where: {
        recipientId: employeeId,
        isRead: false
      }
    });

    return count;
  }
}
