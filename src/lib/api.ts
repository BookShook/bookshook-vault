/* ─────────────────────────────────────────────────────────
   API client – talks to /api/* on the same origin (Worker)
   ───────────────────────────────────────────────────────── */

// In production (Cloudflare Pages), call the Worker via bookshook.com
// In development, Vite proxies /api to localhost:8787
const API_BASE = import.meta.env.PROD
  ? "https://bookshook.com"
  : "";

// ───────────────────────────── Types ─────────────────────────────

export type MeResponse =
  | { isAuthenticated: false }
  | {
      isAuthenticated: true;
      ghostMemberId: string;
      email?: string;
      name?: string | null;
      status?: string;
      tiers: Array<{ id?: string; name?: string; slug?: string }>;
      isPaid: boolean;
    };

// New Vault API types
export type VaultTag = {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  category: string;
  parent_tag_id: string | null;
  is_premium: boolean;
  sensitive_flag: boolean;
  display_order: number;
};

export type VaultTagCategory = {
  slug: string;
  display_name: string;
  description: string | null;
  single_select: boolean;
  is_premium: boolean;
  display_order: number;
};

export type VaultTagsResponse = {
  categories: VaultTagCategory[];
  tags: VaultTag[];
};

// Legacy types (for backward compatibility)
export type Tag = {
  id: string;
  category: string;
  name: string;
  slug: string;
  singleSelect: boolean;
};

export type TagCategory = {
  category: string;
  tags: Tag[];
};

export type TagsResponse = {
  categories: TagCategory[];
};

export type Author = {
  id: string;
  name: string;
  slug: string;
};

export type BookListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  publishedYear: number | null;
  pageCount: number | null;
  authors: Author[];
  tags: Tag[];
};

export type BooksListResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filtersApplied: Record<string, unknown>;
  sort: string;
  items: BookListItem[];
};

export type BookDetail = BookListItem & {
  createdAt: string;
  updatedAt: string;
};

export type BookDetailResponse = {
  book: BookDetail;
};

// ───────────────────────────── Fetchers ─────────────────────────────

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/api/me`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  return (await res.json().catch(() => ({ isAuthenticated: false }))) as MeResponse;
}

export async function getTags(): Promise<TagsResponse> {
  const res = await fetch(`${API_BASE}/api/tags`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch tags");
  return (await res.json()) as TagsResponse;
}

export async function getVaultTags(): Promise<VaultTagsResponse> {
  // Include sensitive tags (kink bundles/details are marked sensitive)
  const res = await fetch(`${API_BASE}/api/tags?include_sensitive=true`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch tags");
  return (await res.json()) as VaultTagsResponse;
}

export type GetBooksParams = {
  q?: string;
  tags?: string[]; // slugs
  page?: number;
  pageSize?: number;
};

export async function getBooks(params: GetBooksParams = {}): Promise<BooksListResponse> {
  const url = new URL(`${API_BASE}/api/books`, window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.tags && params.tags.length > 0) {
    url.searchParams.set("tags", params.tags.join(","));
  }
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch books");
  return (await res.json()) as BooksListResponse;
}

export async function getBookBySlug(slug: string): Promise<BookDetailResponse> {
  const res = await fetch(`${API_BASE}/api/books/${encodeURIComponent(slug)}`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Book not found");
  return (await res.json()) as BookDetailResponse;
}

// ───────────────────────────── Premium Types ─────────────────────────────

export type InteractionType = "heart" | "save" | "tbr" | "blacklist_book" | "blacklist_author";

export type BookInteractions = {
  heart?: boolean;
  save?: boolean;
  tbr?: boolean;
};

export type BookInteractionsResponse = {
  bookId: string;
  interactions: BookInteractions;
};

export type LibraryItem = {
  book: BookListItem;
  interactionType?: string;
  createdAt?: string;
};

export type MyLibraryResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filter?: string;
  items: LibraryItem[];
};

export type RecommendationItem = {
  book: BookListItem;
  score?: number;
  reasons?: string[];
};

export type RecommendationsResponse = {
  items?: BookListItem[];
  recommendations?: RecommendationItem[];
  message?: string;
};

// ───────────────────────────── Premium Fetchers ─────────────────────────────

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function getBookInteractions(bookId: string): Promise<BookInteractionsResponse> {
  const res = await fetch(`${API_BASE}/api/interactions/${encodeURIComponent(bookId)}`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch interactions", body);
  }
  return (await res.json()) as BookInteractionsResponse;
}

export async function postInteraction(payload: {
  type: InteractionType;
  bookId: string;
  note?: string;
  rating?: number;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/interactions`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to save interaction", body);
  }
  return res.json();
}

export async function deleteInteraction(payload: {
  type: InteractionType;
  bookId: string;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/interactions`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to delete interaction", body);
  }
  return res.json();
}

export type GetMyLibraryParams = {
  filter?: string; // "all" | "heart" | "save" | "tbr"
  page?: number;
  pageSize?: number;
};

export async function getMyLibrary(params: GetMyLibraryParams = {}): Promise<MyLibraryResponse> {
  const url = new URL(`${API_BASE}/api/my/library`, window.location.origin);
  if (params.filter) url.searchParams.set("filter", params.filter);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch library", body);
  }
  return (await res.json()) as MyLibraryResponse;
}

export async function getRecommendations(): Promise<RecommendationsResponse> {
  const res = await fetch(`${API_BASE}/api/recommendations`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch recommendations", body);
  }
  return (await res.json()) as RecommendationsResponse;
}

// ───────────────────────────── Author Portal Types ─────────────────────────────

export type AuthorMeResponse =
  | { isAuthenticated: false }
  | {
      isAuthenticated: true;
      author_account_id: string;
      author_id: string;
      email: string;
      display_name: string | null;
      status: string;
      created_at: string;
      csrf: string;
    };

export type AuthorLoginResponse = {
  author_account_id: string;
  author_id: string;
  email: string;
  csrf: string;
};

export type AuthorBook = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  published_year: number | null;
};

export type AuthorBooksResponse = {
  items: AuthorBook[];
};

export type SubmissionEvidence = {
  chapter?: string;
  page?: string;
  location?: string;
  notes?: string;
};

export type AuthorSubmission = {
  id: string;
  author_account_id: string;
  book_id: string;
  tag_id: string;
  evidence_json: SubmissionEvidence;
  status: "pending" | "approved" | "rejected";
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields from GET /api/author/submissions
  category?: string;
  slug?: string;
  name?: string;
  title?: string;
};

export type AuthorSubmissionsResponse = {
  items: AuthorSubmission[];
};

// ───────────────────────────── Author Portal Fetchers ─────────────────────────────

export async function authorLogin(token: string): Promise<AuthorLoginResponse> {
  const res = await fetch(`${API_BASE}/api/author/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error || "Login failed", body);
  }
  return (await res.json()) as AuthorLoginResponse;
}

export async function authorLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/author/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getAuthorMe(): Promise<AuthorMeResponse> {
  const res = await fetch(`${API_BASE}/api/author/me`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    return { isAuthenticated: false };
  }
  const data = await res.json();
  return {
    isAuthenticated: true,
    ...data.me,
    csrf: data.csrf,
  } as AuthorMeResponse;
}

export async function getAuthorBooks(): Promise<AuthorBooksResponse> {
  const res = await fetch(`${API_BASE}/api/author/books`, {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch author books", body);
  }
  return (await res.json()) as AuthorBooksResponse;
}

export async function submitAuthorTag(
  bookId: string,
  tagId: string,
  evidence: SubmissionEvidence,
  csrfToken: string
): Promise<{ item: AuthorSubmission }> {
  const res = await fetch(`${API_BASE}/api/author/submissions`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ book_id: bookId, tag_id: tagId, evidence }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error || "Submission failed", body);
  }
  return (await res.json()) as { item: AuthorSubmission };
}

export type GetAuthorSubmissionsParams = {
  status?: "pending" | "approved" | "rejected";
};

export async function getAuthorSubmissions(
  params: GetAuthorSubmissionsParams = {}
): Promise<AuthorSubmissionsResponse> {
  const url = new URL(`${API_BASE}/api/author/submissions`, window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch submissions", body);
  }
  return (await res.json()) as AuthorSubmissionsResponse;
}

// ───────────────────────────── Admin Portal Types ─────────────────────────────

export type AdminLoginResponse = {
  ok: boolean;
  csrf: string;
};

export type AdminSubmission = {
  id: string;
  author_account_id: string;
  book_id: string;
  tag_id: string;
  evidence_json: SubmissionEvidence;
  status: "pending" | "approved" | "rejected";
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category: string;
  slug: string;
  tag_name: string;
  title: string;
  author_name: string;
};

export type AdminSubmissionsResponse = {
  items: AdminSubmission[];
};

export type AdminProposal = {
  id: string;
  proposal_type: "assign_existing" | "create_new";
  book_id: string;
  existing_tag_id: string | null;
  proposed_category_key: string | null;
  proposed_name: string | null;
  proposed_slug: string | null;
  rationale: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Vote totals
  upvotes: string;
  downvotes: string;
  total_votes: string;
  upvote_ratio: number;
  // Joined fields
  existing_tag_name: string | null;
  existing_tag_category: string | null;
  book_title: string | null;
};

export type AdminProposalsResponse = {
  items: AdminProposal[];
  eligible_preview: AdminProposal[];
  threshold: { minVotes: number; minRatio: number };
};

// ───────────────────────────── Admin Portal Fetchers ─────────────────────────────

export async function adminLogin(password: string): Promise<AdminLoginResponse> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error || "Login failed", body);
  }
  return (await res.json()) as AdminLoginResponse;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export type GetAdminSubmissionsParams = {
  status?: "pending" | "approved" | "rejected";
};

export async function getAdminSubmissions(
  params: GetAdminSubmissionsParams = {}
): Promise<AdminSubmissionsResponse> {
  const url = new URL(`${API_BASE}/api/admin/author-submissions`, window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch submissions", body);
  }
  return (await res.json()) as AdminSubmissionsResponse;
}

export async function decideSubmission(
  submissionId: string,
  action: "approve" | "reject",
  csrfToken: string,
  reviewerNotes?: string
): Promise<{ ok: boolean; status: string }> {
  const res = await fetch(`${API_BASE}/api/admin/author-submissions/${submissionId}/decide`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ action, reviewer_notes: reviewerNotes }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error || "Decision failed", body);
  }
  return (await res.json()) as { ok: boolean; status: string };
}

export type GetAdminProposalsParams = {
  status?: "pending" | "approved" | "rejected";
};

export async function getAdminProposals(
  params: GetAdminProposalsParams = {}
): Promise<AdminProposalsResponse> {
  const url = new URL(`${API_BASE}/api/admin/proposals`, window.location.origin);
  if (params.status) url.searchParams.set("status", params.status);

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, "Failed to fetch proposals", body);
  }
  return (await res.json()) as AdminProposalsResponse;
}

export async function decideProposal(
  proposalId: string,
  action: "approve" | "reject",
  csrfToken: string,
  rejectionReason?: string
): Promise<{ ok: boolean; status: string }> {
  const res = await fetch(`${API_BASE}/api/admin/proposals/${proposalId}/decide`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ action, rejection_reason: rejectionReason }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error || "Decision failed", body);
  }
  return (await res.json()) as { ok: boolean; status: string };
}

export async function createAuthorInvite(
  authorId: string,
  email: string,
  csrfToken: string,
  displayName?: string
): Promise<{ token: string; expires_hours: number; author_account_id: string }> {
  const res = await fetch(`${API_BASE}/api/admin/authors/invite`, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ author_id: authorId, email, display_name: displayName }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as any).error || "Invite failed", body);
  }
  return await res.json();
}
