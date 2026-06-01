"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("../services/notification.service");
const notification_dto_1 = require("../dto/notification.dto");
const prisma = new client_1.PrismaClient();
class NotificationController {
    constructor() {
        this.createNotification = async (req, res) => {
            try {
                const validatedData = notification_dto_1.CreateNotificationDto.parse(req.body);
                const { employeeId } = req.user;
                const notification = await this.notificationService.createNotification({
                    ...validatedData,
                    createdById: employeeId
                });
                res.status(201).json({
                    success: true,
                    message: 'Notification created successfully',
                    data: notification
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create notification'
                });
            }
        };
        this.getNotifications = async (req, res) => {
            try {
                const { employeeId } = req.user;
                const { unreadOnly } = req.query;
                const notifications = await this.notificationService.getNotifications(employeeId, unreadOnly === 'true');
                res.json({
                    success: true,
                    data: notifications
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch notifications'
                });
            }
        };
        this.markAsRead = async (req, res) => {
            try {
                const { notificationId } = req.body;
                const { employeeId } = req.user;
                if (notificationId) {
                    await this.notificationService.markAsRead(notificationId, employeeId);
                }
                else {
                    await this.notificationService.markAllAsRead(employeeId);
                }
                res.json({
                    success: true,
                    message: 'Notifications marked as read'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to mark notifications as read'
                });
            }
        };
        this.getUnreadCount = async (req, res) => {
            try {
                const { employeeId } = req.user;
                const count = await this.notificationService.getUnreadCount(employeeId);
                res.json({
                    success: true,
                    data: { unreadCount: count }
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch unread count'
                });
            }
        };
        this.notificationService = new notification_service_1.NotificationService();
    }
}
exports.NotificationController = NotificationController;
