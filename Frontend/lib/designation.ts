/**
 * Mirrors `enum Designation` in Backend/prisma/schema.prisma — update both when the enum changes.
 */
export const DESIGNATION_OPTIONS = [
  { value: "INTERN", label: "Intern", roleCategory: "employee" as const },
  {
    value: "SOFTWARE_ENGINEER",
    label: "Software Engineer",
    roleCategory: "employee" as const,
  },
  {
    value: "SENIOR_ENGINEER",
    label: "Senior Engineer",
    roleCategory: "employee" as const,
  },
  { value: "TECH_LEAD", label: "Tech Lead", roleCategory: "manager" as const },
  { value: "MANAGER", label: "Manager", roleCategory: "manager" as const },
  { value: "HR", label: "HR", roleCategory: "manager" as const },
  { value: "DIRECTOR", label: "Director", roleCategory: "manager" as const },
] as const;

export type DesignationValue = (typeof DESIGNATION_OPTIONS)[number]["value"];

export const DESIGNATION_VALUES: DesignationValue[] = DESIGNATION_OPTIONS.map(
  (o) => o.value
);

/** Dropdown line: e.g. "Intern → Employee" (matches prior UX). */
export function formatDesignationOption(
  option: (typeof DESIGNATION_OPTIONS)[number]
): string {
  const role =
    option.roleCategory === "employee" ? "Employee" : "Manager";
  return `${option.label} → ${role}`;
}

/** Badge / preview text for assigned role from designation. */
export function designationRolePreviewLabel(designation: string): string {
  const opt = DESIGNATION_OPTIONS.find((o) => o.value === designation);
  if (!opt) return "—";
  return opt.roleCategory === "employee" ? "Employee" : "Manager";
}

export function isDesignationValue(v: string): v is DesignationValue {
  return DESIGNATION_VALUES.includes(v as DesignationValue);
}
