"use client";
import React, { useState } from "react";

const CARDS = {
  payroll: {
    title: "Payroll",
    subtitle: "We redefined Payroll industry back in 2016. 6 simple steps. No manual tasks. All on cloud.",
    accent: '#3b82f6',
    content: {
      heading: "Payroll & Expense Management",
      description: "Automate salaries, deductions, reimbursements, payslips and stay 100% compliant with statutory rules.",
      points: ["Automated salary processing", "Tax & compliance ready", "Expense reimbursements", "Payslip generation"],
    },
  },
  modernHR: {
    title: "Modern HR",
    subtitle: "All your people information in one place to create a connected digital workplace.",
    accent: '#22c55e',
    content: {
      heading: "Modern HR Management",
      description: "Centralize employee data, documents, roles and lifecycle in a single system.",
      points: ["Employee profiles", "Document management", "Org structure", "HR workflows"],
    },
  },
  performance: {
    title: "Performance",
    subtitle: "Build a high-performing culture driven by contextual feedback and goal alignment.",
    accent: '#ec4899',
    content: {
      heading: "Performance & Culture",
      description: "Drive growth with goals, reviews and continuous feedback.",
      points: ["OKRs & goals", "Performance reviews", "Continuous feedback", "Culture building"],
    },
  },
};

export default function Section2() {
  const [active, setActive] = useState<keyof typeof CARDS>("payroll");
  const current = CARDS[active];

  return (
    <section className="py-20 px-6"
      style={{
        backgroundColor: 'var(--bg-color)',
        borderBottom: '1px solid var(--card-border)',
        backgroundImage: 'radial-gradient(ellipse at 80% 30%, rgba(59,130,246,0.05) 0%, transparent 60%)',
      }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
            
            Performance-driven HR platform
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Everything you need to build, manage and grow a modern workforce.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {(Object.keys(CARDS) as Array<keyof typeof CARDS>).map((key) => {
            const card = CARDS[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="text-left p-8 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: `1px solid ${isActive ? card.accent : 'var(--card-border)'}`,
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full mb-4 text-xl"
                  style={{ backgroundColor: `${card.accent}18`, color: card.accent }}>
                  ◎
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{card.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{card.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Dynamic content */}
        <div className="rounded-2xl shadow-lg p-10 max-w-4xl mx-auto"
          style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
            {current.content.heading}
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>{current.content.description}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {current.content.points.map((point, i) => (
              <li key={i} className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
