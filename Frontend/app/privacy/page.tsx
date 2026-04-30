import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { Shield, Lock, Eye, Database, Users, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Your privacy is important to us. This policy explains how PRIMA collects, uses, and protects your personal information."
      icon={<Shield size={28} />}
    >
      <LegalSection icon={<Database size={18} />} title="Information We Collect">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Personal Information</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Account details: name, email, phone, job title, department</li>
              <li>Authentication data: login credentials, OAuth tokens, session info</li>
              <li>Profile data: employee ID, designation, reporting manager</li>
            </ul>
          </div>
          <div className="theme-divider" />
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Operational Data</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Attendance records: check-in/out times, location, work hours</li>
              <li>Leave management: applications, approvals, balances</li>
              <li>Project data: task assignments, time tracking</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<Users size={18} />} title="How We Use Your Information">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Core HR Functions</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Employee onboarding and management</li>
              <li>Attendance and time tracking</li>
              <li>Leave management and approvals</li>
              <li>Payroll processing and reporting</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>System Operations</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>User authentication and authorization</li>
              <li>Security and fraud prevention</li>
              <li>Technical support and troubleshooting</li>
              <li>Compliance and audit requirements</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<Lock size={18} />} title="Data Protection & Security">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Lock, label: "Encryption", desc: "AES-256 encryption for data at rest and in transit." },
            { icon: Shield, label: "Access Control", desc: "Role-based access ensures only authorized personnel access sensitive data." },
            { icon: Database, label: "Backup & Recovery", desc: "Regular backups and disaster recovery protect against data loss." },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label}>
              <div className="icon-box w-10 h-10 mx-auto mb-3"><Icon size={18} /></div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>{label}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<Eye size={18} />} title="Your Privacy Rights">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Access", desc: "Request a copy of your personal data" },
            { label: "Correction", desc: "Update or correct inaccurate information" },
            { label: "Deletion", desc: "Request deletion of your data (subject to legal requirements)" },
            { label: "Portability", desc: "Export your data in a machine-readable format" },
            { label: "Restriction", desc: "Limit how we process your data" },
            { label: "Objection", desc: "Object to certain types of data processing" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--PRIMAry-color)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{label}:</span> {desc}
              </span>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<Mail size={18} />} title="Contact Us">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Privacy Officer</h3>
            <div className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <p>Email: privacy@PRIMA-hr.com</p>
              <p>Phone: +91 9592003120</p>
              <p>Address: Seasia Infotech, Mohali, Punjab</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Response Time</h3>
            <div className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <p>General Inquiries: 2–3 business days</p>
              <p>Data Requests: 30 days maximum</p>
              <p>Security Issues: 24 hours</p>
            </div>
          </div>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
