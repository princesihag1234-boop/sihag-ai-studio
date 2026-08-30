"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/photo-editor/", label: "Photo Editor" },
  { href: "/crop-image/", label: "Crop Image" },
  { href: "/resize-image/", label: "Resize Image" },
  { href: "/about/", label: "About" },
  { href: "/help/", label: "Help & Guide" },
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/terms/", label: "Terms of Use" },
];

export default function SiteLinks() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
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

        <div className="absolute bottom-[calc(100%+8px)] right-0 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]/98 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="border-b border-white/10 px-3 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              SIHAG AI STUDIO
            </p>
          </div>

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
