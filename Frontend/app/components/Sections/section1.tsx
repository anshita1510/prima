"use client";
import React, { useState } from "react";
import { Users, DollarSign, Target, UserPlus } from "lucide-react";

const FEATURES = {
  people: {
    title: "People Data & Analytics",
    description: "Connect all your people data in one place and gain powerful insights for better decisions.",
    icon: Users,
    preview: { name: "People Analytics", role: "Insights Dashboard", about: "Visualize employee data, trends, and reports to make smarter HR decisions." },
  },
  payroll: {
    title: "Payroll & Expense Tracking",
    description: "Automate payroll and expenses with complete accuracy and compliance.",
    icon: DollarSign,
    preview: { name: "Payroll System", role: "Salary & Expenses", about: "Manage salaries, deductions, reimbursements, and payslips with full compliance." },
  },
  performance: {
    title: "Performance & Culture",
    description: "Set goals, track performance, and build a strong company culture.",
    icon: Target,
    preview: { name: "Performance", role: "Goals & Reviews", about: "Track OKRs, reviews, and continuous feedback to improve team performance." },
  },
  hiring: {
    title: "Hiring & Onboarding",
    description: "Hire faster and onboard employees with personalized workflows.",
    icon: UserPlus,
    preview: { name: "Hiring", role: "Recruitment", about: "Streamline hiring, offers, and onboarding journeys for new employees." },
  },
};

export default function OurWorkSection() {
  const [active, setActive] = useState<keyof typeof FEATURES>("people");
  const current = FEATURES[active];

  return (
    <section className="py-16 px-6"
      style={{
        backgroundColor: 'var(--bg-color)',
        borderBottom: '1px solid var(--card-border)',
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.05) 0%, transparent 60%)',
      }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
            Smart HR to outsmart the changing world
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            The world has changed and it will keep changing. Our HR platform helps organizations
            adapt, evolve, and scale by working smarter and making data-driven decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — feature list */}
          <div className="space-y-4">
            {(Object.keys(FEATURES) as Array<keyof typeof FEATURES>).map((key) => {
              const feature = FEATURES[key];
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className="w-full text-left p-6 rounded-2xl transition-all duration-200 shadow-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: `1px solid ${isActive ? 'var(--PRIMAry-color)' : 'var(--card-border)'}`,
                    boxShadow: isActive ? '0 0 0 1px var(--PRIMAry-color)' : undefined,
                  }}
                >
                  <h3 className="font-semibold text-lg mb-2"
                    style={{ color: isActive ? 'var(--PRIMAry-color)' : 'var(--text-color)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)' }}>{feature.description}</p>
                </button>
              );
            })}
          </div>

          {/* Right — preview card */}
          <div className="rounded-2xl shadow-lg p-6"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--PRIMAry-subtle)' }}>
                {React.createElement(current.icon, { size: 28, style: { color: 'var(--PRIMAry-color)' } })}
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--text-color)' }}>{current.preview.name}</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{current.preview.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Module', value: current.title },
                { label: 'Status', value: 'Active' },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
              <h5 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Overview</h5>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{current.preview.about}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
