declare const process: {
  env: Record<string, string | undefined>;
};

const siteUrl =
  process.env.SITE_URL ??
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
