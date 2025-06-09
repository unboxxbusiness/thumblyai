
"use client";

import { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

import ThumbnailForm from "./thumbnail-form";
import ThumbnailDisplay from "./thumbnail-display";
import { generateThumbnailAction, regenerateThumbnailAction } from "@/app/actions";
// The actual GenerateThumbnailInput type comes from the AI flow, but for form values we define it here.
// import type { GenerateThumbnailInput } from "@/ai/flows/generate-thumbnail"; 
import { COLOR_SCHEMES, FONT_PAIRINGS, STYLES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  videoTopic: z.string().min(3, "Video topic must be at least 3 characters long.").max(100, "Video topic is too long."),
  colorScheme: z.string().min(1, "Please select a color scheme."),
  fontPairing: z.string().min(1, "Please select a font pairing."),
  style: z.string().min(1, "Please select a style."),
  uploadedImageDataUri: z.string().url("Invalid image data URI format.").optional().or(z.literal('')), // Allow empty string from cleared input
});

type ThumbnailFormValues = z.infer<typeof formSchema>;

export default function ThumbnailGeneratorClient() {
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, startGeneratingTransition] = useTransition();
  const [isRegenerating, startRegeneratingTransition] = useTransition();

  const formMethods = useForm<ThumbnailFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoTopic: "",
      colorScheme: COLOR_SCHEMES[0],
      fontPairing: FONT_PAIRINGS[0],
      style: STYLES[0],
      uploadedImageDataUri: "",
    },
  });
  const { watch } = formMethods;
  const currentVideoTopic = watch("videoTopic");

  const handleGenerate = async (data: ThumbnailFormValues) => {
    setError(null);
    startGeneratingTransition(async () => {
      // Ensure empty string is treated as undefined for the backend
      const payload = {
        ...data,
        uploadedImageDataUri: data.uploadedImageDataUri || undefined,
      };
      const result = await generateThumbnailAction(payload);
      if ("error" in result) {
        setError(result.error);
        setGeneratedThumbnail(null);
        toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setGeneratedThumbnail(result.thumbnailDataUri);
        toast({ title: "Thumbnail Generated!", description: "Your new thumbnail is ready." });
      }
    });
  };

  const handleRegenerate = () => {
    if (!generatedThumbnail) {
      toast({ title: "Cannot Regenerate", description: "Generate a thumbnail first.", variant: "destructive" });
      return;
    }
    setError(null);
    const currentFormValues = formMethods.getValues();
    startRegeneratingTransition(async () => {
      const payload = {
        ...currentFormValues,
        previousThumbnail: generatedThumbnail,
        uploadedImageDataUri: currentFormValues.uploadedImageDataUri || undefined,
      };
      const result = await regenerateThumbnailAction(payload);
      if ("error" in result) {
        setError(result.error);
        toast({ title: "Regeneration Failed", description: result.error, variant: "destructive" });
      } else {
        setGeneratedThumbnail(result.thumbnail);
        toast({ title: "Thumbnail Regenerated!", description: "We've updated your thumbnail." });
      }
    });
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <section className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline mb-3 sm:mb-4">
          Create <span className="text-primary">Stunning</span> Thumbnails with AI
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe your video, pick your style, (optionally) upload an image, and let Thumbly Ai craft the perfect thumbnail.
        </p>
      </section>

      <FormProvider {...formMethods}>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-headline">Thumbnail Settings</CardTitle>
            <CardDescription>Tell us about your video to get started. You can also upload an image to include.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThumbnailForm onSubmit={handleGenerate} isGenerating={isGenerating} />
          </CardContent>
        </Card>
      </FormProvider>

      <section>
        <ThumbnailDisplay
          thumbnailDataUri={generatedThumbnail}
          videoTopic={currentVideoTopic}
          onRegenerate={handleRegenerate}
          isGenerating={isGenerating}
          isRegenerating={isRegenerating}
          error={error}
        />
      </section>
    </div>
  );
}
