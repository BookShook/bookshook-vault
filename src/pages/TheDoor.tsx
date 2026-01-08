import { Link } from "react-router-dom";
import { ChevronDown, Flame, Sparkles } from "lucide-react";

// Book spines for the dramatic entrance
const BOOK_SPINES = [
  { color: "#8B0000", title: "TWISTED", height: 220 },
  { color: "#2F4F4F", title: "ENEMIES", height: 200 },
  { color: "#4A0E4E", title: "ONE BED", height: 240 },
  { color: "#1a1a2e", title: "SLOW BURN", height: 210 },
  { color: "#3d0c02", title: "GRUMPY", height: 230 },
  { color: "#0d3b66", title: "SECRETS", height: 195 },
  { color: "#4a1942", title: "TENSION", height: 225 },
  { color: "#2d3436", title: "YEARNING", height: 205 },
  { color: "#1B1464", title: "OBSESSED", height: 235 },
  { color: "#4a0404", title: "UNHINGED", height: 215 },
];

const QUOTES = [
  "I finished this at 2am and texted three people.",
  "The grovel in chapter 24 should be studied.",
  "He said 'I know' and I had to put my phone down.",
  "Finally, enemies who actually hate each other.",
];

export default function TheDoor() {
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="door">
      {/* Atmospheric background layers */}
      <div className="door__atmosphere">
        <div className="door__gradient-1" />
        <div className="door__gradient-2" />
        <div className="door__particles" />
      </div>

      {/* The Grand Entrance */}
      <section className="door__entrance">
        {/* Book Spines - Left Side */}
        <div className="door__spines door__spines--left">
          {BOOK_SPINES.slice(0, 5).map((spine, i) => (
            <div
              key={i}
              className="door__spine"
              style={{
                background: `linear-gradient(180deg, ${spine.color} 0%, ${spine.color}dd 50%, ${spine.color}99 100%)`,
                height: spine.height,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <span className="door__spine-title">{spine.title}</span>
            </div>
          ))}
        </div>

        {/* Center Content */}
        <div className="door__center">
          <div className="door__glow" />

          <p className="door__whisper">psst... come closer</p>

          <h1 className="door__title">
            <span className="door__title-line">I read</span>
            <span className="door__title-accent">350 books</span>
            <span className="door__title-line">a year</span>
          </h1>

          <p className="door__subtitle">
            so you never waste a night on the wrong one
          </p>

          <div className="door__quote-card">
            <Sparkles className="door__quote-icon" size={20} />
            <p className="door__quote">"{randomQuote}"</p>
          </div>

          <Link to="/books" className="door__enter">
            <span className="door__enter-text">Enter the Vault</span>
            <span className="door__enter-glow" />
          </Link>

          <div className="door__scroll-hint">
            <span>or keep scrolling</span>
            <ChevronDown size={24} className="door__scroll-chevron" />
          </div>
        </div>

        {/* Book Spines - Right Side */}
        <div className="door__spines door__spines--right">
          {BOOK_SPINES.slice(5).map((spine, i) => (
            <div
              key={i}
              className="door__spine"
              style={{
                background: `linear-gradient(180deg, ${spine.color} 0%, ${spine.color}dd 50%, ${spine.color}99 100%)`,
                height: spine.height,
                animationDelay: `${(i + 5) * 0.1}s`,
              }}
            >
              <span className="door__spine-title">{spine.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* The Reveal - What This Is */}
      <section className="door__reveal">
        <div className="door__reveal-content">
          <h2 className="door__reveal-title">
            This is <span className="door__gold">BookShook</span>
          </h2>

          <div className="door__promise-grid">
            <div className="door__promise-card">
              <div className="door__promise-icon">
                <Flame size={32} />
              </div>
              <h3>Heat Ratings That Mean Something</h3>
              <p>A 5-flame scale applied consistently. No more guessing if "steamy" means a kiss or... more.</p>
            </div>

            <div className="door__promise-card">
              <div className="door__promise-icon door__promise-icon--teal">
                ⚠️
              </div>
              <h3>Content Warnings Without Spoilers</h3>
              <p>Every trigger documented. Because you deserve to know before you commit.</p>
            </div>

            <div className="door__promise-card">
              <div className="door__promise-icon door__promise-icon--pink">
                🏷️
              </div>
              <h3>200+ Trope Tags</h3>
              <p>One bed. Found family. Touch her and die. Find exactly what you're craving.</p>
            </div>

            <div className="door__promise-card">
              <div className="door__promise-icon door__promise-icon--purple">
                ✍️
              </div>
              <h3>Marginalia Notes</h3>
              <p>My unfiltered reactions. The exact chapters that hit. The moments worth rereading.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Invitation */}
      <section className="door__invitation">
        <div className="door__invitation-bg" />
        <div className="door__invitation-content">
          <p className="door__invitation-eyebrow">Every Friday</p>
          <h2 className="door__invitation-title">One perfect book recommendation</h2>
          <p className="door__invitation-text">
            Delivered to your inbox. Free forever.
          </p>
          <a href="https://bookshook.com/#/portal/signup" className="door__invitation-cta">
            Get the Friday Pick
          </a>
        </div>
      </section>

      {/* The Black Card Teaser */}
      <section className="door__blackcard">
        <div className="door__blackcard-visual">
          <div className="door__card-shine" />
          <span className="door__card-logo">BookShook</span>
          <span className="door__card-member">VAULT MEMBER</span>
        </div>

        <div className="door__blackcard-content">
          <h2 className="door__blackcard-title">The Black Card</h2>
          <p className="door__blackcard-price">
            <span className="door__price-amount">$5.99</span>
            <span className="door__price-period">/month</span>
          </p>
          <p className="door__blackcard-text">
            Full access to every tag, every warning, every marginalia note.
            The complete vault experience.
          </p>
          <Link to="/membership" className="door__blackcard-cta">
            Learn More
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="door__final">
        <h2 className="door__final-title">Ready?</h2>
        <Link to="/books" className="door__final-cta">
          Enter the Vault
        </Link>
      </section>
    </div>
  );
}
