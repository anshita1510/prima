"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const project_repository_1 = require("../repository/project.repository");
class ProjectService {
    constructor(prisma) {
        this.prisma = prisma;
        this.projectRepository = new project_repository_1.ProjectRepository(prisma);
    }
    async createProject(data, ownerId, companyId) {
        // Verify department belongs to company
        const department = await this.prisma.department.findFirst({
            where: { id: data.departmentId, companyId }
        });
        if (!department) {
            throw new Error('Department not found');
        }
        // Verify all member IDs belong to the company
        if (data.memberIds?.length) {
            const members = await this.prisma.employee.findMany({
                where: {
                    id: { in: data.memberIds },
                    companyId
                }
            });
            if (members.length !== data.memberIds.length) {
                throw new Error('Some members not found in company');
            }
        }
        return this.projectRepository.create({
            ...data,
            ownerId,
            companyId
        });
    }
    async getProjects(query, companyId, employeeId, isManager) {
        return this.projectRepository.findMany({
            ...query,
            companyId,
            employeeId,
            isManager
        });
    }
    async getProjectById(id, companyId, employeeId, isManager) {
        const project = await this.projectRepository.findById(id, companyId);
        if (!project) {
            throw new Error('Project not found');
        }
        // Check access for non-managers
        if (!isManager) {
            const hasAccess = project.ownerId === employeeId ||
                project.members.some(member => member.id === employeeId);
            if (!hasAccess) {
                throw new Error('Access denied');
            }
        }
        return project;
    }
    async updateProject(id, data, companyId, employeeId, isManager) {
        const project = await this.prisma.project.findFirst({
            where: { id, companyId }
        });
        if (!project) {
            throw new Error('Project not found');
        }
        // Only project owner or managers can update
        if (!isManager && project.ownerId !== employeeId) {
            throw new Error('Access denied');
        }
        // Verify department if provided
        if (data.departmentId) {
            const department = await this.prisma.department.findFirst({
                where: { id: data.departmentId, companyId }
            });
            if (!department) {
                throw new Error('Department not found');
            }
        }
        // Verify member IDs if provided
        if (data.memberIds?.length) {
            const members = await this.prisma.employee.findMany({
                where: {
                    id: { in: data.memberIds },
                    companyId
                }
            });
            if (members.length !== data.memberIds.length) {
                throw new Error('Some members not found in company');
            }
        }
        return this.projectRepository.update(id, { ...data, companyId });
    }
    async deleteProject(id, companyId, employeeId, isManager) {
        const project = await this.prisma.project.findFirst({
            where: { id, companyId }
        });
        if (!project) {
            throw new Error('Project not found');
        }
        // Only project owner or managers can delete
        if (!isManager && project.ownerId !== employeeId) {
            throw new Error('Access denied');
        }
        return this.projectRepository.delete(id, companyId);
    }
    async getProjectMembers(projectId, companyId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, companyId },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        designation: true,
                        user: {
                            select: { email: true }
                        }
                    }
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        designation: true,
                        user: {
                            select: { email: true }
                        }
                    }
                }
            }
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return {
            owner: project.owner,
            members: project.members
        };
    }
}
exports.ProjectService = ProjectService;
