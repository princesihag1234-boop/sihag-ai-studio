"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SITE_URL = "https://sihag-ai-studio.pages.dev/";
const SITE_TITLE = "SIHAG AI STUDIO — Free Online Photo Editor";
const SITE_TEXT =
  "Edit photos online with layers, text, brush tools, adjustments, filters, masks, retouching, and export tools.";

const links = [
  { href: "/photo-editor/", label: "Photo Editor" },
  { href: "/crop-image/", label: "Crop Image" },
  { href: "/resize-image/", label: "Resize Image" },
  { href: "/add-text-to-photo/", label: "Add Text to Photo" },
  { href: "/image-filters/", label: "Image Filters" },
  { href: "/about/", label: "About" },
  { href: "/help/", label: "Help & Guide" },
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/terms/", label: "Terms of Use" },
];

type ShareStatus = "idle" | "copied" | "error";

function legacyCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }

  return copied;
}

export default function SiteLinks() {
  const pathname = usePathname();
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");

  if (pathname !== "/") {
    return null;
  }

  function showStatus(status: ShareStatus, duration: number) {
    setShareStatus(status);
    window.setTimeout(() => setShareStatus("idle"), duration);
  }

  async function copySiteLink() {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(SITE_URL);
        showStatus("copied", 1800);
        return true;
      }
    } catch {
      // Fall through to the legacy copy method below.
    }

    try {
      if (legacyCopy(SITE_URL)) {
        showStatus("copied", 1800);
        return true;
      }
    } catch {
      // Report failure below.
    }

    showStatus("error", 2200);
    return false;
  }

  async function shareSite() {
    setShareStatus("idle");

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({
          title: SITE_TITLE,
          text: SITE_TEXT,
          url: SITE_URL,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        // Some browsers expose navigator.share but reject a particular
        // share request. Copying the production URL is a useful fallback.
      }
    }

    await copySiteLink();
  }

  return (
    <div className="fixed bottom-3 right-3 z-[9999]">
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/10 bg-[#11151c]/95 px-3 py-2 text-xs font-medium text-zinc-300 shadow-2xl shadow-black/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-[#171c25] hover:text-white [&::-webkit-details-marker]:hidden">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-white/10 text-[10px] font-bold text-white">
            S
          </span>
          <span>Site</span>
          <span className="text-[10px] text-zinc-600 transition group-open:rotate-180">
            ▲
          </span>
        </summary>

        <div className="absolute bottom-[calc(100%+8px)] right-0 max-h-[70vh] w-56 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1117]/98 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="border-b border-white/10 px-3 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              SIHAG AI STUDIO
            </p>
          </div>

          <button
            type="button"
            onClick={shareSite}
            className="mt-2 flex w-full items-center justify-between rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-2 text-left text-xs font-medium text-cyan-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/[0.1]"
          >
            <span>
              {shareStatus === "copied"
                ? "Link copied"
                : shareStatus === "error"
                  ? "Copy failed"
                  : "Share SIHAG AI STUDIO"}
            </span>
            <span aria-hidden="true" className="text-[11px] text-cyan-300">
              ↗
            </span>
          </button>

          <nav className="mt-2 space-y-1" aria-label="Public site links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </details>
    </div>
  );
}
