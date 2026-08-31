import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Photo Filters & Image Adjustments Online",
  description:
    "Adjust photos online with SIHAG AI STUDIO. Fine-tune exposure, brightness, contrast, highlights, shadows, temperature, tint, vibrance, saturation, and more.",
  alternates: {
    canonical: "/image-filters/",
  },
  openGraph: {
    type: "website",
    url: "/image-filters/",
    title: "Image Filters & Photo Adjustments Online | SIHAG AI STUDIO",
    description:
      "Create your own photo look with exposure, brightness, contrast, color, saturation, temperature, tint, and other adjustment controls.",
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
    title: "Image Filters & Photo Adjustments Online | SIHAG AI STUDIO",
    description:
      "Adjust photo tone and color online with SIHAG AI STUDIO.",
    images: ["/og-image.png"],
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
      faqs={[
        {
          question: "Does SIHAG AI STUDIO have photo adjustment controls?",
          answer: "Yes. The editor includes controls for light, contrast, color, temperature, tint, vibrance, saturation, and other image settings described on this page.",
        },
        {
          question: "Can I adjust brightness and contrast separately?",
          answer: "Yes. Brightness and contrast are separate controls, alongside exposure, highlights, shadows, whites, blacks, and other tonal adjustments.",
        },
        {
          question: "Can I change the warmth or color balance of a photo?",
          answer: "Yes. Temperature and tint controls can shift color balance, while vibrance and saturation help refine overall color intensity.",
        },
        {
          question: "Can I use adjustments together with other editing tools?",
          answer: "Yes. You can combine adjustments with crop, layers, text, paint, retouching, selections, transforms, and export in the same workspace.",
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
