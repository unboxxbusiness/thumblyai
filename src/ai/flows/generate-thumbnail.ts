
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

// This definePrompt is good for schema definition and can be used for simpler text-only generation if needed later.
// The main flow will construct a more complex prompt for image generation.
const prompt = ai.definePrompt({
  name: 'generateThumbnailPrompt',
  input: {schema: GenerateThumbnailInputSchema},
  output: {schema: GenerateThumbnailOutputSchema},
  prompt: `You are an expert YouTube thumbnail designer, specializing in creating highly engaging, modern, and professional thumbnails like those seen on top creator channels (e.g., Ali Abdaal).

Your goal is to generate a thumbnail that is:
- **Visually Striking:** Clean, minimalist yet eye-catching.
- **Clear & Legible:** Features bold, easy-to-read text that highlights the core video topic.
- **High Contrast:** Uses colors effectively for readability and visual pop.
- **Professional:** Looks polished and high-quality.
- **Engaging:** Designed to maximize click-through rates.
- **Relevant:** Accurately reflects the video's content.

Video Topic: {{{videoTopic}}}
Color Scheme: {{{colorScheme}}}
Font Pairing: {{{fontPairing}}}
Style: {{{style}}}
{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
Instruction: Incorporate this user-provided image thoughtfully into the thumbnail design. It could be a background, a main subject, or an element within the composition. Ensure it blends well with the overall style, topic, color scheme, and font pairing.
{{/if}}

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo') as text in the thumbnail image itself. Instead, *use* these selections to *guide* the visual design choices like color palettes, font choices, and overall aesthetic. The text on the thumbnail should be derived from the 'Video Topic'.

Incorporate these elements into a compelling thumbnail design. The primary text should be prominent. Avoid clutter. Focus on a single, clear message or visual.
The thumbnail should be returned as a data URI.
  `,
});

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    const basePromptText = `Generate a high-quality, modern YouTube thumbnail, in the style of top creators like Ali Abdaal.
The thumbnail must be:
- Visually Striking: Clean, minimalist, yet eye-catching.
- Clear & Legible: Feature bold, easy-to-read text that is directly related to the video topic: "${input.videoTopic}".
- High Contrast: Use colors effectively for readability and visual pop, guided by the color scheme: "${input.colorScheme}".
- Professional: Look polished and high-quality.
- Engaging: Designed to maximize click-through rates.
- Relevant: Accurately reflects the video's content.
- Typographic Style: Apply a font style inspired by "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style: "${input.style}".

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style (e.g., do not write 'Bright & Punchy' or 'Modern Sans Serif Duo' as text on the thumbnail image itself). Instead, *use* these selections to *guide* the visual design choices. The text on the thumbnail should be derived from the 'Video Topic'.

The main text from the video topic should be prominent. Avoid visual clutter. Focus on a single, clear message or visual.
Prioritize a clean aesthetic with strong typography. Ensure any human figures (if generated or present in an uploaded image) are well-composed and look professional. Ensure the final image is high resolution and suitable for a YouTube thumbnail.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;

    if (input.uploadedImageDataUri) {
      imageGenerationPromptConfig = [
        { media: { url: input.uploadedImageDataUri } },
        { text: `${basePromptText}\n\nINSTRUCTION (User Image Provided): An image has been provided by the user (see context image above). Please use this image as a key component or background for the thumbnail. Integrate it naturally with the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}") specified. The thumbnail text should be about the video topic.` }
      ];
    } else {
      imageGenerationPromptConfig = `${basePromptText}\n\nINSTRUCTION (No User Image): Generate all visual elements for the thumbnail based on the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}"). The thumbnail text should be about the video topic.`;
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
