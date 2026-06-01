"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskCommentDto = exports.TaskQueryDto = exports.UpdateTaskDto = exports.CreateTaskDto = exports.TaskPriorityEnum = exports.TaskStatusEnum = void 0;
const zod_1 = require("zod");
exports.TaskStatusEnum = zod_1.z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED']);
exports.TaskPriorityEnum = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
exports.CreateTaskDto = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Task title is required'),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.number().int().positive(),
    assignedToId: zod_1.z.number().int().positive().optional(),
    priority: exports.TaskPriorityEnum.optional().default('MEDIUM'),
    dueDate: zod_1.z.string().optional().transform(val => {
        if (!val)
            return undefined;
        // Accept both date-only (2026-04-15) and full ISO datetime
        const d = new Date(val);
        if (isNaN(d.getTime()))
            return undefined;
        return d.toISOString();
    }),
    startDate: zod_1.z.string().optional().transform(val => {
        if (!val)
            return undefined;
        const d = new Date(val);
        if (isNaN(d.getTime()))
            return undefined;
        return d.toISOString();
    }),
    estimatedHours: zod_1.z.number().int().positive().optional()
});
exports.UpdateTaskDto = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    assignedToId: zod_1.z.number().int().positive().optional(),
    status: exports.TaskStatusEnum.optional(),
    priority: exports.TaskPriorityEnum.optional(),
    dueDate: zod_1.z.string().optional().transform(val => {
        if (!val)
            return undefined;
        const d = new Date(val);
        if (isNaN(d.getTime()))
            return undefined;
        return d.toISOString();
    }),
    startDate: zod_1.z.string().optional().transform(val => {
        if (!val)
            return undefined;
        const d = new Date(val);
        if (isNaN(d.getTime()))
            return undefined;
        return d.toISOString();
    }),
    estimatedHours: zod_1.z.number().int().positive().optional(),
    actualHours: zod_1.z.number().int().positive().optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.TaskQueryDto = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional().default(1),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive().max(500)).optional().default(10),
    projectId: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional(),
    assignedToId: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional(),
    status: exports.TaskStatusEnum.optional(),
    priority: exports.TaskPriorityEnum.optional(),
    isActive: zod_1.z.string().transform(val => val === 'true').optional()
});
exports.CreateTaskCommentDto = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content is required')
});
