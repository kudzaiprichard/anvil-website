import FieldCanvas from "@/components/FieldCanvas";
import Instruments from "@/components/Instruments";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import OpenSource from "@/components/OpenSource";
import Download from "@/components/Download";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <FieldCanvas />
      <Instruments />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Features />
        <OpenSource />
        <Download />
      </main>
      <Footer />
    </>
  );
}
