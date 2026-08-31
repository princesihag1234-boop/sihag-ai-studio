import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Adjust Image Contrast Online - Increase or Reduce Contrast",
  description:
    "Adjust image contrast online with SIHAG AI STUDIO. Increase or reduce contrast, combine it with brightness and color adjustments, and export in your browser.",
  alternates: {
    canonical: "/adjust-image-contrast/",
  },
  openGraph: {
    type: "website",
    url: "/adjust-image-contrast/",
    title: "Adjust Image Contrast Online | SIHAG AI STUDIO",
    description:
      "Increase or reduce image contrast in your browser, continue editing, and export with SIHAG AI STUDIO.",
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
    title: "Adjust Image Contrast Online | SIHAG AI STUDIO",
    description:
      "Increase or reduce image contrast in your browser, continue editing, and export with SIHAG AI STUDIO.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return (
    <ToolLandingPage
      eyebrow="Refine tonal separation in your browser"
      title="Adjust Image Contrast"
      accent="Online"
      intro="Increase contrast for stronger separation or reduce it for a softer look with SIHAG AI STUDIO, then continue editing in the same browser workspace."
      description="Contrast is available within the editor's image-adjustment workflow. Use it with brightness and other available controls to refine the image before continuing with layers, crop, text, retouching, or export."
      canonicalPath="/adjust-image-contrast/"
      steps={[
        {
          title: "Open your image",
          text: "Load a photo in SIHAG AI STUDIO and select the image you want to adjust.",
        },
        {
          title: "Change contrast",
          text: "Use the contrast adjustment to increase or reduce tonal separation.",
        },
        {
          title: "Fine-tune and export",
          text: "Combine the result with other available adjustments, then continue editing or export.",
        },
      ]}
      features={[
        {
          title: "Increase contrast",
          text: "Strengthen the difference between lighter and darker areas when the image looks flat.",
        },
        {
          title: "Reduce contrast",
          text: "Soften tonal separation when a gentler look fits the image better.",
        },
        {
          title: "Works with brightness",
          text: "Combine contrast with brightness and other available adjustment controls.",
        },
        {
          title: "Continue editing",
          text: "Keep working with crop, layers, masks, text, retouching, transforms, and export controls.",
        },
      ]}
      faqs={[
        {
          question: "How do I increase image contrast online?",
          answer: "Open your image, use the contrast adjustment, and increase the value until the light and dark areas have the separation you want.",
        },
        {
          question: "Can I reduce contrast for a softer look?",
          answer: "Yes. Lower the contrast setting to reduce tonal separation.",
        },
        {
          question: "Should I adjust brightness and contrast together?",
          answer: "They can be used together when an image needs both an overall light-level correction and a change in tonal separation.",
        },
        {
          question: "Can I keep editing after changing contrast?",
          answer: "Yes. Contrast is part of the larger SIHAG AI STUDIO editing workflow, so you can continue with the other available tools before export.",
        },
      ]}
      relatedTools={[
        {
          href: "/adjust-image-brightness/",
          label: "Adjust Image Brightness",
          text: "Brighten or darken the overall image.",
        },
        {
          href: "/image-filters/",
          label: "Image Filters Online",
          text: "Explore broader looks and image adjustments.",
        },
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Use the complete editor for more detailed photo work.",
        },
      ]}
    />
  );
}
