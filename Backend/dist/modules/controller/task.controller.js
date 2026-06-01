"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const client_1 = require("@prisma/client");
const task_service_1 = require("../services/task.service");
const task_dto_1 = require("../dto/task.dto");
const prisma = new client_1.PrismaClient();
class TaskController {
    constructor() {
        this.createTask = async (req, res) => {
            try {
                const validatedData = task_dto_1.CreateTaskDto.parse(req.body);
                const { employeeId, companyId, role } = req.user;
                const task = await this.taskService.createTask(validatedData, employeeId, companyId, role);
                res.status(201).json({
                    success: true,
                    message: 'Task created successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create task'
                });
            }
        };
        this.getTasks = async (req, res) => {
            try {
                const validatedQuery = task_dto_1.TaskQueryDto.parse(req.query);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const isSuperAdmin = role === 'SUPER_ADMIN';
                const result = await this.taskService.getTasks(validatedQuery, isSuperAdmin ? null : companyId, // Super admins can see all companies
                employeeId, isManager);
                res.json({
                    success: true,
                    data: result.tasks,
                    pagination: result.pagination
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch tasks'
                });
            }
        };
        this.getTaskById = async (req, res) => {
            try {
                const taskId = parseInt(req.params.id);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const task = await this.taskService.getTaskById(taskId, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    data: task
                });
            }
            catch (error) {
                res.status(error.message === 'Task not found' ? 404 : 403).json({
                    success: false,
                    message: error.message || 'Failed to fetch task'
                });
            }
        };
        this.updateTask = async (req, res) => {
            try {
                const taskId = parseInt(req.params.id);
                const validatedData = task_dto_1.UpdateTaskDto.parse(req.body);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const task = await this.taskService.updateTask(taskId, validatedData, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    message: 'Task updated successfully',
                    data: task
                });
            }
            catch (error) {
                res.status(error.message === 'Task not found' ? 404 : 403).json({
                    success: false,
                    message: error.message || 'Failed to update task'
                });
            }
        };
        this.deleteTask = async (req, res) => {
            try {
                const taskId = parseInt(req.params.id);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                await this.taskService.deleteTask(taskId, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    message: 'Task deleted successfully'
                });
            }
            catch (error) {
                res.status(error.message === 'Task not found' ? 404 : 403).json({
                    success: false,
                    message: error.message || 'Failed to delete task'
                });
            }
        };
        this.addTaskComment = async (req, res) => {
            try {
                const taskId = parseInt(req.params.id);
                const validatedData = task_dto_1.CreateTaskCommentDto.parse(req.body);
                const { employeeId, companyId } = req.user;
                const comment = await this.taskService.addTaskComment(taskId, validatedData, employeeId, companyId);
                res.status(201).json({
                    success: true,
                    message: 'Comment added successfully',
                    data: comment
                });
            }
            catch (error) {
                res.status(error.message === 'Task not found or access denied' ? 404 : 400).json({
                    success: false,
                    message: error.message || 'Failed to add comment'
                });
            }
        };
        this.getMyTasks = async (req, res) => {
            try {
                const { employeeId, companyId } = req.user;
                const { status } = req.query;
                const tasks = await this.taskService.getMyTasks(employeeId, companyId, status);
                res.json({
                    success: true,
                    data: tasks
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch your tasks'
                });
            }
        };
        this.getTaskStats = async (req, res) => {
            try {
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const isSuperAdmin = role === 'SUPER_ADMIN';
                const stats = await this.taskService.getTaskStats(isSuperAdmin ? null : companyId, // Super admins can see stats from all companies
                employeeId, isManager);
                res.json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch task statistics'
                });
            }
        };
        this.taskService = new task_service_1.TaskService(prisma);
    }
}
exports.TaskController = TaskController;
