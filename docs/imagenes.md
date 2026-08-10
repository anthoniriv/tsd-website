# Guía de imágenes — TDS

Tamaños y formato de cada imagen que se puede reemplazar desde el panel
(`/admin`). Todas se suben desde el panel: no hay que tocar código.

> Regla general: **PNG** cuando el fondo debe verse transparente (equipos, kits),
> **JPG** cuando es una foto completa (vehículos, maquinaria). Peso máximo **8 MB**
> por archivo, ideal por debajo de 500 KB. Usar el doble de resolución de la que se
> ve en pantalla para que no se vea borrosa en pantallas Retina.

## Productos (`/admin/productos` → Imágenes)

| Hueco | Tamaño | Formato | Notas |
|---|---|---|---|
| Principal | 1200 × 1200 px (cuadrada) | PNG fondo blanco o transparente | Es la de la tienda, el carrito y los correos. Producto centrado con margen. |
| Apoyo 1, 2 y 3 | 1200 × 1200 px (cuadrada) | PNG o JPG | Otras vistas del mismo producto (ángulos, detalle, contenido de la caja). Salen como miniaturas bajo la principal. |
| Foto del equipo (solo líneas Jaltest) | 1400 × 900 px (horizontal) | JPG o PNG | Panel derecho de la lámina en `/producto`. Se recorta en diagonal por la izquierda: dejar aire de ese lado. |

## Láminas de `/producto` (`/admin/laminas`)

Cinco líneas Jaltest — **CV, OHW, AGV, Marine, MHE** — con los mismos 5 huecos
cada una:

| Hueco | Tamaño | Formato | Notas |
|---|---|---|---|
| Kit del producto | 1200 × 700 px (horizontal) | **PNG con transparencia** | El equipo Jaltest con sus cables. Sin fondo: se apoya sobre blanco. |
| Foto principal | 1400 × 900 px (horizontal) | JPG | La grande del panel derecho. Se recorta en diagonal por la izquierda. Lleva etiqueta (ej. COSECHADORAS). |
| Foto de apoyo 1 | 600 × 600 px (cuadrada) | JPG | Mini foto etiquetada (ej. TRACTORES). |
| Foto de apoyo 2 | 600 × 600 px (cuadrada) | JPG | Mini foto etiquetada (ej. PULVERIZADORAS). |
| Foto de apoyo 3 | 600 × 600 px (cuadrada) | JPG | Mini foto etiquetada (ej. PICADORAS). |

La etiqueta de cada foto se escribe en el panel, en español e inglés. Si un hueco
se deja vacío, se sigue mostrando la imagen original de la lámina.

### Sección "Soluciones — Cables y adaptadores"

| Hueco | Tamaño | Formato | Notas |
|---|---|---|---|
| Foto 1, 2 y 3 del hexágono | 1000 × 1000 px (cuadrada) | **PNG, fondo claro o transparente** | Solo el set de cables, **sin** el texto ni el hexágono de la lámina: el diseño lo pone la web. Las 3 se alternan solas cada 5 segundos. |

## Banners del inicio (`/admin/banners`)

| Hueco | Tamaño | Formato | Notas |
|---|---|---|---|
| Slide del hero | 1672 × 940 px (16:9) | JPG | Texto incluido en la imagen. Es el ancho máximo: más grande no se aprovecha. |

## JSON resumido

```json
{
  "producto": {
    "principal":   { "w": 1200, "h": 1200, "formato": "PNG", "fondo": "blanco/transparente" },
    "apoyo_1_2_3": { "w": 1200, "h": 1200, "formato": "PNG o JPG" },
    "equipo_linea": { "w": 1400, "h": 900, "formato": "JPG" }
  },
  "lamina_linea": {
    "kit":       { "w": 1200, "h": 700, "formato": "PNG transparente" },
    "principal": { "w": 1400, "h": 900, "formato": "JPG", "etiqueta": true },
    "apoyo_1":   { "w": 600, "h": 600, "formato": "JPG", "etiqueta": true },
    "apoyo_2":   { "w": 600, "h": 600, "formato": "JPG", "etiqueta": true },
    "apoyo_3":   { "w": 600, "h": 600, "formato": "JPG", "etiqueta": true }
  },
  "soluciones_cables": {
    "hex_1_2_3": { "w": 1000, "h": 1000, "formato": "PNG", "fondo": "claro/transparente" }
  },
  "banner_home": { "w": 1672, "h": 940, "formato": "JPG" },
  "peso_maximo_mb": 8
}
```

## Política CORS del bucket R2

Sin esto, el navegador bloquea la subida desde el panel con un error de CORS.
Cloudflare → R2 → bucket `tds-ecomerce` → **Settings** → *CORS Policy* → **Edit**:

```json
[
  {
    "AllowedOrigins": [
      "https://www.techdsolution.com",
      "https://techdsolution.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["content-type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

El origen debe coincidir exacto: protocolo + dominio + puerto, sin barra final.
Ojo con las **URLs de deployment** de Vercel (`tds-xxxxx-anthonirivs-projects.vercel.app`):
son un origen distinto del dominio y no están en la lista, así que subir imágenes
desde una de ellas falla. Para probar, entrar por `www.techdsolution.com`.

Si aun así falla, el panel reintenta solo por el servidor (`PUT /api/admin/upload`),
que es mismo-origen y no depende del CORS. El bucket además necesita **lectura
pública** para que las imágenes se vean en la web.
