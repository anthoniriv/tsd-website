# Imágenes TDS

Assets recuperados del Figma, ya aplanados a este nivel (sin subcarpetas).
Referenciados desde `src/lib/products.ts`, `src/lib/site.ts` y los componentes.

## Fotos / banners (.png)
- hero.png — banner home (incluye categorías + equipos)
- veh-cv.png — camiones (línea CV)
- veh-ohw.png — excavadora (OHW)
- veh-agv.png — cosechadora (AGV)
- veh-marine.png — lancha (Marine)
- truck.png — camión closeup (kit On-Highway)
- tractor.png — tractor (kit Agriculture)
- kit.png — interfaz + cables Jaltest (compartido)
- laptop.png — Panasonic Toughbook
- cable-a.png / cable-b.png — adaptadores
- finder-a.png / finder-b.png — cable finder / MDC11
- renovaciones.png — técnica con laptop (hexágono)

## Logos Jaltest (.svg vectorial)
- logo-cv.svg, logo-ohw.svg, logo-agv.svg, logo-marine.svg, logo-mhe.svg
- logo-computer.svg

## Pendientes / sin asset
- **MHE (montacargas)**: no se recuperó foto de vehículo → el bloque usa `kit.png`.
  Suelta `veh-mhe.png` y agrega `vehicleImg: "/images/veh-mhe.png"` a la línea `mhe` en `products.ts`.

> Precios y descripciones del catálogo de hardware son DEMO (en `products.ts`).
> `hero.png` pesa ~9 MB: conviene optimizar (TinyPNG / migrar a `next/image`).
