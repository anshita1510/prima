'use client';

import { useState } from 'react';
import {
  ArrowLeft, Calendar, Users, User, Building2, Target,
  Clock, CheckSquare, Activity, AlertCircle, Trash2, Briefcase, Plus,
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: any;
  tasks: any[];
  onBack: () => void;
  onAddTask: () => void;
  onDeleteProject: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onUpdateTaskStatus: (id: number, status: string) => void;
  onUpdateProjectStatus?: (id: number, status: string) => void;
}

const card = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '16px',
} as const;

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  ON_HOLD: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  PLANNING: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  CANCELLED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  TODO: { bg: 'rgba(100,116,139,0.12)', color: 'var(--text-muted)' },
  IN_PROGRESS: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  IN_REVIEW: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  LOW: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  HIGH: { bg: 'rgba(249,115,22,0.12)', color: '#fb923c' },
  URGENT: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED'];

const fmtDate = (d: string | Date) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const daysRemaining = (end: string) => {
  if (!end) return 'N/A';
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  return diff > 0 ? `${diff} days` : 'Overdue';
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || { bg: 'var(--bg-subtle)', color: 'var(--text-muted)' };
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {status.replace('_', ' ')}
    </span>
  );
}

function MetricCard({ label, value, icon: Icon, accent, progress }: { label: string; value: string | number; icon: any; accent: string; progress?: number }) {
  return (
    <div className="p-5 rounded-2xl" style={{ ...card, borderLeft: `3px solid ${accent}` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <Icon className="w-5 h-5 opacity-30" style={{ color: accent }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{value}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: accent }} />
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, icon: Icon, accent, children }: { title: string; icon: any; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={card}>
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ProjectDetailView({ project, tasks, onBack, onAddTask, onDeleteProject, onDeleteTask, onUpdateTaskStatus, onUpdateProjectStatus }: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState('TODO');

  const getTasksByStatus = (s: string) => tasks.filter(t => t.status === s);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-color)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="rounded-2xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg,#1e40af,#4f46e5,#7c3aed)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.description && <p className="text-white/70 mt-1 text-sm">{project.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {project.status?.replace('_', ' ')}
                </span>
                {project.progressPercentage > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    {project.progressPercentage}% Complete
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => onDeleteProject(project.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Progress" value={`${project.progressPercentage || 0}%`} icon={Target} accent="#3b82f6" progress={project.progressPercentage || 0} />
        <MetricCard label="Total Tasks" value={project._count?.tasks || 0} icon={CheckSquare} accent="#22c55e" />
        <MetricCard label="Team Members" value={project._count?.members || 0} icon={Users} accent="#a78bfa" />
        <MetricCard label="Days Remaining" value={daysRemaining(project.endDate)} icon={Clock} accent="#f59e0b" />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <SectionCard title="Project Information" icon={Building2} accent="#3b82f6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Department', value: project.department?.name || 'N/A' },
                { label: 'Company', value: project.company?.name || 'N/A' },
                { label: 'Project Code', value: project.code || 'N/A' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Status</p>
                {onUpdateProjectStatus ? (
                  <select value={project.status || 'PLANNING'} onChange={e => onUpdateProjectStatus(project.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm outline-none"
                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}>
                    {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                ) : <StatusBadge status={project.status} />}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Timeline" icon={Calendar} accent="#22c55e">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[{ label: 'Start Date', value: fmtDate(project.startDate) }, { label: 'End Date', value: fmtDate(project.endDate) }].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Project Manager" icon={User} accent="#a78bfa">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(167,139,250,0.15)' }}>
                <User className="w-5 h-5" style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{project.owner?.name || 'N/A'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.owner?.designation || 'Manager'}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title={`Team Members (${project._count?.members || 0})`} icon={Users} accent="#6366f1">
          {project.projectRoles?.length ? (
            <div className="space-y-2">
              {project.projectRoles.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(99,102,241,0.15)' }}>
                    <User className="w-4 h-4" style={{ color: '#6366f1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>{m.employee?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No team members assigned</p>
          )}
        </SectionCard>
      </div>

      {/* Task Management */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: 'var(--PRIMAry-color)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>Task Management</span>
          </div>
          <button onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: 'pointer' }}>
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        <div className="p-5">
          {/* Tab buttons */}
          <div className="flex items-center gap-1 flex-wrap mb-5">
            {TASK_STATUSES.map(s => {
              const count = getTasksByStatus(s).length;
              const isActive = activeTab === s;
              return (
                <button key={s} onClick={() => setActiveTab(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--PRIMAry-color)' : 'var(--input-bg)',
                    color: isActive ? '#fff' : 'var(--text-color)',
                    border: `1px solid ${isActive ? 'var(--PRIMAry-color)' : 'var(--card-border)'}`,
                    cursor: 'pointer',
                  }}>
                  {s.replace('_', ' ')}
                  <span className="px-1.5 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--card-border)', color: isActive ? '#fff' : 'var(--text-color)' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Task list */}
          {getTasksByStatus(activeTab).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <CheckSquare className="w-10 h-10 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab.replace('_', ' ').toLowerCase()} tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getTasksByStatus(activeTab).map(task => {
                const p = PRIORITY_COLORS[task.priority] || { bg: 'var(--bg-subtle)', color: 'var(--text-muted)' };
                return (
                  <div key={task.id} className="p-4 rounded-xl transition-all"
                    style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{task.title}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: p.bg, color: p.color }}>{task.priority}</span>
                        </div>
                        {task.description && <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{task.description}</p>}
                        <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                          {task.assignedTo && <div className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignedTo.name}</div>}
                          {task.dueDate && <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(task.dueDate)}</div>}
                          {task.estimatedHours && <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.actualHours || 0}h / {task.estimatedHours}h</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select value={task.status || 'TODO'} onChange={e => onUpdateTaskStatus(task.id, e.target.value)}
                          className="px-2 py-1.5 rounded-lg text-xs outline-none"
                          style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}>
                          {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <button onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', cursor: 'pointer' }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
