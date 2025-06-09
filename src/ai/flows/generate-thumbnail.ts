
// src/ai/flows/generate-thumbnail.ts
'use server';
/**
 * @fileOverview A thumbnail generation AI agent.
 *
 * - generateThumbnail - A function that handles the thumbnail generation process.
 * - GenerateThumbnailInput - The input type for the generateThumbnail function.
 * - GenerateThumbnailOutput - The return type for the generateThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThumbnailInputSchema = z.object({
  videoTopic: z.string().describe('The topic of the video.'),
  colorScheme: z.string().describe('The color scheme for the thumbnail.'),
  fontPairing: z.string().describe('The font pairing for the thumbnail.'),
  style: z.string().describe('The style of the thumbnail (e.g., clean, bold).'),
  uploadedImageDataUri: z.string().optional().describe(
    "An optional user-uploaded image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type GenerateThumbnailInput = z.infer<typeof GenerateThumbnailInputSchema>;

const GenerateThumbnailOutputSchema = z.object({
  thumbnailDataUri: z.string().describe('The generated thumbnail as a data URI.'),
});
export type GenerateThumbnailOutput = z.infer<typeof GenerateThumbnailOutputSchema>;

export async function generateThumbnail(input: GenerateThumbnailInput): Promise<GenerateThumbnailOutput> {
  return generateThumbnailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThumbnailPrompt',
  input: {schema: GenerateThumbnailInputSchema},
  output: {schema: GenerateThumbnailOutputSchema},
  prompt: `!!! CRITICAL RULES !!!
1.  TEXT ON IMAGE: The ONLY text on the thumbnail MUST be a short, impactful phrase derived SOLELY from the Video Topic: "{{{videoTopic}}}".
2.  NO PARAMETER TEXT: The "Color Scheme" ({{{colorScheme}}}), "Font Pairing" ({{{fontPairing}}}), and "Style" ({{{style}}}) parameters are for VISUAL INSPIRATION ONLY. Their names or any descriptive text about them MUST NOT appear on the image.
3.  NO EXTRA TEXT OR CONTENT: Absolutely no other text, instructions, or stray characters should appear on the image.

Create a YouTube thumbnail for the video titled: "{{{videoTopic}}}".
- Design Guidance: Use the predefined Color Scheme ("{{{colorScheme}}}"), Font Pairing ("{{{fontPairing}}}"), and Style ("{{{style}}}") for visual inspiration.
- Viral Strategy: Follow viral YouTube clickbait designs.
- Imagery: {{#if uploadedImageDataUri}}Use the User Provided Image (below) as the primary visual foundation.{{else}}Generate or use relevant images based on the video topic ("{{{videoTopic}}}") to enhance context.{{/if}}
- Key Elements: Include bold, high-contrast text (from "{{{videoTopic}}}"), a clear focal point (e.g., expressive face, dramatic object), minimal clutter, and eye-catching visual elements.
- Optimization: Optimize for maximum clicks and ensure readability at small sizes.
- Export & Dimensions: Export at exactly 1280x720 pixels (16:9 aspect ratio). The visual composition MUST fill this entire canvas. There must be NO black bars, NO AI-introduced cropping, and NO padding.

{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
Instruction (User Image Provided): Use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION. All other design elements MUST be applied to or in support of this image.
{{/if}}
  `,
});

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    const { videoTopic, colorScheme, fontPairing, style, uploadedImageDataUri } = input;

    let promptText = `!!! CRITICAL RULES !!!
1.  TEXT ON IMAGE: The ONLY text on the thumbnail MUST be a short, impactful phrase derived SOLELY from the Video Topic: "${videoTopic}".
2.  NO PARAMETER TEXT: The "Color Scheme" ("${colorScheme}"), "Font Pairing" ("${fontPairing}"), and "Style" ("${style}") parameters are for VISUAL INSPIRATION ONLY. Their names or any descriptive text about them MUST NOT appear on the image.
3.  NO EXTRA TEXT OR CONTENT: Absolutely no other text, instructions, or stray characters should appear on the image.

Create a YouTube thumbnail for the video titled: "${videoTopic}".
- Design Guidance: Use the predefined Color Scheme ("${colorScheme}"), Font Pairing ("${fontPairing}"), and Style ("${style}") for visual inspiration.
- Viral Strategy: Follow viral YouTube clickbait designs.
- Imagery: ${uploadedImageDataUri ? "Use the User Provided Image (provided as the first media item in this prompt) as the primary visual foundation." : `Generate or use relevant images based on the video topic ("${videoTopic}") to enhance context.`}
- Key Elements: Include bold, high-contrast text (from "${videoTopic}"), a clear focal point (e.g., expressive face, dramatic object), minimal clutter, and eye-catching visual elements.
- Optimization: Optimize for maximum clicks and ensure readability at small sizes.
- Export & Dimensions: Export at exactly 1280x720 pixels (16:9 aspect ratio). The visual composition MUST fill this entire canvas. There must be NO black bars, NO AI-introduced cropping, and NO padding.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;

    if (uploadedImageDataUri) {
      promptText += `\n\nInstruction (User Image Provided): Use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION. All other design elements MUST be applied to or in support of this image.`;
      imageGenerationPromptConfig = [
        { media: { url: uploadedImageDataUri } },
        { text: promptText }
      ];
    } else {
      imageGenerationPromptConfig = promptText;
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imageGenerationPromptConfig,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {thumbnailDataUri: media.url!};
  }
);
    

    


