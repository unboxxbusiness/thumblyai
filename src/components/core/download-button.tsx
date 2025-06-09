
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

      // Calculate aspect ratios
      const imgAspectRatio = img.width / img.height;
      const canvasAspectRatio = canvas.width / canvas.height;
      let sx, sy, sWidth, sHeight;

      // "Cover" logic: crop image to fill canvas
      if (imgAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas aspect ratio (needs horizontal cropping)
        sHeight = img.height;
        sWidth = sHeight * canvasAspectRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        // Image is taller than or same aspect ratio as canvas (needs vertical cropping or no cropping)
        sWidth = img.width;
        sHeight = sWidth / canvasAspectRatio; // This might be taller than img.height if img is much narrower
        if (sHeight > img.height) { // Recalculate if sHeight exceeds original image height
            sHeight = img.height;
            sWidth = sHeight * canvasAspectRatio;
            sx = (img.width - sWidth) / 2; // Center horizontally
            sy = 0;
        } else {
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }
      }
      
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
