@AGENTS.md

# TDS — Tech Diagnostic Solutions

Sitio del revendedor **Jaltest / Cojali USA** (Doral, FL): landing + **ecommerce** +
**panel admin**, en 3 locales. Diseño basado en una referencia del cliente — replicar
fiel pero refinando UX/UI (espaciado, hover, mobile, skeletons, lazy loading).

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) + **React 19**
- **Tailwind CSS v4** (config en `globals.css` con `@theme`, no `tailwind.config`)
- **shadcn** sobre **@base-ui/react** (⚠️ NO Radix) — `components.json`
- **Neon Postgres** + **Drizzle ORM** · **Stripe Checkout** · **Resend** (emails) · `zod`
- `lucide-react` iconos · `sonner` toasts · `bcryptjs` (auth admin)
- Node v20 local. Deploy: **Vercel** (proyecto `tds`, Neon vía Marketplace).

## Comandos

```bash
rtk proxy npm run dev      # dev (rtk rompe npx/npm directo → usar 'rtk proxy')
rtk proxy npm run build    # build prod + type check (la verificación real)
rtk proxy npm run db:generate  # migración desde el schema
rtk proxy npm run db:migrate   # aplicar a Neon
rtk proxy npm run db:seed      # sembrar catálogo + admin owner
rtk proxy npm run db:studio    # inspeccionar la BD
```

Env necesarias (`.env.local`, vía `vercel env pull`): `DATABASE_URL` (Neon),
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`,
`ORDER_NOTIFY_EMAIL`, `ORDER_FROM_EMAIL`, y las cinco de Cloudflare R2 (subida de imágenes
del panel): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`,
`R2_PUBLIC_URL`. Para el seed: `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.

⚠️ `vercel env pull` **sobrescribe** `DATABASE_URL` con el de producción. En local se usa
una rama de Neon aparte (`ep-shy-glade`, la misma que `PREVIEW_DATABASE_URL`); prod es
`ep-raspy-forest`. Si Neon borra esa rama, todo (local y preview) revienta con
`password authentication failed for user 'neondb_owner'` — no es la contraseña, es el
endpoint muerto: hay que crear la rama de nuevo y reponer las dos variables.

**Rutas**. Público: `/` · `/producto` (institucional, las 5 líneas Jaltest) · `/tienda`
(catálogo con búsqueda/filtros) · `/tienda/[slug]` · `/checkout` · `/pedido/[token]`
(seguimiento sin cuenta) · `/contacto`. Panel: `/admin/*`. API: `/api/stripe/webhook`.

**Todas las rutas son dinámicas** (`ƒ`): el locale se lee de una cookie en el layout.
`cacheComponents` NO está activado — hacerlo obligaría a rediseñar cada página con
Suspense sin beneficio real con un catálogo de ~20 productos.

## Arquitectura

```
src/
  app/
    layout.tsx          # html/body + Toaster + fuente Inter (sin chrome)
    (site)/             # sitio público — Header + Footer + CartProvider
      layout.tsx        #   el chrome vive aquí, NO en el layout raíz (si no, /admin lo heredaría)
      page.tsx          #   Inicio: HeroSlider (banners de BD) → CoverageKits → …
      producto/         #   institucional: 5 ProductHero + Panasonic + grids
      tienda/           #   catálogo con búsqueda/filtros + [slug] ficha
      checkout/         #   form + Server Action → Stripe
      pedido/[token]/   #   seguimiento sin cuenta
      contacto/         #   hero + LocationMap + ContactForm (+ actions.ts)
      cart-actions.ts   #   detalles del carrito resueltos en servidor
    admin/              # panel (sidebar propia) — productos, banners, láminas,
      actions.ts        #   pedidos, contacto, usuarios. TODA escritura por actions.ts
    api/stripe/webhook/ # única fuente de verdad del pago
  proxy.ts              # (el "middleware" de Next 16) filtra /admin por cookie
  db/
    schema.ts           # 8 tablas. Textos localizados = JSONB {es,en}. Dinero en centavos
    seed.ts / seed-data.ts
  lib/
    catalog.ts          # lecturas del catálogo (server-only, react.cache)
    pricing.ts          # precio por tier — fuente única, la usan carrito y checkout
    orders.ts           # crear pedido, marcar pagado, seguimiento
    auth.ts             # sesión admin (bcrypt + cookie httpOnly)
    auth.shared.ts      # constantes sin deps de servidor (las importa proxy.ts)
    products.ts         # TIPOS de UI + ACCENT + kits decorativos (ya NO es la data)
    i18n.ts / i18n.server.ts / site.ts / email.ts / stripe.ts
```

## Patrones clave

### La data vive en Postgres, no en el código
`src/lib/products.ts` conserva los **tipos** (`JaltestLine`, `HardwareItem`, `AccentKey`)
y los kits decorativos del honeycomb, pero **ya no contiene el catálogo**: las lecturas
son `getJaltestLines(tier)` / `getHardware(cat, tier)` / `searchHardware(…)` en
`src/lib/catalog.ts`. Los componentes no cambiaron: siguen haciendo `item.name[lang]`
porque los textos localizados se guardan como JSONB `{es, en}`, que mapea 1:1 a
`Localized<T>`.

### Precios: nunca confíes en el cliente
Tabla `product_prices(product_id, tier, amount_cents)` — un precio **explícito** por tier
(`us` = USA/Canadá · `world` = resto del mundo), editable desde el panel. Ya no hay multiplicador. El carrito del
navegador guarda **solo `{id, qty}`**; el importe se resuelve siempre en servidor con
`priceMapFor()` (`lib/pricing.ts`), tanto para mostrar como para cobrar. Los `order_items`
guardan un **snapshot** de nombre y precio: cambiar el catálogo no reescribe pedidos ya
hechos.

### El webhook manda, no el redirect
`/api/stripe/webhook` es lo único que marca un pedido como pagado, descuenta stock y
dispara los emails. El `success_url` puede no visitarse nunca (el usuario cierra la
pestaña) — el webhook siempre llega. Es **idempotente** porque Stripe reintenta.

### Auth del admin
Sesión opaca en tabla `sessions` + cookie httpOnly. `proxy.ts` solo comprueba que la
cookie *exista* (filtro barato); la validación real (token vivo + rol) está en
`requireUser()` / `requireRole()`, que corren en el layout y en **cada** Server Action.
Roles: `owner` ⊃ `admin` ⊃ `editor`.

Constantes globales (nav, dirección, redes, policies) en `src/lib/site.ts`.

### Imágenes editables: productos y `site_media`
Un producto tiene **1 principal + hasta 3 de apoyo** (`products.gallery`, jsonb): la ficha
`/tienda/[slug]` las pinta como galería con miniaturas (`ProductGallery`). Las imágenes de
las **láminas** de `/producto` viven en la tabla `site_media` (`clave → {img, label}`) y se
editan en `/admin/laminas`. Los slots los declara el diseño en `src/lib/site-media.ts`
(`line.<accent>.{kit,main,sub1..3}`, `solutions.cables.1..3`) — el admin solo reemplaza el
archivo; un slot vacío cae al recorte original de `product-specs.ts`. Cada línea Jaltest usa
ahora el mismo patrón **1 foto grande + 3 etiquetadas** (antes solo AGV).
Tamaños recomendados y política CORS del bucket: `docs/imagenes.md`.

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

**País e idioma son ejes separados** (todo USD):

- **País** → tarifa. Se elige de una lista de 243 países (`src/lib/countries.ts`,
  nombres vía `Intl.DisplayNames`, sin traducciones que mantener). `US`/`CA` →
  tier `us`; cualquier otro → `world`. Cookie `tds_country`.
- **Idioma** → contenido `es` | `en`. Cookie `tds_lang`. Independiente del país:
  alguien en México puede navegar en inglés y sigue pagando tarifa `world`.

En la primera visita el `RegionGate` (modal, `components/layout/region-gate.tsx`)
pide país —preseleccionado con `x-vercel-ip-country`— y propone el idioma del
país, que el usuario puede cambiar. Guarda ambas cookies + una marca en
localStorage. `?region=1` reabre el modal (lo usa el chip de país del header).
La cookie vieja `tds_locale` solo se lee para deducir el idioma de visitantes
antiguos. `getLocaleData()` (RSC) devuelve `{ lang, country, tier, dict }`.

Dos capas separadas: el **chrome de UI** vive en el diccionario `src/lib/i18n.ts`
(añadir una clave a `es` rompe el build si falta en `en` — es deliberado); el **contenido
de catálogo y banners** vive en BD, editable desde el panel.

En client components no hay contexto de i18n: se pasan **slices tipados** (`Dict["cart"]`)
o strings ya resueltos desde el servidor.

Comentarios y copy en español; nombres de código en inglés.

## Pendientes conocidos

- **Checkout no verificado end-to-end**: el flujo de Stripe está escrito y compila, pero
  falta ejecutar una compra real con `stripe listen` + tarjeta `4242…` para confirmar que
  el webhook marca el pedido pagado, baja el stock y envía el email.
- Emails en modo desarrollo (`onboarding@resend.dev`): solo entregan al dueño de la cuenta
  de Resend. Al lanzar, verificar el dominio de TDS y ajustar `ORDER_FROM_EMAIL`.
- Las **5 líneas Jaltest no son creables desde el panel**: su layout en `/producto` está
  atado a los 5 ids (`VISUALS` en `product-hero.tsx`). Editar textos/precios/imágenes sí;
  añadir una sexta línea exige tocar el diseño.
- Imágenes: el panel sube archivos a **Cloudflare R2** (`lib/r2.ts` firma con `aws4fetch`;
  `/api/admin/upload` devuelve URL prefirmada y el navegador hace el PUT directo al bucket,
  con progreso vía XHR). El input acepta también una ruta manual (`/images/…`) como fallback.
  El bucket necesita **CORS con `PUT`** desde el origen y acceso público de lectura.
- Sin impuestos ni costes de envío: el total es el subtotal.
- Footer/policies con `href="#"` placeholder (las redes ya apuntan a FB/IG reales).
