
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
  prompt: `You are an expert YouTube thumbnail designer, specializing in refining and elevating thumbnails to match the style of top creators (e.g., Ali Abdaal).

You will be given a previous thumbnail and parameters. Your task is to regenerate the thumbnail, making it significantly more:
- **Modern & Engaging:** Align with current YouTube design trends focusing on clarity, bold typography, and high visual appeal.
- **Significantly Increased Click-Worthiness & Modern Appeal:** Elevate the design to be highly compelling by adopting cutting-edge YouTube thumbnail strategies for maximum engagement and a modern, professional look (e.g., Ali Abdaal). This involves dramatically enhancing visual impact (e.g., more dynamic compositions, intriguing elements, clear subject focus, or emotion-driven imagery if appropriate), making text even bolder, clearer, and more prominent, and optimizing colors/contrast for immediate attention, all while improving relevance and directness to the video topic.
- **Professional:** Ensure a polished, high-quality finish.
- **Clearer & More Impactful:** Improve text legibility, color contrast, and overall composition.
- **Aspect Ratio & Resolution:** The regenerated image should inherently be high resolution and suitable for a 1920x1080 YouTube thumbnail (16:9 aspect ratio).

Consider the following inputs:
Video Topic: {{{videoTopic}}}
Color Scheme (for design guidance): {{{colorScheme}}}
Font Pairing (for design guidance): {{{fontPairing}}}
Style (for design guidance): {{{style}}}
Previous Thumbnail: {{media url=previousThumbnail}}

{{#if uploadedImageDataUri}}
New User Provided Image: {{media url=uploadedImageDataUri}}
Instruction for New User Image: A new image has also been uploaded (second media item). YOU MUST prioritize and prominently integrate this NEW user-provided image into the regenerated thumbnail. It should replace elements from the 'Previous Thumbnail' or become the new primary visual. Ensure it blends seamlessly and professionally with the overall style, topic, color scheme, and font pairing, improving upon the previous design.
{{else}}
Instruction for Previous Thumbnail: Analyze the 'Previous Thumbnail' (first media item) and apply your expertise to significantly enhance its design based on the other parameters.
{{/if}}

IMPORTANT - PARAMETER USAGE & TEXT RESTRICTIONS (ABSOLUTELY CRITICAL FOR REGENERATION):
1.  **Parameter Influence, NOT Text:** The selected Color Scheme ({{{colorScheme}}}), Font Pairing ({{{fontPairing}}}), and Style ({{{style}}}) are for INSPIRATION and GUIDANCE of the visual design ONLY. Their names or descriptions (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo') MUST NOT appear as text anywhere on the regenerated thumbnail image.
2.  **Video Topic is KING for Text:** The ONLY text permitted on the regenerated thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the Video Topic: "{{{videoTopic}}}". NO other words, sentences, or descriptions (especially not parameter names) should be written on the image.

Recap for Text: The text on the regenerated thumbnail must be concise, taken ONLY from the video topic. All other parameters guide the visual style, not the text content.

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
- **Enhanced Contrast & Colors:** Optimize color usage for pop and readability based on the selected color scheme parameter: "${input.colorScheme}".
- **Significantly Increased Click-Worthiness & Modern Appeal:** Elevate the design to be highly compelling by adopting cutting-edge YouTube thumbnail strategies for maximum engagement and a modern, professional look (e.g., Ali Abdaal). This involves dramatically enhancing visual impact (e.g., more dynamic compositions, intriguing elements, clear subject focus, or emotion-driven imagery if appropriate), making text even bolder, clearer, and more prominent, and optimizing colors/contrast for immediate attention, all while improving relevance and directness to the video topic.
- **Professional Composition:** Ensure any human figures or key elements are well-composed and look professional.
- Typographic Style: Apply a font style inspired by the font pairing parameter: "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style parameter: "${input.style}".
- Aspect Ratio & Resolution: The regenerated image must inherently be high resolution and perfectly suitable for a 1920x1080 YouTube thumbnail (16:9 aspect ratio).

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
      regenerationInstructionsText += `\n\nCRITICAL INSTRUCTION FOR REGENERATION (NEW USER IMAGE PROVIDED):\n- The FIRST media item in this prompt is the *previous thumbnail*.\n- The SECOND media item in this prompt is a *newly uploaded image* by the user.\nYOUR ABSOLUTE TOP PRIORITY is to use the NEWLY UPLOADED IMAGE (the second media item) as the dominant visual foundation for the regenerated thumbnail. It must be the central focus or main background. You may draw MINOR inspiration or subtle elements from the PREVIOUS THUMBNAIL (the first media item) ONLY if they directly enhance and integrate seamlessly with the new uploaded image and fit the overall design goals of clarity, modernity, and professionalism.\nThe final design MUST heavily feature and be built around the new user-uploaded image. REMEMBER THE CRITICAL TEXT AND PARAMETER USAGE RULES ABOVE: Parameter names (like "${input.colorScheme}") are for design guidance only and MUST NOT be written on the image. Text on the image MUST come ONLY from the Video Topic ("${input.videoTopic}").`;
    } else {
      regenerationInstructionsText += `\n\nINSTRUCTION FOR REGENERATION (NO NEW USER IMAGE):\n- The media item provided in this prompt is the *previous thumbnail*.\nYour task is to significantly refine this design to make it better, adhering to all the quality guidelines mentioned above. REMEMBER THE CRITICAL TEXT AND PARAMETER USAGE RULES ABOVE: Parameter names (like "${input.colorScheme}") are for design guidance only and MUST NOT be written on the image. Text on the image MUST come ONLY from the Video Topic ("${input.videoTopic}").`;
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
