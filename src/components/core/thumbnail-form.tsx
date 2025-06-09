
"use client";

import type { Control } from "react-hook-form";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { COLOR_SCHEMES, FONT_PAIRINGS, STYLES } from "@/lib/constants";
import { Loader2, XCircle } from "lucide-react";
import type { GenerateThumbnailInput } from "@/ai/flows/generate-thumbnail"; // Assuming this type will be updated or is general enough

// Extend this type if it's strictly typed and doesn't include uploadedImageDataUri
interface ThumbnailFormSchema extends GenerateThumbnailInput {
  uploadedImageDataUri?: string;
}

interface ThumbnailFormProps {
  onSubmit: (data: ThumbnailFormSchema) => void;
  isGenerating: boolean;
}

export default function ThumbnailForm({ onSubmit, isGenerating }: ThumbnailFormProps) {
  const { control, handleSubmit, formState: { errors }, setValue } = useFormContext<ThumbnailFormSchema>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={control}
        name="videoTopic"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="videoTopic">Video Topic</FormLabel>
            <FormControl>
              <Input id="videoTopic" placeholder="e.g., 'How to make a great YouTube thumbnail'" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="uploadedImageDataUri"
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel htmlFor="uploadedImage">Upload Image (Optional)</FormLabel>
            <FormControl>
              <Input
                id="uploadedImage"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onChange(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    onChange(undefined);
                  }
                  // Reset file input value to allow re-uploading the same file if cleared,
                  // but only if a value was previously set by this onChange.
                  // This avoids clearing it if the user cancels the file dialog without selecting.
                  if (!file && value) {
                     if (e.target) e.target.value = '';
                  } else if (!file && !value) {
                    // Do nothing if no file selected and no previous value
                  } else {
                     // A file was selected, or a file was cleared where there was one.
                     // The actual e.target.value will be cleared by the browser or by the explicit clear button.
                  }
                }}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary/10 file:text-primary
                  hover:file:bg-primary/20"
              />
            </FormControl>
            {value && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[200px] min-w-0">Image selected</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    onChange(undefined);
                    // Also clear the file input element visually
                    const fileInput = document.getElementById('uploadedImage') as HTMLInputElement | null;
                    if (fileInput) {
                      fileInput.value = '';
                    }
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Clear uploaded image</span>
                </Button>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={control}
          name="colorScheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="colorScheme">Color Scheme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="colorScheme">
                    <SelectValue placeholder="Select a color scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COLOR_SCHEMES.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="fontPairing"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="fontPairing">Font Pairing</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="fontPairing">
                    <SelectValue placeholder="Select a font pairing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FONT_PAIRINGS.map((pairing) => (
                    <SelectItem key={pairing} value={pairing}>
                      {pairing}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="style">Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button type="submit" className="w-full md:w-auto" disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Thumbnail"
        )}
      </Button>
    </form>
  );
}
