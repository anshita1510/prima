import PageLayout from "../components/PageLayout";
import { Check, Star, Zap, Crown, Shield } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "29",
    description: "Perfect for small teams getting started with HR management",
    icon: Star,
    features: ["Up to 25 employees", "Basic attendance tracking", "Leave management", "Employee profiles", "Basic reporting", "Email support", "Mobile app access"],
    popular: false,
    accentColor: "#6d28d9",
  },
  {
    name: "Professional",
    price: "79",
    description: "Advanced features for growing businesses",
    icon: Zap,
    features: ["Up to 100 employees", "Advanced attendance tracking", "Project management", "Task assignment", "Performance reviews", "Custom reports", "Priority support", "API access", "Integrations"],
    popular: true,
    accentColor: "#2563eb",
  },
  {
    name: "Enterprise",
    price: "199",
    description: "Complete solution for large organizations",
    icon: Crown,
    features: ["Unlimited employees", "Advanced analytics", "Custom workflows", "Multi-location support", "Advanced security", "Dedicated support", "Custom integrations", "SLA guarantee", "Training & onboarding"],
    popular: false,
    accentColor: "#d97706",
  },
];

const faqs = [
  { q: "Can I change plans anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
  { q: "Is there a setup fee?", a: "No, there are no setup fees or hidden costs. You only pay the monthly subscription." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and bank transfers for annual plans." },
  { q: "Do you offer discounts for annual billing?", a: "Yes, save 20% when you choose annual billing instead of monthly payments." },
];

export default function PricingPage() {
  return (
    <PageLayout title="Pricing">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="premium-badge mb-6">Simple, Transparent Pricing</div>
        <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-color)' }}>
          One plan for every<br />
          <span className="gradient-text">stage of growth</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
          All plans include our core HR management features with no hidden fees or setup costs.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {["30-day free trial", "No setup fees", "Cancel anytime"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Shield size={14} style={{ color: '#059669' }} />
              {item}
            </div>
          ))}
        </div>
        <div className="accent-line" />
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {plans.map(({ name, price, description, icon: Icon, features, popular, accentColor }) => (
          <div
            key={name}
            className="premium-card p-8 relative flex flex-col"
            style={popular ? { borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}33, var(--shadow-lg)` } : {}}
          >
            {popular && (
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'var(--gradient-PRIMAry)' }}
              >
                Most Popular
              </div>
            )}
            <div className="text-center mb-8">
              <div
                className="icon-box w-12 h-12 mx-auto mb-4"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                <Icon size={22} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>{name}</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{description}</p>
              <div>
                <span className="text-5xl font-bold" style={{ color: 'var(--text-color)' }}>${price}</span>
                <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>/month</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Check size={16} style={{ color: '#059669', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={popular ? "btn-PRIMAry-gradient w-full" : "btn-outline-theme w-full"}
              style={{ borderRadius: '12px' }}
            >
              Start Free Trial
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="premium-card p-10 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text-color)' }}>
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map(({ q, a }) => (
            <div key={q}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>{q}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
          Ready to get started?
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          Join thousands of companies already using PRIMA to manage their HR operations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-PRIMAry-gradient">Start Free Trial</button>
          <button className="btn-outline-theme">Schedule Demo</button>
        </div>
      </div>
    </PageLayout>
  );
}
