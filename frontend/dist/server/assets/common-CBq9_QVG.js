import "clsx";
const COOK_AND_CREATE_SLUGS = ["cook-and-create", "cook-create", "cookandcreate", "cook_create"];
function isCookAndCreateSlug(slug) {
  if (!slug) return false;
  const s = slug.trim().toLowerCase();
  return COOK_AND_CREATE_SLUGS.some((c) => s === c) || s.startsWith("cook");
}
function resolveLobbyRoute(slug) {
  const baseSearch = {};
  baseSearch.game = slug;
  if (isCookAndCreateSlug(slug)) {
    return { to: "/cookandcreate/lobby", search: baseSearch };
  }
  return { to: "/lobby", search: baseSearch };
}
function resolveGameRoute(slug) {
  const baseSearch = {};
  if (slug) baseSearch.game = slug;
  if (isCookAndCreateSlug(slug)) {
    return { to: "/cookandcreate/game", search: baseSearch };
  }
  return { to: "/game", search: baseSearch };
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export {
  isCookAndCreateSlug as a,
  resolveLobbyRoute as b,
  isValidEmail as i,
  resolveGameRoute as r
};
