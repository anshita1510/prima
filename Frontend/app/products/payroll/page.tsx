import PageLayout from "../../components/PageLayout";
import { Calculator, Clock, FileText, Shield, TrendingUp, DollarSign } from "lucide-react";

const features = [
  { icon: Calculator, title: "Automated Calculations", description: "Accurate salary calculations with tax deductions, benefits, and overtime automatically computed." },
  { icon: Clock, title: "Time Integration", description: "Seamlessly integrate with attendance data for precise payroll processing based on actual hours worked." },
  { icon: FileText, title: "Payslip Generation", description: "Generate detailed payslips with breakdown of earnings, deductions, and net pay for each employee." },
  { icon: Shield, title: "Tax Compliance", description: "Stay compliant with local tax regulations and automatically generate required tax reports." },
  { icon: TrendingUp, title: "Payroll Analytics", description: "Comprehensive reporting and analytics to track payroll costs and trends over time." },
  { icon: DollarSign, title: "Multi-Currency Support", description: "Handle payroll for global teams with support for multiple currencies and exchange rates." },
];

const steps = [
  "Import attendance and time data",
  "Calculate salaries and deductions",
  "Review and approve payroll",
  "Generate payslips and reports",
  "Process payments and notifications",
];

const benefits = [
  "Reduce payroll processing time by 75%",
  "Eliminate calculation errors with automation",
  "Ensure 100% tax compliance",
  "Provide employee self-service portal",
  "Generate comprehensive payroll reports",
  "Support for complex pay structures",
];

export default function PayrollPage() {
  return (
    <PageLayout title="Payroll">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">Payroll Management</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Payroll that runs itself,<br />
          <span className="gradient-text">accurately every time</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Simplify payroll processing with our automated system. Handle complex calculations,
          ensure tax compliance, and provide full transparency to your employees.
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

      {/* Benefits + Process */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        <div className="premium-card p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>Key Benefits</h2>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--PRIMAry-color)' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="premium-card p-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>Payroll Process</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'var(--gradient-PRIMAry)', color: '#fff' }}
                >
                  {i + 1}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="cta-section mb-20">
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold mb-3">Payroll by the Numbers</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            See how PRIMA Payroll is transforming payroll processing worldwide.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { value: "75%", label: "Time Saved" },
            { value: "100%", label: "Accuracy Rate" },
            { value: "50+", label: "Countries Supported" },
            { value: "24/7", label: "Support Available" },
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
          Ready to Streamline Your Payroll?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join thousands of companies using PRIMA Payroll to automate their payroll processing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">View Demo</button>
        </div>
      </div>
    </PageLayout>
  );
}
