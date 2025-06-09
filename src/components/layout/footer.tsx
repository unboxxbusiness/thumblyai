export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Thumbly Ai. All rights reserved.</p>
        <p className="mt-1">Powered by Google Gemini & Genkit.</p>
      </div>
    </footer>
  );
}
