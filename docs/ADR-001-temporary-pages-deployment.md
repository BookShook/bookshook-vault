# ADR-001: Temporary Pages-hosted SPA for Iteration Velocity

## Status
Accepted (Temporary)

## Context
During initial rapid development of the BookShook Vault React frontend, we needed fast iteration cycles without the overhead of integrating with the Ghost theme system. Cloudflare Pages provides instant deployments on every push with preview URLs for each branch.

However, this creates a cross-origin architecture:
- **Frontend:** `bookshook-vault.pages.dev` (Cloudflare Pages)
- **API:** `bookshook.com/api/*` (Cloudflare Workers)

The canonical BookShook architecture expects:
- Ghost(Pro) hosting the site + Members auth
- Vault SPA served at `https://bookshook.com/vault/*`
- API at `https://bookshook.com/api/*`
- All on the same apex domain

## Decision
Temporarily serve the SPA from Cloudflare Pages during development, accepting the cross-origin complexity.

## Consequences

### Negative
- **Cross-site cookies required:** Must use `SameSite=None` + `Secure` for session cookies
- **CORS complexity:** API must allow credentials from Pages origin
- **Browser behavior risk:** Browsers are tightening cross-site cookie restrictions; this architecture may break in future browser updates
- **"Works in some browsers / breaks in others":** Potential inconsistency across browser vendors
- **CSRF becomes critical:** Without same-origin protection, CSRF tokens are the primary defense

### Positive
- **Fast iteration:** Instant preview deployments for every commit
- **Isolated development:** Frontend changes don't require Ghost theme deploys
- **Easy rollback:** Pages maintains deployment history

### Mitigations in Place
1. **Path-restricted cookies:** Admin cookie scoped to `/api/admin`, Author cookie to `/api/author`
2. **CSRF protection:** All state-changing requests require valid CSRF token in header
3. **Routes under /vault/*:** All client routes use `/vault` basename for future compatibility

## Exit Criteria
Migrate to canonical architecture before:
- [ ] Premium tier rollout
- [ ] Scaling author/admin access beyond beta users
- [ ] Any production issues related to cross-site cookies

## Migration Path

### Option A: Ghost Theme Integration (Recommended)
1. Build frontend assets into Ghost theme under `/assets/vault/`
2. Create Ghost page at `/vault/` with mount point and script tags
3. Ghost serves HTML shell; SPA handles routing under `/vault/*`
4. Update cookies to `SameSite=Lax`, remove CORS configuration

### Option B: Same-Origin Proxy
1. Keep Pages as asset origin
2. Configure Cloudflare to proxy `bookshook.com/vault/*` to Pages
3. Browser sees single origin
4. Update cookies to `SameSite=Lax`

## Related
- Canonical architecture spec (internal)
- Cookie security considerations
- Ghost theme development guide

## Date
2026-01-08
