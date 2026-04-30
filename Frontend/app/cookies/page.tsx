import LegalLayout, { LegalSection } from "../components/LegalLayout";
import { Cookie, Settings, BarChart3, Shield, Eye, Trash2 } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="This policy explains how PRIMA uses cookies and similar technologies to enhance your experience and improve our services."
      icon={<Cookie size={28} />}
    >
      <LegalSection icon={<Cookie size={18} />} title="What Are Cookies?">
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Cookies are small text files stored on your device when you visit our website. They help us provide a better experience
          by remembering your preferences and enabling certain functionality.
        </p>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Settings, label: "Functionality", desc: "Remember your login status and preferences" },
            { icon: BarChart3, label: "Analytics", desc: "Help us understand how you use our service" },
            { icon: Shield, label: "Security", desc: "Protect against fraud and unauthorized access" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label}>
              <div className="icon-box w-10 h-10 mx-auto mb-3"><Icon size={18} /></div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>{label}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<Settings size={18} />} title="Types of Cookies We Use">
        <div className="space-y-5">
          {[
            {
              icon: Shield, label: "Essential Cookies", badge: "Required", badgeColor: "#dc2626",
              desc: "Necessary for the website to function properly and cannot be disabled.",
              items: ["Session management", "Login status", "Security tokens", "Language preferences"],
            },
            {
              icon: BarChart3, label: "Performance Cookies", badge: "Optional", badgeColor: "#2563eb",
              desc: "Help us understand how visitors interact with our website by collecting anonymous information.",
              items: ["Page views and traffic", "User behavior patterns", "Load time monitoring", "Error tracking"],
            },
            {
              icon: Eye, label: "Preference Cookies", badge: "Optional", badgeColor: "#059669",
              desc: "Remember your choices and preferences to provide a personalized experience.",
              items: ["Dashboard layout", "Notification settings", "Saved filters", "Timezone settings"],
            },
          ].map(({ icon: Icon, label, badge, badgeColor, desc, items }) => (
            <div key={label} className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="icon-box w-8 h-8 rounded-lg"><Icon size={16} /></div>
                <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>{label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${badgeColor}18`, color: badgeColor }}>
                  {badge}
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection icon={<Trash2 size={18} />} title="Managing Your Cookies">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Browser Settings</h3>
            <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>View and delete existing cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block third-party cookies</li>
              <li>Clear all cookies when closing browser</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-color)' }}>Our Cookie Preferences</h3>
            <ul className="space-y-1 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              <li>Accept or reject optional cookies</li>
              <li>View detailed cookie information</li>
              <li>Change your preferences anytime</li>
            </ul>
            <button className="btn-PRIMAry-gradient text-sm" style={{ padding: '8px 20px', borderRadius: '10px' }}>
              Manage Cookie Preferences
            </button>
          </div>
        </div>
      </LegalSection>

      <LegalSection icon={<BarChart3 size={18} />} title="Cookie Retention Periods">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-color)' }}>Cookie Type</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-color)' }}>Duration</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--text-color)' }}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Session Cookies", "Until browser closes", "Authentication and temporary data"],
                ["Persistent Cookies", "30 days – 2 years", "Preferences and settings"],
                ["Analytics Cookies", "2 years", "Usage analysis and improvements"],
                ["Security Cookies", "24 hours", "Fraud prevention and security"],
              ].map(([type, duration, purpose]) => (
                <tr key={type} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-3 px-4" style={{ color: 'var(--text-color)' }}>{type}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>{duration}</td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
