
import { ImagePlay } from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '@/components/core/mode-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <ImagePlay className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground font-headline">Thumbly Ai</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Future navigation items can go here */}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
