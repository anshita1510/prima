import PageLayout from "../../components/PageLayout";
import { Users, Calendar, FileText, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  { icon: Users, title: "Employee Management", description: "Centralized employee database with comprehensive profiles, organizational charts, and role management." },
  { icon: Calendar, title: "Attendance Tracking", description: "Real-time attendance monitoring with GPS tracking, shift management, and automated reporting." },
  { icon: FileText, title: "Leave Management", description: "Streamlined leave requests, approvals, and balance tracking with customizable policies." },
  { icon: BarChart3, title: "Performance Reviews", description: "360-degree feedback system with goal tracking and performance analytics." },
  { icon: Shield, title: "Compliance Management", description: "Stay compliant with labor laws and regulations with automated compliance tracking." },
  { icon: Zap, title: "Workflow Automation", description: "Automate repetitive HR tasks and create custom workflows for your organization." },
];

const stats = [
  { value: "50%", label: "Reduction in HR Admin Time" },
  { value: "99.9%", label: "System Uptime" },
  { value: "24/7", label: "Customer Support" },
];

export default function HRMSPage() {
  return (
    <PageLayout title="HRMS">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">Human Resource Management</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          HR that works as hard<br />
          <span className="gradient-text">as your team does</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Streamline your HR operations with our comprehensive HRMS. Manage employees, track attendance,
          handle leave requests, and more — all in one platform.
        </p>
        <div className="accent-line" />
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="premium-card p-8">
            <div className="icon-box w-12 h-12 mb-5">
              <Icon size={22} />
            </div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-color)' }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="cta-section mb-20">
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold mb-3">Why Choose PRIMA HRMS?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            Designed to simplify complex HR processes and empower your team.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-5xl font-bold mb-2">{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
          Ready to Transform Your HR Operations?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join thousands of companies already using PRIMA HRMS to streamline their HR processes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">Schedule Demo</button>
        </div>
      </div>
    </PageLayout>
  );
}
