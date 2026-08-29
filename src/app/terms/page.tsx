import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | SIHAG AI STUDIO",
  description:
    "Terms of Use for SIHAG AI STUDIO, including user content, acceptable use, service availability, and future online features.",
};

const sections = [
  {
    title: "1. Using SIHAG AI STUDIO",
    body: [
      "These Terms of Use describe the basic rules for using SIHAG AI STUDIO and its browser-based image editing features.",
      "By using the service, you agree to use it responsibly and in accordance with applicable laws and these Terms.",
    ],
  },
  {
    title: "2. The service",
    body: [
      "SIHAG AI STUDIO provides browser-based creative tools for editing images and related content. Features may change, improve, be added, or be removed as the product evolves.",
      "Some features may run directly in your browser, while future cloud or AI-assisted features may require communication with online services.",
    ],
  },
  {
    title: "3. Your content",
    body: [
      "You keep ownership of the images, designs, project files, prompts, and other content you create or provide, subject to any rights held by other people or organizations.",
      "You are responsible for making sure you have the necessary rights or permission to use content that you upload, edit, or process through the service.",
      "When an optional online feature requires server-side processing, you authorize the service and its technical providers to process the relevant content only as reasonably necessary to provide that feature.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "Do not use SIHAG AI STUDIO to violate applicable law, infringe intellectual-property rights, distribute malicious software, interfere with the service, attempt unauthorized access, or deliberately abuse technical resources.",
      "You must not use the service in a way that harms other users, the website, its infrastructure, or third-party services connected to it.",
    ],
  },
  {
    title: "5. Accounts and paid features",
    body: [
      "The current service may not require a user account for core editing. If accounts, subscriptions, payments, cloud storage, or premium features are introduced later, additional terms may apply.",
      "Pricing, billing conditions, renewal terms, refund rules, and account requirements will be presented before a paid feature is offered.",
    ],
  },
  {
    title: "6. AI-assisted and experimental features",
    body: [
      "Some current or future features may be labeled experimental, beta, preview, AI-assisted, or otherwise under active development.",
      "Results from automated or AI-assisted tools may be incomplete, inaccurate, unexpected, or unsuitable for a particular purpose. You remain responsible for reviewing outputs before relying on or publishing them.",
    ],
  },
  {
    title: "7. Project files and backups",
    body: [
      "Browser storage, autosave, recovery, and project-saving tools are provided for convenience and should not be treated as your only backup.",
      "Keep independent copies of important original images and project files. Clearing browser data, device failures, software updates, storage limits, or technical errors may cause locally stored recovery data to become unavailable.",
    ],
  },
  {
    title: "8. Intellectual property",
    body: [
      "The SIHAG AI STUDIO name, interface, original website code, branding, and service design may be protected by intellectual-property laws.",
      "These Terms do not give users ownership of the service itself, its branding, or proprietary technology. They also do not transfer ownership of user-created content to SIHAG AI STUDIO.",
    ],
  },
  {
    title: "9. Third-party services",
    body: [
      "The website may depend on third-party hosting, infrastructure, libraries, APIs, payment services, analytics, advertising providers, or AI services.",
      "Those providers may have their own terms and privacy practices. SIHAG AI STUDIO is not responsible for third-party services that are outside its reasonable control.",
    ],
  },
  {
    title: "10. Service availability",
    body: [
      "We aim to keep SIHAG AI STUDIO available and useful, but uninterrupted or error-free operation cannot be guaranteed.",
      "The service may occasionally be unavailable because of maintenance, updates, provider outages, security work, technical limitations, or circumstances outside our control.",
    ],
  },
  {
    title: "11. No professional guarantee",
    body: [
      "SIHAG AI STUDIO is provided as a creative software service. Unless expressly stated otherwise, features are provided on an as-available basis without a guarantee that every tool or output will meet every user's requirements.",
      "You are responsible for reviewing exported work, preserving originals, and deciding whether an output is suitable for your intended use.",
    ],
  },
  {
    title: "12. Limitation of responsibility",
    body: [
      "To the extent permitted by applicable law, SIHAG AI STUDIO is not responsible for indirect losses caused by factors outside its reasonable control, including loss of locally stored project data, third-party outages, device problems, or misuse of the service.",
      "Nothing in these Terms is intended to remove rights or protections that cannot legally be excluded.",
    ],
  },
  {
    title: "13. Suspension or restriction",
    body: [
      "Access may be restricted when reasonably necessary to protect the service, investigate abuse, comply with legal obligations, prevent security threats, or respond to serious violations of these Terms.",
    ],
  },
  {
    title: "14. Changes to these Terms",
    body: [
      "These Terms may be updated as SIHAG AI STUDIO develops. Material changes will be reflected on this page with an updated effective date.",
      "Continued use of the service after updated Terms take effect may be treated as acceptance where permitted by applicable law.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-300px] h-[580px] w-[900px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[150px]" />
        <div className="absolute bottom-[-250px] left-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[150px]" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.06] px-3 py-1.5 text-xs font-medium text-violet-200">
              Service rules & responsibilities
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Terms of Use
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
              These Terms explain the basic rules for using SIHAG AI STUDIO,
              your rights in your creative work, and how the service may evolve.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-xs text-zinc-500">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                Effective: August 29, 2026
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                Version 1.0
              </span>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  In short
                </p>
                <div className="mt-5 space-y-4 text-sm leading-6 text-zinc-400">
                  <p>You keep ownership of your creative content.</p>
                  <p>Use the editor responsibly and lawfully.</p>
                  <p>Keep backups of important projects and originals.</p>
                  <p>Future online features may have additional terms.</p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <Link
                    href="/privacy"
                    className="text-sm font-medium text-zinc-300 transition hover:text-white"
                  >
                    Read Privacy Policy →
                  </Link>
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

              <div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.045] p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white">
                  Questions about these Terms?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                  A dedicated Contact page will provide the public method for
                  support and policy questions. That page is being added to the
                  public information section of SIHAG AI STUDIO.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5 text-xs leading-6 text-zinc-500">
                These Terms are a general website template and are not a
                substitute for professional legal advice. Because terms can
                create legal obligations, they should be reviewed before being
                relied on as a final legal agreement, especially before adding
                payments, accounts, subscriptions, advertising, cloud storage,
                or third-party AI processing.
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
              <Link href="/privacy" className="transition hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="text-zinc-300">
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
