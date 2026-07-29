declare const process: {
  env: Record<string, string | undefined>;
};

// CONVEX_SITE_URL is the Convex HTTP site (e.g. https://tremendous-ibex-26.convex.site)
// This is the actual JWT issuer used by @convex-dev/auth — it must match the token's "iss" claim.
// SITE_URL is the frontend URL (Vercel) and should NOT be used here.
const siteUrl =
  process.env.CONVEX_SITE_URL ??
  "http://localhost:5173";
const normalizedSiteUrl = siteUrl.replace(/\/$/, "");

export default {
  providers: [
    {
      domain: normalizedSiteUrl,
      applicationID: "convex",
    },
  ],
};
