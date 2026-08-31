import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Resize Image Online - Custom Width & Height",
  description:
    "Resize image output online with SIHAG AI STUDIO. Edit your photo, open Export, enter custom width and height or choose an available preset, then export the result.",
  alternates: {
    canonical: "/resize-image/",
  },
  openGraph: {
    type: "website",
    url: "/resize-image/",
    title: "Resize Image Online | SIHAG AI STUDIO",
    description:
      "Choose custom output width and height or an available export preset, then export your image from SIHAG AI STUDIO.",
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
    title: "Resize Image Online | SIHAG AI STUDIO",
    description:
      "Choose custom output dimensions and export a resized image with SIHAG AI STUDIO.",
    images: ["/og-image.png"],
  },
};

export default function ResizeImagePage() {
  return (
    <ToolLandingPage
      eyebrow="Custom image output dimensions"
      title="Resize Image"
      accent="Online"
      intro="Choose the output dimensions you need when exporting from SIHAG AI STUDIO. The editor supports custom width and height controls as part of its export workflow."
      description="Resize is handled at export so you can finish your edits first, then choose the output size. Open Export and set custom dimensions or use an available size preset before creating the finished file."
      canonicalPath="/resize-image/"
      steps={[
        {
          title: "Open and edit",
          text: "Load your image in SIHAG AI STUDIO and make any crop, adjustment, text, layer, or retouching changes you need.",
        },
        {
          title: "Open Export",
          text: "Open the export controls and choose the full document or an eligible selection as the export area.",
        },
        {
          title: "Choose output size",
          text: "Set custom width and height or choose an available preset, then export the resized result.",
        },
      ]}
      features={[
        {
          title: "Custom width and height",
          text: "Set exact output dimensions through the editor's custom export-size controls.",
        },
        {
          title: "Export presets",
          text: "Use available export-size presets when one matches the dimensions you need.",
        },
        {
          title: "Full document or selection",
          text: "The export workflow can work from the full document and, when applicable, an active selection.",
        },
        {
          title: "Edit before resizing",
          text: "Crop, adjust, retouch, add text, or work with layers before choosing the final output size.",
        },
      ]}
      faqs={[
        {
          question: "How do I resize an image in SIHAG AI STUDIO?",
          answer: "Finish your edits, open Export, then choose the output width and height or use an available size preset before exporting the finished image.",
        },
        {
          question: "Does resizing change my editing canvas immediately?",
          answer: "This page describes the export-size workflow. You can complete your edits first and choose the final output dimensions when exporting.",
        },
        {
          question: "Can I enter custom image dimensions?",
          answer: "Yes. The export controls include custom width and height settings for choosing exact output dimensions.",
        },
        {
          question: "Can I crop before resizing the exported image?",
          answer: "Yes. You can crop and make other edits first, then select the output dimensions during export.",
        },
      ]}
      relatedTools={[
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Reframe the photo before choosing its final export dimensions.",
        },
        {
          href: "/adjust-image-brightness/",
          label: "Adjust Image Brightness",
          text: "Correct the image's overall light level before exporting.",
        },
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Open the complete editor for layers, adjustments, retouching, text, brushes, and more.",
        },
      ]}
    />
  );
}
