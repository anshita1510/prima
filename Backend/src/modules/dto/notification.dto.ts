import { z } from 'zod';

export const NotificationTypeEnum = z.enum([
  'TASK_ASSIGNED',
  'TASK_UPDATED', 
  'TASK_OVERDUE',
  'PROJECT_CREATED',
  'PROJECT_UPDATED',
  'DEADLINE_REMINDER',
  'DEPENDENCY_BLOCKED'
]);

export const CreateNotificationDto = z.object({
  title: z.string().min(1, 'Notification title is required'),
  message: z.string().min(1, 'Notification message is required'),
  type: NotificationTypeEnum,
  referenceId: z.number().int().positive().optional(),
  referenceType: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  recipientIds: z.array(z.number().int().positive()).min(1, 'At least one recipient is required')
});

export const NotificationQueryDto = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default(10),
  type: NotificationTypeEnum.optional(),
  isRead: z.string().transform(val => val === 'true').optional(),
  recipientId: z.string().transform(Number).pipe(z.number().int().positive()).optional()
});

export const MarkNotificationReadDto = z.object({
  notificationIds: z.array(z.number().int().positive()).min(1)
});

export type CreateNotificationDtoType = z.infer<typeof CreateNotificationDto>;
export type NotificationQueryDtoType = z.infer<typeof NotificationQueryDto>;
export type MarkNotificationReadDtoType = z.infer<typeof MarkNotificationReadDto>;