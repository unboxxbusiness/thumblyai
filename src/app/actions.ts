"use server";

import { generateThumbnail as generateThumbnailFlow, type GenerateThumbnailInput, type GenerateThumbnailOutput } from "@/ai/flows/generate-thumbnail";
import { regenerateThumbnail as regenerateThumbnailFlow, type RegenerateThumbnailInput, type RegenerateThumbnailOutput } from "@/ai/flows/regenerate-thumbnail";
import { z } from "zod";

const GenerateInputSchema = z.object({
  videoTopic: z.string().min(3, "Video topic must be at least 3 characters"),
  colorScheme: z.string(),
  fontPairing: z.string(),
  style: z.string(),
});

const RegenerateInputSchema = GenerateInputSchema.extend({
  previousThumbnail: z.string().url("Invalid previous thumbnail data URI"),
});

export async function generateThumbnailAction(
  data: GenerateThumbnailInput
): Promise<GenerateThumbnailOutput | { error: string }> {
  const validatedData = GenerateInputSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: validatedData.error.errors.map(e => e.message).join(", ") };
  }

  try {
    // The AI flow expects specific input names as per its schema, map if necessary.
    // For this example, we assume the names match.
    const result = await generateThumbnailFlow(validatedData.data);
    return result;
  } catch (e) {
    console.error("Error generating thumbnail:", e);
    return { error: "Failed to generate thumbnail. Please try again." };
  }
}

export async function regenerateThumbnailAction(
  data: RegenerateThumbnailInput
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
    return { error: "Failed to regenerate thumbnail. Please try again." };
  }
}
