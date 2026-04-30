"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Send,
  RotateCcw,
  ChevronDown,
  RefreshCw,
  CheckCircle,
  MailPlus,
  KeyRound,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DESIGNATION_OPTIONS,
  designationRolePreviewLabel,
  formatDesignationOption,
} from "@/lib/designation";
import { userService, CreateUserData, Company } from "../services/user.service";

interface CreateUserFormProps {
  currentUserRole: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";
  currentUserCompany?: Company;
  /** `console` = enterprise split-panel layout (uppercase labels, designation cards). */
  layoutVariant?: "default" | "console";
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface CreateUserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  designation: string;
  companyName?: string;
  companyId?: string | number;
}

function FormSection({
  title,
  children,
  isFirst,
}: {
  title: string;
  children: React.ReactNode;
  isFirst?: boolean;
}) {
  return (
    <section className={cn(!isFirst && "create-user-section--divided")}>
      <h3 className="create-user-section-head">{title}</h3>
      <div className="create-user-fields-stack">{children}</div>
    </section>
  );
}

export default function CreateUserForm({
  currentUserRole,
  currentUserCompany,
  layoutVariant = "default",
  onSuccess,
  onError,
}: CreateUserFormProps) {
  const [sendInviteUi, setSendInviteUi] = useState(true);
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    designation: "",
    companyName: currentUserCompany?.name || "",
    companyId: currentUserCompany?.id || "",
  });

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  useEffect(() => {
    if (currentUserRole === "SUPER_ADMIN") {
      loadCompanies();
    }
  }, [currentUserRole]);

  useEffect(() => {
    const handleFocus = () => {
      if (currentUserRole === "SUPER_ADMIN") {
        loadCompanies();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [currentUserRole]);

  const loadCompanies = async () => {
    if (currentUserRole !== "SUPER_ADMIN") return;
    setLoadingCompanies(true);
    try {
      const response = await userService.getCompanies();
      setCompanies(response.companies);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Failed to load companies:", error);
      onError?.("Failed to load companies: " + (err.message || "Unknown"));
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanySelect = (company: Company) => {
    setFormData((prev) => ({
      ...prev,
      companyId: company.id,
      companyName: company.name,
    }));
    setShowCompanyDropdown(false);
  };

  const validateForm = (): boolean => {
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.designation
    ) {
      onError?.("Please fill in all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      onError?.("Please enter a valid email address");
      return false;
    }

    if (currentUserRole === "SUPER_ADMIN" && !formData.companyId) {
      onError?.("Please select a company");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const userData: CreateUserData = {
        email: formData.email.toLowerCase().trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation,
        role: "EMPLOYEE",
      };

      if (currentUserRole === "SUPER_ADMIN") {
        userData.companyId = formData.companyId;
        userData.companyName = formData.companyName;
      }

      const response = await userService.createUser(userData);

      const msg =
        response?.message ||
        `User Created Successfully! An invitation email has been sent to ${formData.email}.`;

      onSuccess?.(msg);
      resetForm();
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error("Form submission error:", err);
      onError?.(e.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      designation: "",
      companyName: currentUserCompany?.name || "",
      companyId: currentUserCompany?.id || "",
    });
  };

  const rolePreview = designationRolePreviewLabel(formData.designation);

  const infoSteps = [
    { icon: MailPlus, text: "Invite email sent" },
    { icon: KeyRound, text: "Temporary password generated" },
    { icon: Building2, text: "User added to org" },
    { icon: Shield, text: "Role assigned automatically" },
  ];

  if (layoutVariant === "console") {
    return (
      <div className="create-user-card-surface um-create-panel flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="um-create-panel-head shrink-0">
          <h2>Create user</h2>
          <p>
            {currentUserRole === "SUPER_ADMIN"
              ? "Add a teammate to any company. They’ll receive credentials by email."
              : `Invite someone to ${currentUserCompany?.name || "your organization"}.`}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="um-field-stack min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="create-user-name-grid">
              <div>
                <label htmlFor="um-firstName" className="um-field-label">
                  First name
                </label>
                <input
                  id="um-firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Jane"
                  className="create-user-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="um-lastName" className="um-field-label">
                  Last name
                </label>
                <input
                  id="um-lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="create-user-input"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="um-email" className="um-field-label">
                Email address
              </label>
              <input
                id="um-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@company.com"
                className="create-user-input"
                required
              />
            </div>

            <div>
              <label htmlFor="um-phone" className="um-field-label">
                Phone number
              </label>
              <input
                id="um-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 555 000 0000"
                className="create-user-input"
                required
              />
            </div>

            {currentUserRole === "SUPER_ADMIN" && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="um-field-label mb-0">Company</span>
                  <button
                    type="button"
                    onClick={loadCompanies}
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ color: "var(--PRIMAry-color)" }}
                    disabled={loadingCompanies}
                  >
                    <RefreshCw
                      className={cn("h-3.5 w-3.5", loadingCompanies && "animate-spin")}
                    />
                    Refresh
                  </button>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    className="create-user-input flex items-center justify-between text-left"
                    disabled={loadingCompanies}
                  >
                    <span
                      style={{
                        color: formData.companyName
                          ? "var(--text-color)"
                          : "var(--text-muted)",
                      }}
                    >
                      {loadingCompanies
                        ? "Loading companies…"
                        : formData.companyName || "Select a company"}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>
                  {showCompanyDropdown && (
                    <div className="create-user-dropdown absolute z-50 mt-2 max-h-60 w-full overflow-y-auto">
                      {loadingCompanies ? (
                        <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                          Loading companies…
                        </div>
                      ) : companies.length === 0 ? (
                        <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                          No companies found.
                        </div>
                      ) : (
                        companies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => handleCompanySelect(company)}
                            className="create-user-dropdown-item w-full px-4 py-3 text-left text-sm transition-colors"
                          >
                            <div className="font-medium" style={{ color: "var(--text-color)" }}>
                              {company.name}
                            </div>
                            <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              {company.code} • {company.userCount || 0} users
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {!!formData.companyId && (
                  <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    Org code:{" "}
                    <span className="font-mono" style={{ color: "var(--text-color)" }}>
                      {companies.find((c) => String(c.id) === String(formData.companyId))?.code ?? "—"}
                    </span>
                  </p>
                )}
              </div>
            )}

            {currentUserRole !== "SUPER_ADMIN" && currentUserCompany && (
              <div>
                <span className="um-field-label">Company</span>
                <div className="create-user-muted-surface px-4 py-3">
                  <p className="text-sm font-medium" style={{ color: "var(--text-color)" }}>
                    {currentUserCompany.name}
                  </p>
                  <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {currentUserCompany.code}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="um-designation" className="um-field-label">
                Designation
              </label>
              <select
                id="um-designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="create-user-input cursor-pointer"
                required
              >
                <option value="">Select designation</option>
                {DESIGNATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {formatDesignationOption(d)}
                  </option>
                ))}
              </select>
              {formData.designation ? (
                <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  Role preview:{" "}
                  <span className="font-semibold" style={{ color: "var(--text-color)" }}>
                    {rolePreview}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="um-console-footer">
            <div className="um-toggle-row !pt-0">
              <input
                id="um-send-invite"
                type="checkbox"
                checked={sendInviteUi}
                onChange={(e) => setSendInviteUi(e.target.checked)}
              />
              <label htmlFor="um-send-invite" className="um-toggle-copy cursor-pointer">
                <strong>Send invitation email</strong>
                <span>
                  {sendInviteUi
                    ? "They’ll receive sign-in instructions and a temporary password."
                    : "You can re-enable before submitting; invitations are recommended for new accounts."}
                </span>
              </label>
            </div>

            <div className="um-panel-actions">
              <button type="button" className="um-btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" disabled={loading} className="um-btn-submit">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating…
                  </>
                ) : (
                  "Create user"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  const labelClass =
    "flex items-center gap-2 text-sm font-medium";
  const labelStyle = { color: "var(--text-color)" } as const;
  const iconStyle = { color: "var(--PRIMAry-color)" } as const;

  return (
    <div className="create-user-page-content">
      <div className="create-user-page-intro">
        <div className="create-user-icon-tile" aria-hidden>
          <User className="h-6 w-6" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--text-color)" }}
          >
            Create New User
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {currentUserRole === "SUPER_ADMIN"
              ? "Add a new user to any company in the system."
              : `Add a new user to ${currentUserCompany?.name || "your company"}.`}
          </p>
        </div>
      </div>

      <div className="create-user-shell">
        <div className="create-user-card-surface create-user-form-column w-full min-w-0">
          <form onSubmit={handleSubmit} className="create-user-form-sections min-w-0">
            <FormSection title="Basic information" isFirst>
              <div className="create-user-fields-stack">
                <div className="space-y-2">
                  <label htmlFor="email" className={labelClass} style={labelStyle}>
                    <Mail className="h-4 w-4 shrink-0" style={iconStyle} />
                    Email address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="create-user-input"
                    required
                  />
                </div>

                <div className="create-user-name-grid">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className={labelClass} style={labelStyle}>
                      <User className="h-4 w-4 shrink-0" style={iconStyle} />
                      First name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="create-user-input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className={labelClass} style={labelStyle}>
                      <User className="h-4 w-4 shrink-0" style={iconStyle} />
                      Last name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="create-user-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className={labelClass} style={labelStyle}>
                    <Phone className="h-4 w-4 shrink-0" style={iconStyle} />
                    Phone number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555 000 0000"
                    className="create-user-input"
                    required
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Organization details">
              {currentUserRole === "SUPER_ADMIN" && (
                <div className="create-user-fields-stack">
                  <div className="space-y-2">
                    <label className={labelClass} style={labelStyle}>
                      <Building className="h-4 w-4 shrink-0" style={iconStyle} />
                      Company *
                      <button
                        type="button"
                        onClick={loadCompanies}
                        className="ml-auto inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80"
                        style={{ color: "var(--PRIMAry-color)" }}
                        disabled={loadingCompanies}
                      >
                        <RefreshCw
                          className={cn(
                            "h-3.5 w-3.5",
                            loadingCompanies && "animate-spin"
                          )}
                        />
                        Refresh
                      </button>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                        className="create-user-input flex items-center justify-between text-left"
                        disabled={loadingCompanies}
                      >
                        <span
                          style={{
                            color: formData.companyName
                              ? "var(--text-color)"
                              : "var(--text-muted)",
                          }}
                        >
                          {loadingCompanies
                            ? "Loading companies..."
                            : formData.companyName || "Select a company"}
                        </span>
                        <ChevronDown
                          className="h-4 w-4 shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </button>

                      {showCompanyDropdown && (
                        <div className="create-user-dropdown absolute z-50 mt-2 max-h-60 w-full overflow-y-auto">
                          {loadingCompanies ? (
                            <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                              Loading companies...
                            </div>
                          ) : companies.length === 0 ? (
                            <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                              No companies found. Create a company first in the
                              &quot;Manage Companies&quot; tab.
                            </div>
                          ) : (
                            companies.map((company) => (
                              <button
                                key={company.id}
                                type="button"
                                onClick={() => handleCompanySelect(company)}
                                className="create-user-dropdown-item w-full px-4 py-3 text-left text-sm transition-colors"
                              >
                                <div className="font-medium" style={{ color: "var(--text-color)" }}>
                                  {company.name}
                                </div>
                                <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                                  {company.code} • {company.userCount || 0} users
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {companies.length === 0 && !loadingCompanies && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      No companies available. Go to &quot;Manage Companies&quot; to create one first.
                    </p>
                  )}
                  {!!formData.companyId && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium" style={labelStyle}>
                        Organization code
                      </span>
                      <div className="create-user-readonly">
                        {companies.find(
                          (c) => String(c.id) === String(formData.companyId)
                        )?.code ?? "—"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentUserRole !== "SUPER_ADMIN" && currentUserCompany && (
                <div className="create-user-fields-stack">
                  <span className={labelClass} style={labelStyle}>
                    <Building className="h-4 w-4 shrink-0" style={iconStyle} />
                    Company
                  </span>
                  <div className="create-user-muted-surface p-4">
                    <p className="font-medium" style={{ color: "var(--text-color)" }}>
                      {currentUserCompany.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium" style={labelStyle}>
                      Organization code
                    </span>
                    <div className="create-user-readonly">{currentUserCompany.code}</div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Users will be added to your company automatically.
                    </p>
                  </div>
                </div>
              )}
            </FormSection>

            <FormSection title="Employment details">
              <div className="create-user-fields-stack">
                <div className="space-y-2">
                  <label htmlFor="designation" className={labelClass} style={labelStyle}>
                    <Briefcase className="h-4 w-4 shrink-0" style={iconStyle} />
                    Designation *
                  </label>
                  <select
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="create-user-input cursor-pointer"
                    required
                  >
                    <option value="">Select designation</option>
                    {DESIGNATION_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {formatDesignationOption(d)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Role preview (from designation):
                  </span>
                  <span className="create-user-badge">{rolePreview}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Role is automatically assigned based on designation.
                </p>
              </div>
            </FormSection>

            <FormSection title="Actions">
              <div className="create-user-actions-row pt-1">
                <button type="submit" disabled={loading} className="create-user-btn-primary">
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating user…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Create User &amp; Send Invitation
                    </>
                  )}
                </button>
                <button type="button" onClick={resetForm} className="create-user-btn-secondary">
                  <RotateCcw className="h-4 w-4" />
                  Reset Form
                </button>
              </div>
            </FormSection>
          </form>
        </div>

        <aside
          className="create-user-sidebar-column create-user-card-surface create-user-sidebar-aside order-last w-full shrink-0 lg:order-none"
        >
          <h3
            className="flex items-center gap-2 text-base font-semibold leading-snug"
            style={{ color: "var(--text-color)" }}
          >
            <CheckCircle className="h-5 w-5 shrink-0" style={iconStyle} />
            What happens next?
          </h3>
          <ul className="create-user-sidebar-steps">
            {infoSteps.map(({ icon: Icon, text }) => (
              <li key={text} className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <span className="create-user-info-icon mt-0.5">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
