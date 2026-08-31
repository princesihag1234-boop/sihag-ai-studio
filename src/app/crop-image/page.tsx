import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Crop Image Online - Free Photo Crop Tool",
  description:
    "Crop images online with SIHAG AI STUDIO. Open a photo, adjust the crop frame and aspect controls, apply the crop, then continue editing and export in your browser.",
  alternates: {
    canonical: "/crop-image/",
  },
  openGraph: {
    type: "website",
    url: "/crop-image/",
    title: "Crop Image Online | SIHAG AI STUDIO",
    description:
      "Crop a photo in your browser, then continue with layers, adjustments, text, brush tools, and export controls.",
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
    title: "Crop Image Online | SIHAG AI STUDIO",
    description:
      "Crop a photo in your browser and continue editing with SIHAG AI STUDIO.",
    images: ["/og-image.png"],
  },
};

export default function CropImagePage() {
  return (
    <ToolLandingPage
      eyebrow="Crop photos in your browser"
      title="Crop Image"
      accent="Online"
      intro="Reframe a photo with the Crop tool in SIHAG AI STUDIO, then continue editing without leaving the browser workspace."
      description="The editor includes a dedicated Crop tool with a crop frame and aspect controls. After applying the crop, you can continue with the rest of your editing workflow."
      canonicalPath="/crop-image/"
      steps={[
        {
          title: "Open a photo",
          text: "Launch SIHAG AI STUDIO and load the image you want to crop.",
        },
        {
          title: "Choose Crop",
          text: "Select the Crop tool, adjust the crop area and aspect setting, then apply the crop when the framing looks right.",
        },
        {
          title: "Continue or export",
          text: "Keep editing with layers and adjustments, or use the export controls when the image is ready.",
        },
      ]}
      features={[
        {
          title: "Dedicated crop workflow",
          text: "Use the editor's Crop tool and crop frame instead of manually hiding unwanted image areas.",
        },
        {
          title: "Aspect controls",
          text: "Choose the crop aspect behavior that fits the composition before applying the result.",
        },
        {
          title: "Continue editing",
          text: "After cropping, keep working with selections, layers, text, brushes, color adjustments, and retouching tools.",
        },
        {
          title: "Browser-based workflow",
          text: "The core editing workspace runs in the browser, so the crop can be part of a larger online editing session.",
        },
      ]}
      faqs={[
        {
          question: "How do I crop an image online in SIHAG AI STUDIO?",
          answer: "Open your image, choose the Crop tool, adjust the crop frame and aspect behavior, then apply the crop when the composition looks right.",
        },
        {
          question: "Can I choose an aspect ratio while cropping?",
          answer: "The crop workflow includes aspect controls, allowing you to choose how the crop frame behaves before you apply the result.",
        },
        {
          question: "Can I continue editing after I crop the photo?",
          answer: "Yes. After cropping, you can continue with layers, selections, text, brushes, photo adjustments, retouching, transforms, and export controls in the same editor.",
        },
        {
          question: "Does cropping require a separate app?",
          answer: "No. The crop workflow is built into the browser-based SIHAG AI STUDIO editor, so cropping can be part of the same online editing session.",
        },
      ]}
      relatedTools={[
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Use the complete SIHAG AI STUDIO workspace for broader photo editing.",
        },
        {
          href: "/resize-image/",
          label: "Resize Image Online",
          text: "Set custom output dimensions from the editor's export workflow.",
        },
        {
          href: "/help/",
          label: "Help & Guide",
          text: "Read guidance for using SIHAG AI STUDIO's editing workspace.",
        },
      ]}
    />
  );
}
