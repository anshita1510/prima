import PageLayout from "../components/PageLayout";
import { Target, Users, Award, Globe, Heart, Zap } from "lucide-react";

const values = [
  { icon: Heart, title: "People First", description: "Great HR technology should empower people, not complicate their lives." },
  { icon: Zap, title: "Innovation", description: "Constantly pushing boundaries to deliver cutting-edge solutions for modern workplaces." },
  { icon: Award, title: "Excellence", description: "Committed to delivering the highest quality products and exceptional customer service." },
  { icon: Globe, title: "Global Impact", description: "Building solutions that work for organizations of all sizes, anywhere in the world." },
];

const team = [
  { name: "Sarah Johnson", role: "CEO & Founder", bio: "15+ years in HR technology, former VP at leading SaaS companies." },
  { name: "Michael Chen", role: "CTO", bio: "Expert in scalable systems, former senior engineer at tech giants." },
  { name: "Emily Rodriguez", role: "Head of Product", bio: "Product strategy expert with deep understanding of HR workflows." },
  { name: "David Kim", role: "Head of Engineering", bio: "Full-stack architect passionate about building reliable systems." },
];

const stats = [
  { value: "10K+", label: "Companies" },
  { value: "500K+", label: "Employees Managed" },
  { value: "99.9%", label: "Uptime" },
  { value: "25+", label: "Countries" },
];

export default function AboutPage() {
  return (
    <PageLayout title="About Us">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">Our Story</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Revolutionizing<br />
          <span className="gradient-text">HR Management</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          PRIMA was founded with a simple mission: to make HR management effortless, efficient,
          and engaging for organizations of all sizes.
        </p>
        <div className="accent-line" />
      </div>

      {/* Story + Mission */}
      <div className="grid md:grid-cols-2 gap-6 mb-20">
        <div className="premium-card p-8">
          <h2 className="text-2xl font-bold mb-5" style={{ color: 'var(--text-color)' }}>Our Story</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            Founded in 2026 by a team of HR professionals and technology experts, PRIMA emerged
            from the frustration of dealing with outdated, complex HR systems that hindered
            rather than helped organizations.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            We saw an opportunity to create something better — a platform that would be intuitive,
            powerful, and designed with the end user in mind. Today, we serve thousands of
            companies worldwide, from startups to enterprises.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Our journey is just beginning. We're committed to continuous innovation and helping
            organizations build better workplaces for their people.
          </p>
        </div>
        <div className="premium-card p-8">
          <h2 className="text-2xl font-bold mb-5" style={{ color: 'var(--text-color)' }}>Our Mission</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
            To empower organizations with intelligent HR technology that puts people first,
            streamlines operations, and drives business success.
          </p>
          <div className="space-y-4">
            {[
              { icon: Users, text: "10,000+ companies trust PRIMA", color: "#6d28d9" },
              { icon: Globe, text: "Available in 25+ countries", color: "#059669" },
              { icon: Award, text: "99.9% uptime guarantee", color: "#2563eb" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  <Icon size={16} />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Our Values</h2>
          <div className="accent-line" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
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

      {/* Team */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>Meet Our Team</h2>
          <div className="accent-line" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(({ name, role, bio }) => (
            <div key={name} className="premium-card p-6 text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold"
                style={{ background: 'var(--gradient-PRIMAry)', color: '#fff' }}
              >
                {name.charAt(0)}
              </div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>{name}</h3>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--PRIMAry-color)' }}>{role}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="cta-section mb-20">
        <div className="text-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold mb-3">PRIMA by the Numbers</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
          {stats.map(({ value, label }) => (
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
          Ready to join the PRIMA family?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Discover how PRIMA can transform your HR operations and empower your team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">Contact Sales</button>
        </div>
      </div>
    </PageLayout>
  );
}
