"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  RefreshCw,
  X,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Circle,
  Pause,
  XCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { taskService, type Task } from "@/app/services/task.service";
import { projectService } from "@/app/services/projectService";

const STATUS_CONFIG = {
  TODO: { label: "To Do", color: "#6366f1", bg: "rgba(99,102,241,0.12)", icon: Circle },
  IN_PROGRESS: { label: "In Progress", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", icon: Clock },
  IN_REVIEW: { label: "In Review", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Pause },
  COMPLETED: { label: "Completed", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "#f87171", bg: "rgba(239,68,68,0.12)", icon: XCircle },
} as const;

const PRIORITY_CONFIG = {
  LOW: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  HIGH: { color: "#fb923c", bg: "rgba(249,115,22,0.12)" },
  URGENT: { color: "#f87171", bg: "rgba(239,68,68,0.12)" },
} as const;

const STATUSES = Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const card = {
  backgroundColor: "var(--card-bg)",
  border: "1px solid var(--card-border)",
  borderRadius: "16px",
} as const;

const inputStyle = {
  backgroundColor: "var(--input-bg)",
  border: "1px solid var(--card-border)",
  color: "var(--text-color)",
  borderRadius: "10px",
  outline: "none",
} as const;

function fmtDate(d?: string) {
  return d
    ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

function isOverdue(d?: string) {
  if (!d) return false;
  return new Date(d).getTime() < Date.now();
}

function dueCountdown(d?: string, status?: string) {
  if (!d) return "—";
  const due = new Date(d);
  const now = new Date();
  const ms = due.getTime() - now.getTime();
  const days = Math.ceil(ms / 86400000);
  if (status === "COMPLETED" || status === "CANCELLED") return fmtDate(d);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (!p.length) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase();
}

function CreateTaskModal({
  projects,
  onClose,
  onCreated,
}: {
  projects: { id: number; name: string }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: 0,
    priority: "MEDIUM" as const,
    dueDate: "",
    assignedToId: "",
  });
  const [employees, setEmployees] = useState<{ id: number; employeeId: number; employee?: { name?: string } }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form.projectId) {
      void (async () => {
        try {
          const res = await projectService.getProjectTeamMembers(form.projectId);
          if (res?.success) setEmployees(res.data || []);
        } catch {
          setEmployees([]);
        }
      })();
    }
  }, [form.projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.projectId) {
      setError("Please select a project");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await taskService.createTask({
        title: form.title.trim(),
        description: form.description || undefined,
        projectId: form.projectId,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
        assignedToId: form.assignedToId ? parseInt(form.assignedToId, 10) : undefined,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: "linear-gradient(135deg,#1e40af,#7c3aed)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Task</h2>
              <p className="text-xs text-white/60">Add a task to a project</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg"
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Task Title <span style={{ color: "#f87171" }}>*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Design login screen"
              className="w-full px-3 py-2.5 text-sm"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Project <span style={{ color: "#f87171" }}>*</span>
              </label>
              <select
                value={form.projectId}
                onChange={(e) => setForm((f) => ({ ...f, projectId: parseInt(e.target.value, 10), assignedToId: "" }))}
                className="w-full px-3 py-2.5 text-sm"
                style={inputStyle}
              >
                <option value={0}>Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as typeof form.priority }))}
                className="w-full px-3 py-2.5 text-sm"
                style={inputStyle}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Assign To
              </label>
              <select
                value={form.assignedToId}
                onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm"
                style={inputStyle}
                disabled={!form.projectId}
              >
                <option value="">Unassigned</option>
                {employees.map((m) => (
                  <option key={m.id} value={m.employeeId}>
                    {m.employee?.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Task details..."
              rows={3}
              className="w-full resize-none px-3 py-2.5 text-sm"
              style={inputStyle}
            />
          </div>

          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--card-border)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Fields marked <span style={{ color: "#f87171" }}>*</span> are required
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-muted)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailModal({
  task: initialTask,
  onClose,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onStatusChange: (id: number, s: string) => void;
  onDelete: (id: number) => void;
}) {
  const [task, setTask] = useState<Task>(initialTask);
  const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  useEffect(() => {
    void (async () => {
      try {
        const detailed = await taskService.getTaskById(initialTask.id);
        if (detailed) setTask(detailed);
      } catch {
        /* ignore */
      }
    })();
  }, [initialTask.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 32px 128px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{
            background: "linear-gradient(135deg,#1e40af,#4f46e5)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">{task.code || "TASK"}</span>
                <span className="text-white/30">•</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{task.project?.name}</span>
              </div>
              <h2 className="text-xl font-bold leading-tight text-white">{task.title}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.8)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-8 md:col-span-2">
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--primary-color)" }}>
                  <div className="h-3 w-1 rounded-full" style={{ backgroundColor: "var(--primary-color)" }} />
                  Description
                </h3>
                <div
                  className="rounded-2xl p-5 text-sm leading-relaxed"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-color)",
                  }}
                >
                  {task.description || <span className="italic opacity-40">No description provided.</span>}
                </div>
              </section>
              <div className="grid grid-cols-2 gap-6">
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Status
                  </h3>
                  <select
                    value={task.status}
                    onChange={(e) => {
                      onStatusChange(task.id, e.target.value);
                      setTask((prev) => ({ ...prev, status: e.target.value as Task["status"] }));
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: s.bg,
                      color: s.color,
                      border: `1px solid ${s.color}66`,
                      outline: "none",
                    }}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st].label}
                      </option>
                    ))}
                  </select>
                </section>
                <section>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Priority
                  </h3>
                  <div
                    className="flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-bold"
                    style={{ backgroundColor: p.bg, color: p.color, borderColor: `${p.color}44` }}
                  >
                    {task.priority}
                  </div>
                </section>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-5 rounded-2xl p-6" style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)" }}>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Assignee
                  </p>
                  {task.assignedTo ? (
                    <div>
                      <p className="text-sm font-bold leading-tight" style={{ color: "var(--text-color)" }}>
                        {task.assignedTo.name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50" style={{ color: "var(--text-muted)" }}>
                        {(task.assignedTo as { designation?: string }).designation || "Member"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm italic opacity-40">
                      <User className="h-4 w-4" /> Unassigned
                    </div>
                  )}
                </div>
                <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 16 }}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Due
                  </p>
                  <span
                    className={`text-xs font-bold ${isOverdue(task.dueDate) && task.status !== "COMPLETED" ? "text-red-400" : ""}`}
                    style={{ color: "var(--text-color)" }}
                  >
                    {fmtDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-bold uppercase tracking-widest transition-all"
                style={{
                  backgroundColor: "rgba(239,68,68,0.05)",
                  color: "#f87171",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <XCircle className="h-4 w-4" /> Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PIE_COLORS: Record<string, string> = {
  TODO: "#6366f1",
  IN_PROGRESS: "#60a5fa",
  IN_REVIEW: "#f59e0b",
  COMPLETED: "#22c55e",
  CANCELLED: "#94a3b8",
};

export default function TasksManagementDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | keyof typeof STATUS_CONFIG>("all");
  const [rangeStart, setRangeStart] = useState("2026-04-01");
  const [rangeEnd, setRangeEnd] = useState("2026-05-31");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({
        priority: filterPriority || undefined,
        projectId: filterProject ? parseInt(filterProject, 10) : undefined,
        limit: 200,
      });
      setTasks(res.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterProject]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await projectService.getAllProjects();
      setProjects((res.data || []).map((p: { id: number; name: string }) => ({ id: p.id, name: p.name })));
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
    void loadProjects();
  }, [loadTasks, loadProjects]);

  const rangeStartMs = useMemo(() => new Date(rangeStart).getTime(), [rangeStart]);
  const rangeEndMs = useMemo(() => new Date(rangeEnd).getTime() + 86400000 - 1, [rangeEnd]);

  const filteredByUi = useMemo(() => {
    const q = search.toLowerCase();
    return tasks.filter((t) => {
      const matchTab = activeTab === "all" || t.status === activeTab;
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        t.project?.name?.toLowerCase().includes(q) ||
        t.assignedTo?.name?.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q);
      if (!t.dueDate) return matchTab && matchSearch;
      const due = new Date(t.dueDate).getTime();
      const inRange = due >= rangeStartMs && due <= rangeEndMs;
      return matchTab && matchSearch && inRange;
    });
  }, [tasks, activeTab, search, rangeStartMs, rangeEndMs]);

  const counts = useMemo(
    () => STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter((t) => t.status === s).length }), {} as Record<string, number>),
    [tasks]
  );

  const overdueList = useMemo(
    () =>
      tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED" && t.status !== "CANCELLED"
      ),
    [tasks]
  );

  const dueSoonList = useMemo(() => {
    const now = Date.now();
    const week = now + 7 * 86400000;
    return tasks
      .filter((t) => {
        if (!t.dueDate || t.status === "COMPLETED" || t.status === "CANCELLED") return false;
        const d = new Date(t.dueDate).getTime();
        return d >= now && d <= week;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks]);

  const total = tasks.length;
  const overdueCount = overdueList.length;
  const inProg = counts.IN_PROGRESS || 0;
  const completed = counts.COMPLETED || 0;
  const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : "0");

  const pieData = useMemo(
    () =>
      STATUSES.map((s) => ({
        key: s,
        name: STATUS_CONFIG[s].label,
        value: counts[s] || 0,
      })).filter((d) => d.value > 0),
    [counts]
  );

  const totalPages = Math.max(1, Math.ceil(filteredByUi.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = filteredByUi.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await taskService.updateTask(id, { status: status as Task["status"] });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: status as Task["status"] } : t)));
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      /* ignore */
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Title", "Project", "Assignee", "Priority", "Due", "Status"].join(","),
      ...filteredByUi.map((t) =>
        [
          `"${(t.title || "").replace(/"/g, '""')}"`,
          `"${(t.project?.name || "").replace(/"/g, '""')}"`,
          `"${(t.assignedTo?.name || "").replace(/"/g, '""')}"`,
          t.priority,
          t.dueDate || "",
          t.status,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex min-w-0 flex-col gap-8 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>
                  Tasks
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  Manage and track all project tasks.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl px-2 py-1" style={{ ...inputStyle, padding: "6px 10px" }}>
                  <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="date"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                    className="border-none bg-transparent text-xs outline-none"
                    style={{ color: "var(--text-color)" }}
                  />
                  <span style={{ color: "var(--text-muted)" }}>–</span>
                  <input
                    type="date"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                    className="border-none bg-transparent text-xs outline-none"
                    style={{ color: "var(--text-color)" }}
                  />
                </div>
                <button
                  type="button"
                  className="rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{ ...inputStyle, cursor: "pointer" }}
                  onClick={() => setSearch("")}
                >
                  <Filter className="mr-1 inline h-3.5 w-3.5" />
                  Filters
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <Download className="mr-1 inline h-3.5 w-3.5" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                  }}
                >
                  <Plus className="h-4 w-4" /> New Task
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Tasks", value: total, sub: "All tasks created", accent: "#7c3aed", bar: null as number | null },
                {
                  label: "In Progress",
                  value: inProg,
                  sub: `${pct(inProg)}% of total`,
                  accent: "#3b82f6",
                  bar: total ? Math.round((inProg / total) * 100) : 0,
                },
                {
                  label: "Completed",
                  value: completed,
                  sub: `${pct(completed)}% of total`,
                  accent: "#22c55e",
                  bar: total ? Math.round((completed / total) * 100) : 0,
                },
                {
                  label: "Overdue",
                  value: overdueCount,
                  sub: `${pct(overdueCount)}% of total`,
                  accent: "#ef4444",
                  bar: total ? Math.round((overdueCount / total) * 100) : 0,
                },
              ].map((c) => (
                <div key={c.label} className="rounded-2xl p-5" style={card}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                        {c.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--text-color)" }}>
                        {loading ? "…" : c.value}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        {c.sub}
                      </p>
                      {c.bar != null && (
                        <div className="mt-3 h-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${c.bar}%`, backgroundColor: c.accent }} />
                        </div>
                      )}
                    </div>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${c.accent}22` }}
                    >
                      <CheckSquare className="h-5 w-5" style={{ color: c.accent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === "all" ? "var(--primary-color)" : "var(--input-bg)",
                  color: activeTab === "all" ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--card-border)",
                  cursor: "pointer",
                }}
              >
                All ({total})
              </button>
              {STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = activeTab === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveTab(s)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      backgroundColor: active ? cfg.color : "var(--input-bg)",
                      color: active ? "#fff" : "var(--text-muted)",
                      border: "1px solid var(--card-border)",
                      cursor: "pointer",
                    }}
                  >
                    {cfg.label} ({counts[s] || 0})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks…"
                  className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-color)",
                  }}
                />
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-sm outline-none sm:min-w-[140px]"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-color)",
                }}
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-sm outline-none sm:min-w-[160px]"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-color)",
                }}
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void loadTasks()}
                disabled={loading}
                className="rounded-xl p-2.5"
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl" style={card}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--card-border)", backgroundColor: "var(--bg-subtle)" }}>
                      {["Task", "Project", "Assignee", "Priority", "Due Date", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                          <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
                          Loading…
                        </td>
                      </tr>
                    ) : paged.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                          No tasks in this date range.
                        </td>
                      </tr>
                    ) : (
                      paged.map((t) => {
                        const st = STATUS_CONFIG[t.status] || STATUS_CONFIG.TODO;
                        const pr = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                        const od =
                          t.dueDate &&
                          new Date(t.dueDate) < new Date() &&
                          t.status !== "COMPLETED" &&
                          t.status !== "CANCELLED";
                        return (
                          <tr
                            key={t.id}
                            className="cursor-pointer transition-colors hover:bg-[var(--bg-subtle)]"
                            style={{ borderBottom: "1px solid var(--card-border)" }}
                            onClick={() => setSelectedTask(t)}
                          >
                            <td className="max-w-[240px] px-4 py-3">
                              <p className="font-semibold" style={{ color: "var(--text-color)" }}>
                                {t.title}
                              </p>
                              {t.description && (
                                <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: "var(--text-muted)" }}>
                                  {t.description}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>
                              {t.project?.name}
                            </td>
                            <td className="px-4 py-3">
                              {t.assignedTo ? (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                    style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                                  >
                                    {initials(t.assignedTo.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium" style={{ color: "var(--text-color)" }}>
                                      {t.assignedTo.name}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                      {(t.assignedTo as { designation?: string }).designation || "—"}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: "var(--text-muted)" }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                style={{ backgroundColor: pr.bg, color: pr.color }}
                              >
                                {t.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={od ? "font-semibold text-red-500" : ""} style={{ color: "var(--text-color)" }}>
                                {fmtDate(t.dueDate)}
                              </span>
                              <p className="text-xs" style={{ color: od ? "#f87171" : "var(--text-muted)" }}>
                                {dueCountdown(t.dueDate, t.status)}
                              </p>
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={t.status}
                                onChange={(e) => void handleStatusChange(t.id, e.target.value)}
                                className="max-w-[140px] cursor-pointer rounded-lg border px-2 py-1 text-xs font-semibold outline-none"
                                style={{ backgroundColor: st.bg, color: st.color, borderColor: `${st.color}44` }}
                              >
                                {STATUSES.map((stt) => (
                                  <option key={stt} value={stt}>
                                    {STATUS_CONFIG[stt].label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="rounded-lg p-2 hover:bg-[var(--bg-subtle)]"
                                style={{ color: "var(--text-muted)" }}
                                aria-label="More"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderTop: "1px solid var(--card-border)", backgroundColor: "var(--bg-subtle)" }}
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Showing {(pageSafe - 1) * pageSize + 1} to {Math.min(pageSafe * pageSize, filteredByUi.length)} of {filteredByUi.length}{" "}
                  tasks
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className="rounded-lg px-2 py-1 text-xs"
                    style={inputStyle}
                  >
                    {[6, 10, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} per page
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={pageSafe <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg p-1.5 disabled:opacity-40"
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {pageSafe} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={pageSafe >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg p-1.5 disabled:opacity-40"
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="w-full min-w-0 shrink-0 space-y-4 xl:w-[300px]">
            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-color)" }}>
                Task overview
              </h3>
              <div className="relative mx-auto mt-4 flex h-[200px] justify-center">
                {pieData.length === 0 ? (
                  <p className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    No tasks
                  </p>
                ) : (
                  <ResponsiveContainer width={220} height={200} minHeight={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.key} fill={PIE_COLORS[entry.key] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card-bg)",
                          border: "1px solid var(--card-border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-color)" }}>
                    {total}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Total
                  </span>
                </div>
              </div>
              <ul className="mt-2 space-y-2 text-xs">
                {STATUSES.map((k) => {
                  const n = counts[k] || 0;
                  if (n === 0 && total > 0) return null;
                  return (
                    <li key={k} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[k] }} />
                        {STATUS_CONFIG[k].label}
                      </span>
                      <span className="font-semibold tabular-nums" style={{ color: "var(--text-color)" }}>
                        {n}
                        {total > 0 ? ` (${((n / total) * 100).toFixed(1)}%)` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-color)" }}>
                Due soon
              </h3>
              <ul className="mt-3 space-y-3">
                {dueSoonList.length === 0 ? (
                  <li className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No upcoming deadlines
                  </li>
                ) : (
                  dueSoonList.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className="w-full cursor-pointer text-left"
                        onClick={() => setSelectedTask(t)}
                      >
                        <p className="text-sm font-semibold" style={{ color: "var(--text-color)" }}>
                          {t.title}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {t.project?.name} · {fmtDate(t.dueDate)}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-color)" }}>
                Overdue tasks
              </h3>
              <ul className="mt-3 space-y-3">
                {overdueList.length === 0 ? (
                  <li className="text-xs" style={{ color: "var(--text-muted)" }}>
                    None
                  </li>
                ) : (
                  overdueList.slice(0, 6).map((t) => (
                    <li key={t.id} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <button type="button" className="min-w-0 flex-1 cursor-pointer text-left" onClick={() => setSelectedTask(t)}>
                        <p className="text-sm font-semibold text-red-600">{t.title}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {t.project?.name} · due {fmtDate(t.dueDate)}
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {showCreate && (
        <CreateTaskModal projects={projects} onClose={() => setShowCreate(false)} onCreated={() => void loadTasks()} />
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
