import heroImg from "@/assets/hero-bg-home.jpg";
import logoImg from "@/assets/home-logo.png";

/**
 * Homepage SEO — title, description, canonical, Open Graph, Twitter and
 * structured data for https://zoventro.com/. The canonical points Google at the
 * HTTPS homepage URL, so the http:// and other variants are treated as this one
 * page. Tags with the same name/property as the root route's override them on
 * the homepage only.
 */
export const HOME_CANONICAL_URL = "https://zoventro.com/";

const SITE_NAME = "Zoventro";
const TITLE = "Zoventro — Interactive Team Engagement Platform";
const DESCRIPTION =
  "Interactive team games like Mystery Quest and Cook & Create. Built for HR, designed for real engagement. Set up in minutes, no IT required.";
const SHORT_TITLE = "Zoventro — Interactive Team Engagement";
const SHORT_DESCRIPTION = "Boost engagement, collaboration and energy without complicated setups.";

// Bundled assets resolve to site paths; social crawlers need absolute URLs.
const absolute = (assetPath: string) => new URL(assetPath, HOME_CANONICAL_URL).toString();
const SHARE_IMAGE = absolute(heroImg);
const SHARE_IMAGE_ALT = "Zoventro — interactive team engagement games for HR";

/** Meta tags for the homepage route's head(). */
export const homeSeoMeta = [
  { title: TITLE },
  { name: "description", content: DESCRIPTION },
  {
    name: "keywords",
    content:
      "team engagement, team building games, corporate team activities, virtual team games, HR engagement platform, Mystery Quest, Cook & Create",
  },
  { name: "author", content: SITE_NAME },
  { name: "robots", content: "index, follow" },

  // Open Graph (Facebook, LinkedIn, WhatsApp, …)
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: SITE_NAME },
  { property: "og:url", content: HOME_CANONICAL_URL },
  { property: "og:title", content: SHORT_TITLE },
  { property: "og:description", content: SHORT_DESCRIPTION },
  { property: "og:image", content: SHARE_IMAGE },
  { property: "og:image:alt", content: SHARE_IMAGE_ALT },
  { property: "og:locale", content: "en_IN" },

  // Twitter / X
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: SHORT_TITLE },
  { name: "twitter:description", content: SHORT_DESCRIPTION },
  { name: "twitter:image", content: SHARE_IMAGE },
  { name: "twitter:image:alt", content: SHARE_IMAGE_ALT },
];

/** Head links for the homepage route (rendered server-side by its head()). */
export const homeSeoLinks = [{ rel: "canonical", href: HOME_CANONICAL_URL }];

/** Structured data (JSON-LD) so Google knows the site name and organisation. */
export const homeSeoScripts = [
  {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: SITE_NAME,
          url: HOME_CANONICAL_URL,
          logo: absolute(logoImg),
        },
        {
          "@type": "WebSite",
          name: SITE_NAME,
          url: HOME_CANONICAL_URL,
          description: DESCRIPTION,
        },
      ],
    }),
  },
];
