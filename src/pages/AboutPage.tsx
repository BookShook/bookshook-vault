import { BookOpen, Heart, Flame, Star } from "lucide-react";

const STATS = [
  { value: "350+", label: "Books read yearly" },
  { value: "2,000+", label: "Books cataloged" },
  { value: "200+", label: "Trope tags" },
  { value: "10K+", label: "Marginalia notes" },
];

const PHILOSOPHY = [
  {
    title: "Every Book Earned",
    description: "Nothing gets recommended unless I've read it cover to cover. No algorithms, no paid placements, no shortcuts.",
  },
  {
    title: "Consent for Readers",
    description: "You deserve to know what's in a book before you commit. Every content warning, every trigger, documented without spoilers.",
  },
  {
    title: "Tropes Done Right",
    description: "Tags that actually mean something. When I say enemies-to-lovers, they actually hate each other first.",
  },
  {
    title: "Heat That Makes Sense",
    description: "A consistent 5-flame scale applied the same way to every book. No guessing, no surprises.",
  },
];

export default function AboutPage() {
  return (
    <div className="about">
      {/* Hero */}
      <section className="about__hero">
        <div className="about__hero-content">
          <h1 className="about__title">The Founder</h1>
          <p className="about__subtitle">Hi, I'm Shook.</p>
        </div>
      </section>

      {/* Story */}
      <section className="about__story">
        <div className="about__story-content">
          <p className="about__story-text about__story-text--large">
            I read 350 books a year so you don't waste a single night on the wrong one.
          </p>

          <p className="about__story-text">
            It started with frustration. I'd pick up a book labeled "enemies to lovers" only to find
            they mildly disliked each other for one chapter. I'd dive into what Goodreads called
            "steamy" and find a closed-door fade to black. I'd recommend a book to a friend without
            knowing it had content that triggered them.
          </p>

          <p className="about__story-text">
            So I started keeping notes. Detailed notes. What tropes were actually in the book.
            What the heat level really was. What content might affect sensitive readers.
            Which chapters had the moments worth bookmarking.
          </p>

          <p className="about__story-text">
            Those notes became BookShook.
          </p>

          <p className="about__story-text">
            Now I spend my nights in the vault, cataloging every book so you can find exactly
            what you're craving—or avoid what you're not ready for. No algorithm, no sponsorships,
            no incentive except getting you to the right book.
          </p>

          <p className="about__story-text about__story-text--signature">
            Happy reading,<br />
            <span className="about__signature">Shook</span>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="about__stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="about__stat">
            <span className="about__stat-value">{stat.value}</span>
            <span className="about__stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Philosophy */}
      <section className="about__philosophy">
        <h2 className="about__section-title">The Philosophy</h2>

        <div className="about__philosophy-grid">
          {PHILOSOPHY.map((item) => (
            <div key={item.title} className="about__philosophy-card">
              <h3 className="about__philosophy-title">{item.title}</h3>
              <p className="about__philosophy-text">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Promise */}
      <section className="about__promise">
        <h2 className="about__promise-title">The Promise</h2>
        <div className="about__promise-content">
          <p className="about__promise-text">
            Every book in this vault has been read by me. Every tag applied by hand.
            Every content warning verified. Every marginalia note is my real, unfiltered reaction.
          </p>
          <p className="about__promise-text">
            I don't take money from publishers. I don't prioritize books based on anything
            except whether they're worth your time. When I say a book is good, I mean it.
            When I say a book has triggers, I've documented them.
          </p>
          <p className="about__promise-text about__promise-text--emphasized">
            This is my life's work. And it's for you.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="about__contact">
        <h2 className="about__section-title">Say Hello</h2>
        <p className="about__contact-text">
          Have a book suggestion? Found an error? Just want to talk about that one scene?
        </p>
        <a href="mailto:shook@bookshook.com" className="about__contact-btn">
          shook@bookshook.com
        </a>

        <div className="about__social">
          <a href="https://instagram.com/bookshook" className="about__social-link">Instagram</a>
          <a href="https://tiktok.com/@bookshook" className="about__social-link">TikTok</a>
          <a href="https://twitter.com/bookshook" className="about__social-link">Twitter</a>
        </div>
      </section>

      {/* CTA */}
      <section className="about__cta">
        <p className="about__cta-text">Ready to find your next favorite book?</p>
        <a href="/books" className="about__cta-btn">
          Enter the Vault
        </a>
      </section>
    </div>
  );
}
