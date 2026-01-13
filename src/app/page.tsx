import { HeroSection } from '@/components/HeroSection';
import { ProductsSection } from '@/components/ProductsSection';
import { AboutSection } from '@/components/AboutSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <ProductsSection />
        <AboutSection />
      </main>
    </div>
  );
}
