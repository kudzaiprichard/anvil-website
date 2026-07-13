import BackgroundSwitcher from "@/components/BackgroundSwitcher";
import Instruments from "@/components/Instruments";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import OpenSource from "@/components/OpenSource";
import Download from "@/components/Download";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <BackgroundSwitcher />
      <Instruments />
      <Marquee />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Features />
        <OpenSource />
        <Download />
      </main>
      <Footer />
    </>
  );
}
