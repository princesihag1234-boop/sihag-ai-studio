import Link from "next/link";

type Step = {
  title: string;
  text: string;
};

type Feature = {
  title: string;
  text: string;
};

type RelatedTool = {
  href: string;
  label: string;
  text: string;
};

type Faq = {
  question: string;
  answer: string;
};

type ToolLandingPageProps = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  description: string;
  steps: Step[];
  features: Feature[];
  relatedTools: RelatedTool[];
  faqs: Faq[];
  canonicalPath: string;
};

const SITE_URL = "https://sihag-ai-studio.pages.dev";

const CORE_TOOL_LINKS: RelatedTool[] = [
  {
    href: "/photo-editor/",
    label: "Online Photo Editor",
    text: "Use the complete SIHAG AI STUDIO workspace for layers, adjustments, text, brush tools, retouching, and export.",
  },
  {
    href: "/crop-image/",
    label: "Crop Image Online",
    text: "Reframe a photo with the dedicated Crop tool and continue editing in the same workspace.",
  },
  {
    href: "/resize-image/",
    label: "Resize Image Online",
    text: "Choose custom output width and height or an available preset when exporting your image.",
  },
  {
    href: "/add-text-to-photo/",
    label: "Add Text to Photo",
    text: "Create editable text layers and control the words, font, size, color, alignment, and styling.",
  },
  {
    href: "/image-filters/",
    label: "Image Filters & Adjustments",
    text: "Build a custom look with exposure, brightness, contrast, color, saturation, and other photo adjustments.",
  },
];

export default function ToolLandingPage({
  eyebrow,
  title,
  accent,
  intro,
  description,
  steps,
  features,
  relatedTools,
  faqs,
  canonicalPath,
}: ToolLandingPageProps) {
  const pageUrl = `${SITE_URL}${canonicalPath}`;

  const relatedToolLinks = Array.from(
    new Map(
      [...relatedTools, ...CORE_TOOL_LINKS]
        .filter((tool) => tool.href !== canonicalPath)
        .map((tool) => [tool.href, tool])
    ).values()
  );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@type": "SoftwareApplication",
        name: "SIHAG AI STUDIO",
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        url: `${SITE_URL}/`,
      },
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "SIHAG AI STUDIO",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: title,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
              {eyebrow}
            </div>

            <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-8xl">
              {title}
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                {accent}
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400 sm:text-xl">
              {intro}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Open SIHAG Editor
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                See How It Works
              </a>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-white/10 bg-white/[0.018]"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start editing in a few steps.
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">{description}</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-[#0b0e14]/80 p-6"
                >
                  <span className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
                    0{index + 1}
                  </span>
                  <h3 className="mt-7 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {step.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Editing workspace
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                More control when you need it.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-zinc-400">
                This tool page leads into the full SIHAG AI STUDIO editor, so you
                can continue with layers, text, brush tools, adjustments,
                selections, transforms, and export controls after the main task.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {feature.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.018]">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Quick answers
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Frequently asked questions.
              </h2>
              <p className="mt-4 leading-7 text-zinc-400">
                Clear answers about this workflow and how it fits into the SIHAG AI STUDIO editor.
              </p>
            </div>

            <div className="mt-10 grid gap-3 lg:grid-cols-2">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-[#0b0e14]/80 p-6"
                >
                  <h3 className="font-semibold leading-6 text-white">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Explore more tools
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Continue with SIHAG AI STUDIO.
            </h2>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedToolLinks.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-2xl border border-white/10 bg-[#0b0e14]/80 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0e1219]"
                >
                  <p className="font-semibold text-white group-hover:text-cyan-200">
                    {tool.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {tool.text}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
            <div>
              <p className="font-medium text-zinc-300">SIHAG AI STUDIO</p>
              <p className="mt-1 text-xs">Browser-based creative image editing.</p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/" className="transition hover:text-white">
                Editor
              </Link>
              <Link href="/photo-editor/" className="transition hover:text-white">
                Photo Editor
              </Link>
              <Link href="/crop-image/" className="transition hover:text-white">
                Crop
              </Link>
              <Link href="/resize-image/" className="transition hover:text-white">
                Resize
              </Link>
              <Link href="/add-text-to-photo/" className="transition hover:text-white">
                Add Text
              </Link>
              <Link href="/image-filters/" className="transition hover:text-white">
                Filters
              </Link>
              <Link href="/about/" className="transition hover:text-white">
                About
              </Link>
              <Link href="/help/" className="transition hover:text-white">
                Help
              </Link>
            </div>

            <p className="text-xs">© 2026 SIHAG AI STUDIO</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
