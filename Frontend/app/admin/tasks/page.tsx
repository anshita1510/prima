'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    CheckSquare, Plus, Search, RefreshCw, X, Calendar,
    User, Clock, AlertCircle, CheckCircle2, Circle,
    Pause, XCircle, Filter,
} from 'lucide-react';
import { taskService, Task } from '@/app/services/task.service';
import { projectService } from '@/app/services/projectService';

// ── Constants ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
    TODO: { label: 'To Do', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: Circle },
    IN_PROGRESS: { label: 'In Progress', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: Clock },
    IN_REVIEW: { label: 'In Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Pause },
    COMPLETED: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', color: '#f87171', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
} as const;

const PRIORITY_CONFIG = {
    LOW: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    HIGH: { color: '#fb923c', bg: 'rgba(249,115,22,0.12)' },
    URGENT: { color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
} as const;

const STATUSES = Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const card = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '16px' } as const;
const inputStyle = { backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)', borderRadius: '10px', outline: 'none' } as const;

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const isOverdue = (d?: string) => d && new Date(d) < new Date() ? true : false;

// ── Create Task Modal ──────────────────────────────────────────────
function CreateTaskModal({ projects, onClose, onCreated }: { projects: any[]; onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({ title: '', description: '', projectId: 0, priority: 'MEDIUM' as const, dueDate: '', assignedToId: '' });
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (form.projectId) loadEmployees(form.projectId);
    }, [form.projectId]);

    const loadEmployees = async (pid: number) => {
        try {
            const res = await projectService.getProjectTeamMembers?.(pid);
            if (res?.success) setEmployees(res.data || []);
        } catch { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required'); return; }
        if (!form.projectId) { setError('Please select a project'); return; }
        setLoading(true); setError('');
        try {
            await taskService.createTask({
                title: form.title.trim(),
                description: form.description || undefined,
                projectId: form.projectId,
                priority: form.priority,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
                assignedToId: form.assignedToId ? parseInt(form.assignedToId) : undefined,
            });
            onCreated(); onClose();
        } catch (e: any) { setError(e.message || 'Failed to create task'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
                <div className="flex items-center justify-between px-6 py-4"
                    style={{ background: 'linear-gradient(135deg,#1e40af,#7c3aed)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <CheckSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Create New Task</h2>
                            <p className="text-xs text-white/60">Add a task to a project</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                            ⚠ {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                            Task Title <span style={{ color: '#f87171' }}>*</span>
                        </label>
                        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g., Design login screen" className="w-full px-3 py-2.5 text-sm" style={inputStyle} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Project <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: parseInt(e.target.value), assignedToId: '' }))}
                                className="w-full px-3 py-2.5 text-sm" style={inputStyle}>
                                <option value={0}>Select project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Priority</label>
                            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                                className="w-full px-3 py-2.5 text-sm" style={inputStyle}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Due Date</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm" style={inputStyle} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Assign To</label>
                            <select value={form.assignedToId} onChange={e => setForm(f => ({ ...f, assignedToId: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm" style={inputStyle} disabled={!form.projectId}>
                                <option value="">Unassigned</option>
                                {employees.map((m: any) => (
                                    <option key={m.id} value={m.employeeId}>
                                        {m.employee?.name || 'Unknown'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Task details..." rows={3} className="w-full px-3 py-2.5 text-sm resize-none" style={inputStyle} />
                    </div>

                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fields marked <span style={{ color: '#f87171' }}>*</span> are required</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={loading}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Task</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Task Detail Modal ──────────────────────────────────────────────
function TaskDetailModal({ task: initialTask, onClose, onStatusChange, onDelete }: {
    task: Task;
    onClose: () => void;
    onStatusChange: (id: number, s: string) => void;
    onDelete: (id: number) => void
}) {
    const [task, setTask] = useState<Task>(initialTask);
    const [loading, setLoading] = useState(false);
    const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
    const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const StatusIcon = s.icon;

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const detailed = await taskService.getTaskById(initialTask.id);
                if (detailed) setTask(detailed);
            } catch (err) {
                console.error("Failed to fetch task details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [initialTask.id]);

    const handleDelete = () => {
        onDelete(task.id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 32px 128px rgba(0,0,0,0.5)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5"
                    style={{ background: 'linear-gradient(135deg,#1e40af,#4f46e5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <CheckSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">{task.code || 'TASK_DETAIL'}</span>
                                <span className="text-white/30">•</span>
                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{task.project?.name}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white leading-tight">{task.title}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                                    <div className="w-1 h-3 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                                    Description
                                </h3>
                                <div className="p-5 rounded-2xl text-sm leading-relaxed" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}>
                                    {task.description || <span className="italic opacity-40">No description provided for this task.</span>}
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-6">
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Status</h3>
                                    <div className="flex items-center gap-3">
                                        <select value={task.status} onChange={e => { onStatusChange(task.id, e.target.value); setTask(prev => ({ ...prev, status: e.target.value as any })) }}
                                            className="px-4 py-2.5 rounded-xl text-sm font-semibold w-full transition-all"
                                            style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}66`, outline: 'none' }}>
                                            {STATUSES.map(st => <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>)}
                                        </select>
                                    </div>
                                </section>
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Priority</h3>
                                    <div className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center border"
                                        style={{ backgroundColor: p.bg, color: p.color, borderColor: `${p.color}44` }}>
                                        {task.priority}
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl space-y-5" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Assignee</p>
                                    {task.assignedTo ? (
                                        <div className="flex items-center gap-3">
                                            {/* <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
                                                {task.assignedTo.name[0]}
                                            </div> */}
                                            <div>
                                                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-color)' }}>{task.assignedTo.name}</p>
                                                <p className="text-[10px] tracking-wider uppercase opacity-50 font-bold" style={{ color: 'var(--text-muted)' }}>{task.assignedTo.designation || 'Member'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm italic opacity-40">
                                            <User className="w-4 h-4" /> Unassigned
                                        </div>
                                    )}
                                </div>
                                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Timeline</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2 opacity-60"><Calendar className="w-3.5 h-3.5" /> Due</span>
                                            <span className={`font-bold ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-red-400' : 'text-[var(--text-color)]'}`}>
                                                {fmtDate(task.dueDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleDelete}
                                className="w-full py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'rgba(239,68,68,0.05)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.05)'}>
                                <XCircle className="w-4 h-4" /> Delete Task
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Task Card ──────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, onDelete, onClick }: {
    task: Task;
    onStatusChange: (id: number, s: string) => void;
    onDelete: (id: number) => void;
    onClick: () => void;
}) {
    const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
    const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
    const overdue = isOverdue(task.dueDate) && task.status !== 'COMPLETED' && task.status !== 'CANCELLED';

    return (
        <div className="group relative p-5 rounded-2xl transition-all cursor-pointer overflow-hidden"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: `1px solid var(--card-border)`,
                borderLeft: `4px solid ${s.color}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={onClick}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(0,0,0,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
            }}>
            <div className="flex items-start justify-between gap-5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[10px] font-mono tracking-tighter opacity-40 uppercase">{task.code}</span>
                        <span className="text-[10px] opacity-20">|</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--primary-color)' }}>{task.project?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-bold tracking-tight transition-colors group-hover:text-[var(--primary-color)]" style={{ color: 'var(--text-color)' }}>{task.title}</h3>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md flex-shrink-0 uppercase tracking-tighter"
                            style={{ backgroundColor: p.bg, color: p.color, border: `1px solid ${p.color}33` }}>{task.priority}</span>
                        {overdue && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md flex-shrink-0 uppercase tracking-tighter"
                                style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>OVERDUE</span>
                        )}
                    </div>
                    {task.description && (
                        <p className="text-xs mb-4 line-clamp-1 opacity-50 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                    )}
                    <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {task.assignedTo && (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black"
                                    style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)' }}>{task.assignedTo.name[0]}</div>
                                {task.assignedTo.name}
                            </span>
                        )}
                        {task.dueDate && (
                            <span className={`flex items-center gap-2 ${overdue ? 'text-red-400' : ''}`}>
                                <Calendar className="w-3.5 h-3.5 opacity-40" /> {fmtDate(task.dueDate)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 self-center" onClick={e => e.stopPropagation()}>
                    <div className="hidden group-hover:flex items-center gap-2 animate-in fade-in slide-in-from-right-2 overflow-hidden">
                        <button onClick={() => onDelete(task.id)}
                            className="p-2 rounded-xl transition-all hover:bg-red-500/10 text-red-500/60 hover:text-red-500"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                    <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
                        className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase cursor-pointer transition-all border outline-none shadow-sm"
                        style={{ backgroundColor: s.bg, color: s.color, borderColor: `${s.color}33`, minWidth: '120px' }}>
                        {STATUSES.map(st => <option key={st} value={st} className="bg-[#1e293b] text-white font-sans">{STATUS_CONFIG[st].label}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | keyof typeof STATUS_CONFIG>('all');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const res = await taskService.getTasks({
                status: filterStatus || undefined,
                priority: filterPriority || undefined,
                projectId: filterProject ? parseInt(filterProject) : undefined,
                limit: 100,
            });
            setTasks(res.tasks || []);
        } catch { setTasks([]); }
        finally { setLoading(false); }
    }, [filterStatus, filterPriority, filterProject]);

    const loadProjects = useCallback(async () => {
        try {
            const res = await projectService.getAllProjects();
            setProjects(res.data || []);
        } catch { }
    }, []);

    useEffect(() => { loadTasks(); loadProjects(); }, [loadTasks, loadProjects]);

    const handleSearch = (v: string) => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setSearch(v), 250);
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await taskService.updateTask(id, { status: status as any });
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as any } : t));
        } catch { }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this task?')) return;
        try { await taskService.deleteTask(id); setTasks(prev => prev.filter(t => t.id !== id)); } catch { }
    };

    // Counts per status
    const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s).length }), {} as Record<string, number>);

    // Filtered list
    const filtered = tasks.filter(t => {
        const matchTab = activeTab === 'all' || t.status === activeTab;
        const q = search.toLowerCase();
        const matchSearch = !q || t.title.toLowerCase().includes(q) ||
            t.project?.name?.toLowerCase().includes(q) ||
            t.assignedTo?.name?.toLowerCase().includes(q) ||
            t.code?.toLowerCase().includes(q);
        return matchTab && matchSearch;
    });

    // Stats
    const stats = [
        { label: 'Total', value: tasks.length, color: '#60a5fa' },
        { label: 'In Progress', value: counts.IN_PROGRESS || 0, color: '#60a5fa' },
        { label: 'Completed', value: counts.COMPLETED || 0, color: '#22c55e' },
        { label: 'Overdue', value: tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length, color: '#f87171' },
    ];

    return (
        <>
                {/* Header */}
                <div className="px-6 py-4 sticky top-0 z-10"
                    style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Tasks</h1>
                            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage and track all project tasks</p>
                        </div>
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                            <Plus className="w-4 h-4" /> New Task
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {stats.map(s => (
                            <div key={s.label} className="p-4 rounded-2xl" style={{ ...card, borderBottom: `3px solid ${s.color}` }}>
                                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status tabs */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <button onClick={() => setActiveTab('all')}
                                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                style={{ backgroundColor: activeTab === 'all' ? 'var(--PRIMAry-color)' : 'var(--input-bg)', color: activeTab === 'all' ? '#fff' : 'var(--text-color)', border: '1px solid var(--card-border)', cursor: 'pointer' }}>
                                All ({tasks.length})
                            </button>
                            {STATUSES.map(s => {
                                const cfg = STATUS_CONFIG[s];
                                const isActive = activeTab === s;
                                return (
                                    <button key={s} onClick={() => setActiveTab(s)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                        style={{ backgroundColor: isActive ? cfg.color : 'var(--input-bg)', color: isActive ? '#fff' : 'var(--text-color)', border: '1px solid var(--card-border)', cursor: 'pointer' }}>
                                        {cfg.label} ({counts[s] || 0})
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                <input onChange={e => handleSearch(e.target.value)} placeholder="Search tasks…"
                                    className="pl-8 pr-3 py-2 rounded-xl text-sm w-44" style={inputStyle} />
                            </div>
                            {/* Priority filter */}
                            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                                className="px-3 py-2 rounded-xl text-sm" style={inputStyle}>
                                <option value="">All Priorities</option>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {/* Project filter */}
                            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                                className="px-3 py-2 rounded-xl text-sm" style={inputStyle}>
                                <option value="">All Projects</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {/* Refresh */}
                            <button onClick={loadTasks} disabled={loading}
                                className="p-2 rounded-xl" style={{ ...inputStyle, cursor: 'pointer', padding: '8px' }}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>
                    </div>

                    {/* Task list */}
                    <div style={card} className="overflow-hidden">
                        <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
                            <CheckSquare className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                                {activeTab === 'all' ? 'All Tasks' : STATUS_CONFIG[activeTab as keyof typeof STATUS_CONFIG]?.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full ml-1"
                                style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}>
                                {filtered.length}
                            </span>
                        </div>

                        <div className="p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12 gap-3" style={{ color: 'var(--text-muted)' }}>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span className="text-sm">Loading tasks…</span>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 gap-3">
                                    <CheckSquare className="w-10 h-10 opacity-30" style={{ color: 'var(--text-muted)' }} />
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {search ? 'No tasks match your search' : 'No tasks yet — create one to get started'}
                                    </p>
                                    {!search && (
                                        <button onClick={() => setShowCreate(true)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mt-1"
                                            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: 'pointer' }}>
                                            <Plus className="w-4 h-4" /> Create Task
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filtered.map(task => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                            onClick={() => setSelectedTask(task)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            {showCreate && (
                <CreateTaskModal
                    projects={projects}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); loadTasks(); }}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}
