import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Free Online Photo Editor - Edit Photos in Browser",
  description:
    "Edit photos online for free with SIHAG AI STUDIO. Crop, use layers, add text, paint, retouch, adjust color and light, transform images, and export in your browser.",
  alternates: {
    canonical: "/photo-editor/",
  },
  openGraph: {
    type: "website",
    url: "/photo-editor/",
    title: "Free Online Photo Editor | SIHAG AI STUDIO",
    description:
      "Edit photos online with layers, text, brush tools, selections, adjustments, retouching, transforms, and flexible export controls.",
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
    title: "Free Online Photo Editor | SIHAG AI STUDIO",
    description:
      "Edit photos online with layers, text, brush tools, adjustments, retouching, transforms, and export controls.",
    images: ["/og-image.png"],
  },
};

export default function PhotoEditorPage() {
  return (
    <ToolLandingPage
      eyebrow="Free browser-based photo editing"
      title="Free Online"
      accent="Photo Editor"
      intro="Open an image and edit it directly in your browser with SIHAG AI STUDIO. Use practical photo-editing controls without installing a large desktop application."
      description="Open the editor, choose your image, then use the tools that fit your workflow. You can make quick corrections or continue into detailed layer-based editing."
      canonicalPath="/photo-editor/"
      steps={[
        {
          title: "Open your image",
          text: "Launch the editor and choose the photo you want to work on.",
        },
        {
          title: "Edit in the browser",
          text: "Use crop, layers, selections, text, brush tools, adjustments, retouching, transforms, and other available controls.",
        },
        {
          title: "Export your result",
          text: "When the edit is ready, use the export controls to create the finished image.",
        },
      ]}
      features={[
        {
          title: "Layer-based editing",
          text: "Build more detailed compositions with layers, masks, opacity, blend modes, transforms, and adjustment workflows.",
        },
        {
          title: "Text and brush tools",
          text: "Add editable text, paint with brush controls, erase, and continue refining the image inside the same workspace.",
        },
        {
          title: "Color and retouching",
          text: "Use image adjustments plus retouching tools such as healing, clone, blur, sharpen, dodge, and burn where appropriate.",
        },
        {
          title: "Flexible export",
          text: "Export the full document or a selection and choose sizing controls for the finished file.",
        },
      ]}
      faqs={[
        {
          question: "Can I edit a photo online without installing software?",
          answer: "Yes. SIHAG AI STUDIO runs its core editing workspace in a modern web browser, so you can open an image and work with the available editing tools without installing a large desktop editor.",
        },
        {
          question: "What can I do in the online photo editor?",
          answer: "The editor includes layers, masks, selections, crop, editable text, paint and retouching tools, image adjustments, transforms, and export controls for broader photo-editing workflows.",
        },
        {
          question: "Can I keep editing after cropping or adding text?",
          answer: "Yes. Crop, text, adjustments, brushes, layers, and other available tools are part of the same workspace, so you can continue refining the image before export.",
        },
        {
          question: "Can I choose the output size when I export?",
          answer: "Yes. The export workflow includes sizing controls, including custom output dimensions and available presets, so you can choose the finished image size after editing.",
        },
      ]}
      relatedTools={[
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Trim an image and focus the frame on the area you want to keep.",
        },
        {
          href: "/rotate-image/",
          label: "Rotate Image Online",
          text: "Correct orientation or fine-tune the angle before export.",
        },
        {
          href: "/adjust-image-brightness/",
          label: "Adjust Image Brightness",
          text: "Brighten or darken a photo with the editor's adjustment workflow.",
        },
      ]}
    />
  );
}
