import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Crop Image Online",
  description:
    "Crop images online with SIHAG AI STUDIO. Open a photo, choose the Crop tool, adjust the frame, apply the crop, and continue editing in your browser.",
  alternates: {
    canonical: "/crop-image/",
  },
  openGraph: {
    type: "website",
    url: "/crop-image/",
    title: "Crop Image Online | SIHAG AI STUDIO",
    description:
      "Crop a photo in your browser, then continue with layers, adjustments, text, brush tools, and export controls.",
  },
  twitter: {
    card: "summary",
    title: "Crop Image Online | SIHAG AI STUDIO",
    description:
      "Crop a photo in your browser and continue editing with SIHAG AI STUDIO.",
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
