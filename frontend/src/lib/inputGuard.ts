import type { ClipboardEvent } from "react";

/**
 * Props that block copy / cut / paste on a single input or textarea.
 *
 * Used ONLY on the in-game answer/question/accusation/step/dish-name fields of
 * Mystery Quest and Cook & Create so players can't paste prepared text or copy
 * others' answers out. Deliberately not applied to login, registration, HR or
 * any other field — spread it element-by-element where wanted, nothing global.
 */
const block = (e: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  e.preventDefault();

export const noPasteCopyProps = {
  onPaste: block,
  onCopy: block,
  onCut: block,
} as const;
