
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
  prompt: `You are an expert YouTube thumbnail designer.

ABSOLUTELY CRITICAL INSTRUCTIONS REGARDING TEXT AND PARAMETERS:
1.  **NO PARAMETER TEXT ON IMAGE:** The "Color Scheme" ({{{colorScheme}}}), "Font Pairing" ({{{fontPairing}}}), and "Style" ({{{style}}}) parameters you are given are strictly for INSPIRING the VISUAL DESIGN of the thumbnail. Their names, descriptions (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo'), or any related text MUST NOT, under any circumstances, appear as written text on the generated image. These parameters guide the *look and feel*, NOT the text content.
2.  **VIDEO TOPIC IS THE ONLY SOURCE OF TEXT:** The ONLY text that is allowed to be written on the thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the provided Video Topic: "{{{videoTopic}}}". Do NOT write any other words, phrases, or sentences on the image, especially not parameter names or their values.

Recap for Clarity:
- Text on Image: ONLY from "{{{videoTopic}}}", keep it short and bold.
- Parameters ({{{colorScheme}}}, {{{fontPairing}}}, {{{style}}}): Guide visual choices (colors, fonts, overall aesthetic) ONLY. DO NOT write their names on the image.

Your primary task is to create a YouTube thumbnail for the video titled "{{{videoTopic}}}".
When designing, you MUST apply the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics:
- **Bold & Clear Text:** Text must be prominent, extremely easy to read, and impactful (derived ONLY from "{{{videoTopic}}}").
- **High Contrast & Visual Pop:** Employ strong color contrasts and visual elements that make the thumbnail stand out immediately, guided by the {{{colorScheme}}} parameter.
- **Clear Focal Point:** There must be a single, unambiguous focal point that instantly draws the viewer's attention.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer.
- **Attention-Grabbing Visual Elements:** Incorporate elements that are inherently eye-catching and directly relevant to the video's topic.
- **Optimized for Clicks & Small Sizes:** The design must be engineered for maximum click-through rates and maintain its clarity and impact even when viewed as a small icon.
- **Professional & Relevant:** The overall look should be polished, high-quality, and accurately represent the content of the video.

Use the following parameters to guide the visual design according to the rules above:
Color Scheme (for visual design guidance): {{{colorScheme}}}
Font Pairing (for visual font style guidance): {{{fontPairing}}}
Style (for overall visual aesthetic guidance): {{{style}}}

{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
CRITICAL INSTRUCTION (User Image Provided): A user-uploaded image is provided. YOU MUST use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally, following all text and parameter rules.
{{/if}}

Incorporate these elements into a compelling thumbnail design. The primary text (derived *only* from the video topic) should be prominent.
The thumbnail MUST be high resolution, targeting 1920x1080 pixels (16:9 aspect ratio), and returned as a data URI.
FINAL AND CRITICAL REQUIREMENT: The output image dimensions MUST be exactly 1920 pixels wide by 1080 pixels tall, maintaining a 16:9 aspect ratio. The visual composition must be designed to perfectly fill a 16:9 aspect ratio display. Avoid creating content that would result in significant letterboxing or pillarboxing when displayed in a 16:9 viewport.
  `,
});

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    const basePromptText = `You are an expert YouTube thumbnail designer.

ABSOLUTELY CRITICAL INSTRUCTIONS REGARDING TEXT AND PARAMETERS:
1.  **NO PARAMETER TEXT ON IMAGE:** The "Color Scheme" ("${input.colorScheme}"), "Font Pairing" ("${input.fontPairing}"), and "Style" ("${input.style}") parameters you are given are strictly for INSPIRING the VISUAL DESIGN of the thumbnail. Their names, descriptions (e.g., 'Bright & Punchy', 'Modern Sans Serif Duo'), or any related text MUST NOT, under any circumstances, appear as written text on the generated image. These parameters guide the *look and feel*, NOT the text content.
2.  **VIDEO TOPIC IS THE ONLY SOURCE OF TEXT:** The ONLY text that is allowed to be written on the thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the provided Video Topic: "${input.videoTopic}". Do NOT write any other words, phrases, or sentences on the image, especially not parameter names or their values.

Recap for Clarity:
- Text on Image: ONLY from "${input.videoTopic}", keep it short and bold.
- Parameters ("${input.colorScheme}", "${input.fontPairing}", "${input.style}"): Guide visual choices (colors, fonts, overall aesthetic) ONLY. DO NOT write their names on the image.

Create a YouTube thumbnail for the video titled: "${input.videoTopic}".
You MUST apply the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics:
- **Bold & Clear Text:** Text must be prominent, extremely easy to read, and impactful (derived *only* from the video topic: "${input.videoTopic}").
- **High Contrast & Visual Pop:** Employ strong color contrasts and visual elements that make the thumbnail stand out immediately, guided by the color scheme parameter: "${input.colorScheme}".
- **Clear Focal Point:** There must be a single, unambiguous focal point that instantly draws the viewer's attention.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer.
- **Attention-Grabbing Visual Elements:** Incorporate elements that are inherently eye-catching and directly relevant to the video's topic: "${input.videoTopic}".
- **Optimized for Clicks & Small Sizes:** The design must be engineered for maximum click-through rates and maintain its clarity and impact even when viewed as a small icon.
- **Professional & Relevant:** The overall look should be polished, high-quality, and accurately represent the video topic: "${input.videoTopic}".
- Typographic Style: Apply a font style inspired by the font pairing parameter: "${input.fontPairing}".
- Overall Aesthetic: Adhere to the style parameter: "${input.style}".
- Aspect Ratio & Resolution: The generated image MUST inherently be high resolution, specifically targeting 1920 pixels wide by 1080 pixels tall (a 16:9 aspect ratio). The visual composition of the generated image must be designed to perfectly fill a 16:9 aspect ratio frame. Avoid creating content that would result in significant letterboxing or pillarboxing when displayed in a 16:9 viewport.

The text (derived *only* from "${input.videoTopic}") should be prominent.
Prioritize a clean aesthetic with strong typography. Ensure any human figures (if generated or present in an uploaded image) are well-composed and look professional.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;
    const finalResolutionInstruction = "\n\nFINAL AND CRITICAL REQUIREMENT: The output image dimensions MUST be exactly 1920 pixels wide by 1080 pixels tall, maintaining a 16:9 aspect ratio. The visual composition must be designed to perfectly fill a 16:9 aspect ratio display.";

    if (input.uploadedImageDataUri) {
      imageGenerationPromptConfig = [
        { media: { url: input.uploadedImageDataUri } },
        { text: `${basePromptText}\n\nCRITICAL INSTRUCTION (User Image Provided):\nA user-uploaded image is provided as the first media item in this prompt. YOU MUST use this uploaded image as the_ABSOLUTE_PRIMARY_VISUAL_FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally, REMEMBERING ALL CRITICAL TEXT AND PARAMETER USAGE RULES. The final image MUST target a resolution of 1920x1080 pixels.${finalResolutionInstruction}` }
      ];
    } else {
      imageGenerationPromptConfig = `${basePromptText}\n\nINSTRUCTION (No User Image): Generate all visual elements for the thumbnail based on the Video Topic ("${input.videoTopic}"). REMEMBER ALL CRITICAL TEXT AND PARAMETER USAGE RULES. Ensure the generated image is high resolution, specifically targeting 1920x1080 pixels (16:9 aspect ratio).${finalResolutionInstruction}`;
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
    
