import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Adjust Image Brightness Online - Brighten or Darken Photos",
  description:
    "Adjust image brightness online with SIHAG AI STUDIO. Brighten or darken a photo, compare the result, continue editing, and export directly in your browser.",
  alternates: {
    canonical: "/adjust-image-brightness/",
  },
  openGraph: {
    type: "website",
    url: "/adjust-image-brightness/",
    title: "Adjust Image Brightness Online | SIHAG AI STUDIO",
    description:
      "Brighten or darken a photo in your browser with SIHAG AI STUDIO, then continue editing and export.",
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
    title: "Adjust Image Brightness Online | SIHAG AI STUDIO",
    description:
      "Brighten or darken a photo in your browser with SIHAG AI STUDIO, then continue editing and export.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return (
    <ToolLandingPage
      eyebrow="Correct light levels in your browser"
      title="Adjust Image Brightness"
      accent="Online"
      intro="Brighten a dark photo or reduce excessive brightness with SIHAG AI STUDIO, then continue refining the image in the same browser workspace."
      description="Brightness is part of the editor's image-adjustment workflow. Make the correction on the selected image, combine it with contrast and other available adjustments, then continue editing or export."
      canonicalPath="/adjust-image-brightness/"
      steps={[
        {
          title: "Open a photo",
          text: "Load the image you want to correct in SIHAG AI STUDIO.",
        },
        {
          title: "Adjust brightness",
          text: "Open the adjustment controls and change brightness until the image reaches the light level you want.",
        },
        {
          title: "Refine and export",
          text: "Combine the brightness correction with other edits if needed, then export the finished image.",
        },
      ]}
      features={[
        {
          title: "Brighten dark photos",
          text: "Increase brightness when the overall image appears too dark.",
        },
        {
          title: "Reduce excessive brightness",
          text: "Lower brightness when the image needs a darker overall exposure feel.",
        },
        {
          title: "Combine with contrast",
          text: "Use brightness alongside contrast and other available image adjustments for a more balanced correction.",
        },
        {
          title: "Non-isolated workflow",
          text: "Continue with crop, layers, text, retouching, masks, and export controls after the adjustment.",
        },
      ]}
      faqs={[
        {
          question: "How do I brighten an image online?",
          answer: "Open the image in SIHAG AI STUDIO, use the brightness adjustment, and increase it until the overall light level looks right.",
        },
        {
          question: "Can I darken an image too?",
          answer: "Yes. Move the brightness adjustment in the opposite direction to reduce the image's overall brightness.",
        },
        {
          question: "Can I change contrast after adjusting brightness?",
          answer: "Yes. Brightness and contrast are available as part of the broader image-adjustment workflow.",
        },
        {
          question: "Can I continue editing after changing brightness?",
          answer: "Yes. You can continue using layers, crop, text, brushes, retouching, transforms, and other available tools before export.",
        },
      ]}
      relatedTools={[
        {
          href: "/adjust-image-contrast/",
          label: "Adjust Image Contrast",
          text: "Increase or reduce separation between light and dark areas.",
        },
        {
          href: "/sharpen-image/",
          label: "Sharpen Image Online",
          text: "Refine local detail with the editor's sharpen workflow.",
        },
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Open the complete editor for broader photo corrections.",
        },
      ]}
    />
  );
}
