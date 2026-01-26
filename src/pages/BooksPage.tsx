// ============================================================================
// BOOKSHOOK VAULT — Production-Ready Discovery Engine
// API-driven, URL-synced, dramatic editorial design
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMe } from '../auth/MeContext';
import { getVaultTags, getBooks, type VaultTag, type VaultTagCategory, type VaultTagsResponse, type BookListItem } from '../lib/api';
import { ShareModal } from '../components/ShareModal';

// ============================================================================
// TYPES
// ============================================================================

interface FilterState {
  query: string;
  include: string[];      // tag IDs to include
  exclude: string[];      // tag IDs to exclude (content warnings)
  safety: string[];       // safety shield tag IDs
  kindleUnlimited: boolean;
  hiddenGemsOnly: boolean;
  sort: 'newest' | 'grovel' | 'regret_low' | 'heat';
}

interface Preset {
  id: string;
  name: string;
  tagline: string;
  slugs: {
    include?: string[];
    safety?: string[];
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Filter tier organization - uses ACTUAL category slugs from API
const FILTER_TIERS: Record<string, { name: string; categories: string[]; defaultExpanded: boolean; isExclude?: boolean }> = {
  essential: {
    name: 'The Essentials',
    categories: ['world_framework', 'pairing', 'heat_level', 'safety'],
    defaultExpanded: true,
  },
  tropes: {
    name: 'Tropes & Dynamics',
    categories: ['trope'],
    defaultExpanded: false,
  },
  characters: {
    name: 'Character Archetypes',
    categories: ['hero_archetype', 'heroine_archetype'],
    defaultExpanded: false,
  },
  atmosphere: {
    name: 'Setting & Atmosphere',
    categories: ['tone', 'setting_wrapper', 'aesthetic_atmosphere', 'seasonal_wrapper', 'plot_engine', 'market_life_stage'],
    defaultExpanded: false,
  },
  representation: {
    name: 'Representation',
    categories: [
      'rep_sexual_orientation',
      'rep_gender_identity',
      'rep_relationship_structure',
      'rep_physical_disability',
      'rep_chronic_illness',
      'rep_neurodivergence',
      'rep_mental_health',
      'rep_body_age',
      'rep_race_culture',
      'rep_religion',
      'rep_background',
    ],
    defaultExpanded: false,
  },
  advanced: {
    name: 'Advanced Filters',
    categories: ['series_status', 'consent_mode', 'kink_bundle', 'kink_detail'],
    defaultExpanded: false,
  },
  exclusions: {
    name: 'Content to Avoid',
    categories: ['content_warning'],
    defaultExpanded: false,
    isExclude: true,
  },
};

// Premium categories (frontend override since DB may not have is_premium set)
const PREMIUM_CATEGORIES = new Set(['consent_mode', 'kink_bundle', 'kink_detail']);

// Content warning display groups (presentation only)
const CW_DISPLAY_GROUPS: Record<string, string[]> = {
  'Consent & Violence': [
    'sexual_assault', 'non_consent', 'dubious_consent',
    'abuse_depicted', 'domestic_violence', 'child_abuse_backstory'
  ],
  'Infidelity': ['cheating', 'other_woman_man_drama'],
  'Death & Violence': ['death_on_page', 'graphic_violence', 'gore', 'murder'],
  'Self-Harm': ['self_harm', 'suicide'],
  'Addiction': ['addiction', 'overdose'],
  'Family': ['incest', 'pregnancy_loss', 'pregnancy', 'infertility'],
  'Captivity': ['kidnapping', 'captivity', 'stalking'],
  'Power Dynamics': ['significant_age_gap', 'power_imbalance'],
  'Story Structure': ['hfn_not_hea', 'love_interest_death'],
  'Sensitive Content': [
    'animal_harm', 'child_in_danger', 'child_death', 'medical_trauma',
    'terminal_illness', 'war_combat_cw', 'torture',
    'racism_depicted', 'homophobia_depicted', 'transphobia_depicted'
  ],
};

// 5 dramatic presets (no emojis)
const PRESETS: Preset[] = [
  {
    id: 'devastate-me',
    name: 'Devastate Me',
    tagline: 'Wreck my heart. Make it worth it.',
    slugs: {
      include: ['angsty_emotional', 'slow_burn', 'hurt_comfort'],
      safety: ['guaranteed_hea'],
    },
  },
  {
    id: 'unhinged-hours',
    name: 'Unhinged Hours',
    tagline: 'Morally grey everything. No apologies.',
    slugs: {
      include: ['dark_tone', 'possessive_obsessive', 'morally_grey_hero'],
    },
  },
  {
    id: 'comfort-read',
    name: 'Comfort Read',
    tagline: 'Low stakes. Guaranteed landing.',
    slugs: {
      include: ['cozy_comfort_read', 'rom_com_humor'],
      safety: ['guaranteed_hea', 'no_cheating', 'low_angst', 'good_communication'],
    },
  },
  {
    id: 'slow-burn-agony',
    name: 'Slow Burn Agony',
    tagline: '300 pages before they touch.',
    slugs: {
      include: ['slow_burn', 'pining_unrequited', 'enemies_to_lovers'],
      safety: ['guaranteed_hea'],
    },
  },
  {
    id: 'grovel-worthy',
    name: 'Grovel Worthy',
    tagline: 'He messed up. Now he crawls.',
    slugs: {
      include: ['alphahole', 'second_chance', 'hurt_comfort'],
    },
  },
];

// ============================================================================
// HOOKS
// ============================================================================

function useTaxonomy() {
  const [data, setData] = useState<VaultTagsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getVaultTags()
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const categoryMap = useMemo(() => {
    if (!data) return new Map<string, VaultTagCategory>();
    return new Map(data.categories.map((c) => [c.slug, c]));
  }, [data]);

  const tagsByCategory = useMemo(() => {
    if (!data) return new Map<string, VaultTag[]>();
    const map = new Map<string, VaultTag[]>();
    data.tags.forEach((tag) => {
      const list = map.get(tag.category) || [];
      list.push(tag);
      map.set(tag.category, list);
    });
    map.forEach((tags) => tags.sort((a, b) => a.display_order - b.display_order));
    return map;
  }, [data]);

  const tagById = useMemo(() => {
    if (!data) return new Map<string, VaultTag>();
    return new Map(data.tags.map((t) => [t.id, t]));
  }, [data]);

  const tagBySlug = useMemo(() => {
    if (!data) return new Map<string, VaultTag>();
    return new Map(data.tags.map((t) => [t.slug, t]));
  }, [data]);

  return { data, loading, error, categoryMap, tagsByCategory, tagById, tagBySlug };
}

function useFilterState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: FilterState = useMemo(() => ({
    query: searchParams.get('q') || '',
    include: searchParams.get('include')?.split(',').filter(Boolean) || [],
    exclude: searchParams.get('exclude')?.split(',').filter(Boolean) || [],
    safety: searchParams.get('safety')?.split(',').filter(Boolean) || [],
    kindleUnlimited: searchParams.get('ku') === '1',
    hiddenGemsOnly: searchParams.get('gems') === '1',
    sort: (searchParams.get('sort') as FilterState['sort']) || 'newest',
  }), [searchParams]);

  const setFilters = useCallback((updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    const params = new URLSearchParams();

    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.include.length) params.set('include', newFilters.include.join(','));
    if (newFilters.exclude.length) params.set('exclude', newFilters.exclude.join(','));
    if (newFilters.safety.length) params.set('safety', newFilters.safety.join(','));
    if (newFilters.kindleUnlimited) params.set('ku', '1');
    if (newFilters.hiddenGemsOnly) params.set('gems', '1');
    if (newFilters.sort !== 'newest') params.set('sort', newFilters.sort);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const toggleTag = useCallback((tagId: string, _isSingleSelect: boolean, isExclude: boolean = false) => {
    const key = isExclude ? 'exclude' : 'include';
    const current = filters[key];

    if (current.includes(tagId)) {
      setFilters({ [key]: current.filter((id) => id !== tagId) });
    } else {
      setFilters({ [key]: [...current, tagId] });
    }
  }, [filters, setFilters]);

  const toggleSafety = useCallback((tagId: string) => {
    const current = filters.safety;
    if (current.includes(tagId)) {
      setFilters({ safety: current.filter((id) => id !== tagId) });
    } else {
      setFilters({ safety: [...current, tagId] });
    }
  }, [filters, setFilters]);

  const clearAll = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const applyPreset = useCallback((include: string[], safety: string[]) => {
    setFilters({
      query: '',
      include,
      exclude: [],
      safety,
      kindleUnlimited: false,
      hiddenGemsOnly: false,
      sort: 'newest',
    });
  }, [setFilters]);

  return { filters, setFilters, toggleTag, toggleSafety, clearAll, applyPreset };
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface ChipProps {
  tag: VaultTag;
  selected: boolean;
  onToggle: () => void;
  isPremiumUser: boolean;
  isExclude?: boolean;
  onPremiumClick?: () => void;
}

function Chip({ tag, selected, onToggle, isPremiumUser, isExclude, onPremiumClick }: ChipProps) {
  // Check both API is_premium flag AND frontend PREMIUM_CATEGORIES override
  const isPremiumTag = tag.is_premium || PREMIUM_CATEGORIES.has(tag.category);
  const locked = isPremiumTag && !isPremiumUser;

  const handleClick = () => {
    if (locked && onPremiumClick) {
      onPremiumClick();
    } else {
      onToggle();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        vault-chip
        ${selected ? (isExclude ? 'vault-chip--exclude' : 'vault-chip--selected') : ''}
        ${locked ? 'vault-chip--locked' : ''}
      `}
      title={tag.description || undefined}
    >
      <span>{tag.display_name}</span>
      {locked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )}
    </button>
  );
}

interface SafetyShieldProps {
  tag: VaultTag;
  selected: boolean;
  onToggle: () => void;
}

function SafetyShield({ tag, selected, onToggle }: SafetyShieldProps) {
  return (
    <button
      onClick={onToggle}
      className={`vault-shield ${selected ? 'vault-shield--active' : ''}`}
    >
      <div className="vault-shield__check">
        {selected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <div className="vault-shield__content">
        <div className="vault-shield__name">{tag.display_name}</div>
        {tag.description && (
          <div className="vault-shield__desc">{tag.description}</div>
        )}
      </div>
    </button>
  );
}

interface PresetCardProps {
  preset: Preset;
  active: boolean;
  onApply: () => void;
}

function PresetCard({ preset, active, onApply }: PresetCardProps) {
  return (
    <button
      onClick={onApply}
      className={`vault-preset ${active ? 'vault-preset--active' : ''}`}
    >
      <div className="vault-preset__name">{preset.name}</div>
      <div className="vault-preset__tagline">{preset.tagline}</div>
    </button>
  );
}

interface SectionHeaderProps {
  category: VaultTagCategory;
  expanded: boolean;
  onToggle: () => void;
  filterCount: number;
}

function SectionHeader({ category, expanded, onToggle, filterCount }: SectionHeaderProps) {
  return (
    <button onClick={onToggle} className="vault-section__header">
      <div className="vault-section__title">
        <span>{category.display_name}</span>
        {filterCount > 0 && (
          <span className="vault-section__count">{filterCount}</span>
        )}
        {(category.is_premium || PREMIUM_CATEGORIES.has(category.slug)) && (
          <span className="vault-section__premium">Premium</span>
        )}
      </div>
      <svg
        className={`vault-section__chevron ${expanded ? 'vault-section__chevron--open' : ''}`}
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );
}

interface TierHeaderProps {
  name: string;
  expanded: boolean;
  onToggle: () => void;
  filterCount: number;
}

function TierHeader({ name, expanded, onToggle, filterCount }: TierHeaderProps) {
  return (
    <button onClick={onToggle} className={`vault-tier__header ${expanded ? 'vault-tier__header--open' : ''}`}>
      <div className="vault-tier__title">
        <span>{name}</span>
        {filterCount > 0 && (
          <span className="vault-tier__count">{filterCount}</span>
        )}
      </div>
      <svg
        className={`vault-tier__chevron ${expanded ? 'vault-tier__chevron--open' : ''}`}
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
  );
}

interface ActiveFiltersBarProps {
  filters: FilterState;
  tagById: Map<string, VaultTag>;
  onRemove: (tagId: string, type: 'include' | 'exclude' | 'safety') => void;
  onClear: () => void;
}

function ActiveFiltersBar({ filters, tagById, onRemove, onClear }: ActiveFiltersBarProps) {
  const allActive = [
    ...filters.include.map((id) => ({ id, type: 'include' as const })),
    ...filters.exclude.map((id) => ({ id, type: 'exclude' as const })),
    ...filters.safety.map((id) => ({ id, type: 'safety' as const })),
  ];

  if (allActive.length === 0) return null;

  return (
    <div className="vault-active">
      <span className="vault-active__label">Active ({allActive.length})</span>
      <div className="vault-active__tags">
        {allActive.slice(0, 8).map(({ id, type }) => {
          const tag = tagById.get(id);
          if (!tag) return null;
          return (
            <span
              key={id}
              className={`vault-active__tag ${type === 'exclude' ? 'vault-active__tag--exclude' : ''}`}
            >
              {tag.display_name}
              <button onClick={() => onRemove(id, type)} className="vault-active__remove">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          );
        })}
        {allActive.length > 8 && (
          <span className="vault-active__more">+{allActive.length - 8}</span>
        )}
      </div>
      <button onClick={onClear} className="vault-active__clear">Clear All</button>
    </div>
  );
}

interface ContentWarningSectionProps {
  tags: VaultTag[];
  selectedIds: string[];
  onToggle: (tagId: string) => void;
  isPremiumUser: boolean;
}

function ContentWarningSection({ tags, selectedIds, onToggle, isPremiumUser }: ContentWarningSectionProps) {
  const tagBySlug = useMemo(() => new Map(tags.map((t) => [t.slug, t])), [tags]);

  return (
    <div className="vault-cw">
      {Object.entries(CW_DISPLAY_GROUPS).map(([groupName, slugs]) => {
        const groupTags = slugs.map((slug) => tagBySlug.get(slug)).filter(Boolean) as VaultTag[];
        if (groupTags.length === 0) return null;

        return (
          <div key={groupName} className="vault-cw__group">
            <div className="vault-cw__group-name">{groupName}</div>
            <div className="vault-cw__chips">
              {groupTags.map((tag) => (
                <Chip
                  key={tag.id}
                  tag={tag}
                  selected={selectedIds.includes(tag.id)}
                  onToggle={() => onToggle(tag.id)}
                  isPremiumUser={isPremiumUser}
                  isExclude
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface BookCardProps {
  book: BookListItem;
}

function BookCard({ book }: BookCardProps) {
  return (
    <Link to={`/books/${book.slug}`} className="vault-card">
      <div
        className="vault-card__cover"
        style={book.coverUrl ? { backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />
      <div className="vault-card__info">
        <h3 className="vault-card__title">{book.title}</h3>
        <p className="vault-card__author">
          {book.authors.map(a => a.name).join(', ') || 'Unknown Author'}
        </p>
      </div>
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BooksPage() {
  const { isPaid, requirePaid } = useMe();
  const { loading, error, categoryMap, tagsByCategory, tagById, tagBySlug } = useTaxonomy();
  const { filters, setFilters, toggleTag, toggleSafety, clearAll, applyPreset } = useFilterState();

  const [expandedTiers, setExpandedTiers] = useState<string[]>(['essential']);
  const [expandedSections, setExpandedSections] = useState<string[]>(['world_framework', 'pairing', 'heat_level', 'safety']);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Books state
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);

  // Handle premium click - show modal on standalone, use Ghost portal on bookshook.com
  const handlePremiumClick = useCallback(() => {
    if (window.location.hostname.includes('bookshook.com')) {
      requirePaid();
    } else {
      setShowUpgradeModal(true);
    }
  }, [requirePaid]);

  // Debounced search
  const [searchInput, setSearchInput] = useState(filters.query);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.query) {
        setFilters({ query: searchInput });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, filters.query, setFilters]);

  // Fetch books when filters change
  useEffect(() => {
    setBooksLoading(true);
    // Convert tag IDs to slugs for API
    const tagSlugs: string[] = [];
    filters.include.forEach(id => {
      const tag = tagById.get(id);
      if (tag) tagSlugs.push(tag.slug);
    });

    getBooks({
      q: filters.query || undefined,
      tags: tagSlugs.length > 0 ? tagSlugs : undefined,
      page: 1,
      pageSize: 24,
    })
      .then((res) => {
        setBooks(res.items);
        setTotalBooks(res.total);
        setBooksLoading(false);
      })
      .catch(() => {
        setBooksLoading(false);
      });
  }, [filters.query, filters.include, filters.exclude, filters.safety, tagById]);

  // Count filters in category
  const countCategoryFilters = useCallback((categorySlug: string) => {
    const tags = tagsByCategory.get(categorySlug) || [];
    const tagIds = tags.map((t) => t.id);
    return filters.include.filter((id) => tagIds.includes(id)).length +
           filters.exclude.filter((id) => tagIds.includes(id)).length +
           filters.safety.filter((id) => tagIds.includes(id)).length;
  }, [tagsByCategory, filters]);

  // Count filters in tier
  const countTierFilters = useCallback((tierKey: string) => {
    const tier = FILTER_TIERS[tierKey];
    return tier.categories.reduce((sum, cat) => sum + countCategoryFilters(cat), 0);
  }, [countCategoryFilters]);

  // Total active
  const totalActive = filters.include.length + filters.exclude.length + filters.safety.length;

  // Handle tag toggle with single-select awareness
  const handleTagToggle = useCallback((tag: VaultTag, isExclude: boolean = false) => {
    const category = categoryMap.get(tag.category);
    const isSingleSelect = category?.single_select || false;

    if (isSingleSelect && !isExclude) {
      const categoryTags = tagsByCategory.get(tag.category) || [];
      const categoryIds = categoryTags.map((t) => t.id);
      const filtered = filters.include.filter((id) => !categoryIds.includes(id));

      if (filters.include.includes(tag.id)) {
        setFilters({ include: filtered });
      } else {
        setFilters({ include: [...filtered, tag.id] });
      }
    } else {
      toggleTag(tag.id, false, isExclude);
    }
    setActivePreset(null);
  }, [categoryMap, tagsByCategory, filters.include, setFilters, toggleTag]);

  const handlePresetApply = useCallback((preset: Preset) => {
    setActivePreset(preset.id);

    const slugsToIds = (slugs: string[] = []) =>
      slugs.map((s) => tagBySlug.get(s)?.id).filter(Boolean) as string[];

    const includeIds = slugsToIds(preset.slugs.include);
    const safetyIds = slugsToIds(preset.slugs.safety);

    applyPreset(includeIds, safetyIds);
  }, [tagBySlug, applyPreset]);

  const handleRemoveActive = useCallback((tagId: string, type: 'include' | 'exclude' | 'safety') => {
    if (type === 'safety') {
      setFilters({ safety: filters.safety.filter((id) => id !== tagId) });
    } else if (type === 'exclude') {
      setFilters({ exclude: filters.exclude.filter((id) => id !== tagId) });
    } else {
      setFilters({ include: filters.include.filter((id) => id !== tagId) });
    }
    setActivePreset(null);
  }, [filters, setFilters]);

  // Render section content
  const renderSectionContent = useCallback((categorySlug: string) => {
    const category = categoryMap.get(categorySlug);
    const tags = tagsByCategory.get(categorySlug) || [];
    if (!category || tags.length === 0) return null;

    const tierConfig = Object.values(FILTER_TIERS).find((t) => t.categories.includes(categorySlug));
    const isExclude = tierConfig?.isExclude || false;

    // Safety shields get special treatment
    if (categorySlug === 'safety') {
      return (
        <div className="vault-shields">
          {tags.map((tag) => (
            <SafetyShield
              key={tag.id}
              tag={tag}
              selected={filters.safety.includes(tag.id)}
              onToggle={() => {
                toggleSafety(tag.id);
                setActivePreset(null);
              }}
            />
          ))}
        </div>
      );
    }

    // Content warnings get grouped display
    if (categorySlug === 'content_warning') {
      return (
        <ContentWarningSection
          tags={tags}
          selectedIds={filters.exclude}
          onToggle={(id) => {
            toggleTag(id, false, true);
            setActivePreset(null);
          }}
          isPremiumUser={isPaid}
        />
      );
    }

    // Standard chip grid
    return (
      <div className="vault-chips">
        {tags.map((tag) => (
          <Chip
            key={tag.id}
            tag={tag}
            selected={
              isExclude
                ? filters.exclude.includes(tag.id)
                : filters.include.includes(tag.id)
            }
            onToggle={() => handleTagToggle(tag, isExclude)}
            isPremiumUser={isPaid}
            isExclude={isExclude}
            onPremiumClick={handlePremiumClick}
          />
        ))}
      </div>
    );
  }, [categoryMap, tagsByCategory, filters, isPaid, toggleSafety, toggleTag, handleTagToggle, handlePremiumClick]);

  if (loading) {
    return <div className="vault-loading">Loading taxonomy...</div>;
  }

  if (error) {
    return <div className="vault-error">Failed to load filters. Please refresh.</div>;
  }

  return (
    <div className="vault">
      {/* Hero */}
      <header className="vault-hero">
        <p className="vault-hero__eyebrow">The Vault</p>
        <h1 className="vault-hero__title">
          Find Your Next <em>Obsession</em>
        </h1>
        <p className="vault-hero__sub">
          {totalActive > 0
            ? `Filtering by ${totalActive} criteria`
            : '200+ tags. Every trope. Every vibe.'
          }
        </p>
      </header>

      {/* How This Works */}
      <div className="vault-howto">
        <details className="vault-howto__details">
          <summary className="vault-howto__summary">
            <span>How This Works</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </summary>
          <div className="vault-howto__content">
            <div className="vault-howto__grid">
              <div className="vault-howto__item">
                <div className="vault-howto__icon">1</div>
                <h3>Pick a Mood</h3>
                <p>Start with a preset like "Devastate Me" or "Comfort Read" to instantly filter by vibe, or build your own from scratch.</p>
              </div>
              <div className="vault-howto__item">
                <div className="vault-howto__icon">2</div>
                <h3>Stack Your Filters</h3>
                <p>Mix and match from 200+ tags across tropes, archetypes, heat levels, and representation. The more specific, the better the match.</p>
              </div>
              <div className="vault-howto__item">
                <div className="vault-howto__icon">3</div>
                <h3>Set Your Shields</h3>
                <p>Use Safety Shields to guarantee HEA, avoid cheating, or filter out content warnings. Your boundaries, your rules.</p>
              </div>
              <div className="vault-howto__item">
                <div className="vault-howto__icon">4</div>
                <h3>Share Your Search</h3>
                <p>Your filters are saved in the URL. Copy and share your perfect search with friends, or bookmark it for later.</p>
              </div>
            </div>
            <div className="vault-howto__premium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Tags marked with a lock are <strong>Premium</strong> features for BookShook members.</span>
            </div>
          </div>
        </details>
      </div>

      {/* Search */}
      <div className="vault-search">
        <div className="vault-search__box">
          <svg className="vault-search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, author, trope..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="vault-search__input"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`vault-search__toggle ${showFilters ? 'vault-search__toggle--active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          Filters
          {totalActive > 0 && (
            <span className="vault-search__badge">{totalActive}</span>
          )}
        </button>
      </div>

      {/* Presets */}
      {showFilters && (
        <div className="vault-presets">
          {PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              active={activePreset === preset.id}
              onApply={() => handlePresetApply(preset)}
            />
          ))}
        </div>
      )}

      {/* Main Layout */}
      <div className={`vault-layout ${showFilters ? '' : 'vault-layout--collapsed'}`}>
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="vault-sidebar">
            <ActiveFiltersBar
              filters={filters}
              tagById={tagById}
              onRemove={handleRemoveActive}
              onClear={() => {
                clearAll();
                setActivePreset(null);
              }}
            />

            {/* Tiers */}
            {Object.entries(FILTER_TIERS).map(([tierKey, tier]) => {
              // Skip tiers where no categories have tags
              const categoriesWithTags = tier.categories.filter((slug) => {
                const tags = tagsByCategory.get(slug);
                return tags && tags.length > 0;
              });
              if (categoriesWithTags.length === 0) return null;

              const tierExpanded = expandedTiers.includes(tierKey);
              const tierCount = countTierFilters(tierKey);

              return (
                <div key={tierKey} className="vault-tier">
                  <TierHeader
                    name={tier.name}
                    expanded={tierExpanded}
                    onToggle={() => setExpandedTiers((prev) =>
                      prev.includes(tierKey)
                        ? prev.filter((t) => t !== tierKey)
                        : [...prev, tierKey]
                    )}
                    filterCount={tierCount}
                  />

                  {tierExpanded && (
                    <div className="vault-tier__content">
                      {tier.categories.map((categorySlug) => {
                        const category = categoryMap.get(categorySlug);
                        const tags = tagsByCategory.get(categorySlug);
                        // Skip categories with no tags
                        if (!category || !tags || tags.length === 0) return null;

                        const sectionExpanded = expandedSections.includes(categorySlug);
                        const sectionCount = countCategoryFilters(categorySlug);

                        return (
                          <div key={categorySlug} className="vault-section">
                            <SectionHeader
                              category={category}
                              expanded={sectionExpanded}
                              onToggle={() => setExpandedSections((prev) =>
                                prev.includes(categorySlug)
                                  ? prev.filter((s) => s !== categorySlug)
                                  : [...prev, categorySlug]
                              )}
                              filterCount={sectionCount}
                            />

                            {sectionExpanded && renderSectionContent(categorySlug)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>
        )}

        {/* Results */}
        <main className="vault-results">
          <div className="vault-results__header">
            <span className="vault-results__count">
              {booksLoading ? (
                'Loading...'
              ) : (
                <><strong>{totalBooks}</strong> books found</>
              )}
            </span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value as FilterState['sort'] })}
              className="vault-results__sort"
            >
              <option value="newest">Newest</option>
              <option value="grovel">Grovel Index</option>
              <option value="regret_low">Reader Regret (Low)</option>
              <option value="heat">Heat Level</option>
            </select>
            {totalActive > 0 && (
              <button
                type="button"
                className="vault-results__share"
                onClick={() => setShowShareModal(true)}
              >
                Share
              </button>
            )}
          </div>

          <div className="vault-grid">
            {booksLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="vault-card vault-card--loading">
                  <div className="vault-card__cover" />
                  <div className="vault-card__info">
                    <div className="vault-card__title">Loading...</div>
                    <div className="vault-card__author"></div>
                  </div>
                </div>
              ))
            ) : books.length > 0 ? (
              books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            ) : (
              <div className="vault-empty">
                <p>No books found matching your filters.</p>
                <div className="vault-empty__actions">
                  <button onClick={clearAll} className="vault-empty__clear">
                    Clear all filters
                  </button>
                  {totalActive > 0 && (
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="vault-empty__share"
                    >
                      Share this search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="vault-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="vault-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="vault-modal__close"
              onClick={() => setShowUpgradeModal(false)}
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="vault-modal__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="vault-modal__title">Premium Feature</h2>
            <p className="vault-modal__text">
              This filter is available exclusively to BookShook members.
              Unlock advanced filters, kink tags, and more with a membership.
            </p>
            <a
              href="https://bookshook.com/#/portal/signup"
              className="vault-modal__cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Become a Member
            </a>
            <button
              className="vault-modal__dismiss"
              onClick={() => setShowUpgradeModal(false)}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          filters={filters}
          tagById={tagById}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
