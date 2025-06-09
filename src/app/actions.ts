
"use server";

import { generateThumbnail as generateThumbnailFlow, type GenerateThumbnailInput, type GenerateThumbnailOutput } from "@/ai/flows/generate-thumbnail";
import { regenerateThumbnail as regenerateThumbnailFlow, type RegenerateThumbnailInput, type RegenerateThumbnailOutput } from "@/ai/flows/regenerate-thumbnail";
import { z } from "zod";

const GenerateInputSchema = z.object({
  videoTopic: z.string().min(3, "Video topic must be at least 3 characters"),
  colorScheme: z.string(),
  fontPairing: z.string(),
  style: z.string(),
  uploadedImageDataUri: z.string().url("Invalid uploaded image data URI").optional(),
});

const RegenerateInputSchema = GenerateInputSchema.extend({
  previousThumbnail: z.string().url("Invalid previous thumbnail data URI"),
  // uploadedImageDataUri is inherited and remains optional
});

export async function generateThumbnailAction(
  data: z.infer<typeof GenerateInputSchema> // Use inferred type for data
): Promise<GenerateThumbnailOutput | { error: string }> {
  const validatedData = GenerateInputSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: validatedData.error.errors.map(e => e.message).join(", ") };
  }

  try {
    const result = await generateThumbnailFlow(validatedData.data);
    return result;
  } catch (e) {
    console.error("Error generating thumbnail:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `Failed to generate thumbnail. ${errorMessage}` };
  }
}

export async function regenerateThumbnailAction(
  data: z.infer<typeof RegenerateInputSchema> // Use inferred type for data
): Promise<RegenerateThumbnailOutput | { error: string }> {
  const validatedData = RegenerateInputSchema.safeParse(data);
  if (!validatedData.success) {
     return { error: validatedData.error.errors.map(e => e.message).join(", ") };
  }
  
  try {
    const result = await regenerateThumbnailFlow(validatedData.data);
    return result;
  } catch (e) {
    console.error("Error regenerating thumbnail:", e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
    return { error: `Failed to regenerate thumbnail. ${errorMessage}` };
  }
}
