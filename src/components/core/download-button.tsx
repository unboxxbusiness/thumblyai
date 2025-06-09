
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
      // Set canvas dimensions to the target resolution (which is 16:9)
      canvas.width = resolution.width;
      canvas.height = resolution.height;
      
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast({ title: "Error", description: "Could not create image context.", variant: "destructive" });
        return;
      }

      // Fill background with black. This will be visible for letterboxing/pillarboxing.
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imageAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      
      let scaledWidth, scaledHeight, dx, dy;

      // "Contain" logic: Scale image to fit within canvas while maintaining aspect ratio
      if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas aspect ratio (or same width, different height)
        // Fit to canvas width, scale height accordingly
        scaledWidth = canvas.width;
        scaledHeight = canvas.width / imageAspectRatio;
      } else {
        // Image is taller than canvas aspect ratio (or same height, different width) or same aspect ratio
        // Fit to canvas height, scale width accordingly
        scaledHeight = canvas.height;
        scaledWidth = canvas.height * imageAspectRatio;
      }

      // Calculate offsets to center the scaled image on the canvas
      dx = (canvas.width - scaledWidth) / 2;
      dy = (canvas.height - scaledHeight) / 2;
      
      // Draw the source image onto the canvas, scaled and centered
      ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, scaledWidth, scaledHeight);
      
      try {
        // The canvas (and thus the data URL) will have the dimensions of resolution.width x resolution.height
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
