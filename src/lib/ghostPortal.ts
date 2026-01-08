type PortalAction = "signin" | "signup" | "account";

/**
 * Ghost Portal is typically opened via hash routes like:
 *   #/portal/signin
 *   #/portal/signup
 *   #/portal/account
 *
 * We keep this resilient by trying any known globals first,
 * then falling back to the hash route.
 */
export function openGhostPortal(action: PortalAction) {
  const w = window as any;

  // Some installs expose helper objects; harmless if missing.
  if (w.GhostPortal && typeof w.GhostPortal.open === "function") {
    try {
      w.GhostPortal.open();
      return;
    } catch {
      // fall through
    }
  }

  // Default + reliable
  window.location.hash = `#/portal/${action}`;
}
