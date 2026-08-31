import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Add Text to Photo Online - Free Text Editor",
  description:
    "Add text to photos online with SIHAG AI STUDIO. Create editable text layers, change font, size, color and alignment, position the text, then export your image.",
  alternates: {
    canonical: "/add-text-to-photo/",
  },
  openGraph: {
    type: "website",
    url: "/add-text-to-photo/",
    title: "Add Text to Photo Online | SIHAG AI STUDIO",
    description:
      "Create editable text layers on your photo and control font, size, color, alignment, styling, placement, and more in SIHAG AI STUDIO.",
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
    title: "Add Text to Photo Online | SIHAG AI STUDIO",
    description:
      "Add editable text to a photo in your browser with SIHAG AI STUDIO.",
    images: ["/og-image.png"],
  },
};

export default function AddTextToPhotoPage() {
  return (
    <ToolLandingPage
      eyebrow="Editable text layers in your browser"
      title="Add Text to"
      accent="Photo Online"
      intro="Place editable text on a photo with SIHAG AI STUDIO. Write your message, choose its look, position it on the canvas, and continue editing without leaving the browser workspace."
      description="The editor includes dedicated text layers. Add a text layer, edit the words, adjust typography and styling, then use the Move tool to position, resize, or rotate it as part of your composition."
      canonicalPath="/add-text-to-photo/"
      steps={[
        {
          title: "Open your photo",
          text: "Launch SIHAG AI STUDIO and load the image you want to add text to.",
        },
        {
          title: "Add and style text",
          text: "Choose the Text tool, create a text layer, then edit the words, font, size, color, alignment, and available styling controls.",
        },
        {
          title: "Position and export",
          text: "Place, resize, or rotate the text as needed, continue with other edits, and export the finished image when ready.",
        },
      ]}
      features={[
        {
          title: "Editable text layers",
          text: "Text remains editable as a layer, so you can revise the wording and style while you continue working.",
        },
        {
          title: "Typography controls",
          text: "Adjust font family, font size, color, alignment, weight, and other available text settings.",
        },
        {
          title: "Stroke and shadow styling",
          text: "Use available text stroke and drop-shadow controls when the design needs more separation or emphasis.",
        },
        {
          title: "Transform on the canvas",
          text: "Use the Move workflow to position, resize, and rotate the text layer within the composition.",
        },
      ]}
      faqs={[
        {
          question: "Can I add editable text to a photo online?",
          answer: "Yes. SIHAG AI STUDIO uses text layers, so the wording and supported typography settings remain editable while you work on the composition.",
        },
        {
          question: "What text settings can I change?",
          answer: "The text workflow includes controls such as the words, font family, size, color, alignment, weight, and other available styling options.",
        },
        {
          question: "Can I move, resize, or rotate text on the image?",
          answer: "Yes. Text layers can be positioned and transformed in the canvas workflow so you can place them where they fit the design.",
        },
        {
          question: "Can I keep editing the photo after adding text?",
          answer: "Yes. Text is part of the larger editor, so you can continue with crop, adjustments, brushes, retouching, layers, and export after adding typography.",
        },
      ]}
      relatedTools={[
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Continue with the complete editor for layers, adjustments, brushes, retouching, selections, and export.",
        },
        {
          href: "/image-filters/",
          label: "Image Filters & Adjustments",
          text: "Change exposure, brightness, contrast, color, saturation, and other image settings before or after adding text.",
        },
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Reframe the image before positioning text in the final composition.",
        },
      ]}
    />
  );
}
