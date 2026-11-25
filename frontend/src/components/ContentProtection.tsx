import { useEffect, useState } from "react";

/**
 * Site-wide content protection.
 *
 * Mounted once at the app root so it covers every page, including content that
 * loads dynamically (React Query / route changes) — the listeners are attached
 * to `document`, so they keep working no matter what re-renders underneath.
 *
 * Honest scope note: a web page cannot truly stop a determined user. OS-level
 * screen capture (macOS Cmd+Shift+3/4, Windows Win+Shift+S) is handled by the
 * operating system before the browser ever sees it, so it cannot be blocked
 * from JavaScript — we only detect the key combos we *can* see (PrintScreen and
 * the browser-reachable ones) and clear the clipboard as a best effort.
 *
 * Form fields stay fully usable on purpose: selection, copy, cut and paste are
 * allowed inside <input>, <textarea> and contenteditable so that legitimate
 * flows (pasting a login code, an email, an OTP) are never broken. Everything
 * that is actual page *content* is protected.
 */

const EDITABLE = (el: EventTarget | null): boolean => {
  const node = el as HTMLElement | null;
  if (!node || !node.closest) return false;
  return !!node.closest(
    'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
  );
};

const PROTECTION_CSS = `
  html.zv-protected, html.zv-protected body {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  /* Keep real form fields selectable/editable. */
  html.zv-protected input,
  html.zv-protected textarea,
  html.zv-protected select,
  html.zv-protected [contenteditable="true"],
  html.zv-protected [contenteditable=""] {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
    -webkit-touch-callout: default;
  }
  html.zv-protected img,
  html.zv-protected svg,
  html.zv-protected video,
  html.zv-protected canvas {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    user-drag: none;
    pointer-events: auto;
  }
  .zv-focus-cover {
    position: fixed;
    inset: 0;
    z-index: 2147483100;
    background: rgba(10, 12, 20, 0.92);
    color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font: 600 15px/1.4 system-ui, -apple-system, sans-serif;
    letter-spacing: 0.02em;
    text-align: center;
    padding: 24px;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
`;

export function ContentProtection() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Inject the stylesheet once.
    const style = document.createElement("style");
    style.id = "zv-protection-style";
    style.textContent = PROTECTION_CSS;
    document.head.appendChild(style);
    document.documentElement.classList.add("zv-protected");

    const blockUnlessEditable = (e: Event) => {
      if (EDITABLE(e.target)) return;
      e.preventDefault();
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // DevTools / view-source.
      if (e.key === "F12") return e.preventDefault();
      if (ctrlOrMeta && e.shiftKey && (k === "i" || k === "j" || k === "c"))
        return e.preventDefault();
      if (ctrlOrMeta && k === "u") return e.preventDefault();

      // Printing.
      if (ctrlOrMeta && k === "p") return e.preventDefault();
      // Save page.
      if (ctrlOrMeta && k === "s" && !EDITABLE(e.target))
        return e.preventDefault();

      // Copy / cut everywhere except form fields.
      if (ctrlOrMeta && (k === "c" || k === "x") && !EDITABLE(e.target))
        return e.preventDefault();

      // Screenshot combos we can observe. OS-level grabs can't be stopped; we
      // best-effort wipe the clipboard so a captured image isn't pasteable.
      const isPrintScreen = e.key === "PrintScreen";
      const macShot = e.metaKey && e.shiftKey && (k === "3" || k === "4" || k === "5");
      const winSnip = e.metaKey && e.shiftKey && k === "s";
      if (isPrintScreen || macShot || winSnip) {
        try {
          navigator.clipboard?.writeText("");
        } catch {
          /* ignore */
        }
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", blockUnlessEditable);
    document.addEventListener("cut", blockUnlessEditable);
    document.addEventListener("dragstart", blockUnlessEditable);
    document.addEventListener("keydown", onKeyDown, true);

    // Focus-loss hide (optional protection #11): cover the page when the window
    // is backgrounded (e.g. an alt-tab to a screen-capture tool).
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", blockUnlessEditable);
      document.removeEventListener("cut", blockUnlessEditable);
      document.removeEventListener("dragstart", blockUnlessEditable);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.documentElement.classList.remove("zv-protected");
      document.getElementById("zv-protection-style")?.remove();
    };
  }, []);

  if (!hidden) return null;
  return (
    <div className="zv-focus-cover" aria-hidden="true">
      Content hidden while this window is not in focus
    </div>
  );
}
