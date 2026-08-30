import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for SIHAG AI STUDIO, including browser storage, technical data, advertising, and future online features.",
};

const sections = [
  {
    title: "1. Overview",
    body: [
      "SIHAG AI STUDIO is a browser-based creative image editor. This Privacy Policy explains how information may be handled when you use the website and editor.",
      "We aim to collect only what is reasonably necessary to operate, secure, improve, support, and, where enabled, monetize the service.",
    ],
  },
  {
    title: "2. Browser-based editing",
    body: [
      "Core editing features are designed to run directly in your browser. This means many image-editing operations can be performed locally on your device rather than requiring every action to be processed on a remote server.",
      "Some website functions may still communicate with our hosting or backend services for technical purposes such as service availability, feature status, security, performance, or future online features.",
    ],
  },
  {
    title: "3. Local project and recovery data",
    body: [
      "The editor may use browser storage technologies, including local browser databases, to support features such as autosave, recovery, preferences, or project continuity.",
      "Data stored locally in your browser generally remains on your device until it is replaced, removed by the application, or cleared through your browser or device settings.",
    ],
  },
  {
    title: "4. Technical and usage information",
    body: [
      "Our hosting and infrastructure providers may automatically process standard technical information needed to deliver and protect the service. This can include IP address, browser type, device information, request time, requested pages, error information, and similar server or security logs.",
      "We may use aggregated or technical information to diagnose problems, improve reliability, prevent abuse, and understand how the service performs.",
    ],
  },
  {
    title: "5. Images and creative content",
    body: [
      "Your images and creative work remain your content. Core browser editing does not require us to claim ownership of the files you edit.",
      "If a future feature requires server-side processing, such as an optional cloud or AI-assisted tool, the relevant image, selection, prompt, or other content may need to be transmitted for processing when you choose to use that feature.",
      "We will update this policy when material new data-processing features are introduced.",
    ],
  },
  {
    title: "6. AI and online features",
    body: [
      "SIHAG AI STUDIO is being developed with a foundation for future AI-assisted tools. Not every listed or planned AI capability is currently active.",
      "Where an online AI feature is enabled in the future, additional information about what is sent, why it is processed, and how it is handled should be provided as part of the feature or an updated version of this policy.",
    ],
  },
  {
    title: "7. Cookies and similar technologies",
    body: [
      "The site may use browser storage, cookies, or other technical mechanisms to provide functionality, remember local state, maintain security, measure service performance, or support advertising where enabled.",
      "Where consent is legally required for non-essential cookies or similar technologies, appropriate consent controls should be provided.",
    ],
  },
  {
    title: "8. Google AdSense and advertising",
    body: [
      "SIHAG AI STUDIO may use Google AdSense to display advertisements after the site and publisher account are approved.",
      "Third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to SIHAG AI STUDIO or other websites.",
      "Google's use of advertising cookies enables Google and its partners to serve ads to users based on visits to this site and/or other sites on the Internet.",
      "Users can manage or opt out of personalized advertising through Google's Ads Settings. Where required, additional consent choices may be presented before advertising cookies are used.",
    ],
  },
  {
    title: "9. Data sharing",
    body: [
      "We do not sell your creative files as part of the normal operation of the editor.",
      "Information may be processed by service providers that help us host, secure, maintain, advertise, or operate the website. We may also disclose information when required by applicable law or when reasonably necessary to protect the service and its users.",
    ],
  },
  {
    title: "10. Data security",
    body: [
      "We use reasonable technical and organizational measures appropriate to the service to reduce the risk of unauthorized access, misuse, or loss.",
      "No online service can guarantee absolute security, so users should keep independent copies of important original files and projects.",
    ],
  },
  {
    title: "11. Your choices",
    body: [
      "You can manage or clear locally stored browser data through your browser settings. Clearing site data may also remove locally stored project recovery information or preferences.",
      "You can choose not to use optional online features that require additional processing when such features become available.",
      "Advertising preferences can also be managed through the controls provided by Google and, where applicable, through consent controls presented on this site.",
    ],
  },
  {
    title: "12. Changes to this policy",
    body: [
      "We may revise this Privacy Policy as SIHAG AI STUDIO evolves. Material changes will be reflected on this page with an updated effective date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[580px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute bottom-[-250px] right-[-160px] h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-[150px]" />
      </div>

      <div className="relative">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
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

        <header className="mx-auto max-w-6xl px-6 pb-12 pt-14 sm:px-8 sm:pt-20 lg:px-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-1.5 text-xs font-medium text-cyan-200">
              Privacy & transparency
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Privacy Policy
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
              A clear explanation of how SIHAG AI STUDIO handles browser data,
              technical information, creative content, advertising, and future
              online features.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-xs text-zinc-500">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                Effective: August 29, 2026
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                Version 1.1
              </span>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  Policy summary
                </p>
                <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-400">
                  <p>Core editing is designed to happen in your browser.</p>
                  <p>Local recovery data may be stored on your device.</p>
                  <p>Hosting systems may process standard technical logs.</p>
                  <p>Advertising may use cookies when AdSense is enabled.</p>
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-[#0b0e14]/80 p-6 sm:p-8"
                >
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-zinc-400 sm:text-[15px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              ))}

              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.045] p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white">
                  More information
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                  For general product guidance, visit the Help & Guide page.
                  This Privacy Policy will be updated whenever material changes
                  are made to the way the service processes information.
                </p>
                <Link
                  href="/help"
                  className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.09] hover:text-white"
                >
                  Open Help & Guide
                </Link>
              </div>

              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5 text-xs leading-6 text-zinc-500">
                This page is provided as general service information and is not
                a substitute for professional legal advice. The policy should be
                reviewed and updated whenever the site begins using new
                analytics, advertising, account, payment, cloud-storage, or AI
                processing services.
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
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
              <Link href="/help" className="transition hover:text-white">
                Help
              </Link>
              <Link href="/privacy" className="text-zinc-300">
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
