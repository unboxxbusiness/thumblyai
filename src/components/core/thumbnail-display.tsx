
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DownloadButton from "./download-button";
import LoadingIndicator from "./loading-indicator";
import { RESOLUTIONS } from "@/lib/constants";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ThumbnailDisplayProps {
  thumbnailDataUri: string | null;
  videoTopic: string;
  onRegenerate: () => void;
  isGenerating: boolean;
  isRegenerating: boolean;
  error: string | null;
}

export default function ThumbnailDisplay({
  thumbnailDataUri,
  videoTopic,
  onRegenerate,
  isGenerating,
  isRegenerating,
  error,
}: ThumbnailDisplayProps) {
  
  const currentVideoTopicOrDefault = videoTopic || "thumbnail";

  if (isGenerating) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-headline">Generating Your Thumbnail...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
          <LoadingIndicator text="AI is working its magic!" size={48} />
        </CardContent>
      </Card>
    );
  }

  if (error && !thumbnailDataUri) {
    return (
       <Card className="w-full shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-headline text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Generation Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-destructive mb-4 text-sm">{error}</p>
          <Button onClick={onRegenerate} disabled={isRegenerating} variant="destructive">
            {isRegenerating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!thumbnailDataUri) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-headline">Your Thumbnail Will Appear Here</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px] bg-muted/30 rounded-md">
          <p className="text-muted-foreground text-sm text-center px-4">Fill out the form above to generate your thumbnail.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-headline">Your Generated Thumbnail</CardTitle>
      </CardHeader>
      <CardContent className="relative aspect-video w-full bg-muted/30">
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <LoadingIndicator text="Regenerating..." size={36} />
          </div>
        )}
         {error && !isRegenerating && (
            <div className="absolute inset-0 bg-destructive/80 flex flex-col items-center justify-center z-10 p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive-foreground mb-2" />
                <p className="text-destructive-foreground text-xs sm:text-sm mb-2">Regeneration failed: {error}</p>
                <Button onClick={onRegenerate} variant="outline" size="sm" className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Regenerating Again
                </Button>
            </div>
        )}
        <Image
          src={thumbnailDataUri}
          alt={`Generated thumbnail for: ${currentVideoTopicOrDefault}`}
          layout="fill"
          objectFit="contain"
          className={isRegenerating || (error && !isRegenerating) ? "opacity-50" : ""}
          data-ai-hint="thumbnail preview"
        />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
        <Button onClick={onRegenerate} disabled={isRegenerating || isGenerating} variant="secondary">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" />
          Regenerate
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          <DownloadButton
            thumbnailDataUri={thumbnailDataUri}
            resolution={RESOLUTIONS.HD}
            filenamePrefix={currentVideoTopicOrDefault}
            disabled={isRegenerating || isGenerating || !!error}
          />
          <DownloadButton
            thumbnailDataUri={thumbnailDataUri}
            resolution={RESOLUTIONS.FHD}
            filenamePrefix={currentVideoTopicOrDefault}
            disabled={isRegenerating || isGenerating || !!error}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
