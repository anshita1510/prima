"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Building2,
  CheckCircle, AlertCircle, RefreshCw, X, Search,
  ChevronLeft, ChevronRight, Trash2, RotateCcw,
} from "lucide-react";
import { userService, Company, Ceo } from "../../../services/user.service";

// ── Zod schema ────────────────────────────────────────────────────
const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().max(50).optional(),
  email: z.string().email("Please enter a valid email address").max(255),
  phoneNumber: z.string().min(7, "Phone number is required").max(20),
  companyId: z.string().min(1, "Please select a company"),
});
type FormData = z.infer<typeof schema>;

// ── Toast ─────────────────────────────────────────────────────────
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
              backgroundColor: "var(--card-bg)",
              border: `1px solid ${t.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              color: t.type === "success" ? "#4ade80" : "#f87171", minWidth: 300,
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

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all";
const inputStyle = { backgroundColor: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-color)" };

export default function CreateCeoContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // CEO list state
  const [ceos, setCeos] = useState<Ceo[]>([]);
  const [ceosLoading, setCeosLoading] = useState(true);
  const [ceoSearch, setCeoSearch] = useState("");
  const [ceoPage, setCeoPage] = useState(1);
  const [ceoTotal, setCeoTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const CEO_PER_PAGE = 8;

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedCompanyId = watch("companyId");

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  }, []);

  // Load companies
  useEffect(() => {
    userService.getCompanies()
      .then(res => setCompanies(res.companies))
      .catch(() => addToast("error", "Failed to load companies"));
  }, [addToast]);

  // Sync selected company display
  useEffect(() => {
    const found = companies.find(c => String(c.id) === watchedCompanyId);
    setSelectedCompany(found || null);
  }, [watchedCompanyId, companies]);

  // Load CEOs
  const loadCeos = useCallback(async () => {
    setCeosLoading(true);
    try {
      const res = await userService.getCeos(ceoPage, CEO_PER_PAGE, ceoSearch || undefined);
      setCeos(res.ceos);
      setCeoTotal(res.total);
    } catch { addToast("error", "Failed to load CEOs"); }
    finally { setCeosLoading(false); }
  }, [ceoPage, ceoSearch, addToast]);

  useEffect(() => { loadCeos(); }, [loadCeos]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await userService.createCeo({
        firstName: data.firstName,
        lastName: data.lastName || "",
        email: data.email,
        phoneNumber: data.phoneNumber,
        companyId: Number(data.companyId),
        password: ""
      });
      addToast("success", `CEO ${res.ceo.name} created! Confirmation email sent.`);
      reset();
      setSelectedCompany(null);
      loadCeos();
    } catch (err: any) {
      addToast("error", err.response?.data?.error || err.message || "Failed to create CEO");
    } finally { setSubmitting(false); }
  };

  const handleDeleteCeo = async (id: number) => {
    try {
      await userService.deleteCeo(id);
      addToast("success", "CEO deactivated");
      setDeleteConfirm(null);
      loadCeos();
    } catch { addToast("error", "Failed to deactivate CEO"); }
  };

  const totalPages = Math.max(1, Math.ceil(ceoTotal / CEO_PER_PAGE));
  const card = { backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16 };

  return (
    <>
      <ToastList toasts={toasts} dismiss={id => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>CEO Management</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Create and manage company CEOs</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          {/* ── Create Form ── */}
          <div className="rounded-2xl p-6" style={card}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))" }}>
                <Crown className="h-5 w-5" style={{ color: "var(--primary-color)" }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-color)" }}>Create New CEO</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Assign a CEO to a company</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name *" error={errors.firstName?.message}>
                  <input {...register("firstName")} placeholder="John" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="Last Name (optional)" error={errors.lastName?.message}>
                  <input {...register("lastName")} placeholder="Doe" className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <Field label="Work Email *" error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="ceo@company.com" autoComplete="email" className={inputCls} style={inputStyle} />
              </Field>

              {/* Designation — fixed */}
              <Field label="Designation">
                <div className={inputCls} style={{ ...inputStyle, opacity: 0.7, cursor: "not-allowed", display: "flex", alignItems: "center", gap: 8 }}>
                  <Crown className="h-4 w-4 shrink-0" style={{ color: "var(--primary-color)" }} />
                  <span>CEO</span>
                </div>
              </Field>

              {/* Company dropdown */}
              <Field label="Company *" error={errors.companyId?.message}>
                <select {...register("companyId")} className={inputCls} style={inputStyle}>
                  <option value="">— Select a company —</option>
                  {companies.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </Field>

              {/* Company code display */}
              <AnimatePresence>
                {selectedCompany && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ backgroundColor: "var(--primary-subtle)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <Building2 className="h-4 w-4 shrink-0" style={{ color: "var(--primary-color)" }} />
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Company Code</p>
                      <p className="font-mono text-sm font-semibold" style={{ color: "var(--primary-color)" }}>{selectedCompany.code}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>CEO ID preview</p>
                      <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>CEO-{selectedCompany.code}-XXXXXX</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Phone Number *" error={errors.phoneNumber?.message}>
                <input {...register("phoneNumber")} type="tel" placeholder="+91 98765 43210" className={inputCls} style={inputStyle} />
              </Field>

              <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}>
                A confirmation email will be sent to the CEO. Clicking the link will redirect them to the login page.
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { reset(); setSelectedCompany(null); }}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-muted)", cursor: "pointer" }}>
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
                <button type="submit" disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", border: "none", cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                  {submitting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating…</> : <><Crown className="h-4 w-4" /> Create CEO</>}
                </button>
              </div>
            </form>
          </div>

          {/* ── CEO List ── */}
          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="flex items-center justify-between gap-3 p-4 border-b" style={{ borderColor: "var(--card-border)" }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-color)" }}>All CEOs</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ceoTotal} total</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                  <input value={ceoSearch} onChange={e => { setCeoSearch(e.target.value); setCeoPage(1); }}
                    placeholder="Search…"
                    className="rounded-xl py-2 pl-8 pr-3 text-xs outline-none w-40"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", color: "var(--text-color)" }} />
                </div>
                <button onClick={loadCeos}
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: "pointer", color: "var(--text-muted)" }}>
                  <RefreshCw className={`h-3.5 w-3.5 ${ceosLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {ceosLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="h-6 w-6 animate-spin" style={{ color: "var(--primary-color)" }} />
              </div>
            ) : ceos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Crown className="h-10 w-10" style={{ color: "var(--text-muted)", opacity: 0.3 }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {ceoSearch ? "No CEOs match your search" : "No CEOs created yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                        {["CEO", "CEO ID", "Company", "Status", "Verified", "Actions"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ceos.map((ceo, i) => (
                        <motion.tr key={ceo.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{ borderBottom: "1px solid var(--card-border)" }}
                          className="transition-colors hover:bg-[var(--bg-subtle)]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                                {ceo.firstName[0]}{ceo.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={{ color: "var(--text-color)" }}>{ceo.firstName} {ceo.lastName}</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ceo.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-lg px-2 py-1 text-xs font-mono"
                              style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}>
                              {ceo.ceoId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm" style={{ color: "var(--text-color)" }}>{ceo.companyName || "—"}</p>
                            {ceo.companyCode && <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{ceo.companyCode}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                              style={{
                                backgroundColor: ceo.isActive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                color: ceo.isActive ? "#4ade80" : "#f87171",
                              }}>
                              {ceo.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {ceo.isVerified
                              ? <CheckCircle className="h-4 w-4 text-green-400" />
                              : <AlertCircle className="h-4 w-4 text-amber-400" />}
                          </td>
                          <td className="px-4 py-3">
                            {deleteConfirm === ceo.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDeleteCeo(ceo.id)}
                                  className="rounded-lg px-2 py-1 text-xs font-medium text-white"
                                  style={{ background: "#ef4444", border: "none", cursor: "pointer" }}>Confirm</button>
                                <button onClick={() => setDeleteConfirm(null)}
                                  className="rounded-lg px-2 py-1 text-xs"
                                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: "pointer", color: "var(--text-muted)" }}>Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(ceo.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg"
                                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", color: "#f87171" }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--card-border)" }}>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Page {ceoPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCeoPage(p => Math.max(1, p - 1))} disabled={ceoPage === 1}
                        className="flex h-7 w-7 items-center justify-center rounded-lg disabled:opacity-40"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: ceoPage === 1 ? "not-allowed" : "pointer", color: "var(--text-muted)" }}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setCeoPage(p => Math.min(totalPages, p + 1))} disabled={ceoPage === totalPages}
                        className="flex h-7 w-7 items-center justify-center rounded-lg disabled:opacity-40"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--card-border)", cursor: ceoPage === totalPages ? "not-allowed" : "pointer", color: "var(--text-muted)" }}>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
