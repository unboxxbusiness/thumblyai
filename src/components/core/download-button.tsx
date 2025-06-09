
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DownloadButtonProps {
  thumbnailDataUri: string;
  resolution: { width: number; height: number; label: string };
  filenamePrefix: string;
  disabled?: boolean;
}

export default function DownloadButton({
  thumbnailDataUri,
  resolution,
  filenamePrefix,
  disabled = false,
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (!thumbnailDataUri) {
      toast({ title: "Error", description: "No thumbnail to download.", variant: "destructive" });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast({ title: "Error", description: "Could not create image context.", variant: "destructive" });
        return;
      }

      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      // "Cover" logic: Calculate source rectangle (from original image)
      // to draw onto the destination canvas, cropping from the center.
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas aspect ratio: image needs to be cropped horizontally.
        // Source width will be smaller, source height will be full image height.
        sWidth = img.height * canvasAspectRatio;
        sx = (img.width - sWidth) / 2;
        // sy remains 0, sHeight remains img.height
      } else if (imgAspectRatio < canvasAspectRatio) {
        // Image is taller than canvas aspect ratio: image needs to be cropped vertically.
        // Source height will be smaller, source width will be full image width.
        sHeight = img.width / canvasAspectRatio;
        sy = (img.height - sHeight) / 2;
        // sx remains 0, sWidth remains img.width
      }
      // If imgAspectRatio is equal to canvasAspectRatio, no cropping is needed.
      // sx, sy will be 0,0 and sWidth, sHeight will be img.width, img.height.
      
      // Draw the calculated portion of the image onto the canvas, scaling it to fill the canvas.
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const safeFilenamePrefix = filenamePrefix.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `thumbly-ai-${safeFilenamePrefix}-${resolution.width}x${resolution.height}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Download Started", description: `${resolution.label} is downloading.` });
      } catch (error) {
        console.error("Error converting canvas to data URL:", error);
        toast({ title: "Error", description: "Failed to prepare image for download.", variant: "destructive" });
      }
    };
    img.onerror = () => {
      toast({ title: "Error", description: "Could not load thumbnail image for download.", variant: "destructive" });
    };
    img.src = thumbnailDataUri;
  };

  return (
    <Button onClick={handleDownload} disabled={disabled || !thumbnailDataUri} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Download {resolution.label}
    </Button>
  );
}
