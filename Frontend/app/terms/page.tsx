import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { FileText, Scale, AlertTriangle, Users, Shield, Clock } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="These terms govern your use of PRIMA HR Management System. Please read them carefully before using our services."
      icon={<FileText size={28} />}
    >
      <LegalSection icon={<Scale size={18} />} title="Acceptance of Terms">
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          By accessing and using PRIMA HR Management System, you accept and agree to be bound by the terms and provisions of this agreement.
        </p>
        <div
          className="rounded-xl p-4 text-sm font-medium"
          style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)', border: '1px solid var(--PRIMAry-subtle)' }}
        >
          If you do not agree to abide by the above, please do not use this service.
        </div>
      </LegalSection>

      <LegalSection icon={<Users size={18} />} title="Service Description">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Core Features</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Employee management and onboarding</li>
              <li>Attendance tracking and time management</li>
              <li>Leave management and approval workflows</li>
              <li>Project and task management</li>
              <li>Performance evaluation and reviews</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Additional Services</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Role-based access control</li>
              <li>Multi-tenant organization support</li>
              <li>Real-time notifications</li>
              <li>Calendar and event management</li>
              <li>API integrations</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<AlertTriangle size={18} />} title="User Responsibilities">
        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Account Security</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Maintain the confidentiality of your login credentials</li>
              <li>Use strong passwords and enable two-factor authentication</li>
              <li>Immediately notify us of any unauthorized access</li>
            </ul>
          </div>
          <div className="theme-divider" />
          <div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Prohibited Activities</h3>
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
            >
              <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li>Uploading malicious software or harmful content</li>
                <li>Attempting to reverse engineer or hack the system</li>
                <li>Sharing false or misleading information</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<Shield size={18} />} title="Data and Privacy">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Your Data Rights</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>You retain ownership of your data</li>
              <li>We process data only as necessary</li>
              <li>You can export your data at any time</li>
              <li>Data deletion requests are honored promptly</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Our Commitments</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Industry-standard security measures</li>
              <li>Regular security audits and updates</li>
              <li>Transparent privacy practices</li>
              <li>Compliance with data protection laws</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<Clock size={18} />} title="Service Availability">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { value: "99.9%", label: "Uptime Target", desc: "We strive to maintain 99.9% service availability." },
            { value: "⏰", label: "Maintenance", desc: "Scheduled maintenance with advance notice." },
            { value: "24/7", label: "Support", desc: "24/7 technical support for critical issues." },
          ].map(({ value, label, desc }) => (
            <div key={label}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--PRIMAry-color)' }}>{value}</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>{label}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
