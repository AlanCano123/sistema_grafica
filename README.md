# Sistema Gráfica — Catálogo (v1)

Catálogo básico de productos, alimentado desde la API de CDO Promocionales.
Es un Server Component: la llamada a la API (con el token) se hace del lado del
servidor, así el token nunca llega al navegador del cliente ni queda expuesto
en el bundle de JavaScript.

## Cómo integrarlo en tu proyecto

Copiá estas carpetas/archivos dentro de tu proyecto en:
`C:\Users\Alan\OneDrive\Desktop\Proyectos\Sistema_Grafica\sistema_grafica_fernando`

```
app/layout.tsx        (reemplaza el default)
app/page.tsx           (reemplaza el default)
components/ProductCard.tsx
components/Pagination.tsx
lib/types.ts
lib/cdo-api.ts
lib/product-helpers.ts
next.config.ts          (reemplaza el default)
.env.example
```

Si tu proyecto ya tiene `app/globals.css` con Tailwind configurado, no hace
falta tocar nada ahí — las clases usadas (`grid`, `rounded-lg`, etc.) son
utilidades estándar de Tailwind.

## Variables de entorno

1. Copiá `.env.example` a `.env.local` (este último **nunca** se sube a Git).
2. Completá con el token que quieras usar (pruebas o producción).
3. En Vercel, estas mismas variables se configuran en:
   Project Settings → Environment Variables (no se suben en el repo).

## Correrlo local

```
npm install
npm run dev
```

Abrí `http://localhost:3000` — vas a ver la grilla de productos con
paginación (24 por página, usando `page_size`/`page_number` como indica la
documentación de la API).

## Qué hace cada archivo

- `lib/types.ts` — tipos TypeScript que reflejan la respuesta real de la API
  (probé la URL de pruebas y calqué la forma exacta del JSON).
- `lib/cdo-api.ts` — la única función que llama a la API. Usa `fetch` con
  `revalidate: 300` (5 min) para no pegarle a la API en cada request, pero
  mantener el stock razonablemente actualizado. Podés bajar ese número si
  necesitás datos más frescos.
- `lib/product-helpers.ts` — funciones chicas para sacar la imagen principal,
  el rango de precio (varía por variante/color) y el stock total sumado de
  todos los variantes.
- `components/ProductCard.tsx` — la tarjeta de cada producto: imagen, nombre,
  categoría, precio y estado de stock ("Agotado" si stock_available es 0 en
  todos los variantes).
- `components/Pagination.tsx` — enlaces "Anterior/Siguiente" que cambian el
  parámetro `?page=` de la URL.
- `app/page.tsx` — junta todo: lee `?page=` de la URL, pide los productos y
  renderiza la grilla + paginación.

## Próximos pasos (cuando quieras)

- Darle estilo real (colores de marca, tipografía, header/footer).
- Filtro por categoría (la API ya devuelve `categories` en cada producto).
- Página de detalle de producto (`/producto/[id]`) mostrando todos los
  variantes/colores con su stock individual.
- El panel de gestión del local que hablamos (login + edición) — eso ya no
  depende de esta API sino de tu propia base de datos, así que es un proyecto
  aparte que consume estos mismos datos como punto de partida.
