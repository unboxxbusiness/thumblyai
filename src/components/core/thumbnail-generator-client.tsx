"use client";

import { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

import ThumbnailForm from "./thumbnail-form";
import ThumbnailDisplay from "./thumbnail-display";
import { generateThumbnailAction, regenerateThumbnailAction } from "@/app/actions";
import type { GenerateThumbnailInput } from "@/ai/flows/generate-thumbnail";
import { COLOR_SCHEMES, FONT_PAIRINGS, STYLES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  videoTopic: z.string().min(3, "Video topic must be at least 3 characters long.").max(100, "Video topic is too long."),
  colorScheme: z.string().min(1, "Please select a color scheme."),
  fontPairing: z.string().min(1, "Please select a font pairing."),
  style: z.string().min(1, "Please select a style."),
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
    },
  });
  const { watch } = formMethods;
  const currentVideoTopic = watch("videoTopic");

  const handleGenerate = async (data: ThumbnailFormValues) => {
    setError(null);
    startGeneratingTransition(async () => {
      const result = await generateThumbnailAction(data);
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
      const result = await regenerateThumbnailAction({
        ...currentFormValues,
        previousThumbnail: generatedThumbnail,
      });
      if ("error" in result) {
        setError(result.error);
        // Keep the old thumbnail visible but show error
        toast({ title: "Regeneration Failed", description: result.error, variant: "destructive" });
      } else {
        setGeneratedThumbnail(result.thumbnail);
        toast({ title: "Thumbnail Regenerated!", description: "We've updated your thumbnail." });
      }
    });
  };

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
          Create <span className="text-primary">Stunning</span> Thumbnails with AI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe your video, pick your style, and let Thumbly Ai craft the perfect thumbnail to boost your clicks.
        </p>
      </section>

      <FormProvider {...formMethods}>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Thumbnail Settings</CardTitle>
            <CardDescription>Tell us about your video to get started.</CardDescription>
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
