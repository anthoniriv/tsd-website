import { getLocaleData } from "@/lib/i18n.server";
import { getHeroBanners } from "@/lib/catalog";
import { HeroSlider } from "@/components/home/hero-slider";
import { TrustStrip } from "@/components/home/trust-strip";
import { CoverageKits } from "@/components/home/coverage-kits";
import { HardwareKits } from "@/components/home/hardware-kits";
import { Renovaciones } from "@/components/home/renovaciones";
import { PreFooterCta } from "@/components/home/pre-footer-cta";

export default async function HomePage() {
  const { dict } = await getLocaleData();
  const heroBanners = await getHeroBanners();

  return (
    <>
      <HeroSlider dict={dict.home} images={heroBanners.map((b) => b.img)} />
      <TrustStrip />
      <CoverageKits />
      <HardwareKits />
      <Renovaciones />
      <PreFooterCta />
    </>
  );
}
