import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {  
  title: "Help & Guide",
  description:
    "Learn how to use SIHAG AI STUDIO, including opening images, layers, selections, adjustments, saving projects, recovery, and exporting.",
};

const guides = [
  {
    number: "01",
    title: "Open an image",
    text: "Launch the editor and open an image from your device. Your image becomes the starting layer of the project.",
  },
  {
    number: "02",
    title: "Navigate the canvas",
    text: "Use zoom, pan, fit-to-screen, rotate, flip, straighten, guides, rulers, snapping, and other canvas controls to work precisely.",
  },
  {
    number: "03",
    title: "Work with layers",
    text: "Create, rename, reorder, group, hide, lock, transform, blend, and adjust layer opacity. You can also use masks for more controlled edits.",
  },
  {
    number: "04",
    title: "Make selections",
    text: "Use rectangular, elliptical, lasso, polygon, magic-wand, and quick-selection tools. Refine, feather, invert, combine, move, and resize selections.",
  },
  {
    number: "05",
    title: "Adjust color and tone",
    text: "Use curves, HSL, color grading, adjustment layers, opacity, blend modes, clipping, and effect-strength controls for non-destructive editing workflows.",
  },
  {
    number: "06",
    title: "Retouch and paint",
    text: "Use healing, clone stamp, paint, eraser, dodge, burn, blur, sharpen, and smudge tools for local edits and retouching.",
  },
  {
    number: "07",
    title: "Add text and shapes",
    text: "Create editable text and shape layers, then adjust styling, fill, gradients, strokes, shadows, alignment, and transform settings.",
  },
  {
    number: "08",
    title: "Undo and recover",
    text: "Use undo and redo while editing. The editor also includes local autosave and recovery support to help restore recent work when possible.",
  },
  {
    number: "09",
    title: "Save your project",
    text: "Save a project in the SIHAG project format when you want to continue editing later with layers and project structure preserved.",
  },
  {
    number: "10",
    title: "Export your result",
    text: "Export finished work as PNG, JPG, or WebP. Depending on the workflow, you can adjust output quality, scale, dimensions, selection area, and background behavior.",
  },
];

const tips = [
  "Keep a separate copy of important original images before editing.",
  "Use adjustment layers and masks when you want edits that are easier to change later.",
  "Save a project file before making major structural changes.",
  "For large images, lower preview quality if the editor feels slow, then export at the quality you need.",
  "Use guides, snapping, rulers, and alignment tools for precise layouts.",
  "If a browser tab closes unexpectedly, reopen the editor and check whether recovery data is available.",
];

export default function HelpPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[580px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-250px] right-[-160px] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[150px]" />
      </div>

      <div className="relative">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-bold transition group-hover:bg-white/[0.1]">
              S
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">
                SIHAG
              </p>
              <p className="-mt-0.5 text-[10px] tracking-[0.26em] text-zinc-500">
                AI STUDIO
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:text-white sm:inline-flex"
            >
              About
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
            >
              Open Editor
            </Link>
          </div>
        </nav>

        <header className="mx-auto max-w-7xl px-6 pb-14 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-200">
              Help center
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Learn the editor,
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent">
                step by step.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
              A practical guide to the main SIHAG AI STUDIO workflow — from
              opening your first image to saving a project and exporting the
              finished result.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Launch Editor
              </Link>
              <a
                href="#getting-started"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Read Guide
              </a>
            </div>
          </div>
        </header>

        <section
          id="getting-started"
          className="border-y border-white/10 bg-white/[0.018]"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Getting started
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Your editing workflow
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">
                Follow these steps in order when you are new to the editor, or
                jump directly to the section you need.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {guides.map((guide) => (
                <article
                  key={guide.number}
                  className="group rounded-2xl border border-white/10 bg-[#0b0e14]/80 p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0e1219] sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.22em] text-cyan-300">
                      {guide.number}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-zinc-700 transition group-hover:bg-cyan-300" />
                  </div>
                  <h3 className="mt-7 text-lg font-semibold text-white">
                    {guide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {guide.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Useful habits
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A few tips for safer, faster editing.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-zinc-400">
                These habits can make long editing sessions easier and reduce
                the chance of losing important work.
              </p>
            </div>

            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div
                  key={tip}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-[48px_1fr]"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-xs font-semibold text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="self-center text-sm leading-6 text-zinc-400">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Project recovery
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                Browser recovery can help — but keep backups.
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                Recovery information may be stored locally in your browser.
                Clearing site data, browser storage, or changing devices can
                remove that information, so important projects should also be
                saved separately.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.045] p-7 sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                AI tools
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                AI-assisted features are still evolving.
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                The editor includes an AI-ready foundation, but not every
                planned AI capability is currently active. Available tools and
                processing behavior may change as these features are developed.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-10 sm:px-10 sm:py-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Ready to edit?
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  Open the workspace and start creating.
                </h2>
                <p className="mt-4 leading-7 text-zinc-400">
                  You can return to this guide whenever you need a quick
                  refresher on the main workflow.
                </p>
              </div>

              <Link
                href="/"
                className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Open Editor
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <p className="font-medium text-zinc-300">SIHAG AI STUDIO</p>
              <p className="mt-1 text-xs">
                Browser-based creative image editing.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/" className="transition hover:text-white">
                Editor
              </Link>
              <Link href="/about" className="transition hover:text-white">
                About
              </Link>
              <Link href="/help" className="text-zinc-300">
                Help
              </Link>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-white">
                Terms
              </Link>
            </div>

            <p className="text-xs">© 2026 SIHAG AI STUDIO</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
