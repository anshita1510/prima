import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Server, Key } from "lucide-react";

export default function SecurityPage() {
  return (
    <LegalLayout
      title="Security"
      subtitle="Your data security is our top priority. Learn about the comprehensive security measures we implement to protect your information."
      icon={<Shield size={28} />}
    >
      <LegalSection icon={<Shield size={18} />} title="Our Security Commitment">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Lock, label: "Encryption", desc: "AES-256 for data at rest and in transit" },
            { icon: Key, label: "Authentication", desc: "MFA and OAuth 2.0" },
            { icon: Eye, label: "Monitoring", desc: "24/7 threat detection" },
            { icon: Server, label: "Infrastructure", desc: "Secure cloud with redundancy" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label}>
              <div className="icon-box w-10 h-10 mx-auto mb-3"><Icon size={18} /></div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>{label}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<Lock size={18} />} title="Data Protection">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Data at Rest</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>AES-256 encryption for database storage</li>
              <li>Encrypted file system and backups</li>
              <li>Hardware security modules (HSM)</li>
              <li>Key rotation every 90 days</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Data in Transit</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>TLS 1.3 for all communications</li>
              <li>Certificate pinning and HSTS</li>
              <li>End-to-end encryption for sensitive data</li>
              <li>Perfect forward secrecy</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<Server size={18} />} title="Infrastructure Security">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Cloud Security", items: ["SOC 2 Type II certified", "ISO 27001 compliant", "Geographic data residency", "Automated security patching", "DDoS protection"] },
            { title: "Network Security", items: ["Web Application Firewall", "Intrusion detection", "Network segmentation", "VPN for administrators", "Rate limiting"] },
            { title: "Application Security", items: ["Secure coding practices", "Regular code reviews", "Vulnerability scanning", "Penetration testing", "Security headers & CSP"] },
          ].map(({ title, items }) => (
            <div key={title}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>{title}</h3>
              <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                {items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<AlertTriangle size={18} />} title="Incident Response">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Response Times</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Mean time to detection: &lt; 15 minutes</li>
              <li>Mean time to response: &lt; 1 hour</li>
              <li>Customer notification: within 24 hours</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Report a Vulnerability</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>Email: security@PRIMA-hr.com</li>
              <li>Responsible disclosure program</li>
              <li>Bug bounty rewards available</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<CheckCircle size={18} />} title="Compliance & Certifications">
        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[
            { label: "SOC 2 Type II", desc: "Security, availability, and confidentiality controls" },
            { label: "ISO 27001", desc: "Information security management system" },
            { label: "GDPR", desc: "General Data Protection Regulation compliance" },
            { label: "CCPA", desc: "California Consumer Privacy Act compliance" },
          ].map(({ label, desc }) => (
            <div key={label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--PRIMAry-color)' }}>{label}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<CheckCircle size={18} />} title="Security Best Practices for Users">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Use strong, unique passwords for your account",
            "Enable multi-factor authentication (MFA)",
            "Log out when using shared computers",
            "Keep your browser and devices updated",
            "Be cautious with public Wi-Fi networks",
            "Report suspicious activities immediately",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-3">
              <CheckCircle size={16} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{tip}</span>
            </div>
          ))}
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
