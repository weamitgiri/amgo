/**
 * Homepage SEO. The canonical points Google at the HTTPS homepage URL, so the
 * http:// and other variants are treated as this one page.
 */
export const HOME_CANONICAL_URL = "https://zoventro.com/";

/** Head links for the homepage route (rendered server-side by its head()). */
export const homeSeoLinks = [{ rel: "canonical", href: HOME_CANONICAL_URL }];
