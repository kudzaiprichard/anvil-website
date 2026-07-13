import EmberField from "@/components/EmberField";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Thesis from "@/components/Thesis";
import Features from "@/components/Features";
import OpenSource from "@/components/OpenSource";
import Download from "@/components/Download";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <EmberField />
      <Nav />
      <main>
        <Hero />
        <Thesis />
        <Features />
        <OpenSource />
        <Download />
      </main>
      <Footer />
    </>
  );
}
