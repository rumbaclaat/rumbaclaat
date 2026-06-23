/**
 * Build-phase flags. These intentionally LOOSEN security so the client can
 * click through and submit pages without auth while we build. They MUST all be
 * turned off before launch.
 */

// When true, /admin and the trade portal are accessible WITHOUT signing in
// (a placeholder super-admin / demo trade account is used).
export const DEV_OPEN_ACCESS = true;
