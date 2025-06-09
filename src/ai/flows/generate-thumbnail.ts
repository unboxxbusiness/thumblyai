
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
  prompt: `You are an expert YouTube thumbnail designer, specializing in creating thumbnails that follow the latest viral YouTube clickbait strategies.

Your goal is to generate a YouTube thumbnail that is:
- **Styled for Maximum Impact:** Design the thumbnail to match the latest viral YouTube clickbait strategies.
- **Bold & Clear Text:** Features bold, easy-to-read text.
- **High Contrast & Visual Pop:** Uses colors effectively for high contrast and immediate visual attention.
- **Clear Focal Point:** The thumbnail must have a clear focal point that draws the viewer's eye.
- **Minimal Clutter:** Avoid visual clutter. Focus on a single, clear message or visual.
- **Attention-Grabbing Elements:** Incorporate attention-grabbing visual elements that are relevant to the video topic.
- **Optimized for Clicks & Small Sizes:** The thumbnail must be optimized for maximum clicks and maintain clarity even at small sizes.
- **Professional & Relevant:** Looks polished, high-quality, and accurately reflects the video's content.
- **Aspect Ratio & Resolution:** The generated image MUST inherently be high resolution, specifically targeting 1920 pixels wide by 1080 pixels tall (a 16:9 aspect ratio).

Video Topic: {{{videoTopic}}}
Color Scheme (for design guidance): {{{colorScheme}}}
Font Pairing (for design guidance): {{{fontPairing}}}
Style (for design guidance): {{{style}}}
{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
CRITICAL INSTRUCTION (User Image Provided): A user-uploaded image is provided. YOU MUST use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally.
{{/if}}

IMPORTANT - PARAMETER USAGE & TEXT RESTRICTIONS (ABSOLUTELY CRITICAL):
1.  **Parameter Influence, NOT Text:** The selected Color Scheme ({{{colorScheme}}}), Font Pairing ({{{fontPairing}}}), and Style ({{{style}}}) are for INSPIRATION and GUIDANCE of the visual design ONLY. Their names or descriptions (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo') MUST NOT appear as text anywhere on the generated thumbnail image.
2.  **Video Topic is KING for Text:** The ONLY text permitted on the thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the Video Topic: "{{{videoTopic}}}". NO other words, sentences, or descriptions (especially not parameter names) should be written on the image.

Recap for Text: The text on the thumbnail must be concise, taken ONLY from the video topic. All other parameters guide the visual style, not the text content.

Incorporate these elements into a compelling thumbnail design. The primary text (derived *only* from the video topic) should be prominent.
The thumbnail MUST be high resolution, targeting 1920x1080 pixels (16:9 aspect ratio), and returned as a data URI.
  `,
});

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    const basePromptText = `Generate a YouTube thumbnail for the video titled: "${input.videoTopic}".
The thumbnail must be:
- **Styled for Maximum Impact:** Design the thumbnail to match the latest viral YouTube clickbait strategies.
- **Bold & Clear Text:** Feature bold, easy-to-read text (derived *only* from the video topic: "${input.videoTopic}").
- **High Contrast & Visual Pop:** Use colors effectively for high contrast and immediate visual attention, guided by the color scheme parameter: "${input.colorScheme}".
- **Clear Focal Point:** The thumbnail must have a clear focal point that draws the viewer's eye.
- **Minimal Clutter:** Avoid visual clutter. Focus on a single, clear message or visual.
- **Attention-Grabbing Elements:** Incorporate attention-grabbing visual elements relevant to the video topic: "${input.videoTopic}".
- **Optimized for Clicks & Small Sizes:** The thumbnail must be optimized for maximum clicks and maintain clarity even at small sizes.
- **Professional & Relevant:** Look polished, high-quality, and accurately reflect the video topic: "${input.videoTopic}".
- Typographic Style: Apply a font style inspired by the font pairing parameter: "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style parameter: "${input.style}".
- Aspect Ratio & Resolution: The generated image MUST inherently be high resolution, specifically targeting 1920 pixels wide by 1080 pixels tall (a 16:9 aspect ratio).

IMPORTANT - PARAMETER USAGE & TEXT RESTRICTIONS (ABSOLUTELY CRITICAL):
1. Parameter Influence, NOT Text: The selected Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}") are for INSPIRATION and GUIDANCE of the visual design ONLY. Their names or descriptions (e.g., "Bright & Punchy", "Modern Sans Serif Duo") MUST NOT appear as text anywhere on the generated thumbnail image.
2. Video Topic is KING for Text: The ONLY text permitted on the thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the Video Topic: "${input.videoTopic}". NO other words, sentences, or descriptions (especially not parameter names) should be written on the image.

Recap for Text: The text on the thumbnail must be concise, taken ONLY from the video topic. All other parameters guide the visual style, not the text content.

The text (derived *only* from "${input.videoTopic}") should be prominent.
Prioritize a clean aesthetic with strong typography. Ensure any human figures (if generated or present in an uploaded image) are well-composed and look professional.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;

    if (input.uploadedImageDataUri) {
      imageGenerationPromptConfig = [
        { media: { url: input.uploadedImageDataUri } },
        { text: `CRITICAL INSTRUCTION (User Image Provided):\nA user-uploaded image is provided as the first media item in this prompt. YOU MUST use this uploaded image as the_ABSOLUTE_PRIMARY_VISUAL_FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally.\n\n${basePromptText}\n\nFurther details for using the uploaded image: Integrate it naturally as a key component or background for the thumbnail, complementing the Video Topic ("${input.videoTopic}"). REMEMBER THE CRITICAL TEXT AND PARAMETER USAGE RULES ABOVE: Parameter names (like "${input.colorScheme}") are for design guidance only and MUST NOT be written on the image. Text on the image MUST come ONLY from the Video Topic ("${input.videoTopic}"). The final image MUST target a resolution of 1920x1080 pixels.` }
      ];
    } else {
      imageGenerationPromptConfig = `${basePromptText}\n\nINSTRUCTION (No User Image): Generate all visual elements for the thumbnail based on the Video Topic ("${input.videoTopic}"). REMEMBER THE CRITICAL TEXT AND PARAMETER USAGE RULES ABOVE: Parameter names (like "${input.colorScheme}") are for design guidance only and MUST NOT be written on the image. Text on the image MUST come ONLY from the Video Topic ("${input.videoTopic}"). Ensure the generated image is high resolution, specifically targeting 1920x1080 pixels (16:9 aspect ratio).`;
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
