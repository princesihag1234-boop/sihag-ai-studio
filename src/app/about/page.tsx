import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | SIHAG AI STUDIO",
  description:
    "Learn about SIHAG AI STUDIO, a browser-based image editor built for fast, accessible creative editing.",
};

const highlights = [
  "Layer-based editing with visibility, locking, opacity, blend modes, groups, and masks",
  "Selections, crop, transform, guides, snapping, rulers, and alignment tools",
  "Curves, HSL, color grading, adjustment layers, blur, sharpen, dodge, burn, and more",
  "Text and shape layers with editable styling",
  "Project save/open, autosave recovery, undo/redo, and multiple export formats",
  "A growing AI tools foundation designed for future cloud-powered features",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b0d10] text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-14">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
              SIHAG AI STUDIO
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              About
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
          >
            Back to Editor
          </Link>
        </header>

        <section className="py-10 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-lg leading-8 text-zinc-300 sm:text-xl">
              SIHAG AI STUDIO is a browser-based creative image editor designed
              to make professional editing tools easier to access from almost
              any modern device with a web browser.
            </p>

            <p className="mt-6 leading-7 text-zinc-400">
              The goal is simple: provide a fast, capable editing workspace
              where people can open an image, make detailed changes, work with
              layers and selections, and export their result without needing a
              large desktop editing application.
            </p>
          </div>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">What you can do</h2>
            <p className="mt-3 leading-7 text-zinc-400">
              The editor already includes a broad set of tools for everyday
              photo editing, design work, and more advanced layer-based
              workflows.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-zinc-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-10 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Built for the web</h2>
          </div>

          <div className="space-y-4 leading-7 text-zinc-400">
            <p>
              Core editing is designed to run directly in the browser so the
              workspace can remain responsive and accessible without requiring
              users to install a traditional desktop editor.
            </p>
            <p>
              SIHAG AI STUDIO is still evolving. New performance improvements,
              creative tools, AI-assisted features, and cloud capabilities may
              be added over time as the platform grows.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 py-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Our direction</h2>
            <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
              We want creative editing to be powerful without being
              intimidating. The long-term direction is to combine professional
              manual editing controls with optional intelligent tools while
              keeping the editor clear, fast, and useful for real work.
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SIHAG AI STUDIO. All rights reserved.</p>
          <Link href="/" className="text-zinc-400 transition hover:text-white">
            Open Editor
          </Link>
        </footer>
      </div>
    </main>
  );
}
