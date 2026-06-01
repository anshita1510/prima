"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkNotificationReadDto = exports.NotificationQueryDto = exports.CreateNotificationDto = exports.NotificationTypeEnum = void 0;
const zod_1 = require("zod");
exports.NotificationTypeEnum = zod_1.z.enum([
    'TASK_ASSIGNED',
    'TASK_UPDATED',
    'TASK_OVERDUE',
    'PROJECT_CREATED',
    'PROJECT_UPDATED',
    'DEADLINE_REMINDER',
    'DEPENDENCY_BLOCKED'
]);
exports.CreateNotificationDto = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Notification title is required'),
    message: zod_1.z.string().min(1, 'Notification message is required'),
    type: exports.NotificationTypeEnum,
    referenceId: zod_1.z.number().int().positive().optional(),
    referenceType: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    recipientIds: zod_1.z.array(zod_1.z.number().int().positive()).min(1, 'At least one recipient is required')
});
exports.NotificationQueryDto = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional().default(1),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive().max(100)).optional().default(10),
    type: exports.NotificationTypeEnum.optional(),
    isRead: zod_1.z.string().transform(val => val === 'true').optional(),
    recipientId: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional()
});
exports.MarkNotificationReadDto = zod_1.z.object({
    notificationIds: zod_1.z.array(zod_1.z.number().int().positive()).min(1)
});
