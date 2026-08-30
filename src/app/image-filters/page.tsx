import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Image Filters & Photo Adjustments Online",
  description:
    "Adjust photo color and tone online with SIHAG AI STUDIO. Control exposure, brightness, contrast, highlights, shadows, temperature, tint, vibrance, saturation, and more in your browser.",
  alternates: {
    canonical: "/image-filters/",
  },
  openGraph: {
    type: "website",
    url: "/image-filters/",
    title: "Image Filters & Photo Adjustments Online | SIHAG AI STUDIO",
    description:
      "Create your own photo look with exposure, brightness, contrast, color, saturation, temperature, tint, and other adjustment controls.",
  },
  twitter: {
    card: "summary",
    title: "Image Filters & Photo Adjustments Online | SIHAG AI STUDIO",
    description:
      "Adjust photo tone and color online with SIHAG AI STUDIO.",
  },
};

export default function ImageFiltersPage() {
  return (
    <ToolLandingPage
      eyebrow="Photo color and tone adjustments"
      title="Image Filters &"
      accent="Photo Adjustments"
      intro="Create a custom look for your photo with SIHAG AI STUDIO's adjustment controls. Fine-tune light, contrast, color, temperature, saturation, and related settings directly in the browser."
      description="Instead of being limited to a single fixed look, use the editor's adjustment controls to shape the image yourself. Change the settings that matter, compare the result on the canvas, and continue with the rest of your edit."
      canonicalPath="/image-filters/"
      steps={[
        {
          title: "Open your image",
          text: "Launch SIHAG AI STUDIO and load the photo you want to adjust.",
        },
        {
          title: "Shape the look",
          text: "Use controls such as exposure, brightness, contrast, highlights, shadows, temperature, tint, vibrance, and saturation to build the look you want.",
        },
        {
          title: "Refine and export",
          text: "Continue with crop, layers, text, brushes, retouching, or other edits, then export the finished image.",
        },
      ]}
      features={[
        {
          title: "Light and contrast",
          text: "Adjust exposure, brightness, contrast, highlights, shadows, whites, and blacks to balance the image.",
        },
        {
          title: "Color controls",
          text: "Use temperature and tint to shift color balance, then refine vibrance and saturation for the intensity you want.",
        },
        {
          title: "Layer-based workflow",
          text: "Continue into the editor's broader layer and adjustment workflows when the project needs more control.",
        },
        {
          title: "More editing in one workspace",
          text: "Crop, add text, paint, retouch, transform, make selections, and export without leaving SIHAG AI STUDIO.",
        },
      ]}
      relatedTools={[
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Use the full SIHAG AI STUDIO workspace for broader image editing.",
        },
        {
          href: "/add-text-to-photo/",
          label: "Add Text to Photo",
          text: "Add editable typography after creating the image look you want.",
        },
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Reframe the composition before or after making color and tone adjustments.",
        },
      ]}
    />
  );
}
