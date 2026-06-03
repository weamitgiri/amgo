export const AVATAR_TONES = [
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
] as const;

export function avatarTone(index: number): string {
  return AVATAR_TONES[index % AVATAR_TONES.length];
}

export const MEMBER_AVATAR_COLORS = [
  "bg-amber-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-orange-200",
  "bg-emerald-200",
] as const;
