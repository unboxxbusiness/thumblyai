
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Thumbly Ai. All rights reserved.</p>
        <p className="mt-1">
          <Link href="https://www.learncodewithrk.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">
            Learn Code With RK
          </Link>
        </p>
      </div>
    </footer>
  );
}
