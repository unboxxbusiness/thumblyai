
// src/ai/flows/regenerate-thumbnail.ts
'use server';

/**
 * @fileOverview A flow to regenerate a thumbnail with slightly different parameters, aiming for improved quality and modern YouTube aesthetics.
 *
 * - regenerateThumbnail - A function that handles the thumbnail regeneration process.
 * - RegenerateThumbnailInput - The input type for the regenerateThumbnail function.
 * - RegenerateThumbnailOutput - The return type for the regenerateThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateThumbnailInputSchema = z.object({
  videoTopic: z.string().describe('The topic of the video.'),
  colorScheme: z.string().describe('The color scheme for the thumbnail.'),
  fontPairing: z.string().describe('The font pairing for the thumbnail.'),
  style: z.string().describe('The style of the thumbnail (e.g., clean, bold).'),
  previousThumbnail: z.string().describe(
    'The previously generated thumbnail as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
  ),
  uploadedImageDataUri: z.string().optional().describe(
    "An optional, new user-uploaded image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. If provided, this should strongly influence or replace parts of the previous thumbnail."
  ),
});

export type RegenerateThumbnailInput = z.infer<typeof RegenerateThumbnailInputSchema>;

const RegenerateThumbnailOutputSchema = z.object({
  thumbnail: z.string().describe(
    'The regenerated thumbnail as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
  ),
});

export type RegenerateThumbnailOutput = z.infer<typeof RegenerateThumbnailOutputSchema>;

export async function regenerateThumbnail(input: RegenerateThumbnailInput): Promise<RegenerateThumbnailOutput> {
  return regenerateThumbnailFlow(input);
}

const regenerateThumbnailPrompt = ai.definePrompt({
  name: 'regenerateThumbnailPrompt',
  input: {schema: RegenerateThumbnailInputSchema},
  output: {schema: RegenerateThumbnailOutputSchema},
  prompt: `!!! CRITICAL RULES (REGENERATION) !!!
1.  TEXT ON IMAGE: The ONLY text on the thumbnail MUST be a short, impactful phrase derived SOLELY from the Video Topic: "{{{videoTopic}}}".
2.  NO PARAMETER TEXT: The "Color Scheme" ({{{colorScheme}}}), "Font Pairing" ({{{fontPairing}}}), and "Style" ({{{style}}}) parameters are for VISUAL INSPIRATION ONLY. Their names or any descriptive text about them MUST NOT appear on the image.
3.  NO EXTRA TEXT OR CONTENT: Absolutely no other text, instructions, or stray characters should appear on the image.

Regenerate an improved YouTube thumbnail for the video titled: "{{{videoTopic}}}".
- Design Guidance: Use the predefined Color Scheme ("{{{colorScheme}}}"), Font Pairing ("{{{fontPairing}}}"), and Style ("{{{style}}}") for visual inspiration.
- Viral Strategy: Follow viral YouTube clickbait designs, aiming for significant improvement over the previous version.
- Imagery:
  {{#if uploadedImageDataUri}}
    A NEW User Provided Image is available (second media item). Use THIS as the dominant visual foundation. You may draw MINOR inspiration from the Previous Thumbnail (first media item) ONLY if it enhances the new image. The new image should replace or significantly alter the previous one.
  {{else}}
    Analyze the Previous Thumbnail (first media item). Enhance it by generating/using more relevant images or significantly improving existing imagery based on the video topic ("{{{videoTopic}}}").
  {{/if}}
- Key Elements: Include bold, high-contrast text (from "{{{videoTopic}}}"), a clear focal point (e.g., expressive face, dramatic object), minimal clutter, and eye-catching visual elements.
- Optimization: Optimize for maximum clicks and ensure readability at small sizes.
- Export & Dimensions: Export at exactly 1280x720 pixels (16:9 aspect ratio). The visual composition MUST fill this entire canvas. There must be NO black bars, NO AI-introduced cropping, and NO padding.

Previous Thumbnail: {{media url=previousThumbnail}}
{{#if uploadedImageDataUri}}
New User Provided Image: {{media url=uploadedImageDataUri}}
Instruction (New User Image Provided): The NEWLY UPLOADED IMAGE (second media item) is your TOP PRIORITY. Build the design around it.
{{/if}}
  `,
});

const regenerateThumbnailFlow = ai.defineFlow(
  {
    name: 'regenerateThumbnailFlow',
    inputSchema: RegenerateThumbnailInputSchema,
    outputSchema: RegenerateThumbnailOutputSchema,
  },
  async input => {
    const { videoTopic, colorScheme, fontPairing, style, previousThumbnail, uploadedImageDataUri } = input;

    let promptText = `!!! CRITICAL RULES (REGENERATION) !!!
1.  TEXT ON IMAGE: The ONLY text on the thumbnail MUST be a short, impactful phrase derived SOLELY from the Video Topic: "${videoTopic}".
2.  NO PARAMETER TEXT: The "Color Scheme" ("${colorScheme}"), "Font Pairing" ("${fontPairing}"), and "Style" ("${style}") parameters are for VISUAL INSPIRATION ONLY. Their names or any descriptive text about them MUST NOT appear on the image.
3.  NO EXTRA TEXT OR CONTENT: Absolutely no other text, instructions, or stray characters should appear on the image.

Regenerate an improved YouTube thumbnail for the video titled: "${videoTopic}".
- Design Guidance: Use the predefined Color Scheme ("${colorScheme}"), Font Pairing ("${fontPairing}"), and Style ("${style}") for visual inspiration.
- Viral Strategy: Follow viral YouTube clickbait designs, aiming for significant improvement over the previous version.
- Key Elements: Include bold, high-contrast text (from "${videoTopic}"), a clear focal point (e.g., expressive face, dramatic object), minimal clutter, and eye-catching visual elements.
- Optimization: Optimize for maximum clicks and ensure readability at small sizes.
- Export & Dimensions: Export at exactly 1280x720 pixels (16:9 aspect ratio). The visual composition MUST fill this entire canvas. There must be NO black bars, NO AI-introduced cropping, and NO padding.`;

    const promptParts: Array<Record<string, any>> = [
      { media: { url: previousThumbnail } }, // Previous thumbnail is always the first media item.
    ];
    
    let imageryInstruction = "";
    if (uploadedImageDataUri) {
      imageryInstruction = `\n- Imagery: A NEW User Provided Image is available (second media item in this prompt). Use THIS as the dominant visual foundation. You may draw MINOR inspiration from the Previous Thumbnail (first media item in this prompt) ONLY if it enhances the new image. The new image should replace or significantly alter the previous one.`;
      promptParts.push({ media: {url: uploadedImageDataUri }}); // New uploaded image is the second media item, if present.
      imageryInstruction += `\n\nInstruction (New User Image Provided): The NEWLY UPLOADED IMAGE (second media item in this prompt) is your TOP PRIORITY. Build the design around it.`;
    } else {
      imageryInstruction = `\n- Imagery: Analyze the Previous Thumbnail (first media item in this prompt). Enhance it by generating/using more relevant images or significantly improving existing imagery based on the video topic ("${videoTopic}").`;
    }
    
    promptText += imageryInstruction;
    promptParts.push({text: promptText});

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: promptParts,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {thumbnail: media.url!};
  }
);
    

    


