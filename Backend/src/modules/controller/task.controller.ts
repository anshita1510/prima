import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto, CreateTaskCommentDto } from '../dto/task.dto';

const prisma = new PrismaClient();

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService(prisma);
  }

  createTask = async (req: Request, res: Response) => {
    try {
      const validatedData = CreateTaskDto.parse(req.body);
      const { employeeId, companyId, role } = req.user as any;

      const task = await this.taskService.createTask(
        validatedData,
        employeeId,
        companyId,
        role
      );

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create task'
      });
    }
  };

  getTasks = async (req: Request, res: Response) => {
    try {
      const validatedQuery = TaskQueryDto.parse(req.query);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
      const isSuperAdmin = role === 'SUPER_ADMIN';

      const result = await this.taskService.getTasks(
        validatedQuery,
        isSuperAdmin ? null : companyId, // Super admins can see all companies
        employeeId,
        isManager
      );

      res.json({
        success: true,
        data: result.tasks,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch tasks'
      });
    }
  };

  getTaskById = async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      const task = await this.taskService.getTaskById(
        taskId,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        data: task
      });
    } catch (error: any) {
      res.status(error.message === 'Task not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to fetch task'
      });
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const validatedData = UpdateTaskDto.parse(req.body);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      const task = await this.taskService.updateTask(
        taskId,
        validatedData,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error: any) {
      res.status(error.message === 'Task not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to update task'
      });
    }
  };

  deleteTask = async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      await this.taskService.deleteTask(
        taskId,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      res.status(error.message === 'Task not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to delete task'
      });
    }
  };

  addTaskComment = async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const validatedData = CreateTaskCommentDto.parse(req.body);
      const { employeeId, companyId } = req.user as any;

      const comment = await this.taskService.addTaskComment(
        taskId,
        validatedData,
        employeeId,
        companyId
      );

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error: any) {
      res.status(error.message === 'Task not found or access denied' ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to add comment'
      });
    }
  };

  getMyTasks = async (req: Request, res: Response) => {
    try {
      const { employeeId, companyId } = req.user as any;
      const { status } = req.query;

      const tasks = await this.taskService.getMyTasks(
        employeeId,
        companyId,
        status as string
      );

      res.json({
        success: true,
        data: tasks
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch your tasks'
      });
    }
  };

  getTaskStats = async (req: Request, res: Response) => {
    try {
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
      const isSuperAdmin = role === 'SUPER_ADMIN';

      const stats = await this.taskService.getTaskStats(
        isSuperAdmin ? null : companyId, // Super admins can see stats from all companies
        employeeId,
        isManager
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch task statistics'
      });
    }
  };
}