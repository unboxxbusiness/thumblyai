
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
  prompt: `You are an expert YouTube thumbnail designer, specializing in refining and elevating thumbnails to match the style of top creators (e.g., Ali Abdaal).

You will be given a previous thumbnail and parameters. Your task is to regenerate the thumbnail, making it significantly more:
- **Modern & Engaging:** Align with current YouTube design trends focusing on clarity, bold typography, and high visual appeal.
- **Click-Worthy:** Optimize for higher click-through rates.
- **Professional:** Ensure a polished, high-quality finish.
- **Clearer & More Impactful:** Improve text legibility, color contrast, and overall composition.

Consider the following inputs and the previous thumbnail:
Video Topic: {{{videoTopic}}}
Color Scheme: {{{colorScheme}}}
Font Pairing: {{{fontPairing}}}
Style: {{{style}}}
Previous Thumbnail: {{media url=previousThumbnail}}

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style as text in the new thumbnail image. Instead, *use* these selections to *guide* the visual design choices, improving upon the previous thumbnail. The text on the thumbnail should primarily be derived from the 'Video Topic'.

Analyze the previous thumbnail and apply your expertise to enhance its design. This might involve adjusting layout, typography, color balance, or adding subtle graphic elements to increase engagement, while adhering to the specified parameters. The goal is a noticeable improvement towards a professional, modern aesthetic with clear, bold text and a clean layout.
Return the new thumbnail as a data URI.
  `,
});

const regenerateThumbnailFlow = ai.defineFlow(
  {
    name: 'regenerateThumbnailFlow',
    inputSchema: RegenerateThumbnailInputSchema,
    outputSchema: RegenerateThumbnailOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.previousThumbnail}},
        {
          text: `Regenerate this thumbnail to be significantly more modern, engaging, and professional, in the style of top YouTube creators like Ali Abdaal.
Focus on:
- **Improved Visual Appeal:** Make it cleaner, more minimalist yet eye-catching.
- **Bolder & Clearer Typography:** Ensure text derived from the video topic is highly legible and impactful.
- **Enhanced Contrast & Colors:** Optimize color usage for pop and readability based on the selected color scheme.
- **Increased Click-Worthiness:** Design for maximum engagement.
- **Professional Composition:** Ensure any human figures or key elements are well-composed and look professional.

Take into account the following parameters, using the provided image as a base for improvement:
Video Topic: "${input.videoTopic}"
Use this topic to derive or refine the main text for the thumbnail.

Color Scheme: "${input.colorScheme}"
Interpret this to adjust or select colors for background, text, and graphics. For example, if the scheme is 'Dark & Moody', use darker, atmospheric colors.

Font Pairing: "${input.fontPairing}"
Interpret this as a typographic style guide. For instance, 'Classic Serif & Sans' suggests a mix of traditional serif and clean sans-serif fonts.

Style: "${input.style}"
Apply this style to the overall visual design. For example, 'Bold & Impactful' suggests strong visual elements and typography.

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style (e.g., do not write 'Bright & Punchy' or 'Modern Sans Serif Duo' as text on the thumbnail image itself). Instead, *use* these selections to *guide* the visual design choices, improving upon the previous thumbnail. The text on the thumbnail should primarily be derived from the 'Video Topic'.

Slightly adjust the design based on these principles and current trends to make it markedly more visually appealing and professional. The aim is a clear upgrade from the previous version, featuring strong, legible text and a clean, uncluttered layout. Ensure the final image is high resolution.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {thumbnail: media.url!};
  }
);
