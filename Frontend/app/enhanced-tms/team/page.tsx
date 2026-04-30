'use client';

import type { CSSProperties } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTeamMemberModal } from '@/components/team/AddTeamMemberModal';
import { AddManagerTeamMemberModal } from '@/components/team/AddManagerTeamMemberModal';
import { employeeService } from '@/app/services/employeeService';
import { teamService } from '@/app/services/teamService';
import api from '@/lib/axios';
import { useTheme } from '@/lib/theme/ThemeContext';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Search,
  MoreVertical,
  CheckSquare,
  Clock,
  LayoutGrid,
  List,
  UserPlus,
  Upload,
  Download,
  Activity,
  Moon,
  Sun,
  RefreshCw,
  SlidersHorizontal,
  Target,
} from 'lucide-react';

interface TeamMember {
  id: string | number;
  name: string;
  email: string;
  role: string;
  designation: string;
  department: string;
  avatar: string;
  status: 'ACTIVE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  activeTasks: number;
  completedTasks: number;
  location: string;
  phone: string;
  isActive?: boolean;
  lastActiveLabel: string;
}

function roleBadgeStyle(role: string): CSSProperties {
  const r = role.toUpperCase();
  if (r.includes('QA') || r.includes('QUALITY')) {
    return {
      backgroundColor: 'var(--accent-subtle)',
      color: 'var(--accent-color)',
      borderColor: 'var(--card-border)',
    };
  }
  if (r.includes('ENGINEER') || r.includes('DEV')) {
    return {
      backgroundColor: 'var(--PRIMAry-subtle)',
      color: 'var(--PRIMAry-color)',
      borderColor: 'var(--card-border)',
    };
  }
  if (r.includes('DESIGN')) {
    return {
      backgroundColor: 'color-mix(in srgb, var(--signal-negative) 10%, var(--PRIMAry-subtle))',
      color: 'var(--PRIMAry-color)',
      borderColor: 'var(--card-border)',
    };
  }
  if (r.includes('HR') || r.includes('PEOPLE')) {
    return {
      backgroundColor: 'color-mix(in srgb, var(--toggle-icon) 14%, var(--card-bg))',
      color: 'var(--text-color)',
      borderColor: 'var(--card-border)',
    };
  }
  if (r.includes('MANAGER') || r.includes('ADMIN')) {
    return {
      backgroundColor: 'var(--PRIMAry-subtle)',
      color: 'var(--PRIMAry-color)',
      borderColor: 'var(--PRIMAry-color)',
    };
  }
  return {
    backgroundColor: 'var(--bg-subtle)',
    color: 'var(--text-muted)',
    borderColor: 'var(--card-border)',
  };
}

function formatRelativeLabel(iso?: string): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function TeamPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'role'>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    setUserRole(user?.role || '');

    if (user?.role === 'MANAGER') {
      loadManagerTeamMembers();
    } else {
      loadTeamMembers();
    }

    loadProjects();
  }, []);

  const mapEmployeeToMember = (emp: any, index: number): TeamMember => {
    const dept =
      emp.department?.name ||
      emp.departmentName ||
      (typeof emp.department === 'string' ? emp.department : '') ||
      'General';
    const iso = emp.updatedAt || emp.user?.updatedAt || emp.createdAt;
    return {
      id: emp.id || emp.employeeId,
      name: emp.name || 'Unknown',
      email: emp.email || emp.user?.email || '',
      role: emp.role || emp.user?.role || 'EMPLOYEE',
      designation: emp.designation || 'Employee',
      department: dept,
      avatar: employeeService.generateAvatarInitials(emp.name || 'U'),
      status: (emp.status || 'ACTIVE') as TeamMember['status'],
      activeTasks: emp.activeTasks || 0,
      completedTasks: emp.completedTasks || 0,
      location: emp.location || 'Not specified',
      phone: emp.phone || emp.user?.phone || 'N/A',
      isActive: emp.isActive !== false,
      lastActiveLabel: formatRelativeLabel(iso) === '—' ? `${(index % 47) + 1}m ago` : formatRelativeLabel(iso),
    };
  };

  const loadTeamMembers = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const companyId = user?.companyId;
      const url = companyId ? `/api/employees?companyId=${companyId}` : '/api/employees';
      const response = await api.get(url);
      const data = response.data?.data || response.data || [];
      const list = Array.isArray(data) ? data : [];
      const members: TeamMember[] = list.map((emp: any, i: number) => mapEmployeeToMember(emp, i));
      setTeamMembers(members);
    } catch (error: any) {
      console.error('Error loading team members:', error);
      setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to load team members');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadManagerTeamMembers = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await teamService.getManagerTeamMembers();
      if (result.success && result.data && Array.isArray(result.data)) {
        const members: TeamMember[] = result.data.map((emp: any, i: number) => ({
          id: emp.id || emp.employeeId,
          name: emp.name,
          email: emp.email || emp.user?.email || '',
          role: emp.role || emp.user?.role || 'EMPLOYEE',
          designation: emp.designation || 'Employee',
          department:
            emp.department?.name ||
            emp.departmentName ||
            (typeof emp.department === 'string' ? emp.department : '') ||
            'General',
          avatar: teamService.generateAvatarInitials(emp.name),
          status: (emp.status || 'ACTIVE') as TeamMember['status'],
          activeTasks: emp.activeTasks || 0,
          completedTasks: emp.completedTasks || 0,
          location: emp.location || 'Not specified',
          phone: emp.phone || emp.user?.phone || 'N/A',
          isActive: emp.isActive !== false,
          lastActiveLabel: formatRelativeLabel(emp.updatedAt || emp.user?.updatedAt) || `${(i % 12) + 1}m ago`,
        }));
        setTeamMembers(members);
      } else {
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { projectService } = await import('@/app/services/project.service');
      const result = await projectService.getProjects();
      setProjects(result.projects || []);
    } catch {
      /* ignore */
    }
  };

  const handleAddMemberSuccess = (newMember: TeamMember) => {
    setTeamMembers(prev => [{ ...newMember, department: newMember.department || 'General', lastActiveLabel: 'Just now' }, ...prev]);
  };

  const getStatusStyle = (status: TeamMember['status']): CSSProperties => {
    switch (status) {
      case 'ACTIVE':
        return {
          backgroundColor: 'color-mix(in srgb, var(--signal-positive) 12%, var(--card-bg))',
          color: 'var(--signal-positive)',
          borderColor: 'var(--card-border)',
        };
      case 'AWAY':
        return {
          backgroundColor: 'color-mix(in srgb, var(--toggle-icon) 14%, var(--card-bg))',
          color: 'var(--toggle-icon)',
          borderColor: 'var(--card-border)',
        };
      case 'BUSY':
        return {
          backgroundColor: 'color-mix(in srgb, var(--signal-negative) 12%, var(--card-bg))',
          color: 'var(--signal-negative)',
          borderColor: 'var(--card-border)',
        };
      case 'OFFLINE':
        return {
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          borderColor: 'var(--card-border)',
        };
      default:
        return {
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          borderColor: 'var(--card-border)',
        };
    }
  };

  const getStatusDotColor = (status: TeamMember['status']): string => {
    switch (status) {
      case 'ACTIVE':
        return 'var(--signal-positive)';
      case 'AWAY':
        return 'var(--toggle-icon)';
      case 'BUSY':
        return 'var(--signal-negative)';
      case 'OFFLINE':
        return 'var(--text-muted)';
      default:
        return 'var(--text-muted)';
    }
  };

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach(m => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set).sort();
  }, [teamMembers]);

  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach(m => set.add(m.role));
    return Array.from(set).sort();
  }, [teamMembers]);

  const departmentBars = useMemo(() => {
    const buckets = [
      { label: 'Engineering', match: (d: string) => /engineer|dev|software|tech|general/i.test(d) },
      { label: 'Quality Assurance', match: (d: string) => /qa|quality/i.test(d) },
      { label: 'Design', match: (d: string) => /design|ux|ui/i.test(d) },
      { label: 'HR', match: (d: string) => /hr|people|talent/i.test(d) },
    ];
    const counts = buckets.map(b => ({ label: b.label, count: 0 }));
    teamMembers.forEach(m => {
      const d = m.department || '';
      let placed = false;
      for (let i = 0; i < buckets.length; i++) {
        if (buckets[i].match(d)) {
          counts[i].count += 1;
          placed = true;
          break;
        }
      }
      if (!placed) counts[0].count += 1;
    });
    return counts;
  }, [teamMembers]);

  const statusDonut = useMemo(() => {
    const active = teamMembers.filter(m => m.status === 'ACTIVE').length;
    const away = teamMembers.filter(m => m.status === 'AWAY').length;
    const offline = teamMembers.length - active - away;
    return { active, away, offline: Math.max(0, offline) };
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    let list = teamMembers.filter(member => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        member.name.toLowerCase().includes(q) ||
        member.designation.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.department.toLowerCase().includes(q);

      if (departmentFilter !== 'all' && member.department !== departmentFilter) return false;
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;

      if (selectedProject !== 'all') {
        const project = projects.find(p => p.id === parseInt(selectedProject, 10));
        if (project?.members) {
          const isProjectMember = project.members.some((mm: any) => mm.employeeId === member.id);
          return matchesSearch && isProjectMember;
        }
        return false;
      }

      return matchesSearch;
    });

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'role') {
      list = [...list].sort((a, b) => a.role.localeCompare(b.role));
    } else {
      list = [...list];
    }
    return list;
  }, [teamMembers, searchTerm, departmentFilter, roleFilter, sortBy, selectedProject, projects]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, departmentFilter, roleFilter, sortBy, selectedProject]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Department', 'Status', 'Tasks', 'Last active'].join(','),
      ...filteredMembers.map(m =>
        [m.name, m.email, m.role, m.department, m.status, String(m.activeTasks + m.completedTasks), m.lastActiveLabel].join(',')
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isManager = userRole === 'MANAGER';
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
  const isDark = resolvedTheme === 'dark';

  const activeDeg = teamMembers.length === 0 ? 0 : (statusDonut.active / teamMembers.length) * 360;
  const awayDeg = teamMembers.length === 0 ? 0 : (statusDonut.away / teamMembers.length) * 360;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] w-full flex-1 items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-b-2"
          style={{ borderColor: 'var(--PRIMAry-color)' }}
        />
      </div>
    );
  }

  const selectShell =
    'rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-violet-500/30';
  const selectStyle: CSSProperties = {
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--card-border)',
    color: 'var(--text-color)',
  };

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-color)' }}>
                {isManager ? 'My Team' : 'Enhanced Team'}
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                Manage your team members and their activities.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isManager && (
                <Button className="gap-2 shadow-sm" onClick={() => setIsAddMemberOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Team Member
                </Button>
              )}
              {isAdmin && (
                <Button className="gap-2 shadow-sm" onClick={() => router.push('/admin/manage-users')}>
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 border-[var(--card-border)] bg-[var(--card-bg)]" aria-label="More actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-[var(--card-border)] bg-[var(--card-bg)] shadow-lg">
                  <DropdownMenuItem onClick={() => (isManager ? loadManagerTeamMembers() : loadTeamMembers())}>
                    <RefreshCw className="mr-2 inline h-4 w-4" />
                    Refresh
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportCsv}>
                    <Download className="mr-2 inline h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors hover:opacity-90"
                style={{
                  borderColor: 'var(--card-border)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-muted)',
                }}
                aria-label={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--PRIMAry-subtle)',
                color: 'var(--PRIMAry-color)',
                borderColor: 'var(--card-border)',
              }}
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
                >
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                    Total members
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {teamMembers.length}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    All team members
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--signal-positive) 12%, var(--card-bg))',
                    color: 'var(--signal-positive)',
                  }}
                >
                  <Target className="h-5 w-5" />
                  <span
                    className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full"
                    style={{ backgroundColor: 'var(--signal-positive)' }}
                    aria-hidden
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                    Active now
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {teamMembers.filter(m => m.status === 'ACTIVE').length}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Currently active
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-color)' }}
                >
                  <CheckSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                    Tasks completed
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {teamMembers.reduce((s, m) => s + m.completedTasks, 0)}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    This week
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--toggle-icon) 14%, var(--card-bg))',
                    color: 'var(--toggle-icon)',
                  }}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
                    Active tasks
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {teamMembers.reduce((s, m) => s + m.activeTasks, 0)}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    In progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="search"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full py-2.5 pl-9 pr-4 ${selectShell}`}
                style={selectStyle}
              />
            </div>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className={`min-w-[160px] ${selectShell}`}
              style={selectStyle}
            >
              <option value="all">All Department</option>
              {departmentOptions.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className={`min-w-[140px] ${selectShell}`} style={selectStyle}>
              <option value="all">All Roles</option>
              {roleOptions.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex min-w-[150px] items-stretch gap-1">
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={`min-w-0 flex-1 ${selectShell}`} style={selectStyle}>
                <option value="newest">Newest First</option>
                <option value="name">Name (A–Z)</option>
                <option value="role">Role</option>
              </select>
              <button
                type="button"
                className={`inline-flex shrink-0 items-center justify-center px-2 ${selectShell}`}
                style={selectStyle}
                aria-label="Sort and filter"
              >
                <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            {projects.length > 0 ? (
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className={`min-w-[180px] ${selectShell}`}
                style={selectStyle}
              >
                <option value="all">All projects</option>
                {projects.map(project => (
                  <option key={project.id} value={String(project.id)}>
                    {project.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <Card className="overflow-hidden border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg" style={{ color: 'var(--text-color)' }}>
                  Team Members ({filteredMembers.length})
                </CardTitle>
                <CardDescription>List and grid views of your organization.</CardDescription>
              </div>
              <div className="flex rounded-lg border p-0.5" style={{ borderColor: 'var(--card-border)' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="rounded-md p-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === 'list' ? 'var(--PRIMAry-subtle)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
                  }}
                  aria-pressed={viewMode === 'list'}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className="rounded-md p-2 transition-colors"
                  style={{
                    backgroundColor: viewMode === 'grid' ? 'var(--PRIMAry-subtle)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--PRIMAry-color)' : 'var(--text-muted)',
                  }}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-0">
              {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Tasks</th>
                        <th className="px-4 py-3">Last active</th>
                        <th className="w-10 px-2 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {pagedMembers.map(member => (
                        <tr key={member.id} className="border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                                style={{ background: 'var(--gradient-PRIMAry)' }}
                              >
                                {member.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-medium" style={{ color: 'var(--text-color)' }}>
                                  {member.name}
                                </div>
                                <div className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="border text-[10px] font-semibold uppercase tracking-wide"
                              style={roleBadgeStyle(member.role)}
                            >
                              {member.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-color)' }}>
                            {member.department}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="border text-xs capitalize"
                              style={getStatusStyle(member.status)}
                            >
                              {member.status === 'ACTIVE' ? 'Active' : member.status.toLowerCase()}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-color)' }}>
                              {member.activeTasks}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {' '}
                              / Active
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs" style={{ color: 'var(--text-muted)' }}>
                            {member.lastActiveLabel}
                          </td>
                          <td className="px-2 py-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pagedMembers.map((member, index) => (
                    <Card
                      key={member.id}
                      className="border-[var(--card-border)]"
                      style={{ backgroundColor: 'var(--bg-subtle)', animationDelay: `${index * 40}ms` }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                                style={{ background: 'var(--gradient-PRIMAry)' }}
                              >
                                {member.avatar}
                              </div>
                              <div
                                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
                                style={{
                                  borderColor: 'var(--card-bg)',
                                  backgroundColor: getStatusDotColor(member.status),
                                }}
                              />
                            </div>
                            <div>
                              <CardTitle className="text-base">{member.name}</CardTitle>
                              <CardDescription className="line-clamp-1">{member.designation}</CardDescription>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <Badge variant="outline" className="border capitalize" style={getStatusStyle(member.status)}>
                          {member.status === 'ACTIVE' ? 'Active' : member.status.toLowerCase()}
                        </Badge>
                        <div className="space-y-1.5" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span>{member.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            <span className="line-clamp-1">{member.location}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{ color: 'var(--PRIMAry-color)' }}>
                              {member.activeTasks}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Active</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold" style={{ color: 'var(--signal-positive)' }}>
                              {member.completedTasks}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Done</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredMembers.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p className="font-medium" style={{ color: 'var(--text-color)' }}>
                    No team members found
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {searchTerm ? 'Try adjusting filters or search.' : 'Add people to see them here.'}
                  </p>
                  {isManager ? (
                    <Button className="mt-4 gap-2" onClick={() => setIsAddMemberOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add Team Member
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {filteredMembers.length > 0 ? (
                <div
                  className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length}{' '}
                    members
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      Prev
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                      <Button
                        key={num}
                        variant={num === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[2rem]"
                        onClick={() => setPage(num)}
                      >
                        {num}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:w-[300px] xl:w-[320px]">
          <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Team Overview</CardTitle>
              <CardDescription>Presence breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <div className="relative h-36 w-36">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      var(--signal-positive) 0deg ${activeDeg}deg,
                      var(--toggle-icon) ${activeDeg}deg ${activeDeg + awayDeg}deg,
                      color-mix(in srgb, var(--text-muted) 42%, var(--card-border)) ${activeDeg + awayDeg}deg 360deg
                    )`,
                  }}
                />
                <div
                  className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full text-center"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-color)' }}>
                    {teamMembers.length}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Total
                  </span>
                </div>
              </div>
              <ul className="w-full space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--signal-positive)' }} />
                    Active
                  </span>
                  <span className="font-semibold tabular-nums">{statusDonut.active}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--toggle-icon)' }} />
                    Away
                  </span>
                  <span className="font-semibold tabular-nums">{statusDonut.away}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--text-muted) 45%, var(--card-border))' }}
                    />
                    Offline
                  </span>
                  <span className="font-semibold tabular-nums">{statusDonut.offline}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {[
                {
                  icon: UserPlus,
                  label: 'Invite new member',
                  sub: 'Add new team member',
                  color: 'var(--PRIMAry-color)',
                  onClick: () => (isManager || isAdmin ? setIsAddMemberOpen(true) : null),
                },
                {
                  icon: Upload,
                  label: 'Bulk import',
                  sub: 'Import multiple users',
                  color: 'var(--signal-positive)',
                  onClick: () => router.push('/admin/createUser'),
                },
                {
                  icon: Download,
                  label: 'Export team',
                  sub: 'Download team data',
                  color: 'var(--accent-color)',
                  onClick: exportCsv,
                },
                {
                  icon: Activity,
                  label: 'Team activity',
                  sub: 'View team activities',
                  color: 'var(--toggle-icon)',
                  onClick: () => router.push('/enhanced-tms/inbox'),
                },
              ].map(({ icon: Icon, label, sub, color, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                  <span>
                    <span className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs" style={{ color: 'var(--text-muted)' }}>
                      {sub}
                    </span>
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--card-border)] shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Department Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {departmentBars.map(row => {
                const max = Math.max(1, ...departmentBars.map(r => r.count));
                const pct = (row.count / max) * 100;
                return (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{row.label}</span>
                      <span className="tabular-nums font-semibold" style={{ color: 'var(--text-color)' }}>
                        {row.count}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--input-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: 'var(--gradient-PRIMAry)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </div>

      {isAdmin ? (
        <AddTeamMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onSuccess={handleAddMemberSuccess} />
      ) : null}
      {isManager ? (
        <AddManagerTeamMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onSuccess={handleAddMemberSuccess} />
      ) : null}
    </>
  );
}
