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

  if (loading) return <div style={{ opacity: 0.6, fontSize: 14 }}>Loading filters…</div>;
  if (categories.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {categories.map((cat) => (
        <div key={cat.category}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, textTransform: "capitalize" }}>
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
                    border: isActive ? "1px solid #000" : "1px solid rgba(0,0,0,.15)",
                    background: isActive ? "#000" : "#fff",
                    color: isActive ? "#fff" : "#000",
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
            border: "1px solid rgba(0,0,0,.15)",
            background: "#fff",
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
