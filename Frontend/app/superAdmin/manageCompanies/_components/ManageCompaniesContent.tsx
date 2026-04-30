"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Plus, Search, RefreshCw, Edit2, Trash2,
    CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight,
    CreditCard, Users, BarChart2,
} from "lucide-react";
import { userService, CompanyFull } from "../../../services/user.service";

const PLANS = ["TRIAL", "BASIC", "PRO", "ENTERPRISE"] as const;
type Plan = typeof PLANS[number];

const planColor: Record<Plan, string> = {
    TRIAL: "rgba(245,158,11,0.15)",
    BASIC: "rgba(59,130,246,0.15)",
    PRO: "rgba(124,58,237,0.15)",
    ENTERPRISE: "rgba(34,197,94,0.15)",
};
const planText: Record<Plan, string> = {
    TRIAL: "#f59e0b",
    BASIC: "#60a5fa",
    PRO: "#a78bfa",
    ENTERPRISE: "#4ade80",
};

interface Toast { id: number; type: "success" | "error"; message: string }

function ToastList({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div key={t.id}
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-xl"
                        style={{
                            backgroundColor: "var(--card-bg)", border: `1px solid ${t.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                            color: t.type === "success" ? "#4ade80" : "#f87171", minWidth: 280,
                        }}>
                        {t.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        <span className="flex-1">{t.message}</span>
                        <button onClick={() => dismiss(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6 }}>
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

interface CreateFormData { name: string; industry: string; description: string; technology: string; plan: Plan }

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState<CreateFormData>({ name: "", industry: "", description: "", technology: "", plan: "TRIAL" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Company name is required"); return; }
        setLoading(true); setError("");
        try {
            await userService.createCompany({
                name: form.name.trim(),
                industry: form.industry || undefined,
                description: form.description || undefined,
                technology: form.technology || undefined,
                plan: form.plan,
            });
            onCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to create company");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg rounded-2xl p-6"
                style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-lg)" }}>
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-color)" }}>Create Company</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>Company Name *</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Acme Corporation" autoFocus
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                style={{ backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" }} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>Industry</label>
                            <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                                placeholder="e.g. Finance, Healthcare"
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                style={{ backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" }} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>Technology Stack</label>
                            <input value={form.technology} onChange={e => setForm(f => ({ ...f, technology: e.target.value }))}
                                placeholder="e.g. React, Node.js, AWS"
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                style={{ backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" }} />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Brief description of the company…" rows={3}
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                                style={{ backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" }} />
                        </div>

                        <div className="col-span-2">
                            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>Plan</label>
                            <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value as Plan }))}
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                style={{ backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" }}>
                                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}>
                        Company Code will be auto-generated: <span style={{ color: "var(--primary-color)", fontFamily: "monospace" }}>CMP-XXXXXX-DDMMYYYY</span>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-muted)", cursor: "pointer" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", cursor: loading ? "not-allowed" : "pointer" }}>
                            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating…</> : <><Plus className="h-4 w-4" /> Create</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function EditModal({ company, onClose, onUpdated }: { company: CompanyFull; onClose: () => void; onUpdated: () => void }) {
    const [form, setForm] = useState({ name: company.name, industry: company.industry || "", plan: (company.plan || "TRIAL") as Plan, isActive: company.isActive ?? true });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError("Company name is required"); return; }
        setLoading(true); setError("");
        try {
            await userService.updateCompany(company.id, { name: form.name.trim(), isActive: form.isActive });
            onUpdated(); onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to update company");
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-2xl p-6"
                style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-lg)" }}>
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-color)" }}>Edit Company</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-muted)" }}>Company Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus
                            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                            style={{ backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" }} />
                    </div>

                    <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "var(--bg-subtle)" }}>
                        <span style={{ color: "var(--text-muted)" }}>Company Code: </span>
                        <span style={{ color: "var(--primary-color)", fontFamily: "monospace" }}>{company.code}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-sm" style={{ color: "var(--text-muted)" }}>Active</label>
                        <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                            className="relative h-6 w-11 rounded-full transition-colors"
                            style={{ backgroundColor: form.isActive ? "var(--primary-color)" : "var(--card-border)", border: "none", cursor: "pointer" }}>
                            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                                style={{ left: form.isActive ? "calc(100% - 22px)" : "2px" }} />
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-muted)", cursor: "pointer" }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", cursor: loading ? "not-allowed" : "pointer" }}>
                            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function ManageCompaniesContent() {
    const [companies, setCompanies] = useState<CompanyFull[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editTarget, setEditTarget] = useState<CompanyFull | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const addToast = useCallback((type: Toast["type"], message: string) => {
        const id = Date.now();
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await userService.getCompanies();
            setCompanies(res.companies as CompanyFull[]);
        } catch { addToast("error", "Failed to load companies"); }
        finally { setLoading(false); }
    }, [addToast]);

    useEffect(() => { load(); }, [load]);

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleDelete = async (id: number) => {
        try {
            await userService.deleteCompany(id);
            addToast("success", "Company deactivated");
            setDeleteConfirm(null);
            load();
        } catch { addToast("error", "Failed to deactivate company"); }
    };

    const card = { backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16 };

    return (
        <>
            <ToastList toasts={toasts} dismiss={id => setToasts(p => p.filter(t => t.id !== id))} />
            {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { load(); addToast("success", "Company created successfully"); }} />}
            {editTarget && <EditModal company={editTarget} onClose={() => setEditTarget(null)} onUpdated={() => { load(); addToast("success", "Company updated"); }} />}

            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>Manage Companies</h1>
                        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                            {companies.length} {companies.length === 1 ? "company" : "companies"} registered
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                        <Plus className="h-4 w-4" /> New Company
                    </button>
                </div>

                {/* Stats row */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Total", value: companies.length, icon: Building2, color: "#60a5fa" },
                        { label: "Active", value: companies.filter(c => c.isActive !== false).length, icon: CheckCircle, color: "#4ade80" },
                        { label: "Enterprise", value: companies.filter(c => c.plan === "ENTERPRISE").length, icon: BarChart2, color: "#a78bfa" },
                        { label: "Trial", value: companies.filter(c => c.plan === "TRIAL").length, icon: CreditCard, color: "#f59e0b" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="rounded-2xl p-4" style={card}>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
                                    <Icon className="h-4 w-4" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold" style={{ color: "var(--text-color)" }}>{value}</p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search + table */}
                <div className="rounded-2xl overflow-hidden" style={card}>
                    <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search by name or code…"
                                className="w-full rounded-xl py-2 pl-9 pr-4 text-sm outline-none"
                                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-color)" }} />
                        </div>
                        <button onClick={load} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
                            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-muted)", cursor: "pointer" }}>
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "var(--primary-color)" }} />
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Building2 className="h-12 w-12" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                {search ? "No companies match your search" : "No companies yet"}
                            </p>
                            {!search && (
                                <button onClick={() => setShowCreate(true)}
                                    className="mt-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
                                    style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", border: "none", cursor: "pointer" }}>
                                    <Plus className="h-4 w-4" /> Create first company
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                                        {["Company", "Code", "Plan", "Users", "Status", "Created", "Actions"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((company, i) => (
                                        <motion.tr key={company.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            style={{ borderBottom: "1px solid var(--card-border)" }}
                                            className="transition-colors hover:bg-[var(--bg-subtle)]">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                                        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))" }}>
                                                        <Building2 className="h-4 w-4" style={{ color: "var(--primary-color)" }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: "var(--text-color)" }}>{company.name}</p>
                                                        {company.industry && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{company.industry}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-lg px-2.5 py-1 text-xs font-mono"
                                                    style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}>
                                                    {company.code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                                    style={{ backgroundColor: planColor[(company.plan as Plan) || "TRIAL"], color: planText[(company.plan as Plan) || "TRIAL"] }}>
                                                    {company.plan || "TRIAL"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
                                                    <Users className="h-3.5 w-3.5" />
                                                    {company.userCount ?? "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: company.isActive !== false ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                                        color: company.isActive !== false ? "#4ade80" : "#f87171",
                                                    }}>
                                                    {company.isActive !== false ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    {company.createdAt ? new Date(company.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setEditTarget(company)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                                                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: "pointer", color: "var(--text-muted)" }}
                                                        title="Edit">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    {deleteConfirm === company.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => handleDelete(company.id)}
                                                                className="rounded-lg px-2.5 py-1 text-xs font-medium text-white"
                                                                style={{ background: "#ef4444", border: "none", cursor: "pointer" }}>Confirm</button>
                                                            <button onClick={() => setDeleteConfirm(null)}
                                                                className="rounded-lg px-2.5 py-1 text-xs font-medium"
                                                                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: "pointer", color: "var(--text-muted)" }}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setDeleteConfirm(company.id)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                                                            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", color: "#f87171" }}
                                                            title="Deactivate">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
                                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: page === 1 ? "not-allowed" : "pointer", color: "var(--text-muted)" }}>
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs px-2" style={{ color: "var(--text-muted)" }}>{page} / {totalPages}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
                                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: page === totalPages ? "not-allowed" : "pointer", color: "var(--text-muted)" }}>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
