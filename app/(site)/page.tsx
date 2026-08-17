import Hero from "@/components/site/Hero";
import Services from "@/components/site/Services";
import Gallery from "@/components/site/Gallery";
import PriceCalculator from "@/components/PriceCalculator";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <Gallery />
      <PriceCalculator />
    </main>
  );
}
