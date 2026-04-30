import PageLayout from "../../components/PageLayout";
import { BarChart3, PieChart, TrendingUp, Users, Clock, Target } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Real-time Dashboards", description: "Interactive dashboards with real-time HR metrics and KPIs for instant workforce insights." },
  { icon: PieChart, title: "Custom Reports", description: "Create custom reports with a drag-and-drop interface to analyze the metrics that matter most." },
  { icon: TrendingUp, title: "Predictive Analytics", description: "AI-powered analytics to predict employee turnover, performance trends, and workforce planning needs." },
  { icon: Users, title: "Employee Insights", description: "Deep dive into employee performance, engagement, and satisfaction metrics with detailed analytics." },
  { icon: Clock, title: "Time & Attendance Analytics", description: "Analyze attendance patterns, overtime trends, and productivity metrics across your organization." },
  { icon: Target, title: "Goal Tracking", description: "Track and analyze goal completion rates, performance metrics, and team productivity over time." },
];

const dashboardStats = [
  { value: "1,247", label: "Total Employees", trend: "↑ 12%", color: "#6d28d9" },
  { value: "94.2%", label: "Attendance Rate", trend: "↑ 2.1%", color: "#059669" },
  { value: "8.5%", label: "Turnover Rate", trend: "↓ 1.2%", color: "#dc2626" },
  { value: "4.7/5", label: "Employee Satisfaction", trend: "↑ 0.3", color: "#d97706" },
];

export default function AnalyticsPage() {
  return (
    <PageLayout title="Analytics">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">HR Analytics & Intelligence</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Turn data into your<br />
          <span className="gradient-text">competitive advantage</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Transform HR data into actionable insights. Make data-driven decisions with powerful analytics,
          custom reports, and predictive intelligence.
        </p>
        <div className="accent-line" />
      </div>

      {/* Features */}
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

      {/* Sample Dashboard */}
      <div className="premium-card p-8 mb-20">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-color)' }}>
          Sample Analytics Dashboard
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map(({ value, label, trend, color }) => (
            <div
              key={label}
              className="rounded-2xl p-6"
              style={{
                background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                border: `1px solid ${color}33`,
              }}
            >
              <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{label}</div>
              <div className="text-xs font-semibold" style={{ color }}>{trend} from last month</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Banner */}
      <div className="cta-section mb-20">
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold mb-3">Why Choose PRIMA Analytics?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            Turn your HR data into your competitive advantage.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center relative z-10">
          {[
            { value: "50+", label: "Pre-built Reports" },
            { value: "Real-time", label: "Data Updates" },
            { value: "AI-Powered", label: "Predictions" },
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
          Ready to Unlock Your HR Data?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Start making data-driven HR decisions with PRIMA Analytics today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">View Sample Reports</button>
        </div>
      </div>
    </PageLayout>
  );
}
