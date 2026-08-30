import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Free Online Photo Editor",
  description:
    "Edit photos online with SIHAG AI STUDIO. Work with layers, text, brush tools, selections, color adjustments, retouching, transforms, and image export in your browser.",
  alternates: {
    canonical: "/photo-editor/",
  },
  openGraph: {
    type: "website",
    url: "/photo-editor/",
    title: "Free Online Photo Editor | SIHAG AI STUDIO",
    description:
      "Edit photos online with layers, text, brush tools, selections, adjustments, retouching, transforms, and flexible export controls.",
  },
  twitter: {
    card: "summary",
    title: "Free Online Photo Editor | SIHAG AI STUDIO",
    description:
      "Edit photos online with layers, text, brush tools, adjustments, retouching, transforms, and export controls.",
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
      relatedTools={[
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Trim an image and focus the frame on the area you want to keep.",
        },
        {
          href: "/resize-image/",
          label: "Resize Image Online",
          text: "Choose custom output dimensions when exporting your edited image.",
        },
        {
          href: "/about/",
          label: "About SIHAG AI STUDIO",
          text: "Learn more about the browser-based editor and its capabilities.",
        },
      ]}
    />
  );
}
