import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from '../dto/project.dto';

const prisma = new PrismaClient();

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService(prisma);
  }

  createProject = async (req: Request, res: Response) => {
    try {
      const validatedData = CreateProjectDto.parse(req.body);
      const { employeeId, companyId } = req.user as any;

      const project = await this.projectService.createProject(
        validatedData,
        employeeId,
        companyId
      );

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create project'
      });
    }
  };

  getProjects = async (req: Request, res: Response) => {
    try {
      const validatedQuery = ProjectQueryDto.parse(req.query);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      const result = await this.projectService.getProjects(
        validatedQuery,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        data: result.projects,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch projects'
      });
    }
  };

  getProjectById = async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      const project = await this.projectService.getProjectById(
        projectId,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        data: project
      });
    } catch (error: any) {
      res.status(error.message === 'Project not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to fetch project'
      });
    }
  };

  updateProject = async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const validatedData = UpdateProjectDto.parse(req.body);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      const project = await this.projectService.updateProject(
        projectId,
        validatedData,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error: any) {
      res.status(error.message === 'Project not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to update project'
      });
    }
  };

  deleteProject = async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const { employeeId, companyId, role } = req.user as any;
      const isManager = ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

      await this.projectService.deleteProject(
        projectId,
        companyId,
        employeeId,
        isManager
      );

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error: any) {
      res.status(error.message === 'Project not found' ? 404 : 403).json({
        success: false,
        message: error.message || 'Failed to delete project'
      });
    }
  };

  getProjectMembers = async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      const { companyId } = req.user as any;

      const members = await this.projectService.getProjectMembers(projectId, companyId);

      res.json({
        success: true,
        data: members
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Failed to fetch project members'
      });
    }
  };
}