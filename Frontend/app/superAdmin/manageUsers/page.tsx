'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../_components/Sidebarr';
import {
    Crown, Search, RefreshCw, ChevronLeft, ChevronRight,
    CheckCircle, AlertCircle, X, Building2, Mail, Phone,
    Calendar, Shield, Hash,
} from 'lucide-react';
import { userService, Ceo } from '../../services/user.service';

const card = {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '16px',
} as const;

function CeoDetailPanel({ ceo, onClose }: { ceo: Ceo; onClose: () => void }) {
    const initials = `${ceo.firstName[0]}${ceo.lastName?.[0] || ''}`.toUpperCase();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-lg)' }}>
                {/* Header */}
                <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))' }}>
                    <button onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                                {ceo.firstName} {ceo.lastName}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>CEO</span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: ceo.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                        color: ceo.isActive ? '#4ade80' : '#f87171',
                                    }}>
                                    {ceo.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                    {[
                        { icon: Hash, label: 'CEO ID', value: ceo.ceoId, mono: true, color: '#a78bfa' },
                        { icon: Mail, label: 'Email', value: ceo.email },
                        { icon: Phone, label: 'Phone', value: ceo.phone || '—' },
                        { icon: Building2, label: 'Company Name', value: ceo.companyName || '—' },
                        { icon: Shield, label: 'Company Code', value: ceo.companyCode || '—', mono: true, color: '#60a5fa' },
                        { icon: CheckCircle, label: 'Verified', value: ceo.isVerified ? 'Yes' : 'Pending verification' },
                        { icon: Calendar, label: 'Created', value: new Date(ceo.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    ].map(({ icon: Icon, label, value, mono, color }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'var(--bg-subtle)' }}>
                                <Icon className="h-3.5 w-3.5" style={{ color: color || 'var(--text-muted)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                <p className={`text-sm font-medium truncate ${mono ? 'font-mono' : ''}`}
                                    style={{ color: color || 'var(--text-color)' }}>
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ManageUsersPage() {
    const [ceos, setCeos] = useState<Ceo[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedCeo, setSelectedCeo] = useState<Ceo | null>(null);
    const PER_PAGE = 10;

    const fetchCeos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userService.getCeos(page, PER_PAGE, search || undefined);
            setCeos(res.ceos);
            setTotal(res.total);
        } catch {
            setCeos([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const t = setTimeout(fetchCeos, 300);
        return () => clearTimeout(t);
    }, [fetchCeos]);

    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

    return (
        <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
            <Sidebar />
            <main className="flex-1 min-w-0 pt-[57px] lg:pt-0">
                {selectedCeo && <CeoDetailPanel ceo={selectedCeo} onClose={() => setSelectedCeo(null)} />}

                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Manage Users</h1>
                            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                                {total} CEO{total !== 1 ? 's' : ''} registered across all companies
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search by name, email, CEO ID…"
                                    className="rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none w-64"
                                    style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }} />
                            </div>
                            <button onClick={fetchCeos}
                                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-2xl overflow-hidden" style={card}>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <RefreshCw className="h-6 w-6 animate-spin" style={{ color: 'var(--primary-color)' }} />
                            </div>
                        ) : ceos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Crown className="h-12 w-12" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {search ? 'No CEOs match your search' : 'No CEOs registered yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                            {['CEO', 'CEO ID', 'Company Name', 'Company Code', 'Status', 'Verified', 'Created'].map(h => (
                                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ceos.map((ceo, i) => (
                                            <tr key={ceo.id}
                                                onClick={() => setSelectedCeo(ceo)}
                                                style={{ borderBottom: i < ceos.length - 1 ? '1px solid var(--card-border)' : 'none', cursor: 'pointer' }}
                                                className="transition-colors hover:bg-[var(--bg-subtle)]">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                                                            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                                                            {ceo.firstName[0]}{ceo.lastName?.[0] || ''}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>
                                                                {ceo.firstName} {ceo.lastName}
                                                            </p>
                                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ceo.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-lg px-2.5 py-1 text-xs font-mono"
                                                        style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary-color)' }}>
                                                        {ceo.ceoId}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-sm" style={{ color: 'var(--text-color)' }}>{ceo.companyName || '—'}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {ceo.companyCode
                                                        ? <span className="rounded-lg px-2.5 py-1 text-xs font-mono"
                                                            style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                                                            {ceo.companyCode}
                                                        </span>
                                                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                                                        style={{
                                                            backgroundColor: ceo.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                                            color: ceo.isActive ? '#4ade80' : '#f87171',
                                                        }}>
                                                        {ceo.status?.toLowerCase()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {ceo.isVerified
                                                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                                                        : <AlertCircle className="h-4 w-4 text-amber-400" />}
                                                </td>
                                                <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(ceo.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && ceos.length > 0 && totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
                                        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text-muted)' }}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>{page} / {totalPages}</span>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
                                        style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--card-border)', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-muted)' }}>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {!loading && ceos.length > 0 && (
                        <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                            Click any row to view CEO details
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
