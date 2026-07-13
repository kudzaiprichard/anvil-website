import EmberField from "@/components/EmberField";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Thesis from "@/components/Thesis";
import Features from "@/components/Features";
import OpenSource from "@/components/OpenSource";

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
      </main>
    </>
  );
}
