
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
    const detailedPrompt = `Generate a high-quality, modern YouTube thumbnail, in the style of top creators like Ali Abdaal.
The thumbnail must be:
- Visually Striking: Clean, minimalist, yet eye-catching.
- Clear & Legible: Feature bold, easy-to-read text that is directly related to the video topic.
- High Contrast: Use colors effectively for readability and visual pop.
- Professional: Look polished and high-quality.
- Engaging: Designed to maximize click-through rates.
- Relevant: Accurately reflects the video's content.

Video Topic: "${input.videoTopic}"
Use this topic to derive the main text for the thumbnail.

Color Scheme: "${input.colorScheme}"
Interpret this color scheme to select appropriate colors for the background, text, and any graphical elements. For example, if 'Bright & Punchy' is selected, use vibrant and contrasting colors.

Font Pairing: "${input.fontPairing}"
Interpret this as a general typographic style. For example, 'Modern Sans Serif Duo' means use clean sans-serif fonts. The text should be a key element of the thumbnail.

Style: "${input.style}"
Apply this style to the overall visual design. For example, 'Minimalist Clean' means avoid clutter and use simple elements.

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style (e.g., do not write 'Bright & Punchy' or 'Modern Sans Serif Duo' as text on the thumbnail image itself). Instead, *use* these selections to *guide* the visual design choices like color palettes, font choices, and overall aesthetic. The text on the thumbnail should be derived from the 'Video Topic'.

The main text from the video topic should be prominent. Avoid visual clutter. Focus on a single, clear message or visual.
For example, if the topic is 'How to invest in stocks', the thumbnail might feature a stylized graph, a person looking thoughtful, and bold text like 'INVESTING 101' or 'STOCK MARKET BASICS'.
Prioritize a clean aesthetic with strong typography. Ensure any human figures are well-composed and look professional. Ensure the final image is high resolution and suitable for a YouTube thumbnail.`;

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: detailedPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {thumbnailDataUri: media.url!};
  }
);
