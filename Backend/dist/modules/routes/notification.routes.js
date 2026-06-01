"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controller/notification.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Notification CRUD routes
router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.put('/mark-read', notificationController.markAsRead);
router.get('/unread-count', notificationController.getUnreadCount);
exports.default = router;
