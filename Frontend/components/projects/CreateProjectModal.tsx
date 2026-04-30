'use client';

import { useState, useEffect } from 'react';
import { projectService } from '@/app/services/projectService';
import { FolderPlus, X, RefreshCw, CheckCircle2, Users, User } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Employee { id: number; name: string; designation: string; department?: { id: number; name: string } }

const field = (label: string, required = false) => (
  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
    style={{ color: 'var(--text-muted)' }}>
    {label}{required && <span style={{ color: '#f87171' }}> *</span>}
  </label>
);

const inputCls = {
  backgroundColor: 'var(--input-bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--text-color)',
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
} as const;

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [form, setForm] = useState({ name: '', description: '', clientName: '', startDate: '', endDate: '' });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (u) { setUser(u); setCompanyId(u.companyId); }
    loadEmployees(u?.companyId);
  }, [isOpen]);

  const loadEmployees = async (cid?: number) => {
    setDataLoading(true);
    try {
      const timeout = new Promise<any>(r => setTimeout(() => r({ success: false, data: [] }), 4000));
      const result = await Promise.race([projectService.getAvailableEmployees(cid), timeout]);
      if (result.success && result.data?.length) {
        setEmployees(result.data);
      }
    } catch { }
    finally { setDataLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Project name is required');
    if (!form.clientName.trim()) return setError('Client name is required');
    if (!form.startDate || !form.endDate) return setError('Start and end dates are required');
    if (new Date(form.startDate) >= new Date(form.endDate)) return setError('End date must be after start date');
    setLoading(true); setError('');
    try {
      const result = await projectService.createProject({
        name: form.name.trim(), description: form.description?.trim() || '',
        startDate: form.startDate, endDate: form.endDate, status: 'PLANNING' as const,
        teamMembers: selected.map(id => ({ employeeId: id, role: 'MEMBER' as const })),
      });
      if (result.success) { onSuccess(); onClose(); reset(); }
      else setError(result.message || 'Failed to create project');
    } catch (e: any) { setError(e.message || 'Failed to create project'); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm({ name: '', description: '', clientName: '', startDate: '', endDate: '' }); setSelected([]); setError(''); };
  const handleClose = () => { reset(); onClose(); };
  const toggle = (id: number) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#1e40af 0%,#4f46e5 60%,#7c3aed 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <FolderPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Project</h2>
              <p className="text-xs text-white/60">Fill in the details to set up your project</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <span className="text-base">⚠</span> {error}
            </div>
          )}

          {/* Row 1: Name + Client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              {field('Project Name', true)}
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Mobile App v2" style={inputCls} />
            </div>
            <div>
              {field('Client Name', true)}
              <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                placeholder="e.g., Acme Corp" style={inputCls} />
            </div>
          </div>

          {/* Company ID */}
          <div>
            {field('Company ID')}
            <div className="px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
              {companyId || '—'}
            </div>
          </div>

          {/* Row 3: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              {field('Start Date', true)}
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inputCls} />
            </div>
            <div>
              {field('End Date', true)}
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inputCls} />
            </div>
          </div>

          {/* Description */}
          <div>
            {field('Description')}
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the project scope and objectives..." rows={3}
              style={{ ...inputCls, resize: 'none' }} />
          </div>

          {/* Project Manager */}
          <div>
            {field('Project Manager')}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{user?.name || '—'}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.designation || 'Manager'}</p>
              </div>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}>Owner</span>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              {field('Team Members')}
              {selected.length > 0 && (
                <span className="text-xs font-semibold" style={{ color: 'var(--primary-color)' }}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
              {dataLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading members…
                </div>
              ) : employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Users className="w-8 h-8 opacity-30" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No employees available</p>
                </div>
              ) : (
                <div className="max-h-44 overflow-y-auto divide-y" style={{ borderColor: 'var(--card-border)' }}>
                  {employees.map(emp => {
                    const isSelected = selected.includes(emp.id);
                    return (
                      <label key={emp.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                        style={{ backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent' }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle)'; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggle(emp.id)}
                          className="w-4 h-4 rounded flex-shrink-0" style={{ accentColor: 'var(--primary-color)' }} />
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                          {emp.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>{emp.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{emp.designation} · {emp.department?.name || '—'}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--card-border)', backgroundColor: 'var(--bg-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Fields marked <span style={{ color: '#f87171' }}>*</span> are required
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handleClose} disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating…</> : <><FolderPlus className="w-4 h-4" /> Create Project</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
