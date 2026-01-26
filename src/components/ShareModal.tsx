import { useState, useCallback, useMemo } from "react";
import type { VaultTag } from "../lib/api";

// Maps safety shield slugs to human-readable labels
const SAFETY_LABELS: Record<string, string> = {
  guaranteed_hea: "HEA Guaranteed",
  no_cheating: "No Cheating",
  low_angst: "Low Angst",
  good_communication: "Good Communication",
};

// Base axes categories (single-select dimensions)
const BASE_AXES = ["world_framework", "pairing", "heat_level", "series_status", "consent_mode"];

interface FilterState {
  query: string;
  include: string[];
  exclude: string[];
  safety: string[];
  kindleUnlimited: boolean;
  hiddenGemsOnly: boolean;
  sort: string;
}

type ShareModalProps = {
  filters: FilterState;
  tagById: Map<string, VaultTag>;
  onClose: () => void;
};

export function ShareModal({ filters, tagById, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "caption">("link");
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);
  const [copyCaptionSuccess, setCopyCaptionSuccess] = useState(false);
  const [includeHashtags, setIncludeHashtags] = useState(false);

  // Separate tags into axes (single-select) vs dimensions (multi-select)
  const { axesTags, dimensionTags } = useMemo(() => {
    const axes: VaultTag[] = [];
    const dimensions: VaultTag[] = [];

    for (const id of filters.include) {
      const tag = tagById.get(id);
      if (!tag) continue;
      if (BASE_AXES.includes(tag.category)) {
        axes.push(tag);
      } else {
        dimensions.push(tag);
      }
    }

    return { axesTags: axes, dimensionTags: dimensions };
  }, [filters.include, tagById]);

  // Map exclude tags to readable names
  const excludeTagNames = useMemo(() => {
    return filters.exclude
      .map(id => tagById.get(id)?.display_name ?? id)
      .slice(0, 3);
  }, [filters.exclude, tagById]);

  // Map safety tags to readable names
  const safetyNames = useMemo(() => {
    return filters.safety
      .map(id => {
        const tag = tagById.get(id);
        return tag?.display_name ?? SAFETY_LABELS[tag?.slug ?? ""] ?? id;
      });
  }, [filters.safety, tagById]);

  // Generate social caption
  const caption = useMemo(() => {
    const lines: string[] = [];

    // Header
    lines.push("📚 My BookShook search:");

    // Base axes line (if any)
    if (axesTags.length > 0) {
      const axesLine = axesTags.map(t => t.display_name).join(" • ");
      lines.push(axesLine);
    }

    // Must-haves (dimension tags + safety)
    const mustHaves = [
      ...dimensionTags.slice(0, 3).map(t => t.display_name),
      ...safetyNames.slice(0, Math.max(0, 3 - dimensionTags.length)),
    ];
    const mustHaveRemainder = dimensionTags.length + safetyNames.length - mustHaves.length;
    if (mustHaves.length > 0) {
      let line = `Must-haves: ${mustHaves.join(", ")}`;
      if (mustHaveRemainder > 0) {
        line += ` +${mustHaveRemainder} more`;
      }
      lines.push(line);
    }

    // Hard no's (exclude tags)
    const hardNos = excludeTagNames.slice(0, 3);
    const hardNoRemainder = filters.exclude.length - hardNos.length;
    if (hardNos.length > 0) {
      let line = `Hard no's: ${hardNos.join(", ")}`;
      if (hardNoRemainder > 0) {
        line += ` +${hardNoRemainder} more`;
      }
      lines.push(line);
    }

    // Search query if present
    if (filters.query.trim()) {
      lines.push(`Search: "${filters.query.trim()}"`);
    }

    // Empty line before link
    lines.push("");
    lines.push(`Try it: ${window.location.href}`);

    // Hashtags (optional)
    if (includeHashtags) {
      lines.push("");
      lines.push("#BookShook #RomanceBooks #RomanceReads");
    }

    return lines.join("\n");
  }, [axesTags, dimensionTags, safetyNames, excludeTagNames, filters.query, filters.exclude.length, includeHashtags]);

  // Copy link handler
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    });
  }, []);

  // Copy caption handler
  const copyCaption = useCallback(() => {
    navigator.clipboard.writeText(caption).then(() => {
      setCopyCaptionSuccess(true);
      setTimeout(() => setCopyCaptionSuccess(false), 2000);
    });
  }, [caption]);

  // Filter count for summary
  const filterCount = filters.include.length + filters.exclude.length + filters.safety.length;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Share this search</h3>
        <p className="share-modal-subtitle">
          {filterCount} filter{filterCount === 1 ? "" : "s"} applied
        </p>

        {/* Tabs */}
        <div className="share-tabs">
          <button
            type="button"
            className={`share-tab ${activeTab === "link" ? "share-tab--active" : ""}`}
            onClick={() => setActiveTab("link")}
          >
            Link
          </button>
          <button
            type="button"
            className={`share-tab ${activeTab === "caption" ? "share-tab--active" : ""}`}
            onClick={() => setActiveTab("caption")}
          >
            Caption
          </button>
        </div>

        {/* Link Tab */}
        {activeTab === "link" && (
          <div className="share-tab-content">
            <p className="share-helper">Opens the Vault with your exact filters applied.</p>
            <div className="share-url-box">
              <code className="share-url-text">{window.location.href}</code>
            </div>
            <button
              type="button"
              className="share-action-btn"
              onClick={copyLink}
            >
              {copyLinkSuccess ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}

        {/* Caption Tab */}
        {activeTab === "caption" && (
          <div className="share-tab-content">
            <p className="share-helper">Optimized for TikTok/IG/X.</p>
            <div className="share-caption-box">
              <pre className="share-caption-text">{caption}</pre>
            </div>
            <label className="share-hashtag-toggle">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
              />
              <span>Include hashtags</span>
            </label>
            <button
              type="button"
              className="share-action-btn"
              onClick={copyCaption}
            >
              {copyCaptionSuccess ? "Copied!" : "Copy caption"}
            </button>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          className="share-close-btn"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
