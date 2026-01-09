import { useEffect, useState } from "react";
import { getTags, type TagCategory, type Tag } from "../lib/api";

type Props = {
  selectedTags: string[];
  onTagsChange: (slugs: string[]) => void;
};

export default function TagFilterBar({ selectedTags, onTagsChange }: Props) {
  const [categories, setCategories] = useState<TagCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTags()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  function toggle(slug: string) {
    if (selectedTags.includes(slug)) {
      onTagsChange(selectedTags.filter((s) => s !== slug));
    } else {
      onTagsChange([...selectedTags, slug]);
    }
  }

  if (loading) return <div style={{ opacity: 0.6, fontSize: 14, color: "#f5f0e8" }}>Loading filters…</div>;
  if (categories.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {categories.map((cat) => (
        <div key={cat.category}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, textTransform: "capitalize", color: "#f5f0e8" }}>
            {cat.category.replace(/_/g, " ")}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cat.tags.map((tag) => {
              const isActive = selectedTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggle(tag.slug)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: isActive ? "1px solid #d4af37" : "1px solid rgba(255,255,255,.18)",
                    background: isActive ? "#d4af37" : "rgba(255,255,255,0.1)",
                    color: isActive ? "#0a0a0f" : "#f5f0e8",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedTags.length > 0 && (
        <button
          onClick={() => onTagsChange([])}
          style={{
            alignSelf: "flex-start",
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.18)",
            background: "rgba(255,255,255,0.1)",
            color: "#f5f0e8",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
