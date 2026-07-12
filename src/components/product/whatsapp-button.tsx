"use client";

import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * CTA de WhatsApp con el producto prellenado.
 * `solid` para cuando es la única salida (producto agotado); `ghost` cuando acompaña al
 * botón de compra y no debe competir con él.
 */
export function WhatsAppButton({
  label,
  variant = "solid",
  greeting,
  name,
  blurb,
  priceLabel,
  price,
  img,
  className,
}: {
  label: string;
  variant?: "solid" | "ghost";
  greeting: string;
  name: string;
  blurb?: string;
  priceLabel?: string;
  price?: string;
  img?: string;
  className?: string;
}) {
  const open = () => {
    const url = buildWhatsAppUrl({ greeting, name, blurb, priceLabel, price, img });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full text-sm font-bold transition-colors",
        variant === "solid"
          ? "bg-whatsapp text-white hover:bg-whatsapp-dark"
          : "border-2 border-whatsapp bg-white text-whatsapp-dark hover:bg-whatsapp hover:text-white",
        className,
      )}
    >
      <WhatsAppIcon className="h-5 w-5" />
      {label}
    </button>
  );
}
