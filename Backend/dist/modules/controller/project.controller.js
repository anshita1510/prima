"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const client_1 = require("@prisma/client");
const project_service_1 = require("../services/project.service");
const project_dto_1 = require("../dto/project.dto");
const prisma = new client_1.PrismaClient();
class ProjectController {
    constructor() {
        this.createProject = async (req, res) => {
            try {
                const validatedData = project_dto_1.CreateProjectDto.parse(req.body);
                const { employeeId, companyId } = req.user;
                const project = await this.projectService.createProject(validatedData, employeeId, companyId);
                res.status(201).json({
                    success: true,
                    message: 'Project created successfully',
                    data: project
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to create project'
                });
            }
        };
        this.getProjects = async (req, res) => {
            try {
                const validatedQuery = project_dto_1.ProjectQueryDto.parse(req.query);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const result = await this.projectService.getProjects(validatedQuery, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    data: result.projects,
                    pagination: result.pagination
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to fetch projects'
                });
            }
        };
        this.getProjectById = async (req, res) => {
            try {
                const projectId = parseInt(req.params.id);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const project = await this.projectService.getProjectById(projectId, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    data: project
                });
            }
            catch (error) {
                res.status(error.message === 'Project not found' ? 404 : 403).json({
                    success: false,
                    message: error.message || 'Failed to fetch project'
                });
            }
        };
        this.updateProject = async (req, res) => {
            try {
                const projectId = parseInt(req.params.id);
                const validatedData = project_dto_1.UpdateProjectDto.parse(req.body);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                const project = await this.projectService.updateProject(projectId, validatedData, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    message: 'Project updated successfully',
                    data: project
                });
            }
            catch (error) {
                res.status(error.message === 'Project not found' ? 404 : 403).json({
                    success: false,
                    message: error.message || 'Failed to update project'
                });
            }
        };
        this.deleteProject = async (req, res) => {
            try {
                const projectId = parseInt(req.params.id);
                const { employeeId, companyId, role } = req.user;
                const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
                await this.projectService.deleteProject(projectId, companyId, employeeId, isManager);
                res.json({
                    success: true,
                    message: 'Project deleted successfully'
                });
            }
            catch (error) {
                res.status(error.message === 'Project not found' ? 404 : 403).json({
                    success: false,
                    message: error.message || 'Failed to delete project'
                });
            }
        };
        this.getProjectMembers = async (req, res) => {
            try {
                const projectId = parseInt(req.params.id);
                const { companyId } = req.user;
                const members = await this.projectService.getProjectMembers(projectId, companyId);
                res.json({
                    success: true,
                    data: members
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: error.message || 'Failed to fetch project members'
                });
            }
        };
        this.projectService = new project_service_1.ProjectService(prisma);
    }
}
exports.ProjectController = ProjectController;
