
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
  prompt: `You are an expert YouTube thumbnail designer.

ABSOLUTELY CRITICAL INSTRUCTIONS REGARDING TEXT AND PARAMETERS FOR REGENERATION:
1.  **NO PARAMETER TEXT ON IMAGE:** The "Color Scheme" ({{{colorScheme}}}), "Font Pairing" ({{{fontPairing}}}), and "Style" ({{{style}}}) parameters you are given are strictly for INSPIRING the VISUAL DESIGN of the thumbnail. Their names, descriptions, or any related text MUST NOT, under any circumstances, appear as written text on the regenerated image. These parameters guide the *look and feel*, NOT the text content.
2.  **VIDEO TOPIC IS THE ONLY SOURCE OF TEXT:** The ONLY text that is allowed to be written on the regenerated thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the provided Video Topic: "{{{videoTopic}}}". Do NOT write any other words, phrases, or sentences on the image.

Recap for Clarity (Regeneration):
- Text on Image: ONLY from "{{{videoTopic}}}", keep it short and bold.
- Parameters ({{{colorScheme}}}, {{{fontPairing}}}, {{{style}}}): Guide visual choices (colors, fonts, overall aesthetic) ONLY. DO NOT write their names on the image.

Your primary task is to REGENERATE a YouTube thumbnail for the video titled "{{{videoTopic}}}", aiming for significant improvement.
Your redesign MUST use the predefined color scheme ("{{{colorScheme}}}"), font pairing ("{{{fontPairing}}}"), and visual style ("{{{style}}}") for inspiration.
The regenerated thumbnail must follow the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics even more strongly:
- **Relevant Imagery:**
  {{#if uploadedImageDataUri}}
    Use the NEW User Provided Image (second media item) as the dominant visual foundation. You may draw MINOR inspiration from the Previous Thumbnail (first media item) if it enhances the new image. The new image should replace or significantly alter the previous thumbnail's imagery.
  {{else}}
    Analyze the Previous Thumbnail (first media item). You MUST enhance it by generating or using relevant images, graphics, or visual elements that directly support the content of the video topic ("{{{videoTopic}}}") to improve context and visual appeal, or by significantly improving existing imagery.
  {{/if}}
- **Clear Focal Point:** Establish or enhance a clear visual focal point, such as an expressive face, a dramatic object, or a compelling visual element that instantly draws the viewer's attention.
- **Bold, High-Contrast Text:** Text (derived ONLY from "{{{videoTopic}}}") must be prominent, extremely easy to read, impactful, and feature high contrast against its background.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer. Remove any unnecessary elements from the previous design.
- **Attention-Grabbing Visual Elements:** Incorporate or enhance visual elements that immediately attract attention and are directly relevant to the video's content ("{{{videoTopic}}}").
- **Optimized for Clicks & Small Sizes:** The design must be fully optimized for maximum click-through rate and must look clear, legible, and effective even when viewed as a small thumbnail.
- **Professional & Engaging:** The overall look should be polished, high-quality, and accurately represent the content of the video in an engaging way, showing a clear improvement over the previous version.

Consider the following inputs, ensuring all text and parameter rules above are strictly followed:
Video Topic: {{{videoTopic}}}
Color Scheme (for visual design guidance): {{{colorScheme}}}
Font Pairing (for visual font style guidance): {{{fontPairing}}}
Style (for overall visual aesthetic guidance): {{{style}}}
Previous Thumbnail: {{media url=previousThumbnail}}

{{#if uploadedImageDataUri}}
New User Provided Image: {{media url=uploadedImageDataUri}}
CRITICAL INSTRUCTION FOR REGENERATION (NEW USER IMAGE PROVIDED):
- The FIRST media item in this prompt is the *previous thumbnail*.
- The SECOND media item in this prompt is a *newly uploaded image* by the user.
YOUR ABSOLUTE TOP PRIORITY is to use the NEWLY UPLOADED IMAGE (the second media item) as the dominant visual foundation for the regenerated thumbnail. It must be the central focus or main background. You may draw MINOR inspiration or subtle elements from the PREVIOUS THUMBNAIL (the first media item) ONLY if they directly enhance and integrate seamlessly with the new uploaded image and fit the overall design goals of clarity, modernity, and professionalism. The final design MUST heavily feature and be built around the new user-uploaded image. Remember all critical text and parameter rules.
{{else}}
Instruction for Previous Thumbnail: Analyze the 'Previous Thumbnail' (first media item) and apply your expertise to significantly enhance its design based on the other parameters and the clickbait strategies. This includes potentially adding or replacing imagery to be more relevant and impactful. Align with the quality goals and critical text/parameter rules mentioned above.
{{/if}}

The goal is a noticeable improvement towards a professional, modern aesthetic with clear, bold text (derived *only* from the Video Topic) and a clean layout.
FINAL AND CRITICAL REQUIREMENT FOR IMAGE GENERATION:
The output image dimensions MUST be exactly 1280 pixels wide by 720 pixels tall (a 16:9 aspect ratio).
The visual composition must be designed to perfectly fill this 1280x720 canvas.
There must be NO black bars, NO cropping by the AI, and NO padding within the generated image. The generated content itself MUST utilize the full 1280x720 image canvas.
Return the image as a data URI.
  `,
});

const regenerateThumbnailFlow = ai.defineFlow(
  {
    name: 'regenerateThumbnailFlow',
    inputSchema: RegenerateThumbnailInputSchema,
    outputSchema: RegenerateThumbnailOutputSchema,
  },
  async input => {
    const baseRegenerationText = `You are an expert YouTube thumbnail designer.

ABSOLUTELY CRITICAL INSTRUCTIONS REGARDING TEXT AND PARAMETERS FOR REGENERATION:
1.  **NO PARAMETER TEXT ON IMAGE:** The "Color Scheme" ("${input.colorScheme}"), "Font Pairing" ("${input.fontPairing}"), and "Style" ("${input.style}") parameters you are given are strictly for INSPIRING the VISUAL DESIGN of the thumbnail. Their names, descriptions, or any related text MUST NOT, under any circumstances, appear as written text on the regenerated image. These parameters guide the *look and feel*, NOT the text content.
2.  **VIDEO TOPIC IS THE ONLY SOURCE OF TEXT:** The ONLY text that is allowed to be written on the regenerated thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the provided Video Topic: "${input.videoTopic}". Do NOT write any other words, phrases, or sentences on the image.

Recap for Clarity (Regeneration):
- Text on Image: ONLY from "${input.videoTopic}", keep it short and bold.
- Parameters ("${input.colorScheme}", "${input.fontPairing}", "${input.style}"): Guide visual choices (colors, fonts, overall aesthetic) ONLY. DO NOT write their names on the image.

Regenerate the YouTube thumbnail for the video titled "${input.videoTopic}", aiming for significant improvement.
Your redesign MUST use the predefined color scheme ("${input.colorScheme}"), font pairing ("${input.fontPairing}"), and visual style ("${input.style}") for inspiration.
The regenerated thumbnail must follow the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics even more strongly:
- **Relevant Imagery:** ${input.uploadedImageDataUri ? "Use the NEW User Provided Image (second media item in this prompt) as the dominant visual foundation. You may draw MINOR inspiration from the Previous Thumbnail (first media item) if it enhances the new image. The new image should replace or significantly alter the previous thumbnail's imagery." : `Analyze the Previous Thumbnail (first media item in this prompt). You MUST enhance it by generating or using relevant images, graphics, or visual elements that directly support the content of the video topic ("${input.videoTopic}") to improve context and visual appeal, or by significantly improving existing imagery.`}
- **Clear Focal Point:** Establish or enhance a clear visual focal point, such as an expressive face, a dramatic object, or a compelling visual element that instantly draws the viewer's attention.
- **Bold, High-Contrast Text:** Text (derived ONLY from "${input.videoTopic}") must be prominent, extremely easy to read, impactful, and feature high contrast against its background.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer. Remove any unnecessary elements from the previous design.
- **Attention-Grabbing Visual Elements:** Incorporate or enhance visual elements that immediately attract attention and are directly relevant to the video's content ("${input.videoTopic}").
- **Optimized for Clicks & Small Sizes:** The design must be fully optimized for maximum click-through rate and must look clear, legible, and effective even when viewed as a small thumbnail.
- **Professional & Engaging:** The overall look should be polished, high-quality, and accurately represent the content of the video ("${input.videoTopic}") in an engaging way, showing a clear improvement over the previous version.

Aim for a clear upgrade, featuring strong, legible text (derived *only* from "${input.videoTopic}") and a clean, uncluttered layout.`;

    const promptParts: Array<Record<string, any>> = [
      { media: { url: input.previousThumbnail } }, // Previous thumbnail is always the first media item.
    ];

    let regenerationInstructionsText = baseRegenerationText;
    const finalResolutionInstruction = `
FINAL AND CRITICAL REQUIREMENT FOR IMAGE GENERATION:
The output image dimensions MUST be exactly 1280 pixels wide by 720 pixels tall (a 16:9 aspect ratio).
The visual composition must be designed to perfectly fill this 1280x720 canvas.
There must be NO black bars, NO cropping by the AI, and NO padding within the generated image. The generated content itself MUST utilize the full 1280x720 image canvas.`;


    if (input.uploadedImageDataUri) {
      promptParts.push({ media: {url: input.uploadedImageDataUri }}); // New uploaded image is the second media item, if present.
      regenerationInstructionsText += `\n\nADDITIONAL EMPHASIS (NEW USER IMAGE PROVIDED):\n- The FIRST media item is the *previous thumbnail*.\n- The SECOND media item is the *new user-uploaded image*.\nYOUR TOP PRIORITY is the NEWLY UPLOADED IMAGE. It's the dominant visual foundation. Minor inspiration from the PREVIOUS thumbnail is acceptable ONLY IF it enhances the new image. The final design MUST heavily feature the new user image. REMEMBER ALL CRITICAL TEXT AND PARAMETER USAGE RULES.${finalResolutionInstruction}`;
    } else {
      regenerationInstructionsText += `\n\nADDITIONAL EMPHASIS (NO NEW USER IMAGE):\n- The media item provided is the *previous thumbnail*.\nSignificantly refine this design based on the clickbait strategies and quality guidelines mentioned, including improving or adding relevant imagery. REMEMBER ALL CRITICAL TEXT AND PARAMETER USAGE RULES.${finalResolutionInstruction}`;
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
    
