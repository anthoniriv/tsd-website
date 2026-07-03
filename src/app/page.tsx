import { getLocaleData } from "@/lib/i18n.server";
import { HeroSlider } from "@/components/home/hero-slider";
import { TrustStrip } from "@/components/home/trust-strip";
import { CoverageKits } from "@/components/home/coverage-kits";
import { HardwareKits } from "@/components/home/hardware-kits";
import { Renovaciones } from "@/components/home/renovaciones";
import { PreFooterCta } from "@/components/home/pre-footer-cta";

export default async function HomePage() {
  const { dict } = await getLocaleData();
  return (
    <>
      <HeroSlider dict={dict.home} />
      <TrustStrip />
      <CoverageKits />
      <HardwareKits />
      <Renovaciones />
      <PreFooterCta />
    </>
  );
}
