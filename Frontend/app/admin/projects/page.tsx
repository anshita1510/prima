'use client';

import { useState, useEffect } from 'react';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { CreateTaskModal } from '@/components/projects/CreateTaskModal';
import { projectService } from '@/app/services/projectService';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';
import {
  Loader, Plus, Search, FolderOpen, Users, Calendar,
  CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProjectType = 'standard' | 'enhanced';

interface UnifiedProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  progressPercentage: number;
  type: ProjectType;
  members?: any[];
  tasks?: any[];
  _count?: { members?: number; tasks?: number };
  stats?: { totalTasks: number; completedTasks: number; progressPercentage: number; teamMembersCount: number };
  endDate?: string;
  dueDate?: string;
  owner?: any;
  department?: any;
}

const card = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-sm)',
} as const;

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  ON_HOLD: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  PLANNING: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  CANCELLED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

export default function UnifiedProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<UnifiedProject[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<UnifiedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'standard' | 'enhanced'>('all');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await projectService.getAllProjects();
      const unified: UnifiedProject[] = (result.data || []).map((p: any) => ({
        ...p, type: 'standard' as ProjectType,
        _count: { members: p.members?.length || p._count?.members || 0, tasks: p.tasks?.length || p._count?.tasks || 0 },
      }));
      setProjects(unified);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadProjectTasks = async (id: number) => {
    try { const r = await projectService.getProjectTasks(id); setTasks(r.data || []); } catch (e) { console.error(e); }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try { await projectService.deleteProject(id); loadProjects(); setSelectedProject(null); } catch (e) { console.error(e); }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try { await projectService.deleteTask(id); if (selectedProject) loadProjectTasks(selectedProject.id); } catch (e) { console.error(e); }
  };

  const handleUpdateTaskStatus = async (id: number, status: string) => {
    try { await projectService.updateTask(id, { status: status as any }); if (selectedProject) loadProjectTasks(selectedProject.id); } catch (e) { console.error(e); }
  };

  const handleUpdateProjectStatus = async (id: number, status: string) => {
    try {
      const r = await projectService.updateProject(id, { status: status as any });
      if (r.success) { await loadProjects(); if (selectedProject?.id === id) setSelectedProject({ ...selectedProject!, status }); }
    } catch (e) { console.error(e); }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === 'all' || p.type === activeTab;
    return matchSearch && matchTab;
  });

  const counts = { all: projects.length, standard: projects.filter(p => p.type === 'standard').length, enhanced: projects.filter(p => p.type === 'enhanced').length };

  if (loading && projects.length === 0) {
    return (
      <div className="flex min-h-[40vh] w-full flex-1 items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-10 w-10 animate-spin" style={{ color: 'var(--primary-color)' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <>
        <ProjectDetailView
          project={selectedProject as any}
          tasks={tasks}
          onBack={() => setSelectedProject(null)}
          onAddTask={() => setIsCreateTaskOpen(true)}
          onDeleteProject={handleDeleteProject}
          onDeleteTask={handleDeleteTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onUpdateProjectStatus={handleUpdateProjectStatus}
        />
        <CreateTaskModal isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)}
          onSuccess={() => { loadProjectTasks(selectedProject.id); setIsCreateTaskOpen(false); }}
          projectId={selectedProject.id} />
      </>
    );
  }

  return (
    <>
      <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-sm mb-3 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-color)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Projects</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{counts.all} projects total</p>
            </div>
            <button onClick={() => setIsCreateProjectOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {(['all', 'standard', 'enhanced'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === tab ? 'var(--primary-color)' : 'var(--input-bg)',
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }} />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-color)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={card}>
              <FolderOpen className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
                {searchTerm ? 'No projects match your search' : 'No projects yet'}
              </p>
              <button onClick={() => setIsCreateProjectOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', cursor: 'pointer' }}>
                <Plus className="w-4 h-4" /> Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(project => {
                const statusStyle = STATUS_COLORS[project.status] || { bg: 'var(--bg-subtle)', color: 'var(--text-muted)' };
                const progress = project.stats?.progressPercentage || project.progressPercentage || 0;
                return (
                  <div key={project.id} className="p-5 rounded-2xl cursor-pointer transition-all duration-200"
                    style={card}
                    onClick={() => { setSelectedProject(project); loadProjectTasks(project.id); }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--primary-subtle)' }}>
                        <FolderOpen className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {project.status?.replace('_', ' ')}
                        </span>
                        <p className="text-sm font-bold mt-1 truncate" style={{ color: 'var(--text-color)' }}>{project.name}</p>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
                    )}
                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                        <span className="font-bold" style={{ color: 'var(--text-color)' }}>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <Users className="w-3.5 h-3.5" />
                        {project.stats?.teamMembersCount || project._count?.members || 0} members
                      </div>
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {project.stats?.completedTasks || 0}/{project.stats?.totalTasks || project._count?.tasks || 0} tasks
                      </div>
                      {(project.endDate || project.dueDate) && (
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(project.endDate || project.dueDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      <CreateProjectModal isOpen={isCreateProjectOpen} onClose={() => setIsCreateProjectOpen(false)} onSuccess={() => { loadProjects(); setIsCreateProjectOpen(false); }} />
    </>
  );
}
