
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
  prompt: `You are an expert YouTube thumbnail designer, specializing in refining thumbnails to align with the latest viral YouTube clickbait strategies.

You will be given a previous thumbnail and parameters. Your task is to regenerate the thumbnail, making it align with the latest viral YouTube clickbait strategies and significantly more:
- **Styled for Maximum Impact & Engagement:** Elevate the design to be highly compelling by adopting cutting-edge YouTube thumbnail strategies. This involves dramatically enhancing visual impact through dynamic compositions, intriguing and attention-grabbing elements, and a clear subject focus.
- **Bold & Clearer Text:** Make text even bolder, clearer, and more prominent.
- **Optimized Colors & High Contrast:** Optimize colors/contrast for immediate attention and visual pop.
- **Clear Focal Point & Minimal Clutter:** Ensure a clear focal point and remove any unnecessary visual clutter.
- **Optimized for Clicks & Small Sizes:** The regenerated thumbnail must be optimized for maximum clicks and maintain clarity even at small sizes.
- **Professional & Relevant:** Ensure a polished, high-quality finish that accurately reflects the video's content.
- **Aspect Ratio & Resolution:** The regenerated image MUST inherently be high resolution, specifically targeting 1920 pixels wide by 1080 pixels tall (a 16:9 aspect ratio).

Consider the following inputs:
Video Topic: {{{videoTopic}}}
Color Scheme (for design guidance): {{{colorScheme}}}
Font Pairing (for design guidance): {{{fontPairing}}}
Style (for design guidance): {{{style}}}
Previous Thumbnail: {{media url=previousThumbnail}}

{{#if uploadedImageDataUri}}
New User Provided Image: {{media url=uploadedImageDataUri}}
CRITICAL INSTRUCTION FOR REGENERATION (NEW USER IMAGE PROVIDED):
- The FIRST media item in this prompt is the *previous thumbnail*.
- The SECOND media item in this prompt is a *newly uploaded image* by the user.
YOUR ABSOLUTE TOP PRIORITY is to use the NEWLY UPLOADED IMAGE (the second media item) as the dominant visual foundation for the regenerated thumbnail. It must be the central focus or main background. You may draw MINOR inspiration or subtle elements from the PREVIOUS THUMBNAIL (the first media item) ONLY if they directly enhance and integrate seamlessly with the new uploaded image and fit the overall design goals of clarity, modernity, and professionalism. The final design MUST heavily feature and be built around the new user-uploaded image.
{{else}}
Instruction for Previous Thumbnail: Analyze the 'Previous Thumbnail' (first media item) and apply your expertise to significantly enhance its design based on the other parameters, aligning with the quality goals mentioned above.
{{/if}}

IMPORTANT - PARAMETER USAGE & TEXT RESTRICTIONS (ABSOLUTELY CRITICAL FOR REGENERATION):
1.  **Parameter Influence, NOT Text:** The selected Color Scheme ({{{colorScheme}}}), Font Pairing ({{{fontPairing}}}), and Style ({{{style}}}) are for INSPIRATION and GUIDANCE of the visual design ONLY. Their names or descriptions (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo') MUST NOT appear as text anywhere on the regenerated thumbnail image.
2.  **Video Topic is KING for Text:** The ONLY text permitted on the regenerated thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the Video Topic: "{{{videoTopic}}}". NO other words, sentences, or descriptions (especially not parameter names) should be written on the image.

Recap for Text: The text on the regenerated thumbnail must be concise, taken ONLY from the video topic. All other parameters guide the visual style, not the text content.

Analyze the provided image(s) and apply your expertise to enhance the design. This might involve adjusting layout, typography, color balance, or adding subtle graphic elements to increase engagement, while adhering to the specified parameters. The goal is a noticeable improvement towards a professional, modern aesthetic with clear, bold text (derived *only* from the Video Topic) and a clean layout.
The new thumbnail MUST be high resolution, targeting 1920x1080 pixels (16:9 aspect ratio), and returned as a data URI.
  `,
});

const regenerateThumbnailFlow = ai.defineFlow(
  {
    name: 'regenerateThumbnailFlow',
    inputSchema: RegenerateThumbnailInputSchema,
    outputSchema: RegenerateThumbnailOutputSchema,
  },
  async input => {
    const baseRegenerationText = `Regenerate the thumbnail for video topic "${input.videoTopic}" to align with the latest viral YouTube clickbait strategies and make it significantly more:
- **Styled for Maximum Impact & Engagement:** Elevate the design to be highly compelling by adopting cutting-edge YouTube thumbnail strategies for maximum engagement. This includes dramatically enhancing visual impact through dynamic compositions, intriguing and attention-grabbing elements relevant to the video topic ("${input.videoTopic}"), and a clear subject focus.
- **Bolder & Clearer Text:** Make text (derived *only* from the video topic: "${input.videoTopic}") even bolder, clearer, and more prominent.
- **Optimized Colors & High Contrast:** Optimize color usage for pop and readability, based on the selected color scheme parameter: "${input.colorScheme}", ensuring high contrast.
- **Clear Focal Point & Minimal Clutter:** Ensure a clear focal point and remove any unnecessary visual clutter.
- **Optimized for Clicks & Small Sizes:** The regenerated thumbnail must be optimized for maximum clicks and maintain clarity even at small sizes.
- **Professional Composition & Relevance:** Ensure any human figures or key elements are well-composed, look professional, and the thumbnail accurately reflects the video topic ("${input.videoTopic}").
- Typographic Style: Apply a font style inspired by the font pairing parameter: "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style parameter: "${input.style}".
- Aspect Ratio & Resolution: The regenerated image MUST inherently be high resolution, specifically targeting 1920 pixels wide by 1080 pixels tall (a 16:9 aspect ratio).

IMPORTANT - PARAMETER USAGE & TEXT RESTRICTIONS (ABSOLUTELY CRITICAL FOR REGENERATION):
1. Parameter Influence, NOT Text: The selected Color Scheme ("${input.colorScheme}"), Font Pairing ("${input.fontPairing}"), and Style ("${input.style}") are for INSPIRATION and GUIDANCE of the visual design ONLY. Their names or descriptions (e.g., "Bright & Punchy", "Modern Sans Serif Duo") MUST NOT appear as text anywhere on the regenerated thumbnail image.
2. Video Topic is KING for Text: The ONLY text permitted on the regenerated thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the Video Topic: "${input.videoTopic}". NO other words, sentences, or descriptions (especially not parameter names) should be written on the image.

Recap for Text: The text on the regenerated thumbnail must be concise, taken ONLY from the video topic. All other parameters guide the visual style, not the text content.

Aim for a clear upgrade, featuring strong, legible text (derived *only* from "${input.videoTopic}") and a clean, uncluttered layout.`;

    const promptParts: Array<Record<string, any>> = [
      { media: { url: input.previousThumbnail } }, // Previous thumbnail is always the first media item.
    ];

    let regenerationInstructionsText = baseRegenerationText;

    if (input.uploadedImageDataUri) {
      promptParts.push({ media: {url: input.uploadedImageDataUri }}); // New uploaded image is the second media item, if present.
      regenerationInstructionsText += `\n\nCRITICAL INSTRUCTION FOR REGENERATION (NEW USER IMAGE PROVIDED):\n- The FIRST media item in this prompt is the *previous thumbnail*.\n- The SECOND media item in this prompt is a *newly uploaded image* by the user.\nYOUR ABSOLUTE TOP PRIORITY is to use the NEWLY UPLOADED IMAGE (the second media item) as the dominant visual foundation for the regenerated thumbnail. It must be the central focus or main background. You may draw MINOR inspiration or subtle elements from the PREVIOUS THUMBNAIL (the first media item) ONLY if they directly enhance and integrate seamlessly with the new uploaded image and fit the overall design goals of clarity, modernity, and professionalism.\nThe final design MUST heavily feature and be built around the new user-uploaded image. REMEMBER THE CRITICAL TEXT AND PARAMETER USAGE RULES ABOVE: Parameter names (like "${input.colorScheme}") are for design guidance only and MUST NOT be written on the image. Text on the image MUST come ONLY from the Video Topic ("${input.videoTopic}"). The final image MUST target a resolution of 1920x1080 pixels.`;
    } else {
      regenerationInstructionsText += `\n\nINSTRUCTION FOR REGENERATION (NO NEW USER IMAGE):\n- The media item provided in this prompt is the *previous thumbnail*.\nYour task is to significantly refine this design to make it better, adhering to all the quality guidelines mentioned above. REMEMBER THE CRITICAL TEXT AND PARAMETER USAGE RULES ABOVE: Parameter names (like "${input.colorScheme}") are for design guidance only and MUST NOT be written on the image. Text on the image MUST come ONLY from the Video Topic ("${input.videoTopic}"). Ensure the regenerated image specifically targets 1920x1080 pixels (16:9 aspect ratio).`;
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
