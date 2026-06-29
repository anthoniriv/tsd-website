import { HeroSlider } from "@/components/home/hero-slider";
import { TrustStrip } from "@/components/home/trust-strip";
import { CoverageKits } from "@/components/home/coverage-kits";
import { HardwareKits } from "@/components/home/hardware-kits";
import { Renovaciones } from "@/components/home/renovaciones";
import { PreFooterCta } from "@/components/home/pre-footer-cta";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <TrustStrip />
      <CoverageKits />
      <HardwareKits />
      <Renovaciones />
      <PreFooterCta />
    </>
  );
}
