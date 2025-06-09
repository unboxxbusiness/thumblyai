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
  prompt: `!!! EXTREMELY IMPORTANT RULES FOR TEXT ON THE THUMBNAIL !!!
1.  **NO DESCRIPTIVE TEXT FROM PARAMETERS:** The "Color Scheme" ({{{colorScheme}}}), "Font Pairing" ({{{fontPairing}}}), and "Style" ({{{style}}}) parameters are for VISUAL INSPIRATION ONLY. Their names or any descriptive text about them MUST NOT appear on the image.
2.  **ONLY VIDEO TOPIC TEXT:** The ONLY text allowed on the thumbnail image is a very short, impactful phrase derived SOLELY from the Video Topic: "{{{videoTopic}}}". Do NOT include any other words, numbers, or characters. No extra text, no extra comments, no extra content beyond this specific instruction.
3.  **VIOLATION CHECK:** Before outputting the image, double-check and verify that NO unintended text (like parameter names, parts of these instructions, or any other stray characters) has been accidentally included on the image. Only text from "{{{videoTopic}}}" is permitted.

Create a YouTube thumbnail for the video titled: "{{{videoTopic}}}".
Your design MUST use the predefined color scheme ("{{{colorScheme}}}"), font pairing ("{{{fontPairing}}}"), and visual style ("{{{style}}}") for inspiration.
The thumbnail must follow the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics:
- **Relevant Imagery:** {{#if uploadedImageDataUri}}Use the User Provided Image (below) as the primary visual foundation.{{else}}You MUST generate or use relevant images, graphics, or visual elements that directly support the content of the video topic ("{{{videoTopic}}}") to enhance context and visual appeal.{{/if}}
- **Clear Focal Point:** Establish a clear visual focal point, such as an expressive face, a dramatic object, or a compelling visual element that instantly draws the viewer's attention.
- **Bold, High-Contrast Text:** Text (derived ONLY from "{{{videoTopic}}}") must be prominent, extremely easy to read, impactful, and feature high contrast against its background.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer.
- **Attention-Grabbing Visual Elements:** Incorporate visual elements that immediately attract attention and are directly relevant to the video's content ("{{{videoTopic}}}").
- **Optimized for Clicks & Small Sizes:** The design must be fully optimized for maximum click-through rate and must look clear, legible, and effective even when viewed as a small thumbnail.

{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
CRITICAL INSTRUCTION (User Image Provided): A user-uploaded image is provided. YOU MUST use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally, following all text and parameter rules.
{{/if}}

The primary text (derived *only* from the video topic) should be prominent.
FINAL AND CRITICAL REQUIREMENT FOR IMAGE GENERATION:
The output image dimensions MUST be exactly 1280 pixels wide by 720 pixels tall (a 16:9 aspect ratio).
The visual composition must be designed to perfectly fill this 1280x720 canvas.
There must be NO black bars, NO cropping by the AI, and NO padding within the generated image. The generated content itself MUST utilize the full 1280x720 image canvas for direct download and upload compatibility.
Return the image as a data URI.
  `,
});

const generateThumbnailFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFlow',
    inputSchema: GenerateThumbnailInputSchema,
    outputSchema: GenerateThumbnailOutputSchema,
  },
  async input => {
    const basePromptText = `!!! EXTREMELY IMPORTANT RULES FOR TEXT ON THE THUMBNAIL !!!
1.  **NO DESCRIPTIVE TEXT FROM PARAMETERS:** The "Color Scheme" ("${input.colorScheme}"), "Font Pairing" ("${input.fontPairing}"), and "Style" ("${input.style}") parameters are for VISUAL INSPIRATION ONLY. Their names or any descriptive text about them MUST NOT appear on the image.
2.  **ONLY VIDEO TOPIC TEXT:** The ONLY text allowed on the thumbnail image is a very short, impactful phrase derived SOLELY from the Video Topic: "${input.videoTopic}". Do NOT include any other words, numbers, or characters. No extra text, no extra comments, no extra content beyond this specific instruction.
3.  **VIOLATION CHECK:** Before outputting the image, double-check and verify that NO unintended text (like parameter names, parts of these instructions, or any other stray characters) has been accidentally included on the image. Only text from "${input.videoTopic}" is permitted.

Create a YouTube thumbnail for the video titled: "${input.videoTopic}".
Your design MUST use the predefined color scheme ("${input.colorScheme}"), font pairing ("${input.fontPairing}"), and visual style ("${input.style}") for inspiration.
The thumbnail must follow the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics:
- **Relevant Imagery:** ${input.uploadedImageDataUri ? "Use the User Provided Image (provided as the first media item in this prompt) as the primary visual foundation." : `You MUST generate or use relevant images, graphics, or visual elements that directly support the content of the video topic ("${input.videoTopic}") to enhance context and visual appeal.`}
- **Clear Focal Point:** Establish a clear visual focal point, such as an expressive face, a dramatic object, or a compelling visual element that instantly draws the viewer's attention.
- **Bold, High-Contrast Text:** Text (derived ONLY from "${input.videoTopic}") must be prominent, extremely easy to read, impactful, and feature high contrast against its background.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer.
- **Attention-Grabbing Visual Elements:** Incorporate visual elements that immediately attract attention and are directly relevant to the video's content ("${input.videoTopic}").
- **Optimized for Clicks & Small Sizes:** The design must be fully optimized for maximum click-through rate and must look clear, legible, and effective even when viewed as a small thumbnail.

The text (derived *only* from "${input.videoTopic}") should be prominent.
Prioritize a clean aesthetic with strong typography. Ensure any human figures (if generated or present in an uploaded image) are well-composed and look professional.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;
    const finalResolutionInstruction = `
FINAL AND CRITICAL REQUIREMENT FOR IMAGE GENERATION:
The output image dimensions MUST be exactly 1280 pixels wide by 720 pixels tall (a 16:9 aspect ratio).
The visual composition must be designed to perfectly fill this 1280x720 canvas.
There must be NO black bars, NO cropping by the AI, and NO padding within the generated image. The generated content itself MUST utilize the full 1280x720 image canvas for direct download and upload compatibility.`;

    if (input.uploadedImageDataUri) {
      imageGenerationPromptConfig = [
        { media: { url: input.uploadedImageDataUri } },
        { text: `${basePromptText}\n\nCRITICAL INSTRUCTION (User Image Provided): A user-uploaded image is provided. YOU MUST use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally, following all text and parameter rules.\n${finalResolutionInstruction}` }
      ];
    } else {
      imageGenerationPromptConfig = `${basePromptText}\n${finalResolutionInstruction}`;
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
    

    
