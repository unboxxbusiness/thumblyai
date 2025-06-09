
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
1.  **NO PARAMETER TEXT ON IMAGE:** The "Color Scheme" ({{{colorScheme}}}), "Font Pairing" ({{{fontPairing}}}), and "Style" ({{{style}}}) parameters you are given are strictly for INSPIRING the VISUAL DESIGN of the thumbnail. Their names, descriptions, or any related text MUST NOT, under any circumstances, appear as written text on the generated image. These parameters guide the *look and feel*, NOT the text content.
2.  **VIDEO TOPIC IS THE ONLY SOURCE OF TEXT:** The ONLY text that is allowed to be written on the thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the provided Video Topic: "{{{videoTopic}}}". Do NOT write any other words, phrases, or sentences on the image.

Create a YouTube thumbnail for the video titled: "{{{videoTopic}}}".
Your design MUST use the predefined color scheme ("{{{colorScheme}}}"), font pairing ("{{{fontPairing}}}"), and visual style ("{{{style}}}") for inspiration.
The thumbnail must follow the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics:
- **Relevant Imagery:** {{#if uploadedImageDataUri}}Use the User Provided Image (below) as the primary visual foundation.{{else}}You MUST generate or use relevant images, graphics, or visual elements that directly support the content of the video topic ("{{{videoTopic}}}") to enhance context and visual appeal.{{/if}}
- **Clear Focal Point:** Establish a clear visual focal point, such as an expressive face, a dramatic object, or a compelling visual element that instantly draws the viewer's attention.
- **Bold, High-Contrast Text:** Text (derived ONLY from "{{{videoTopic}}}") must be prominent, extremely easy to read, impactful, and feature high contrast against its background.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer.
- **Attention-Grabbing Visual Elements:** Incorporate visual elements that immediately attract attention and are directly relevant to the video's content ("{{{videoTopic}}}").
- **Optimized for Clicks & Small Sizes:** The design must be fully optimized for maximum click-through rate and must look clear, legible, and effective even when viewed as a small thumbnail.
- **Professional & Engaging:** The overall look should be polished, high-quality, and accurately represent the content of the video in an engaging way.

{{#if uploadedImageDataUri}}
User Provided Image: {{media url=uploadedImageDataUri}}
CRITICAL INSTRUCTION (User Image Provided): A user-uploaded image is provided. YOU MUST use this uploaded image as the ABSOLUTE PRIMARY VISUAL FOUNDATION for the thumbnail. All other design elements (text, style, colors, composition) MUST be applied *to, around, or in direct support of* this user image. It should be the central focus or the main background. Ensure it integrates seamlessly and professionally, following all text and parameter rules.
{{/if}}

The primary text (derived *only* from the video topic) should be prominent.
FINAL AND CRITICAL REQUIREMENT FOR IMAGE GENERATION:
The output image dimensions MUST be exactly 1280 pixels wide by 720 pixels tall (a 16:9 aspect ratio).
The visual composition must be designed to perfectly fill this 1280x720 canvas.
There must be NO black bars, NO cropping by the AI, and NO padding within the generated image. The generated content itself MUST utilize the full 1280x720 image canvas.
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
    const basePromptText = `You are an expert YouTube thumbnail designer.

ABSOLUTELY CRITICAL INSTRUCTIONS REGARDING TEXT AND PARAMETERS:
1.  **NO PARAMETER TEXT ON IMAGE:** The "Color Scheme" ("${input.colorScheme}"), "Font Pairing" ("${input.fontPairing}"), and "Style" ("${input.style}") parameters you are given are strictly for INSPIRING the VISUAL DESIGN of the thumbnail. Their names, descriptions, or any related text MUST NOT, under any circumstances, appear as written text on the generated image. These parameters guide the *look and feel*, NOT the text content.
2.  **VIDEO TOPIC IS THE ONLY SOURCE OF TEXT:** The ONLY text that is allowed to be written on the thumbnail image MUST be a very short, impactful phrase or keywords derived directly and exclusively from the provided Video Topic: "${input.videoTopic}". Do NOT write any other words, phrases, or sentences on the image.

Create a YouTube thumbnail for the video titled: "${input.videoTopic}".
Your design MUST use the predefined color scheme ("${input.colorScheme}"), font pairing ("${input.fontPairing}"), and visual style ("${input.style}") for inspiration.
The thumbnail must follow the latest viral YouTube clickbait thumbnail strategies. This means the thumbnail MUST exhibit the following characteristics:
- **Relevant Imagery:** ${input.uploadedImageDataUri ? "Use the User Provided Image (provided as the first media item in this prompt) as the primary visual foundation." : `You MUST generate or use relevant images, graphics, or visual elements that directly support the content of the video topic ("${input.videoTopic}") to enhance context and visual appeal.`}
- **Clear Focal Point:** Establish a clear visual focal point, such as an expressive face, a dramatic object, or a compelling visual element that instantly draws the viewer's attention.
- **Bold, High-Contrast Text:** Text (derived ONLY from "${input.videoTopic}") must be prominent, extremely easy to read, impactful, and feature high contrast against its background.
- **Minimal Clutter:** The design should be clean and uncluttered, focusing on a singular message or visual to avoid overwhelming the viewer.
- **Attention-Grabbing Visual Elements:** Incorporate visual elements that immediately attract attention and are directly relevant to the video's content ("${input.videoTopic}").
- **Optimized for Clicks & Small Sizes:** The design must be fully optimized for maximum click-through rate and must look clear, legible, and effective even when viewed as a small thumbnail.
- **Professional & Engaging:** The overall look should be polished, high-quality, and accurately represent the content of the video ("${input.videoTopic}") in an engaging way.

The text (derived *only* from "${input.videoTopic}") should be prominent.
Prioritize a clean aesthetic with strong typography. Ensure any human figures (if generated or present in an uploaded image) are well-composed and look professional.`;

    let imageGenerationPromptConfig: string | Array<Record<string, any>>;
    const finalResolutionInstruction = `
FINAL AND CRITICAL REQUIREMENT FOR IMAGE GENERATION:
The output image dimensions MUST be exactly 1280 pixels wide by 720 pixels tall (a 16:9 aspect ratio).
The visual composition must be designed to perfectly fill this 1280x720 canvas.
There must be NO black bars, NO cropping by the AI, and NO padding within the generated image. The generated content itself MUST utilize the full 1280x720 image canvas.`;

    if (input.uploadedImageDataUri) {
      imageGenerationPromptConfig = [
        { media: { url: input.uploadedImageDataUri } },
        { text: `${basePromptText}\n\nADDITIONAL EMPHASIS (User Image Provided):\nThe user-uploaded image (first media item) is paramount. Ensure it is the absolute primary visual foundation. All other elements support it. REMEMBER ALL CRITICAL TEXT AND PARAMETER USAGE RULES.${finalResolutionInstruction}` }
      ];
    } else {
      imageGenerationPromptConfig = `${basePromptText}\n\nADDITIONAL EMPHASIS (No User Image): Focus on generating compelling visuals directly related to "${input.videoTopic}". REMEMBER ALL CRITICAL TEXT AND PARAMETER USAGE RULES.${finalResolutionInstruction}`;
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
    
