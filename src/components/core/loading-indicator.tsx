import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  className?: string;
  size?: number;
  text?: string;
}

export default function LoadingIndicator({ className, size = 24, text }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 text-muted-foreground", className)}>
      <Loader2 className={cn("animate-spin text-primary", `h-${size/4} w-${size/4}`)} style={{width: size, height: size}} />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
}
