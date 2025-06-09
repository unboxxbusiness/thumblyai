
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
    "An optional, new user-uploaded image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. If provided, this should influence or replace parts of the previous thumbnail."
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

// This definePrompt is good for schema definition.
// The main flow will construct a more complex prompt for image generation.
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

Consider the following inputs:
Video Topic: {{{videoTopic}}}
Color Scheme: {{{colorScheme}}}
Font Pairing: {{{fontPairing}}}
Style: {{{style}}}
Previous Thumbnail: {{media url=previousThumbnail}}
{{#if uploadedImageDataUri}}
New User Provided Image: {{media url=uploadedImageDataUri}}
Instruction: A new image has also been uploaded. Integrate this new image prominently into the regenerated thumbnail, possibly replacing elements from the 'Previous Thumbnail' or using it as the new primary visual. Ensure it blends well with the overall style, topic, color scheme, and font pairing, and improve upon the previous design. The text on the thumbnail should primarily be derived from the 'Video Topic'.
{{else}}
Instruction: Analyze the 'Previous Thumbnail' and apply your expertise to enhance its design based on the other parameters. The text on the thumbnail should primarily be derived from the 'Video Topic'.
{{/if}}

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style as text in the new thumbnail image. Instead, *use* these selections to *guide* the visual design choices, improving upon the previous thumbnail.

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
    const baseRegenerationText = `Regenerate the thumbnail to be significantly more modern, engaging, and professional, in the style of top YouTube creators like Ali Abdaal.
Focus on:
- **Improved Visual Appeal:** Make it cleaner, more minimalist yet eye-catching.
- **Bolder & Clearer Typography:** Ensure text derived from the video topic ("${input.videoTopic}") is highly legible and impactful.
- **Enhanced Contrast & Colors:** Optimize color usage for pop and readability based on the selected color scheme: "${input.colorScheme}".
- **Increased Click-Worthiness:** Design for maximum engagement.
- **Professional Composition:** Ensure any human figures or key elements are well-composed and look professional.
- Typographic Style: Apply a font style inspired by "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style: "${input.style}".

IMPORTANT: Do NOT include the literal names of the color scheme, font pairing, or style as text on the thumbnail image itself. Instead, *use* these selections to *guide* the visual design choices. The text on the thumbnail should primarily be derived from the 'Video Topic'.

Aim for a clear upgrade, featuring strong, legible text and a clean, uncluttered layout. Ensure the final image is high resolution.`;

    const promptParts: Array<Record<string, any>> = [
      { media: { url: input.previousThumbnail } }, 
    ];

    let regenerationInstructionsText = baseRegenerationText;

    if (input.uploadedImageDataUri) {
      promptParts.push({ media: {url: input.uploadedImageDataUri }});
      regenerationInstructionsText += `\n\nINSTRUCTION FOR REGENERATION (MULTI-IMAGE CONTEXT):
The FIRST image provided in the context is the *previous thumbnail*.
The SECOND image provided in the context is a *newly uploaded image* by the user.
Please regenerate the thumbnail. Prioritize incorporating the NEWLY UPLOADED IMAGE (second image) as the primary visual element or background. You may draw inspiration or elements from the PREVIOUS THUMBNAIL (first image) if they complement the new image and the overall design goals.
The goal is to create an improved thumbnail based on the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}"), strongly featuring the new user-uploaded image.`;
    } else {
      regenerationInstructionsText += `\n\nINSTRUCTION FOR REGENERATION (SINGLE-IMAGE CONTEXT):
The image provided in the context is the *previous thumbnail*.
Refine this design to make it significantly better, adhering to the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}").`;
    }
    promptParts.push({text: regenerationInstructionsText});

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
