"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    async createNotification(data) {
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
    async getNotifications(employeeId, unreadOnly = false) {
        const where = {
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
    async markAsRead(notificationId, employeeId) {
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
    async markAllAsRead(employeeId) {
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
    async getUnreadCount(employeeId) {
        const count = await prisma.notificationRecipient.count({
            where: {
                recipientId: employeeId,
                isRead: false
            }
        });
        return count;
    }
}
exports.NotificationService = NotificationService;
