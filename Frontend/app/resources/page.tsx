"use client";

import { useState } from "react";
import PageLayout from "../components/PageLayout";
import { BookOpen, Video, FileText, Download, Clock, Search } from "lucide-react";

const resources = [
  {
    category: "Getting Started",
    items: [
      { title: "Quick Start Guide", description: "Get up and running with PRIMA in under 10 minutes", type: "Guide", icon: BookOpen, readTime: "5 min read", keywords: ["quick", "start", "guide", "setup"] },
      { title: "Setup Walkthrough Video", description: "Step-by-step video tutorial for initial setup", type: "Video", icon: Video, readTime: "12 min watch", keywords: ["setup", "video", "tutorial"] },
      { title: "Best Practices Checklist", description: "Essential tips for optimal PRIMA implementation", type: "Checklist", icon: FileText, readTime: "3 min read", keywords: ["best practices", "checklist", "tips"] },
    ],
  },
  {
    category: "User Guides",
    items: [
      { title: "Employee Management", description: "Complete guide to managing employee profiles and data", type: "Guide", icon: BookOpen, readTime: "8 min read", keywords: ["employee", "management", "profiles"] },
      { title: "Attendance Tracking", description: "Master attendance features and reporting", type: "Guide", icon: BookOpen, readTime: "6 min read", keywords: ["attendance", "tracking", "time"] },
      { title: "Leave Management", description: "Configure and manage leave policies effectively", type: "Guide", icon: BookOpen, readTime: "7 min read", keywords: ["leave", "vacation", "policies"] },
    ],
  },
  {
    category: "Advanced Features",
    items: [
      { title: "API Documentation", description: "Complete API reference for developers", type: "Documentation", icon: FileText, readTime: "Reference", keywords: ["api", "documentation", "developers"] },
      { title: "Custom Integrations", description: "Build custom integrations with third-party tools", type: "Guide", icon: BookOpen, readTime: "15 min read", keywords: ["integrations", "custom", "third-party"] },
      { title: "Advanced Analytics", description: "Leverage powerful reporting and analytics features", type: "Guide", icon: BookOpen, readTime: "10 min read", keywords: ["analytics", "reporting", "data"] },
    ],
  },
];

const downloads = [
  { title: "PRIMA Mobile App", description: "Download our mobile app for iOS and Android", platforms: ["iOS", "Android"] },
  { title: "Implementation Template", description: "Excel template for planning your PRIMA rollout", platforms: ["Excel"] },
  { title: "Security Whitepaper", description: "Detailed overview of our security measures", platforms: ["PDF"] },
];

type ResourceItem = { title: string; description: string; type: string; icon: React.ElementType; readTime: string; keywords: string[]; category?: string };

export default function ResourcesPage() {
  const [query, setQuery] = useState("");

  const allItems: ResourceItem[] = resources.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, category: cat.category }))
  );

  const filtered = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      })
    : [];

  return (
    <PageLayout title="Resources">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="premium-badge mb-6">Documentation & Guides</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          Everything you need<br />
          <span className="gradient-text">to succeed with PRIMA</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          From quick start guides to advanced tutorials, we've got you covered.
        </p>
        <div className="accent-line" />
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-16">
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-4 pl-12 rounded-2xl text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--PRIMAry-color)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {query && (
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
          </h2>
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <ResourceCard key={item.title} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>No results found. Try different keywords.</p>
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {!query && (
        <div className="space-y-14 mb-16">
          {resources.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>{cat.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.items.map((item) => (
                  <ResourceCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Downloads */}
      {!query && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>Downloads</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {downloads.map((d) => (
              <div key={d.title} className="premium-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="icon-box w-10 h-10" style={{ backgroundColor: 'rgba(5,150,105,0.12)', color: '#059669' }}>
                    <Download size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>{d.title}</h3>
                    <div className="flex gap-1 mt-1">
                      {d.platforms.map((p) => (
                        <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{d.description}</p>
                <button className="btn-outline-theme w-full text-sm" style={{ borderRadius: '10px', padding: '8px 16px' }}>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="cta-section text-center">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity" style={{ color: '#6d28d9' }}>
              Contact Support
            </button>
            <button className="btn-outline-theme" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function ResourceCard({ item }: { item: ResourceItem }) {
  const Icon = item.icon;
  return (
    <div className="premium-card p-6 cursor-pointer">
      <div className="flex items-start gap-4 mb-3">
        <div className="icon-box w-10 h-10 flex-shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="premium-badge text-xs">{item.type}</span>
            {item.category && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.category}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            <Clock size={11} />
            {item.readTime}
          </div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>{item.title}</h3>
        </div>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
    </div>
  );
}
