import PageLayout from "../../components/PageLayout";
import { Building, Globe, Shield, Zap } from "lucide-react";

const features = [
  { icon: Globe, title: "Global Scale", description: "Support for unlimited employees across multiple countries and regions.", color: "#6d28d9" },
  { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliance, SSO, and advanced security features built in.", color: "#dc2626" },
  { icon: Zap, title: "Custom Workflows", description: "Tailored workflows to match your unique business processes.", color: "#2563eb" },
  { icon: Building, title: "Dedicated Support", description: "24/7 dedicated support with SLA guarantees and a named CSM.", color: "#059669" },
];

export default function EnterprisesPage() {
  return (
    <PageLayout title="For Enterprises">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">Enterprise Solutions</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          HR at enterprise scale,<br />
          <span className="gradient-text">without the complexity</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Comprehensive HR platform for large organizations. Advanced security, custom workflows,
          and dedicated support for enterprise-scale operations.
        </p>
        <div className="accent-line" />
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {features.map(({ icon: Icon, title, description, color }) => (
          <div key={title} className="premium-card p-6 text-center">
            <div
              className="icon-box w-12 h-12 mx-auto mb-4"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <Icon size={22} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="cta-section mb-20">
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold mb-3">Trusted by Fortune 500 Companies</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            Leading enterprises worldwide rely on PRIMA for mission-critical HR operations.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
          {[
            { value: "500+", label: "Enterprise Customers" },
            { value: "10M+", label: "Employees Managed" },
            { value: "99.99%", label: "Uptime SLA" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-bold mb-2">{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
          Ready for Enterprise-Grade HR?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join Fortune 500 companies using PRIMA for their global HR operations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Contact Sales</button>
          <button className="btn-outline-theme">Request Enterprise Demo</button>
        </div>
      </div>
    </PageLayout>
  );
}
