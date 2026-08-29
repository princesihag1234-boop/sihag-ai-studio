import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | SIHAG AI STUDIO",
  description:
    "Discover SIHAG AI STUDIO — a modern browser-based creative image editor built for fast, powerful, accessible editing.",
};

const capabilities = [
  {
    title: "Professional Layers",
    text: "Work with layers, groups, masks, opacity, blend modes, transforms, alignment, and non-destructive adjustments.",
  },
  {
    title: "Precision Editing",
    text: "Use crop, selections, rulers, guides, snapping, curves, HSL, color grading, healing, clone, paint, blur, sharpen, and more.",
  },
  {
    title: "Creative Freedom",
    text: "Create editable text and shape layers, save projects, recover work automatically, and export in modern image formats.",
  },
  {
    title: "Built for the Web",
    text: "The core editor runs directly in the browser, reducing setup time and making the workspace accessible on modern devices.",
  },
  {
    title: "Performance Focused",
    text: "Preview quality controls, render queueing, cache management, and memory-safe rendering help keep large projects responsive.",
  },
  {
    title: "AI-Ready Foundation",
    text: "The platform is prepared for future cloud-powered AI tools while keeping the main editor useful even without them.",
  },
];

const principles = [
  ["01", "Power without complexity", "Advanced tools should feel clear, discoverable, and fast to use."],
  ["02", "Browser-first creativity", "Open the site and start creating without installing a heavy desktop application."],
  ["03", "User control first", "Manual editing remains central, with intelligent tools added as optional enhancements."],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-220px] right-[-140px] h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-[140px]" />
      </div>

      <div className="relative">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-sm font-bold shadow-2xl shadow-black/20 transition group-hover:bg-white/[0.1]">
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

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
          >
            Open Editor
          </Link>
        </nav>

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium tracking-wide text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Browser-based creative editing
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-8xl">
              Create without
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                creative limits.
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 sm:text-xl">
              SIHAG AI STUDIO is a modern image editing workspace built for the
              browser — combining professional editing controls, a clean
              interface, and a foundation for future intelligent creative tools.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Launch Editor
              </Link>
              <a
                href="#capabilities"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Explore Capabilities
              </a>
            </div>
          </div>

          <div className="mt-16 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <p className="text-3xl font-semibold tracking-tight text-white">50+</p>
              <p className="mt-1 text-sm text-zinc-500">editing capabilities</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <p className="text-3xl font-semibold tracking-tight text-white">Web</p>
              <p className="mt-1 text-sm text-zinc-500">no large desktop install</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
              <p className="text-3xl font-semibold tracking-tight text-white">Local-first</p>
              <p className="mt-1 text-sm text-zinc-500">core editing in your browser</p>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="border-y border-white/10 bg-white/[0.018]"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Capabilities
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A serious editor, not just a demo.
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">
                The platform is designed around practical editing workflows,
                from quick image adjustments to detailed layer-based projects.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item, index) => (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-white/10 bg-[#0b0e14]/80 p-6 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0e1219]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-[0.2em] text-zinc-600">
                      0{index + 1}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-zinc-700 transition group-hover:bg-cyan-300" />
                  </div>
                  <h3 className="mt-8 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Product philosophy
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Powerful tools should still feel simple.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-zinc-400">
                SIHAG AI STUDIO is being built around a focused idea: remove
                unnecessary friction while keeping the depth creators expect
                from a professional editing workspace.
              </p>
            </div>

            <div className="space-y-4">
              {principles.map(([number, title, text]) => (
                <div
                  key={number}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-[64px_1fr]"
                >
                  <p className="text-sm font-semibold text-cyan-300">{number}</p>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  The next chapter
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  The editor will keep evolving.
                </h2>
                <p className="mt-4 leading-7 text-zinc-400">
                  Future work can include richer cloud features, additional
                  creative tools, performance improvements, collaboration, and
                  optional AI-assisted workflows.
                </p>
              </div>

              <Link
                href="/"
                className="w-fit rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Start Creating
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
              <Link href="/about" className="text-zinc-300">
                About
              </Link>
            </div>

            <p className="text-xs">© 2026 SIHAG AI STUDIO</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
