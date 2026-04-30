import PageLayout from "../../components/PageLayout";
import { Building2, TrendingUp, Shield, Users } from "lucide-react";

const features = [
  { icon: TrendingUp, title: "Advanced Analytics", description: "Deep insights into workforce performance and trends.", color: "#2563eb" },
  { icon: Shield, title: "Compliance Ready", description: "Built-in compliance features for labor regulations.", color: "#059669" },
  { icon: Users, title: "Multi-Department", description: "Manage complex organizational structures with ease.", color: "#6d28d9" },
  { icon: Building2, title: "Multi-Location", description: "Support for multiple offices and locations.", color: "#d97706" },
];

export default function SMEsPage() {
  return (
    <PageLayout title="For SMEs">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">For Growing Businesses</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Professional HR tools<br />
          <span className="gradient-text">that scale with you</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Streamline HR operations for your growing business. Professional HR tools
          that scale with your team from 25 to 500 employees.
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
          <h2 className="text-3xl font-bold mb-3">Trusted by 5000+ SMEs</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            Small and medium enterprises choose PRIMA for reliable, scalable HR management.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
          {[
            { value: "5000+", label: "SMEs Trust PRIMA" },
            { value: "60%", label: "Reduction in HR Costs" },
            { value: "99.9%", label: "System Reliability" },
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
          Ready to Optimize Your HR Operations?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join thousands of SMEs using PRIMA to streamline their HR processes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">Schedule Demo</button>
        </div>
      </div>
    </PageLayout>
  );
}
