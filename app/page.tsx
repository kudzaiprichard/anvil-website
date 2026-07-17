import BackgroundSwitcher from "@/components/BackgroundSwitcher";
import Instruments from "@/components/Instruments";
import StationRail from "@/components/StationRail";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Features from "@/components/Features";
import OpenSource from "@/components/OpenSource";
import Download from "@/components/Download";
import Footer from "@/components/Footer";
import { getLatestRelease } from "@/lib/releases";

export default async function Home() {
  const release = await getLatestRelease();

  return (
    <>
      <BackgroundSwitcher />
      <Instruments />
      <StationRail />
      <Marquee />
      <Nav version={release.version} />
      <main id="main">
        <Hero version={release.version} releaseUrl={release.url} />
        <Manifesto />
        <Features />
        <OpenSource />
        <Download release={release} />
      </main>
      <Footer version={release.version} />
    </>
  );
}
