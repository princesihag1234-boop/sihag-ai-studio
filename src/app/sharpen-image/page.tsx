import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Sharpen Image Online - Refine Photo Detail in Browser",
  description:
    "Sharpen images online with SIHAG AI STUDIO. Use the sharpen brush workflow to refine local detail, control brush settings, continue editing, and export in your browser.",
  alternates: {
    canonical: "/sharpen-image/",
  },
  openGraph: {
    type: "website",
    url: "/sharpen-image/",
    title: "Sharpen Image Online | SIHAG AI STUDIO",
    description:
      "Use the sharpen brush workflow to refine local image detail in your browser, then continue editing and export.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SIHAG AI STUDIO online photo editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sharpen Image Online | SIHAG AI STUDIO",
    description:
      "Use the sharpen brush workflow to refine local image detail in your browser, then continue editing and export.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return (
    <ToolLandingPage
      eyebrow="Refine local detail in your browser"
      title="Sharpen Image"
      accent="Online"
      intro="Refine selected areas of a photo with SIHAG AI STUDIO's blur and sharpen brush workflow while keeping the rest of the edit in the same browser workspace."
      description="Sharpening is available as a brush-based retouching workflow. Choose Sharpen mode, set the brush controls, work over the areas that need more local definition, then continue editing or export."
      canonicalPath="/sharpen-image/"
      steps={[
        {
          title: "Open a photo",
          text: "Load the image you want to refine in SIHAG AI STUDIO.",
        },
        {
          title: "Choose Sharpen",
          text: "Open the blur/sharpen brush workflow, select Sharpen mode, and set the brush size, hardness, and strength for the area you want to work on.",
        },
        {
          title: "Refine and export",
          text: "Brush over the areas that need more definition, then continue editing or export the finished image.",
        },
      ]}
      features={[
        {
          title: "Local sharpen workflow",
          text: "Apply sharpening with a brush so you can target specific areas instead of treating the whole photo identically.",
        },
        {
          title: "Brush controls",
          text: "Use the available size, hardness, and strength controls to shape the retouching workflow.",
        },
        {
          title: "Blur and sharpen modes",
          text: "Switch between related blur and sharpen modes as part of the same retouching tool.",
        },
        {
          title: "Continue editing",
          text: "Combine sharpening with layers, masks, adjustments, crop, text, and other available editing tools.",
        },
      ]}
      faqs={[
        {
          question: "How do I sharpen an image in SIHAG AI STUDIO?",
          answer: "Open the blur/sharpen retouching tool, choose Sharpen mode, set the brush controls, and brush over the areas where you want more local definition.",
        },
        {
          question: "Does the sharpen tool affect the whole image at once?",
          answer: "This page describes the brush-based sharpen workflow, which is designed for working on selected local areas.",
        },
        {
          question: "Can I control how strong the sharpening is?",
          answer: "Yes. The sharpen workflow includes a strength control along with brush size and hardness settings.",
        },
        {
          question: "Can I undo or continue editing after sharpening?",
          answer: "Sharpening is part of the main editor workflow, so you can continue working with the other available editing tools before export.",
        },
      ]}
      relatedTools={[
        {
          href: "/adjust-image-brightness/",
          label: "Adjust Image Brightness",
          text: "Correct overall image light levels.",
        },
        {
          href: "/adjust-image-contrast/",
          label: "Adjust Image Contrast",
          text: "Refine separation between light and dark areas.",
        },
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Open the complete browser-based photo editor.",
        },
      ]}
    />
  );
}
