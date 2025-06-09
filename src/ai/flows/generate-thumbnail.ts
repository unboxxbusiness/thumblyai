
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

// This prompt definition is kept for potential future use or direct invocation,
// but the generateThumbnailFlow currently constructs its own prompt for ai.generate.
const prompt = ai.definePrompt({
  name: 'generateThumbnailPrompt',
  input: {schema: GenerateThumbnailInputSchema},
  output: {schema: GenerateThumbnailOutputSchema},
  prompt: `You are an expert YouTube thumbnail designer, specializing in creating highly engaging, modern, and professional thumbnails like those seen on top creator channels (e.g., Ali Abdaal).

Your goal is to generate a thumbnail that is:
- **Visually Striking:** Clean, minimalist yet eye-catching.
- **Clear & Legible:** Features bold, easy-to-read text. The text on the thumbnail should be derived *only* from the 'Video Topic', keeping it concise and impactful. Avoid any extraneous words or sentences.
- **High Contrast:** Uses colors effectively for readability and visual pop.
- **Professional:** Looks polished and high-quality.
- **Engaging:** Designed to maximize click-through rates.
- **Relevant:** Accurately reflects the video's content.
- **Aspect Ratio & Resolution:** The generated image should inherently be high resolution and suitable for a 1920x1080 YouTube thumbnail (16:9 aspect ratio).

Video Topic: {{{videoTopic}}}
Color Scheme: {{{colorScheme}}}
Font Pairing: {{{fontPairing}}}
Style: {{{style}}}
{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
Instruction for User Image: YOU MUST prominently feature and integrate this user-provided image into the thumbnail design. It should be the main subject or background. Design all other elements (text, colors, style) to complement this image. The text on the thumbnail should be *only* the most essential part of the video topic, keeping it concise.
{{/if}}

IMPORTANT (Applies to all generations):
1.  **Text Content:** The text on the thumbnail should be derived *only* from the 'Video Topic' ({{{videoTopic}}}). Keep it very concise and impactful. Do NOT add any extra words or sentences.
2.  **Parameter Usage:** Do NOT include the literal names of the color scheme, font pairing, or style (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo') as text in the thumbnail image itself. Instead, *use* these selections to *guide* the visual design choices like color palettes, font choices, and overall aesthetic.

Incorporate these elements into a compelling thumbnail design. The primary text (derived *only* from the video topic) should be prominent. Avoid clutter. Focus on a single, clear message or visual.
The thumbnail should be high resolution (suitable for 1920x1080, 16:9 aspect ratio) and returned as a data URI.
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
- Clear & Legible: Feature bold, easy-to-read text.
- High Contrast: Use colors effectively for readability and visual pop, guided by the color scheme: "${input.colorScheme}".
- Professional: Look polished and high-quality.
- Engaging: Designed to maximize click-through rates.
- Relevant: Accurately reflects the video's content.
- Typographic Style: Apply a font style inspired by "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style: "${input.style}".
- Aspect Ratio & Resolution: The generated image must inherently be high resolution and perfectly suitable for a 1920x1080 YouTube thumbnail (16:9 aspect ratio).

IMPORTANT - TEXT CONTENT:
The text on the thumbnail MUST be derived *only* from the most essential part of the video topic: "${input.videoTopic}". Keep it extremely concise and impactful. Do NOT add any extra words, phrases, or sentences beyond what is essential from the topic.

IMPORTANT - PARAMETER USAGE:
Do NOT include the literal names of the color scheme, font pairing, or style (e.g., do not write 'Bright & Punchy' or 'Modern Sans Serif Duo' as text on the thumbnail image itself). Instead, *use* these selections to *guide* all visual design choices.

The text (derived *only* from "${input.videoTopic}") should be prominent. Avoid visual clutter. Focus on a single, clear message.
Prioritize a clean aesthetic with strong typography. Ensure any human figures (if generated or present in an uploaded image) are well-composed and look professional.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;

    if (input.uploadedImageDataUri) {
      imageGenerationPromptConfig = [
        { media: { url: input.uploadedImageDataUri } },
        { text: `CRITICAL INSTRUCTION (User Image Provided):\nA user-uploaded image is provided as the first media item in this prompt. YOU MUST use this uploaded image as the_ABSOLUTE_PRIMARY_VISUAL_FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally.\n\n${basePromptText}\n\nFurther details for using the uploaded image: Integrate it naturally as a key component or background for the thumbnail, complementing the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}"). Remember, the text on the thumbnail should be *only* the most essential part of the video topic, very concise.` }
      ];
    } else {
      imageGenerationPromptConfig = `${basePromptText}\n\nINSTRUCTION (No User Image): Generate all visual elements for the thumbnail based on the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}"). The text on the thumbnail should be *only* the most essential part of the video topic, very concise. Ensure the generated image is high resolution, 16:9 aspect ratio.`;
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imageGenerationPromptConfig,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        // Explicitly set number of candidates to 1 for image generation if not default
        // numOutputCandidates: 1, // Or whatever the API supports if needed
      },
    });
    return {thumbnailDataUri: media.url!};
  }
);
