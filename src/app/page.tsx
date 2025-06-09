import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ThumbnailGeneratorClient from '@/components/core/thumbnail-generator-client';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <ThumbnailGeneratorClient />
      </main>
      <Footer />
    </div>
  );
}
