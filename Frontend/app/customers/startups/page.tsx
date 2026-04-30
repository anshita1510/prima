import PageLayout from "../../components/PageLayout";
import { Rocket, DollarSign, Users, Zap } from "lucide-react";

const features = [
  { icon: DollarSign, title: "Affordable Pricing", description: "Start from just $29/month for up to 25 employees.", color: "#059669" },
  { icon: Zap, title: "Quick Setup", description: "Get started in under 10 minutes with guided setup.", color: "#2563eb" },
  { icon: Users, title: "Scale Ready", description: "Grow from 5 to 500 employees on the same platform.", color: "#6d28d9" },
  { icon: Rocket, title: "Startup Focused", description: "Features designed specifically for fast-growing teams.", color: "#d97706" },
];

export default function StartupsPage() {
  return (
    <PageLayout title="For Startups">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">Built for Startups</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Focus on building,<br />
          <span className="gradient-text">we'll handle HR</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Scale your team efficiently with affordable HR tools designed for growing startups.
          Focus on building your product while we handle your HR operations.
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
          <h2 className="text-3xl font-bold mb-3">Join 1000+ Growing Startups</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            From seed stage to Series A, startups trust PRIMA to manage their growing teams.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
          {[
            { value: "1000+", label: "Startups Using PRIMA" },
            { value: "50%", label: "Time Saved on HR Tasks" },
            { value: "30 Days", label: "Free Trial" },
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
          Ready to Scale Your Startup?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join thousands of startups using PRIMA to build and manage their teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">Talk to Startup Expert</button>
        </div>
      </div>
    </PageLayout>
  );
}
