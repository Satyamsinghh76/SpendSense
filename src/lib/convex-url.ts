const PROD_CONVEX_URL = "https://tremendous-ibex-26.convex.cloud";

export function getConvexUrl() {
  const configuredUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (import.meta.env.PROD) {
    return PROD_CONVEX_URL;
  }
  return configuredUrl || PROD_CONVEX_URL;
}