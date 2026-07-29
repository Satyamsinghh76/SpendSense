const siteUrl =
  process.env.SITE_URL ??
  process.env.CONVEX_SITE_URL ??
  "http://localhost:5173";

export default {
  providers: [
    {
      domain: siteUrl,
      applicationID: "convex",
    },
  ],
};
