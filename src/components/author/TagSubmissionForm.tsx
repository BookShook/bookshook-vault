import { useState, useEffect } from "react";
import { getVaultTags, submitAuthorTag, type VaultTag, type VaultTagCategory, type SubmissionEvidence } from "../../lib/api";
import { useAuthor } from "../../auth/AuthorContext";

type TagSubmissionFormProps = {
  bookId: string;
  onSuccess?: () => void;
};

type PendingTag = {
  id: string;
  tagId: string;
  tagName: string;
  categoryName: string;
  evidence: SubmissionEvidence;
};

const MAX_TAGS = 25;

export function TagSubmissionForm({ bookId, onSuccess }: TagSubmissionFormProps) {
  const { csrfToken } = useAuthor();
  const [categories, setCategories] = useState<VaultTagCategory[]>([]);
  const [tags, setTags] = useState<VaultTag[]>([]);
  const [loading, setLoading] = useState(true);

  // Current tag being added
  const [selectedTagId, setSelectedTagId] = useState("");
  const [evidence, setEvidence] = useState<SubmissionEvidence>({});

  // Queue of tags to submit
  const [pendingTags, setPendingTags] = useState<PendingTag[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVaultTags()
      .then((res) => {
        setCategories(res.categories);
        setTags(res.tags);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasEvidence = (ev: SubmissionEvidence) => {
    return !!(ev.chapter?.trim() || ev.page?.trim() || ev.location?.trim() || ev.notes?.trim());
  };

  const getSelectedTag = () => tags.find((t) => t.id === selectedTagId);
  const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

  const handleAddTag = () => {
    if (!selectedTagId) {
      setError("Please select a tag");
      return;
    }
    if (!hasEvidence(evidence)) {
      setError("Please provide at least one piece of evidence (chapter, page, location, or notes)");
      return;
    }
    if (pendingTags.length >= MAX_TAGS) {
      setError(`Maximum ${MAX_TAGS} tags per submission`);
      return;
    }
    if (pendingTags.some((p) => p.tagId === selectedTagId)) {
      setError("This tag is already in your list");
      return;
    }

    const tag = getSelectedTag();
    const category = tag ? getCategory(tag.category) : null;

    setPendingTags([
      ...pendingTags,
      {
        id: crypto.randomUUID(),
        tagId: selectedTagId,
        tagName: tag?.display_name || "Unknown",
        categoryName: category?.display_name || tag?.category || "",
        evidence: { ...evidence },
      },
    ]);

    // Reset form for next tag
    setSelectedTagId("");
    setEvidence({});
    setError(null);
  };

  const handleRemoveTag = (id: string) => {
    setPendingTags(pendingTags.filter((p) => p.id !== id));
  };

  const handleSubmitAll = async () => {
    if (pendingTags.length === 0 || !csrfToken) return;

    setSubmitting(true);
    setError(null);
    setResults(null);
    setSubmitProgress({ current: 0, total: pendingTags.length });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < pendingTags.length; i++) {
      const pending = pendingTags[i];
      setSubmitProgress({ current: i + 1, total: pendingTags.length });

      try {
        await submitAuthorTag(bookId, pending.tagId, pending.evidence, csrfToken);
        success++;
      } catch {
        failed++;
      }
    }

    setResults({ success, failed });
    setSubmitting(false);

    if (success > 0) {
      setPendingTags([]);
      onSuccess?.();
    }
  };

  // Group tags by category for the dropdown
  const tagsByCategory = categories
    .map((cat) => ({
      category: cat,
      tags: tags.filter((t) => t.category === cat.slug),
    }))
    .filter((g) => g.tags.length > 0);

  // Get evidence summary for display
  const getEvidenceSummary = (ev: SubmissionEvidence) => {
    const parts: string[] = [];
    if (ev.chapter) parts.push(`Ch: ${ev.chapter}`);
    if (ev.page) parts.push(`Pg: ${ev.page}`);
    if (ev.location) parts.push(`Loc: ${ev.location}`);
    if (ev.notes) parts.push(ev.notes.length > 30 ? ev.notes.slice(0, 30) + "..." : ev.notes);
    return parts.join(" | ") || "No evidence";
  };

  if (loading) {
    return <div className="author-form"><p style={{ opacity: 0.6 }}>Loading tags...</p></div>;
  }

  return (
    <div className="author-form">
      <h3 className="author-form__title">Submit Tags</h3>
      <p className="author-form__hint">Add up to {MAX_TAGS} tags with evidence, then submit all at once.</p>

      {/* Add Tag Section */}
      <div className="author-form__add-section">
        <div className="author-form__field">
          <label className="author-form__label">Tag</label>
          <select
            className="author-form__select"
            value={selectedTagId}
            onChange={(e) => { setSelectedTagId(e.target.value); setError(null); }}
            disabled={submitting}
          >
            <option value="">Select a tag...</option>
            {tagsByCategory.map((group) => (
              <optgroup key={group.category.slug} label={group.category.display_name}>
                {group.tags.map((tag) => (
                  <option key={tag.id} value={tag.id} disabled={pendingTags.some((p) => p.tagId === tag.id)}>
                    {tag.display_name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="author-form__evidence-grid">
          <div className="author-form__field">
            <label className="author-form__label">Chapter</label>
            <input
              type="text"
              className="author-form__input"
              value={evidence.chapter || ""}
              onChange={(e) => setEvidence({ ...evidence, chapter: e.target.value })}
              placeholder="e.g., Chapter 5"
              maxLength={64}
              disabled={submitting}
            />
          </div>

          <div className="author-form__field">
            <label className="author-form__label">Page</label>
            <input
              type="text"
              className="author-form__input"
              value={evidence.page || ""}
              onChange={(e) => setEvidence({ ...evidence, page: e.target.value })}
              placeholder="e.g., 42"
              maxLength={64}
              disabled={submitting}
            />
          </div>

          <div className="author-form__field">
            <label className="author-form__label">Location</label>
            <input
              type="text"
              className="author-form__input"
              value={evidence.location || ""}
              onChange={(e) => setEvidence({ ...evidence, location: e.target.value })}
              placeholder="e.g., Kindle loc 1234"
              maxLength={128}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="author-form__field">
          <label className="author-form__label">Notes</label>
          <textarea
            className="author-form__textarea"
            value={evidence.notes || ""}
            onChange={(e) => setEvidence({ ...evidence, notes: e.target.value })}
            placeholder="Brief description of where/how this tag applies..."
            maxLength={400}
            disabled={submitting}
          />
        </div>

        {error && <div className="author-form__error">{error}</div>}

        <button
          type="button"
          className="author-form__add-btn"
          onClick={handleAddTag}
          disabled={submitting || !selectedTagId || pendingTags.length >= MAX_TAGS}
        >
          + Add Tag to List ({pendingTags.length}/{MAX_TAGS})
        </button>
      </div>

      {/* Pending Tags List */}
      {pendingTags.length > 0 && (
        <div className="author-form__pending">
          <h4 className="author-form__pending-title">Tags to Submit ({pendingTags.length})</h4>
          <ul className="author-form__pending-list">
            {pendingTags.map((pending) => (
              <li key={pending.id} className="author-form__pending-item">
                <div className="author-form__pending-info">
                  <span className="author-form__pending-tag">{pending.tagName}</span>
                  <span className="author-form__pending-category">{pending.categoryName}</span>
                  <span className="author-form__pending-evidence">{getEvidenceSummary(pending.evidence)}</span>
                </div>
                <button
                  type="button"
                  className="author-form__pending-remove"
                  onClick={() => handleRemoveTag(pending.id)}
                  disabled={submitting}
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          {submitting && (
            <div className="author-form__progress">
              Submitting {submitProgress.current} of {submitProgress.total}...
            </div>
          )}

          {results && (
            <div className={`author-form__results ${results.failed > 0 ? "author-form__results--partial" : "author-form__results--success"}`}>
              {results.success} tag{results.success !== 1 ? "s" : ""} submitted successfully
              {results.failed > 0 && `, ${results.failed} failed`}
            </div>
          )}

          <button
            type="button"
            className="author-form__submit"
            onClick={handleSubmitAll}
            disabled={submitting || pendingTags.length === 0}
          >
            {submitting ? `Submitting...` : `Submit All ${pendingTags.length} Tag${pendingTags.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
