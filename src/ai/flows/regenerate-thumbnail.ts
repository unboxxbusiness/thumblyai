
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

// This prompt definition is kept for potential future use or direct invocation,
// but the regenerateThumbnailFlow currently constructs its own prompt for ai.generate.
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
- **Aspect Ratio & Resolution:** The regenerated image should inherently be high resolution and suitable for a 1920x1080 YouTube thumbnail (16:9 aspect ratio).

Consider the following inputs:
Video Topic: {{{videoTopic}}}
Color Scheme: {{{colorScheme}}}
Font Pairing: {{{fontPairing}}}
Style: {{{style}}}
Previous Thumbnail: {{media url=previousThumbnail}}

{{#if uploadedImageDataUri}}
New User Provided Image: {{media url=uploadedImageDataUri}}
Instruction for New User Image: A new image has also been uploaded (second media item). YOU MUST prioritize and prominently integrate this NEW user-provided image into the regenerated thumbnail. It should replace elements from the 'Previous Thumbnail' or become the new primary visual. Ensure it blends seamlessly and professionally with the overall style, topic, color scheme, and font pairing, improving upon the previous design. The text on the thumbnail should be *only* the most essential part of the video topic, very concise.
{{else}}
Instruction for Previous Thumbnail: Analyze the 'Previous Thumbnail' (first media item) and apply your expertise to significantly enhance its design based on the other parameters. The text on the thumbnail should primarily be derived *only* from the 'Video Topic', keeping it concise.
{{/if}}

IMPORTANT (Applies to all regenerations):
1.  **Text Content:** The text on the thumbnail should be derived *only* from the 'Video Topic' ({{{videoTopic}}}). Keep it very concise and impactful. Do NOT add any extra words or sentences.
2.  **Parameter Usage:** Do NOT include the literal names of the color scheme, font pairing, or style as text in the new thumbnail image. Instead, *use* these selections to *guide* the visual design choices, improving upon the previous thumbnail.

Analyze the provided image(s) and apply your expertise to enhance the design. This might involve adjusting layout, typography, color balance, or adding subtle graphic elements to increase engagement, while adhering to the specified parameters. The goal is a noticeable improvement towards a professional, modern aesthetic with clear, bold text (derived *only*from the Video Topic) and a clean layout.
The new thumbnail should be high resolution (suitable for 1920x1080, 16:9 aspect ratio) and returned as a data URI.
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
- **Bolder & Clearer Typography:** Ensure text is highly legible and impactful.
- **Enhanced Contrast & Colors:** Optimize color usage for pop and readability based on the selected color scheme: "${input.colorScheme}".
- **Increased Click-Worthiness:** Design for maximum engagement.
- **Professional Composition:** Ensure any human figures or key elements are well-composed and look professional.
- Typographic Style: Apply a font style inspired by "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style: "${input.style}".
- Aspect Ratio & Resolution: The regenerated image must inherently be high resolution and perfectly suitable for a 1920x1080 YouTube thumbnail (16:9 aspect ratio).

IMPORTANT - TEXT CONTENT:
The text on the thumbnail MUST be derived *only* from the most essential part of the video topic: "${input.videoTopic}". Keep it extremely concise and impactful. Do NOT add any extra words, phrases, or sentences beyond what is essential from the topic.

IMPORTANT - PARAMETER USAGE:
Do NOT include the literal names of the color scheme, font pairing, or style as text on the thumbnail image itself. Instead, *use* these selections to *guide* all visual design choices.

Aim for a clear upgrade, featuring strong, legible text (derived *only* from "${input.videoTopic}") and a clean, uncluttered layout.`;

    const promptParts: Array<Record<string, any>> = [
      { media: { url: input.previousThumbnail } }, // Previous thumbnail is always the first media item.
    ];

    let regenerationInstructionsText = baseRegenerationText;

    if (input.uploadedImageDataUri) {
      promptParts.push({ media: {url: input.uploadedImageDataUri }}); // New uploaded image is the second media item, if present.
      regenerationInstructionsText += `\n\nCRITICAL INSTRUCTION FOR REGENERATION (NEW USER IMAGE PROVIDED):\n- The FIRST media item in this prompt is the *previous thumbnail*.\n- The SECOND media item in this prompt is a *newly uploaded image* by the user.\nYOUR ABSOLUTE TOP PRIORITY is to use the NEWLY UPLOADED IMAGE (the second media item) as the dominant visual foundation for the regenerated thumbnail. It must be the central focus or main background. You may draw MINOR inspiration or subtle elements from the PREVIOUS THUMBNAIL (the first media item) ONLY if they directly enhance and integrate seamlessly with the new uploaded image and fit the overall design goals of clarity, modernity, and professionalism.\nThe final design MUST heavily feature and be built around the new user-uploaded image while adhering to the Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}"). Remember, the text must be *only* the most essential part of the video topic, very concise.`;
    } else {
      regenerationInstructionsText += `\n\nINSTRUCTION FOR REGENERATION (NO NEW USER IMAGE):\n- The media item provided in this prompt is the *previous thumbnail*.\nYour task is to significantly refine this design to make it better, adhering to all the quality guidelines mentioned above and the specific parameters: Video Topic ("${input.videoTopic}"), Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}"). The text on the thumbnail should be *only* the most essential part of the video topic, very concise.`;
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
