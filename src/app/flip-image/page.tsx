import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Flip Image Online - Mirror Photo Horizontally or Vertically",
  description:
    "Flip images online with SIHAG AI STUDIO. Mirror a photo horizontally or vertically, keep editing with layers and adjustments, then export in your browser.",
  alternates: {
    canonical: "/flip-image/",
  },
  openGraph: {
    type: "website",
    url: "/flip-image/",
    title: "Flip Image Online | SIHAG AI STUDIO",
    description:
      "Mirror an image horizontally or vertically in your browser, then continue editing and export the result.",
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
    title: "Flip Image Online | SIHAG AI STUDIO",
    description:
      "Mirror an image horizontally or vertically in your browser, then continue editing and export the result.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return (
    <ToolLandingPage
      eyebrow="Mirror photos in your browser"
      title="Flip Image"
      accent="Online"
      intro="Mirror a photo horizontally or vertically with SIHAG AI STUDIO while keeping the rest of your editing workflow in the same browser workspace."
      description="The editor includes horizontal and vertical flip controls for image layers. After flipping, you can continue with rotation, crop, adjustments, text, layers, retouching, and export."
      canonicalPath="/flip-image/"
      steps={[
        {
          title: "Open your image",
          text: "Load the photo you want to mirror in SIHAG AI STUDIO.",
        },
        {
          title: "Choose a flip direction",
          text: "Use the horizontal or vertical flip control for the selected image layer.",
        },
        {
          title: "Review and export",
          text: "Continue editing if needed, then export the finished image.",
        },
      ]}
      features={[
        {
          title: "Horizontal flip",
          text: "Mirror the selected image layer from left to right.",
        },
        {
          title: "Vertical flip",
          text: "Mirror the selected image layer from top to bottom.",
        },
        {
          title: "Layer-based editing",
          text: "Flip an image layer while continuing to work with the rest of the document.",
        },
        {
          title: "Continue after flipping",
          text: "Use rotation, crop, adjustments, text, brushes, retouching, and export controls in the same editor.",
        },
      ]}
      faqs={[
        {
          question: "How do I flip an image horizontally?",
          answer: "Open your image, select the image layer, and use the horizontal flip control to mirror it from left to right.",
        },
        {
          question: "Can I flip an image vertically?",
          answer: "Yes. The editor includes a vertical flip control for mirroring an image from top to bottom.",
        },
        {
          question: "Can I rotate the photo after flipping it?",
          answer: "Yes. Flip and rotation controls are part of the same editing workflow.",
        },
        {
          question: "Can I keep editing after I mirror the image?",
          answer: "Yes. You can continue with crop, layers, adjustments, text, retouching, and other available tools before exporting.",
        },
      ]}
      relatedTools={[
        {
          href: "/rotate-image/",
          label: "Rotate Image Online",
          text: "Correct image orientation or fine-tune the angle.",
        },
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Reframe the photo after flipping it.",
        },
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Use the complete browser-based editing workspace.",
        },
      ]}
    />
  );
}
