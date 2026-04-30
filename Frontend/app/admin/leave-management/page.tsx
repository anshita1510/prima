'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Users, Plus, Search, RefreshCw, X,
} from 'lucide-react';
import { leaveService, Leave } from '@/app/services/leave.service';
import { authService } from '@/app/services/authService';

// ── Types ──────────────────────────────────────────────────────────
type TabKey = 'all' | 'pending' | 'approved' | 'rejected';

interface Counts { all: number; pending: number; approved: number; rejected: number }

// ── Constants ──────────────────────────────────────────────────────
const TABS: { id: TabKey; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Users size={14} /> },
  { id: 'pending', label: 'Pending', icon: <Clock size={14} /> },
  { id: 'approved', label: 'Approved', icon: <CheckCircle size={14} /> },
  { id: 'rejected', label: 'Rejected', icon: <XCircle size={14} /> },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  APPROVED: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  REJECTED: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

const card = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '16px',
} as const;

// ── Helpers ────────────────────────────────────────────────────────
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const leaveDays = (s: string, e: string) => {
  const diff = (new Date(e).getTime() - new Date(s).getTime()) / 86400000;
  return Math.max(1, Math.round(diff) + 1);
};

// ── Sub-components ─────────────────────────────────────────────────

function LeaveTabs({ active, counts, onChange }: { active: TabKey; counts: Counts; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TABS.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{
            backgroundColor: active === t.id ? 'var(--primary-color)' : 'var(--input-bg)',
            color: active === t.id ? '#fff' : 'var(--text-muted)',
            border: '1px solid var(--card-border)', cursor: 'pointer',
          }}>
          {t.icon} {t.label}
          <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: active === t.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
              color: active === t.id ? '#fff' : 'var(--text-muted)',
            }}>
            {counts[t.id]}
          </span>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const msgs: Record<TabKey, string> = {
    all: 'No leave applications found',
    pending: 'No pending leave applications',
    approved: 'No approved leave applications',
    rejected: 'No rejected leave applications',
  };
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Calendar size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{msgs[tab]}</p>
    </div>
  );
}

function LeaveList({
  leaves, user, actionLoading,
  onApprove, onRejectClick,
}: {
  leaves: Leave[];
  user: any;
  actionLoading: boolean;
  onApprove: (id: number) => void;
  onRejectClick: (leave: Leave) => void;
}) {
  if (!leaves.length) return null;

  return (
    <div className="space-y-3">
      {leaves.map(leave => {
        const isOwn = user && (
          leave.employee?.employeeCode === user.employeeCode ||
          (leave as any).employee?.id === user.id
        );
        const canAct = leave.status === 'PENDING' && !isOwn;
        const s = STATUS_STYLE[leave.status] || { bg: 'var(--bg-subtle)', color: 'var(--text-muted)' };

        return (
          <div key={leave.id} className="rounded-xl p-4 transition-all"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                    {leaveService.formatLeaveType(leave.type)}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    {leave.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div>
                    <div className="font-medium mb-0.5" style={{ color: 'var(--text-color)' }}>Employee</div>
                    <div>{leave.employee?.name || '—'}</div>
                    <div className="opacity-70">{leave.employee?.employeeCode}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-0.5" style={{ color: 'var(--text-color)' }}>Duration</div>
                    <div>{fmtDate(leave.startDate)} – {fmtDate(leave.endDate)}</div>
                    <div className="opacity-70">{leaveDays(leave.startDate, leave.endDate)} day(s)</div>
                  </div>
                  <div>
                    <div className="font-medium mb-0.5" style={{ color: 'var(--text-color)' }}>Department</div>
                    <div>{leave.department || '—'}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-0.5" style={{ color: 'var(--text-color)' }}>Applied</div>
                    <div>{fmtDate(leave.createdAt)}</div>
                    {leave.approvedBy && <div className="opacity-70">By: {leave.approvedBy}</div>}
                  </div>
                </div>

                {leave.reason && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-color)' }}>Reason: </span>{leave.reason}
                  </div>
                )}
              </div>

              {canAct && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => onApprove(leave.id)} disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => onRejectClick(leave)} disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RejectDialog({
  leave, reason, onReasonChange, onConfirm, onCancel, loading,
}: {
  leave: Leave | null; reason: string; onReasonChange: (v: string) => void;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  if (!leave) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Reject Leave Application</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-xs space-y-1" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
          <div><span className="font-medium" style={{ color: 'var(--text-color)' }}>Employee:</span> {leave.employee?.name}</div>
          <div><span className="font-medium" style={{ color: 'var(--text-color)' }}>Type:</span> {leaveService.formatLeaveType(leave.type)}</div>
          <div><span className="font-medium" style={{ color: 'var(--text-color)' }}>Duration:</span> {fmtDate(leave.startDate)} – {fmtDate(leave.endDate)}</div>
        </div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Rejection Reason (optional)</label>
        <textarea value={reason} onChange={e => onReasonChange(e.target.value)}
          placeholder="Enter reason for rejection..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none mb-4"
          style={{ backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-color)' }} />
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#ef4444', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Rejecting…</> : 'Reject Leave'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplyLeaveModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ type: 'CASUAL' as const, startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSubmitting(true);
    try {
      const res = await leaveService.applyLeave(form);
      if (res.success) { onSuccess(); }
      else setErr((res as any).error || 'Failed to apply for leave');
    } catch (e: any) { setErr(e.message || 'Failed to apply for leave'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-color)' }}>Apply for Leave</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {err && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
            <AlertCircle size={14} /> {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Leave Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-color)' }} required>
              {['CASUAL', 'SICK', 'EARNED', 'UNPAID'].map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Leave</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['startDate', 'endDate'] as const).map(k => (
              <div key={k}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {k === 'startDate' ? 'Start Date' : 'End Date'}
                </label>
                <input type="date" value={form[k]}
                  onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  min={k === 'startDate' ? today : form.startDate || today}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-color)' }} required />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Reason (optional)</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Enter reason for leave..." rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ backgroundColor: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-color)' }} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? <><RefreshCw size={14} className="animate-spin" /> Submitting…</> : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminLeaveManagement() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth check
  useEffect(() => {
    const currentUser = authService.getStoredUser();
    const token = authService.getToken();
    if (!currentUser || !token) { setError('Please log in to access this page.'); return; }
    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(currentUser.role)) { setError('Access denied.'); return; }
    setUser(currentUser);
    loadLeaves();
  }, []);

  const loadLeaves = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await leaveService.getAllLeaves();
      if (res.success && res.leaves) setLeaves(res.leaves);
      else setError(res.error || 'Failed to load leaves');
    } catch (e: any) { setError(e.message || 'Failed to load leaves'); }
    finally { setLoading(false); }
  }, []);

  // Derived counts
  const counts: Counts = {
    all: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  // Filtered + searched leaves
  const filtered = leaves.filter(l => {
    const matchTab = activeTab === 'all' || l.status === activeTab.toUpperCase();
    const q = search.toLowerCase();
    const matchSearch = !q || l.employee?.name?.toLowerCase().includes(q) ||
      l.employee?.employeeCode?.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q) || l.department?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  // Debounced search
  const handleSearch = (val: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 300);
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true); setError('');
    try {
      const res = await leaveService.updateLeaveStatus(id, 'APPROVED');
      if (res.success) await loadLeaves();
      else setError(res.error || 'Failed to approve');
    } catch (e: any) { setError(e.message || 'Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!selectedLeave) return;
    setActionLoading(true); setError('');
    try {
      const res = await leaveService.updateLeaveStatus(selectedLeave.id, 'REJECTED', rejectionReason);
      if (res.success) { setShowRejectDialog(false); setRejectionReason(''); setSelectedLeave(null); await loadLeaves(); }
      else setError(res.error || 'Failed to reject');
    } catch (e: any) { setError(e.message || 'Failed to reject'); }
    finally { setActionLoading(false); }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 py-4"
          style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Leave Management</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Review and manage employee leave applications</p>
            </div>
            <button onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: 'none', cursor: 'pointer' }}>
              <Plus size={14} /> Apply for Leave
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              <AlertCircle size={16} className="flex-shrink-0" /> {error}
              <button onClick={() => setError('')} className="ml-auto" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <LeaveTabs active={activeTab} counts={counts} onChange={setActiveTab} />
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  placeholder="Search by name, code, type…"
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none w-52"
                  style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }} />
              </div>
            </div>
            <button onClick={loadLeaves} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Content */}
          <div style={card} className="overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: 'var(--primary-color)' }} />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>
                  Leave Applications
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full ml-1"
                  style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}>
                  {filtered.length}
                </span>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-3" style={{ color: 'var(--text-muted)' }}>
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="text-sm">Loading leave applications…</span>
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                <LeaveList
                  leaves={filtered}
                  user={user}
                  actionLoading={actionLoading}
                  onApprove={handleApprove}
                  onRejectClick={leave => { setSelectedLeave(leave); setShowRejectDialog(true); }}
                />
              )}
            </div>
          </div>

        </div>

      {/* Modals */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => { setShowApplyModal(false); loadLeaves(); }}
        />
      )}

      {showRejectDialog && (
        <RejectDialog
          leave={selectedLeave}
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleReject}
          onCancel={() => { setShowRejectDialog(false); setRejectionReason(''); setSelectedLeave(null); }}
          loading={actionLoading}
        />
      )}
    </>
  );
}
