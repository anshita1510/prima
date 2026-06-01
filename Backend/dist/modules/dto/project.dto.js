"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectQueryDto = exports.UpdateProjectDto = exports.CreateProjectDto = void 0;
const zod_1 = require("zod");
exports.CreateProjectDto = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Project name is required'),
    description: zod_1.z.string().optional(),
    departmentId: zod_1.z.number().int().positive(),
    memberIds: zod_1.z.array(zod_1.z.number().int().positive()).optional().default([])
});
exports.UpdateProjectDto = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    departmentId: zod_1.z.number().int().positive().optional(),
    memberIds: zod_1.z.array(zod_1.z.number().int().positive()).optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.ProjectQueryDto = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional().default(1),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive().max(100)).optional().default(10),
    departmentId: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional(),
    ownerId: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().positive()).optional(),
    isActive: zod_1.z.string().transform(val => val === 'true').optional()
});
