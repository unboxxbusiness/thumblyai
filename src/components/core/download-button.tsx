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

      // Draw image maintaining aspect ratio and covering canvas
      // This example simply stretches, but more sophisticated logic could be added for cover/contain
      ctx.drawImage(img, 0, 0, resolution.width, resolution.height);
      
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
