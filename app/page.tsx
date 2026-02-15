import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DeployCard from "./components/DeployCard";
import ComparisonSection from "./components/ComparisonSection";
import UseCasesMarquee from "./components/UseCasesMarquee";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <HeroSection />
        <DeployCard />
      </section>
      <ComparisonSection />
      <UseCasesMarquee />
      <Footer />
    </main>
  );
}
