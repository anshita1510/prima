"use client";

interface FeatureProps { title: string; desc: string; }

export default function MobileAppSection() {
  return (
    <section className="px-6 py-24"
      style={{
        backgroundColor: 'var(--bg-color)',
        borderTop: '1px solid var(--card-border)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.04) 0%, transparent 70%)',
      }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-4xl font-bold" style={{ color: 'var(--text-color)' }}>
            One HR app, embraced by modern teams
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'var(--text-muted)' }}>
            Everything employees and managers need, right from their mobile phone.
          </p>
          <div className="flex justify-center">
            <img
              src="https://hipparillo.com/wp-content/uploads/2023/12/Group-21.png"
              alt="Mobile app preview"
              className="w-[288px] drop-shadow-2xl sm:w-[320px] lg:w-[360px]"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          <Feature title="Simplified leave & attendance" desc="Clock in or apply leave from anywhere." />
          <Feature title="Tax & Expense in 2 clicks" desc="Manage taxes and expenses effortlessly." />
          <Feature title="Culture of recognition" desc="Encourage appreciation across teams." />
          <Feature title="Approvals in one place" desc="Approve requests from a single screen." />
          <Feature title="Personalized experience" desc="Employees see what matters most." />
          <Feature title="Faster issue resolution" desc="Built-in helpdesk for quick support." />
        </div>
      </div>
    </section>
  );
}

function Feature({ title, desc }: FeatureProps) {
  return (
    <div className="rounded-xl p-6 transition-all duration-200 hover:shadow-md"
      style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
      <h4 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-color)' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}
