import { Check, Flame, BookOpen, Star, Sparkles, Lock } from "lucide-react";

const TIERS = [
  {
    id: "free",
    name: "The Lobby",
    price: "Free",
    period: "",
    description: "Peek through the keyhole",
    features: [
      "Friday Pick email every week",
      "Public book catalog browsing",
      "Basic search and filters",
      "Heat level ratings visible",
    ],
    cta: "Stay Free",
    ctaLink: "https://bookshook.com/#/portal/signup",
    featured: false,
  },
  {
    id: "member",
    name: "The Black Card",
    price: "$5.99",
    period: "/month",
    description: "Full access to the vault",
    features: [
      "Everything in The Lobby",
      "Complete tag system access",
      "All content warnings visible",
      "Detailed marginalia notes",
      "Personal library tracking",
      "Mood-based recommendations",
      "Collections & curated lists",
      "Early access to new features",
      "Priority support",
    ],
    cta: "Enter the Vault",
    ctaLink: "https://bookshook.com/#/portal/signup",
    featured: true,
  },
];

const TESTIMONIALS = [
  {
    quote: "I haven't DNF'd a book in 6 months thanks to the content warnings.",
    name: "Sarah M.",
    books: "127 books tracked",
  },
  {
    quote: "The marginalia alone is worth it. It's like reading with a friend.",
    name: "Jamie T.",
    books: "89 books tracked",
  },
  {
    quote: "Finally, a heat rating system that actually makes sense.",
    name: "Alex R.",
    books: "203 books tracked",
  },
];

const FAQS = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, absolutely. No questions asked, no guilt trips. Cancel in two clicks from your account page.",
  },
  {
    question: "Is there a free trial?",
    answer: "The Lobby tier is always free. Try it out, browse around, get the Friday Picks. Upgrade when you're ready for the full experience.",
  },
  {
    question: "How many books are in the vault?",
    answer: "Currently over 2,000 books with detailed tags, content warnings, and marginalia. I add 10-15 new books every week.",
  },
  {
    question: "Do you take requests?",
    answer: "Yes! Members can request books to be added to the vault. I prioritize member requests.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "Credit/debit cards and PayPal through Ghost's secure payment system.",
  },
];

export default function MembershipPage() {
  return (
    <div className="membership">
      {/* Hero */}
      <section className="membership__hero">
        <div className="membership__hero-glow" />
        <h1 className="membership__title">The Black Card</h1>
        <p className="membership__subtitle">
          Never waste another night on the wrong book
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="membership__pricing">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`membership__card ${tier.featured ? "membership__card--featured" : ""}`}
          >
            {tier.featured && (
              <div className="membership__card-badge">
                <Sparkles size={14} />
                Most Popular
              </div>
            )}

            <h2 className="membership__card-name">{tier.name}</h2>
            <p className="membership__card-description">{tier.description}</p>

            <div className="membership__card-price">
              <span className="membership__price-value">{tier.price}</span>
              {tier.period && <span className="membership__price-period">{tier.period}</span>}
            </div>

            <ul className="membership__features">
              {tier.features.map((feature) => (
                <li key={feature} className="membership__feature">
                  <Check size={16} className="membership__feature-icon" />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={tier.ctaLink}
              className={`membership__cta ${tier.featured ? "membership__cta--primary" : ""}`}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </section>

      {/* What You Get */}
      <section className="membership__features-detail">
        <h2 className="membership__section-title">What's Behind the Door</h2>

        <div className="membership__feature-grid">
          <div className="membership__feature-card">
            <div className="membership__feature-icon-wrapper">
              <Flame size={24} />
            </div>
            <h3>Precise Heat Ratings</h3>
            <p>Know exactly what you're getting into. From sweet to scorching, rated on a consistent 5-flame scale with detailed breakdowns.</p>
          </div>

          <div className="membership__feature-card">
            <div className="membership__feature-icon-wrapper">
              <Lock size={24} />
            </div>
            <h3>Complete Content Warnings</h3>
            <p>Every trigger, every sensitive topic, documented so you can read without surprises. Because consent applies to books too.</p>
          </div>

          <div className="membership__feature-card">
            <div className="membership__feature-icon-wrapper">
              <BookOpen size={24} />
            </div>
            <h3>200+ Trope Tags</h3>
            <p>One bed? Found family? Touch her and die? Search by exactly what you're craving tonight.</p>
          </div>

          <div className="membership__feature-card">
            <div className="membership__feature-icon-wrapper">
              <Star size={24} />
            </div>
            <h3>Marginalia Notes</h3>
            <p>My handwritten notes in the margins. The real reactions, the exact chapters that hit, the moments worth bookmarking.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="membership__testimonials">
        <h2 className="membership__section-title">From the Vault</h2>

        <div className="membership__testimonial-grid">
          {TESTIMONIALS.map((testimonial, i) => (
            <blockquote key={i} className="membership__testimonial">
              <p className="membership__testimonial-quote">"{testimonial.quote}"</p>
              <footer className="membership__testimonial-footer">
                <span className="membership__testimonial-name">{testimonial.name}</span>
                <span className="membership__testimonial-books">{testimonial.books}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="membership__faq">
        <h2 className="membership__section-title">Questions</h2>

        <div className="membership__faq-list">
          {FAQS.map((faq, i) => (
            <details key={i} className="membership__faq-item">
              <summary className="membership__faq-question">{faq.question}</summary>
              <p className="membership__faq-answer">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="membership__final-cta">
        <h2 className="membership__cta-title">Ready to enter?</h2>
        <p className="membership__cta-subtitle">
          Join thousands of readers who never pick the wrong book anymore.
        </p>
        <a href="https://bookshook.com/#/portal/signup" className="membership__cta-btn">
          Get The Black Card — $5.99/mo
        </a>
        <p className="membership__cta-note">
          Cancel anytime. No commitment. Just better books.
        </p>
      </section>
    </div>
  );
}
