"use client";

import type { Control } from "react-hook-form";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { COLOR_SCHEMES, FONT_PAIRINGS, STYLES } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import type { GenerateThumbnailInput } from "@/ai/flows/generate-thumbnail";

interface ThumbnailFormProps {
  onSubmit: (data: GenerateThumbnailInput) => void;
  isGenerating: boolean;
}

export default function ThumbnailForm({ onSubmit, isGenerating }: ThumbnailFormProps) {
  const { control, handleSubmit, formState: { errors } } = useFormContext<GenerateThumbnailInput>();

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
