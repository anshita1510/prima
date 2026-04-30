import { z } from 'zod';

export const CreateProjectDto = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  departmentId: z.number().int().positive(),
  memberIds: z.array(z.number().int().positive()).optional().default([])
});

export const UpdateProjectDto = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  departmentId: z.number().int().positive().optional(),
  memberIds: z.array(z.number().int().positive()).optional(),
  isActive: z.boolean().optional()
});

export const ProjectQueryDto = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default(10),
  departmentId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  ownerId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  isActive: z.string().transform(val => val === 'true').optional()
});

export type CreateProjectDtoType = z.infer<typeof CreateProjectDto>;
export type UpdateProjectDtoType = z.infer<typeof UpdateProjectDto>;
export type ProjectQueryDtoType = z.infer<typeof ProjectQueryDto>;