import type { Metadata } from "next";
import ToolLandingPage from "@/components/ToolLandingPage";

export const metadata: Metadata = {
  title: "Rotate Image Online - Free Photo Rotation Tool",
  description:
    "Rotate images online with SIHAG AI STUDIO. Open a photo, use the image rotation controls, fine-tune orientation, continue editing, and export in your browser.",
  alternates: {
    canonical: "/rotate-image/",
  },
  openGraph: {
    type: "website",
    url: "/rotate-image/",
    title: "Rotate Image Online | SIHAG AI STUDIO",
    description:
      "Rotate a photo in your browser, fine-tune its orientation, continue editing, and export the finished image.",
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
    title: "Rotate Image Online | SIHAG AI STUDIO",
    description:
      "Rotate a photo in your browser, fine-tune its orientation, continue editing, and export the finished image.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  return (
    <ToolLandingPage
      eyebrow="Correct image orientation in your browser"
      title="Rotate Image"
      accent="Online"
      intro="Turn a photo to the orientation you need with SIHAG AI STUDIO, then continue editing in the same browser workspace."
      description="The editor includes rotation controls for changing image orientation. You can rotate the selected image layer, continue with crop, adjustments, layers, text, and other tools, then export the result."
      canonicalPath="/rotate-image/"
      steps={[
        {
          title: "Open a photo",
          text: "Launch SIHAG AI STUDIO and load the image you want to rotate.",
        },
        {
          title: "Adjust the rotation",
          text: "Use the image rotation controls to change the orientation and fine-tune the angle when needed.",
        },
        {
          title: "Continue or export",
          text: "Keep editing in the same workspace or export the finished image when the orientation looks right.",
        },
      ]}
      features={[
        {
          title: "Image rotation controls",
          text: "Change the orientation of the selected image layer without leaving the editor.",
        },
        {
          title: "Fine angle control",
          text: "Use rotation and straightening controls when a photo needs more than a simple quarter-turn correction.",
        },
        {
          title: "Works with the full editor",
          text: "Continue with crop, layers, adjustments, text, selections, retouching, and other available tools.",
        },
        {
          title: "Browser-based workflow",
          text: "Rotate and continue editing directly in the browser before exporting the result.",
        },
      ]}
      faqs={[
        {
          question: "How do I rotate an image online in SIHAG AI STUDIO?",
          answer: "Open your image, select the image layer, use the available rotation controls to set the orientation, then continue editing or export the result.",
        },
        {
          question: "Can I straighten a slightly tilted photo?",
          answer: "The editor includes orientation controls that can be used to fine-tune a tilted image as part of the broader editing workflow.",
        },
        {
          question: "Can I crop after rotating the image?",
          answer: "Yes. Rotation and crop are available in the same editor, so you can correct orientation first and then reframe the photo.",
        },
        {
          question: "Do I need to install software to rotate a photo?",
          answer: "No. The core SIHAG AI STUDIO editing workspace runs in a modern browser.",
        },
      ]}
      relatedTools={[
        {
          href: "/crop-image/",
          label: "Crop Image Online",
          text: "Reframe the image after correcting its orientation.",
        },
        {
          href: "/flip-image/",
          label: "Flip Image Online",
          text: "Mirror an image horizontally or vertically in the editor.",
        },
        {
          href: "/photo-editor/",
          label: "Online Photo Editor",
          text: "Open the complete editing workspace for broader photo editing.",
        },
      ]}
    />
  );
}
