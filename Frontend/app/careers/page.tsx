import PageLayout from "../components/PageLayout";
import { MapPin, Clock, DollarSign, Users, Heart, Zap, Award, Coffee } from "lucide-react";

const jobs = [
  {
    title: "Senior Frontend Developer", department: "Engineering", location: "Remote / San Francisco",
    type: "Full-time", salary: "$120k – $160k",
    description: "Join our frontend team to build beautiful, responsive user interfaces using React, TypeScript, and modern web technologies.",
    requirements: ["5+ years React experience", "TypeScript proficiency", "UI/UX design sense"],
    posted: "2 days ago",
  },
  {
    title: "Product Manager", department: "Product", location: "Remote / New York",
    type: "Full-time", salary: "$130k – $170k",
    description: "Lead product strategy and roadmap for our core HR management platform, working closely with engineering and design teams.",
    requirements: ["3+ years PM experience", "B2B SaaS background", "Data-driven mindset"],
    posted: "1 week ago",
  },
  {
    title: "Customer Success Manager", department: "Customer Success", location: "Remote / Austin",
    type: "Full-time", salary: "$80k – $110k",
    description: "Help our customers achieve success with PRIMA by providing guidance, training, and ongoing support.",
    requirements: ["2+ years CS experience", "HR domain knowledge", "Excellent communication"],
    posted: "3 days ago",
  },
  {
    title: "DevOps Engineer", department: "Engineering", location: "Remote / Seattle",
    type: "Full-time", salary: "$110k – $150k",
    description: "Build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems to ensure 99.9% uptime.",
    requirements: ["AWS/GCP experience", "Kubernetes knowledge", "Infrastructure as Code"],
    posted: "5 days ago",
  },
];

const benefits = [
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive health, dental, and vision insurance plus wellness stipend" },
  { icon: Coffee, title: "Flexible Work", description: "Remote-first culture with flexible hours and unlimited PTO" },
  { icon: Zap, title: "Growth & Learning", description: "$2,000 annual learning budget and conference attendance" },
  { icon: Award, title: "Equity & Bonuses", description: "Competitive equity package and performance-based bonuses" },
];

export default function CareersPage() {
  return (
    <PageLayout title="Careers">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">We're Hiring</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Build the future of<br />
          <span className="gradient-text">HR technology</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
          Help us build the future of HR technology. We're looking for passionate, talented individuals
          who want to make a real impact on how companies manage their people.
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2"><Users size={14} style={{ color: 'var(--PRIMAry-color)' }} /> 50+ team members</div>
          <div className="flex items-center gap-2"><MapPin size={14} style={{ color: 'var(--PRIMAry-color)' }} /> Remote-first culture</div>
          <div className="flex items-center gap-2"><Award size={14} style={{ color: 'var(--PRIMAry-color)' }} /> Top-rated workplace</div>
        </div>
        <div className="accent-line" />
      </div>

      {/* Benefits */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Why Work at PRIMA?</h2>
          <div className="accent-line" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="premium-card p-6 text-center">
              <div className="icon-box w-12 h-12 mx-auto mb-4">
                <Icon size={22} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Open Positions</h2>
          <div className="accent-line" />
        </div>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.title} className="premium-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-color)' }}>{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Users size={12} /> {job.department}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {job.type}</span>
                    <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{job.posted}</span>
                  <button className="btn-PRIMAry-gradient text-sm" style={{ padding: '8px 20px', borderRadius: '10px' }}>
                    Apply Now
                  </button>
                </div>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req) => (
                  <span
                    key={req}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--PRIMAry-subtle)', color: 'var(--PRIMAry-color)' }}
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section text-center">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Don't See the Right Role?</h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white font-semibold px-8 py-3 rounded-full transition-opacity hover:opacity-90" style={{ color: '#6d28d9' }}>
              Send Resume
            </button>
            <button className="btn-outline-theme" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              Learn More About PRIMA
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
