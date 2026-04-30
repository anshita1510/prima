"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader,
  Plus,
  Search,
  FolderOpen,
  Users,
  CheckCircle2,
  ArrowLeft,
  LayoutGrid,
  List,
  Flag,
  Activity,
  Clock,
  ClipboardList,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { CreateTaskModal } from "@/components/projects/CreateTaskModal";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { projectService } from "@/app/services/projectService";

type ProjectType = "standard" | "enhanced";

export interface ProjectsDashboardProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  progressPercentage: number;
  type: ProjectType;
  members?: unknown[];
  tasks?: unknown[];
  _count?: { members?: number; tasks?: number };
  stats?: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    teamMembersCount: number;
  };
  endDate?: string;
  dueDate?: string;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: { id?: number; name?: string };
  department?: { name?: string };
}

const card = {
  backgroundColor: "var(--card-bg)",
  border: "1px solid var(--card-border)",
  borderRadius: "16px",
  boxShadow: "var(--shadow-sm)",
} as const;

const STATUS_COLORS: Record<string, { bg: string; color: string; bar: string }> = {
  ACTIVE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", bar: "#22c55e" },
  COMPLETED: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", bar: "#3b82f6" },
  ON_HOLD: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", bar: "#f59e0b" },
  PLANNING: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", bar: "#a78bfa" },
  CANCELLED: { bg: "rgba(239,68,68,0.12)", color: "#f87171", bar: "#ef4444" },
};

const PIE_COLORS: Record<string, string> = {
  COMPLETED: "#60a5fa",
  ACTIVE: "#22c55e",
  ON_HOLD: "#f59e0b",
  CANCELLED: "#f87171",
  PLANNING: "#a78bfa",
};

function statusLabel(status: string): string {
  const s = status?.replace(/_/g, " ") ?? "";
  return s ? s.charAt(0) + s.slice(1).toLowerCase() : "";
}

function daysTimeline(start?: string, end?: string): string | null {
  if (!start || !end) return null;
  const d1 = new Date(start).getTime();
  const d2 = new Date(end).getTime();
  if (!Number.isFinite(d1) || !Number.isFinite(d2)) return null;
  const days = Math.max(0, Math.ceil((d2 - d1) / 86400000));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function leadInitials(name?: string): string {
  if (!name?.trim()) return "?";
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase();
}

export type ProjectsDashboardProps = {
  backHref: string;
};

export function ProjectsDashboard({ backHref }: ProjectsDashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectsDashboardProject[]>([]);
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectsDashboardProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "standard" | "enhanced">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await projectService.getAllProjects();
      const unified: ProjectsDashboardProject[] = (result.data || []).map((p: Record<string, unknown>) => ({
        ...(p as object),
        type: "standard" as ProjectType,
        _count: {
          members:
            (p.members as unknown[] | undefined)?.length ||
            (p._count as { members?: number } | undefined)?.members ||
            0,
          tasks:
            (p.tasks as unknown[] | undefined)?.length ||
            (p._count as { tasks?: number } | undefined)?.tasks ||
            0,
        },
      })) as ProjectsDashboardProject[];
      setProjects(unified);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (id: number) => {
    try {
      const r = await projectService.getProjectTasks(id);
      setTasks(r.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await projectService.deleteProject(id);
      loadProjects();
      setSelectedProject(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await projectService.deleteTask(id);
      if (selectedProject) loadProjectTasks(selectedProject.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTaskStatus = async (id: number, status: string) => {
    try {
      await projectService.updateTask(id, { status: status as never });
      if (selectedProject) loadProjectTasks(selectedProject.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProjectStatus = async (id: number, status: string) => {
    try {
      const r = await projectService.updateProject(id, { status: status as never });
      if (r.success) {
        await loadProjects();
        if (selectedProject?.id === id) setSelectedProject({ ...selectedProject, status });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const counts = useMemo(
    () => ({
      all: projects.length,
      standard: projects.filter((p) => p.type === "standard").length,
      enhanced: projects.filter((p) => p.type === "enhanced").length,
    }),
    [projects]
  );

  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const onHold = projects.filter((p) => p.status === "ON_HOLD").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const onHoldPct = total > 0 ? Math.round((onHold / total) * 100) : 0;
    return { total, completed, active, onHold, completionRate, onHoldPct };
  }, [projects]);

  const pieData = useMemo(() => {
    const keys = ["COMPLETED", "ACTIVE", "ON_HOLD", "CANCELLED"] as const;
    return keys
      .map((k) => ({
        name: statusLabel(k),
        value: projects.filter((p) => p.status === k).length,
        key: k,
      }))
      .filter((d) => d.value > 0);
  }, [projects]);

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchTab = activeTab === "all" || p.type === activeTab;
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchTab && matchStatus;
  });

  const recentActivity = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
    return sorted.slice(0, 5).map((p) => {
      const ts = p.updatedAt || p.createdAt;
      const time = ts
        ? new Date(ts).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";
      let desc = `Project “${p.name}” updated`;
      if (p.status === "COMPLETED") desc = `“${p.name}” marked completed`;
      else if (p.status === "ACTIVE") desc = `“${p.name}” is in progress`;
      return { id: p.id, desc, time, status: p.status };
    });
  }, [projects]);

  const topPerformers = useMemo(() => {
    const byOwner = new Map<string, { name: string; done: number; total: number }>();
    for (const p of projects) {
      const name = p.owner?.name || "Unassigned";
      const done = p.stats?.completedTasks ?? 0;
      const total = p.stats?.totalTasks ?? p._count?.tasks ?? 0;
      const cur = byOwner.get(name) || { name, done: 0, total: 0 };
      cur.done += done;
      cur.total += total;
      byOwner.set(name, cur);
    }
    return [...byOwner.values()]
      .sort((a, b) => b.done - a.done)
      .slice(0, 4)
      .map((row) => ({
        ...row,
        onTime: row.total > 0 ? Math.min(100, Math.round((row.done / row.total) * 100)) : 0,
      }));
  }, [projects]);

  if (loading && projects.length === 0) {
    return (
      <div className="flex min-h-[40vh] w-full flex-1 items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-10 w-10 animate-spin" style={{ color: "var(--primary-color)" }} />
          <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <>
        <ProjectDetailView
          project={selectedProject as never}
          tasks={tasks as never}
          onBack={() => setSelectedProject(null)}
          onAddTask={() => setIsCreateTaskOpen(true)}
          onDeleteProject={handleDeleteProject}
          onDeleteTask={handleDeleteTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onUpdateProjectStatus={handleUpdateProjectStatus}
        />
        <CreateTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onSuccess={() => {
            loadProjectTasks(selectedProject.id);
            setIsCreateTaskOpen(false);
          }}
          projectId={selectedProject.id}
        />
      </>
    );
  }

  const renderProjectCard = (project: ProjectsDashboardProject, list: boolean) => {
    const statusStyle = STATUS_COLORS[project.status] || {
      bg: "var(--bg-subtle)",
      color: "var(--text-muted)",
      bar: "var(--text-muted)",
    };
    const progress = project.stats?.progressPercentage ?? project.progressPercentage ?? 0;
    const members = project.stats?.teamMembersCount ?? project._count?.members ?? 0;
    const totalT = project.stats?.totalTasks ?? project._count?.tasks ?? 0;
    const doneT = project.stats?.completedTasks ?? 0;
    const start = project.startDate || project.createdAt;
    const end = project.endDate || project.dueDate;
    const timeline = daysTimeline(start, end);

    const inner = (
      <>
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl sm:w-1.5"
          style={{ backgroundColor: statusStyle.bar }}
        />
        <div className="relative pl-3 sm:pl-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--primary-subtle)" }}
              >
                <FolderOpen className="h-5 w-5" style={{ color: "var(--primary-color)" }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: statusStyle.color }}
                  >
                    {project.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-base font-bold" style={{ color: "var(--text-color)" }}>
                  {project.name}
                </p>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {project.description}
                  </p>
                )}
              </div>
            </div>
            <span
              className="shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
              }}
            >
              {project.status === "COMPLETED"
                ? "Completed"
                : project.status === "ACTIVE"
                  ? "In Progress"
                  : statusLabel(project.status)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <div className="flex min-w-[120px] items-center gap-2">
              <span className="font-medium" style={{ color: "var(--text-color)" }}>
                Project lead
              </span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                >
                  {leadInitials(project.owner?.name)}
                </div>
                <span className="max-w-[140px] truncate font-medium" style={{ color: "var(--text-color)" }}>
                  {project.owner?.name || "—"}
                </span>
              </div>
              <div className="min-w-[140px] flex-1">
                <div className="mb-1 flex justify-between">
                  <span>Progress</span>
                  <span className="font-bold tabular-nums" style={{ color: "var(--text-color)" }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{members}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                <span className="tabular-nums">
                  {doneT}/{totalT}
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl px-3 py-3 text-xs"
            style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--card-border)" }}
          >
            <div>
              <span style={{ color: "var(--text-muted)" }}>Start</span>
              <p className="font-semibold" style={{ color: "var(--text-color)" }}>
                {start ? new Date(start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>End</span>
              <p className="font-semibold" style={{ color: "var(--text-color)" }}>
                {end ? new Date(end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-3.5 w-3.5" style={{ color: "#f59e0b" }} />
              <span style={{ color: "var(--text-muted)" }}>Priority</span>
              <span className="font-semibold uppercase" style={{ color: "var(--text-color)" }}>
                {project.status === "ACTIVE" ? "High" : project.status === "COMPLETED" ? "—" : "Medium"}
              </span>
            </div>
            {timeline && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span style={{ color: "var(--text-color)" }}>{timeline}</span>
              </div>
            )}
          </div>
        </div>
      </>
    );

    if (list) {
      return (
        <div
          key={project.id}
          className="relative cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-200 sm:p-5"
          style={card}
          onClick={() => {
            setSelectedProject(project);
            loadProjectTasks(project.id);
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
        >
          {inner}
        </div>
      );
    }

    return (
      <div
        key={project.id}
        className="relative cursor-pointer overflow-hidden rounded-2xl p-5 transition-all duration-200"
        style={card}
        onClick={() => {
          setSelectedProject(project);
          loadProjectTasks(project.id);
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-md)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
      >
        {inner}
      </div>
    );
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex min-w-0 flex-col gap-8 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push(backHref)}
                  className="mb-3 flex items-center gap-2 border-none bg-transparent text-sm transition-colors"
                  style={{ color: "var(--text-muted)", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-color)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>
                  Projects
                </h1>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  Track and manage all projects across your teams.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateProjectOpen(true)}
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white sm:w-auto"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                }}
              >
                <Plus className="h-4 w-4" /> New Project
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["all", "standard", "enhanced"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: activeTab === tab ? "var(--primary-color)" : "var(--input-bg)",
                    color: activeTab === tab ? "#fff" : "var(--text-muted)",
                    border: "1px solid var(--card-border)",
                    cursor: "pointer",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-color)",
                  }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-sm outline-none sm:min-w-[140px]"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-color)",
                }}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="PLANNING">Planning</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div
                className="ml-auto flex rounded-xl p-0.5"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)" }}
              >
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg p-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === "grid" ? "var(--card-bg)" : "transparent",
                    color: viewMode === "grid" ? "var(--primary-color)" : "var(--text-muted)",
                  }}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setViewMode("list")}
                  className="rounded-lg p-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === "list" ? "var(--card-bg)" : "transparent",
                    color: viewMode === "list" ? "var(--primary-color)" : "var(--text-muted)",
                  }}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Projects",
                  value: stats.total,
                  sub: "Across all teams",
                  icon: FolderOpen,
                  accent: "#7c3aed",
                },
                {
                  label: "Completed Projects",
                  value: stats.completed,
                  sub: `${stats.completionRate}% completion rate`,
                  icon: CheckCircle2,
                  accent: "#22c55e",
                  bar: stats.completionRate,
                },
                {
                  label: "Active Projects",
                  value: stats.active,
                  sub: "In progress",
                  icon: Activity,
                  accent: "#3b82f6",
                },
                {
                  label: "On Hold Projects",
                  value: stats.onHold,
                  sub: `${stats.onHoldPct}% currently on hold`,
                  icon: Clock,
                  accent: "#f59e0b",
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
                      {"bar" in c && typeof c.bar === "number" && (
                        <div className="mt-3 h-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${c.bar}%`, backgroundColor: c.accent }} />
                        </div>
                      )}
                    </div>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${c.accent}22` }}
                    >
                      <c.icon className="h-5 w-5" style={{ color: c.accent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader className="h-8 w-8 animate-spin" style={{ color: "var(--primary-color)" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl py-16" style={card}>
                <FolderOpen className="mb-3 h-12 w-12" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  {searchTerm || statusFilter !== "all" ? "No projects match your filters" : "No projects yet"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Plus className="h-4 w-4" /> Create Project
                </button>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4">{filtered.map((p) => renderProjectCard(p, true))}</div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {filtered.map((p) => renderProjectCard(p, false))}
              </div>
            )}
          </div>

          <aside className="w-full min-w-0 shrink-0 space-y-4 xl:w-[300px] xl:pt-0">
            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-color)" }}>
                Project summary
              </h3>
              <div className="relative mx-auto mt-4 flex h-[200px] justify-center">
                {pieData.length === 0 ? (
                  <p className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    No data yet
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
                    {stats.total}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Total
                  </span>
                </div>
              </div>
              <ul className="mt-2 space-y-2 text-xs">
                {(["COMPLETED", "ACTIVE", "ON_HOLD", "CANCELLED"] as const)
                  .map((k) => ({
                    k,
                    n: projects.filter((p) => p.status === k).length,
                  }))
                  .filter(({ n }) => n > 0 || stats.total === 0)
                  .map(({ k, n }) => (
                    <li key={k} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[k] }} />
                        {statusLabel(k)}
                      </span>
                      <span className="font-semibold tabular-nums" style={{ color: "var(--text-color)" }}>
                        {n}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-color)" }}>
                Recent activity
              </h3>
              <ul className="mt-4 space-y-3">
                {recentActivity.length === 0 ? (
                  <li className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No recent activity
                  </li>
                ) : (
                  recentActivity.map((a) => (
                    <li key={a.id} className="flex gap-3 text-xs">
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "var(--bg-subtle)" }}
                      >
                        <CheckCircle2 className="h-4 w-4" style={{ color: "var(--primary-color)" }} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ color: "var(--text-color)" }}>{a.desc}</p>
                        <p className="mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {a.time}
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl p-5" style={card}>
              <h3 className="text-sm font-bold" style={{ color: "var(--text-color)" }}>
                Top performers
              </h3>
              <ul className="mt-4 space-y-3">
                {topPerformers.length === 0 ? (
                  <li className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No leads yet
                  </li>
                ) : (
                  topPerformers.map((row) => (
                    <li key={row.name} className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}
                      >
                        {leadInitials(row.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ color: "var(--text-color)" }}>
                          {row.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {row.done} tasks · {row.onTime}% on-time
                        </p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={() => {
          loadProjects();
          setIsCreateProjectOpen(false);
        }}
      />
    </>
  );
}
