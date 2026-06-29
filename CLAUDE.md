@AGENTS.md

# TDS — Tech Diagnostic Solutions

Landing del revendedor **Jaltest / Cojali USA** (Doral, FL). Hoy es landing; está
diseñada para **convertirse en ecommerce** sin reescribir la UI. Diseño basado en una
referencia del cliente — replicar fiel pero refinando UX/UI (espaciado, hover, mobile,
skeletons, lazy loading).

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) + **React 19**
- **Tailwind CSS v4** (config en `globals.css` con `@theme`, no `tailwind.config`)
- **shadcn** sobre **@base-ui/react** (⚠️ NO Radix) — `components.json`
- `lucide-react` iconos · `sonner` toasts · `next-themes` (presente, sin uso aún)
- Node v20 local. Deploy objetivo: **Vercel**.

## Comandos

```bash
rtk proxy npm run dev      # dev (rtk rompe npx/npm directo → usar 'rtk proxy')
rtk proxy npm run build    # build prod + type check (la verificación real)
rtk proxy npm run start    # servir build
```

Rutas: `/` (Inicio) · `/producto` · `/contacto`. Las 3 son estáticas (prerender).

## Arquitectura

```
src/
  app/                  # rutas (RSC por defecto)
    layout.tsx          # Header + Footer + Toaster, fuente Inter, metadata SEO, lang="es"
    page.tsx            # Inicio: HeroSlider → CoverageKits → HardwareKits → Renovaciones
    producto/page.tsx   # 5 ProductHero + Panasonic + 3 ProductGrid + renovar + precios
    contacto/page.tsx   # hero + LocationMap + ContactForm
    loading.tsx         # skeleton a nivel ruta
    globals.css         # tokens de marca + utilidades (hex-clip, no-scrollbar)
  components/
    layout/             # header, footer, logo (compartidos)
    home/               # hero-slider, coverage-kits, hardware-kits, hex-tile, renovaciones
    product/            # product-hero, product-card, product-grid, jaltest-logo
    contact/            # contact-form, location-map
    ui/                 # shadcn + primitivos propios (smart-image, hexagon)
  lib/
    products.ts         # DATA (líneas Jaltest, kits, catálogo hardware) — fuente única
    site.ts             # constantes (nav, contacto, redes, policies)
    utils.ts            # cn()
public/images/          # assets planos (ver public/images/README.md)
```

## Patrones clave

### Datos centralizados → ecommerce-ready
Toda la data de productos vive en `src/lib/products.ts` (tipos `JaltestLine`,
`HardwareItem`, `AccentKey`). La UI sólo consume estas estructuras. Migrar a API/CMS/DB
luego = cambiar la fuente de `products.ts`, sin tocar componentes. `ProductCard` ya
modela `{id, name, img, price, blurb, category}`; el CTA "Cotizar" pasará a "Añadir al
carrito". Precios y descripciones del catálogo de hardware son **DEMO**.

Constantes globales (nav, dirección, redes, policies) en `src/lib/site.ts`.

### Imágenes: `SmartImage` (no `next/image`)
`components/ui/smart-image.tsx` envuelve un `<img>` plano con **skeleton + lazy + fade-in**
y maneja `onError` (mantiene skeleton si falta el asset). Decisión deliberada: los `src`
son placeholders fáciles de intercambiar. Cuando los assets sean finales, se puede migrar
a `next/image` para optimización automática (WebP/blur/responsive). `LocationMap` usa
`<iframe>` de Google Maps (embed, sin API key) con el mismo patrón de skeleton.

### Hexágonos / honeycomb
- `components/ui/hexagon.tsx` — forma base vía `.hex-clip` (clip-path **pointy-top** en
  `globals.css`). Acepta `as="div"|"button"`.
- `components/home/hex-tile.tsx` — hex con `img` = borde `brand` (inset) + foto + overlay
  oscuro (`bg-brand-dark/55`, hover `/30`) + label; **sin `img`** = hex sólido `#78D7F5`
  (sin anillo ni overlay).
- Honeycomb (`coverage-kits`, `hardware-kits`): **desktop** = filas con offset (`-mt-*`),
  fila inferior con spacers para encajar en los valles; **mobile** = grid de cards.
  Patrón: render duplicado `md:hidden` (grid) / `hidden md:flex` (honeycomb).
  `coverage-kits` tiene un **hex blanco central** (`Hexagon bg-white`) en la fila inferior.
- Honeycomb de renovación en `producto/page.tsx` (`RenewalHex`): hexes **pointy-top**
  (`clip-path` rotado), filas que se tocan (`gap-x-[5px]`), fila inferior solapando ~¼ de
  alto (`-mt-[clamp(...)]`). Borde fino `inset-[2px]`. `aspect-[0.86/1]` (altos/angostos).

### Sistema de color por línea (acentos)
`ACCENT` en `products.ts` mapea cada `AccentKey` (cv/ohw/agv/marine/mhe) a su color.
Esquema de marca en `globals.css` (`@theme`):
- **Primario** `--color-brand` **#06C5FE** (botones, links, acentos) · hover
  `--color-brand-dark` **#0285C9** · acento secundario `--color-accent-aqua` **#0DD9D9**.
- **Categorías** `--color-jt-{cv,ohw,agv,marine,mhe}` = `#0285C9 / #F9B401 / #93C01F /
  #01A3B3 / #B02A37` (solo como acento en cards/badges/bordes, NO fondos grandes).
- Precio `--color-price` **#77E530** (solo precios/ofertas).
- Neutras: `--color-bg-main #F7FAFC`, `--color-bg-soft #EEF6FA`, `--color-text-main
  #102A43`, `--color-text-secondary #486581`, `--color-text-muted #829AB1`, bordes
  `#D9E2EC/#BCCCDC`. Los tokens shadcn (`:root`) ya consumen esta paleta.
Se consumen como clases (`bg-brand`, `text-jt-agv`) o `style={{ backgroundColor:
accent.color }}` cuando es dinámico por dato.

### Logos Jaltest = SVG reales
`components/product/jaltest-logo.tsx` renderiza los SVG vectoriales recuperados del Figma
(`/images/logo-{cv,ohw,agv,marine,mhe}.svg`), referenciados desde `JaltestLine.logo`.

### `ProductHero`: planos grises + triángulos de acento (referencia del cliente)
Los 5 bloques van dentro de un **wrapper con base blanca** (`<section relative isolate
bg-white>` en `producto/page.tsx`); cada `<article>` es **transparente** y su `<div>` usa
`overflow-x-clip` (recorta horizontal full-bleed, deja sangrar vertical). Sin `isolate`
en los divs → las capas decorativas se ordenan en el contexto del wrapper: blanco →
**gris** (`-z-20`) → **triángulo de color** (`-z-10`) → contenido (`z-10`). Así el
triángulo siempre queda sobre el gris vecino aunque éste sangre entre bloques.
- **Plano gris** (`#efeee9`) solo en bloques **sin** triángulo (cv/agv/mhe): paralelogramo
  diagonal de altura constante (`clipPath: polygon(0 20%, 100% 0, 100% 80%, 0 100%)`).
  Bloques con acento (ohw/marine) van sobre blanco limpio.
- **Triángulo de color** (ohw/marine) full-bleed, `clip-path`, con `top` negativo para
  subir y pegarse (~5%) a la esquina inf-derecha del gris previo.
- `grayRaised` (VISUALS): el plano gris sube `-15%` por encima del bloque (clip
  recalculado) para tocar el acento previo. `pull` (`md:mt-[-Nvw]`): margen negativo para
  acercar un bloque al anterior; el gris se compensa con `translate-y` para no moverse.
- Heights de cv/agv/mhe igualadas (`clamp(560px,58vw,840px)`) para que la banda gris mida
  lo mismo en px. El **CTA fluye dentro del contenedor de texto** (después de los párrafos,
  `mt-7`), no anclado al fondo.
- La sección **Panasonic** está dentro del wrapper y es **transparente** para que el
  sangrado del gris de MHE sea parte de su fondo (sin cuñas que mantener).

### `HeroSlider` (Inicio)
`components/home/hero-slider.tsx`: crossfade de 2 slides + autoplay + dots con progreso +
pausa en hover. Contenedor `aspect-video` (16:9) `max-w-[1672px] mx-auto` → imagen completa
sin recorte hasta el ancho nativo del asset; en monitores grandes se centra con márgenes
(fondo `bg-neutral-100`). Sin librería (Swiper no hace falta para 2 slides).

## Convenciones / gotchas (importantes)

- **base-ui ≠ Radix**: `Button`/`SheetTrigger` **NO tienen `asChild`**. Para un Link con
  estilo de botón → `<Link className={cn(buttonVariants(...), ...)}>`; los triggers
  renderizan su propio `<button>`, estilízalos directo con `buttonVariants`.
- **lucide quitó los logos de marca** (Facebook/Youtube/Linkedin/X) → SVG inline en
  `footer.tsx`.
- Cualquier componente con handlers (`onSubmit`, `onClick`, `useState`) necesita
  `"use client"` (forms, header, smart-image, location-map, product-grid).
- **rtk** rompe `npx`/`npm` directos → siempre `rtk proxy npm ...`.
- Tailwind v4: sin `tailwind.config.js`; tokens y utilidades en `globals.css`.
- `MHE` no tiene foto de vehículo (no se recuperó del Figma) → su bloque usa `kit.png`;
  `vehicleImg` es opcional en `JaltestLine` y `ProductHero` lo renderiza condicional.

## Ritmo visual / spacing

Secciones: `py-16 sm:py-20`, padding horizontal `px-6`, contenedores `max-w-5xl`
(`max-w-6xl` en grids de producto). Títulos de sección `mb-10`, gaps `gap-10/12`.
Mantener este ritmo al añadir secciones para conservar el "aire".

## Idioma

Sitio **solo en español** (`lang="es"`). UI, copy y comentarios en español; nombres de
código en inglés.

## Pendientes conocidos

- Optimizar `hero.png` (~9 MB) o migrar a `next/image`.
- Buscador del header y de las secciones es UI (sin lógica de búsqueda aún).
- Form de contacto: validación cliente OK; submit es stub (`setTimeout` + toast) — falta
  Server Action / servicio de email.
- Footer/redes/policies con `href="#"` placeholder.
