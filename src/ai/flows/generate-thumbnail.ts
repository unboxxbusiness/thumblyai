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

Consider the following inputs:
Video Topic: {{{videoTopic}}}
Color Scheme: {{{colorScheme}}}
Font Pairing: {{{fontPairing}}} (Interpret as a general typographic style suggestion)
Style: {{{style}}}

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
- Clear & Legible: Feature bold, easy-to-read text.
- High Contrast: Use colors effectively for readability and pop.
- Professional: Look polished and high-quality.
- Engaging: Designed to maximize click-through rates.
- Relevant: Accurately reflect the video topic.

Incorporate the following elements:
Video Topic: "${input.videoTopic}"
Color Scheme: "${input.colorScheme}" (Use as a guide, prioritize overall modern aesthetic)
Font Pairing: "${input.fontPairing}" (Interpret this as a general typographic style guide for the text elements, e.g., 'Modern Sans Serif Duo' means use clean sans-serif fonts)
Style: "${input.style}" (e.g., minimalist, bold, illustrated. Ensure this aligns with a modern YouTube look)

The main text derived from the video topic should be prominent. Avoid clutter. Focus on a single, clear message or visual.
For example, if the topic is 'How to invest in stocks', the thumbnail might feature a stylized graph, a person looking thoughtful, and bold text 'INVESTING 101'.
Prioritize a clean aesthetic with strong typography. Ensure any human figures are well-composed and look professional.`;

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
