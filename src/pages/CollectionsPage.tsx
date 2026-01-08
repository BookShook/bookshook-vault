import { Link } from "react-router-dom";
import { BookOpen, Clock, Flame, Heart } from "lucide-react";

// Mock collection data - replace with API data
const COLLECTIONS = [
  {
    id: 1,
    slug: "one-bed-trope",
    title: "One Bed, No Regrets",
    description: "Every book where proximity does the heavy lifting",
    bookCount: 23,
    coverImages: [
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/59386369.jpg",
    ],
    curator: "Shook",
    heat: 4,
  },
  {
    id: 2,
    slug: "grumpy-sunshine",
    title: "Grumpy Meets Sunshine",
    description: "When the brooding one finally cracks a smile",
    bookCount: 31,
    coverImages: [
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1635194220i/55650627.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/59386369.jpg",
    ],
    curator: "Shook",
    heat: 3,
  },
  {
    id: 3,
    slug: "enemies-to-lovers",
    title: "They Actually Hate Each Other",
    description: "Real animosity. Real tension. Real payoff.",
    bookCount: 18,
    coverImages: [
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1635194220i/55650627.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
    ],
    curator: "Shook",
    heat: 5,
  },
  {
    id: 4,
    slug: "slow-burn-worth-it",
    title: "Slow Burn Worth the Wait",
    description: "400 pages of tension for one perfect moment",
    bookCount: 27,
    coverImages: [
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/59386369.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1635194220i/55650627.jpg",
    ],
    curator: "Shook",
    heat: 3,
  },
  {
    id: 5,
    slug: "the-grovel",
    title: "The Grovel Hall of Fame",
    description: "When sorry isn't enough and they EARN it",
    bookCount: 15,
    coverImages: [
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1635194220i/55650627.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
    ],
    curator: "Shook",
    heat: 4,
  },
  {
    id: 6,
    slug: "2am-finishers",
    title: "2AM Finishers",
    description: "Books that made me message three people at 2am",
    bookCount: 42,
    coverImages: [
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1651588954i/58950447.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611937942i/56732449.jpg",
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1638867089i/59386369.jpg",
    ],
    curator: "Shook",
    heat: 4,
  },
];

function HeatLevel({ level }: { level: number }) {
  return (
    <div className="collections__heat">
      {[1, 2, 3, 4, 5].map((i) => (
        <Flame
          key={i}
          size={12}
          className={i <= level ? "heat__flame--active" : ""}
          style={{ opacity: i <= level ? 1 : 0.3 }}
        />
      ))}
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <div className="collections">
      <header className="collections__header">
        <h1 className="collections__title">Collections</h1>
        <p className="collections__subtitle">
          Curated playlists for every mood, trope, and 2am craving
        </p>
      </header>

      <div className="collections__grid">
        {COLLECTIONS.map((collection) => (
          <Link
            key={collection.id}
            to={`/collections/${collection.slug}`}
            className="collection-card"
          >
            <div className="collection-card__covers">
              {collection.coverImages.slice(0, 3).map((cover, i) => (
                <img
                  key={i}
                  src={cover}
                  alt=""
                  className="collection-card__cover"
                  style={{
                    zIndex: 3 - i,
                    transform: `translateX(${i * 20}px) rotate(${(i - 1) * 3}deg)`,
                  }}
                />
              ))}
            </div>

            <div className="collection-card__info">
              <h3 className="collection-card__title">{collection.title}</h3>
              <p className="collection-card__description">{collection.description}</p>

              <div className="collection-card__meta">
                <span className="collection-card__count">
                  <BookOpen size={14} />
                  {collection.bookCount} books
                </span>
                <HeatLevel level={collection.heat} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="collections__cta">
        <p className="collections__cta-text">
          Want a collection for a specific mood or trope?
        </p>
        <a href="mailto:shook@bookshook.com" className="collections__request-btn">
          Request a Collection
        </a>
      </div>
    </div>
  );
}
