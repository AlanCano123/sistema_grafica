-- Productos propios de Láser Kind, para mostrar en el catálogo público
-- junto a los de CDO/Maya (provider "propio"). El cliente no ve que son
-- nuestros. Fotos en KV (`ownproduct:<product_id>:<photo_id>`), metadata
-- y orden acá. Se administran en /panel/sitio.
CREATE TABLE own_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,   -- precio final en ARS (sin multiplicador de catálogo)
  category TEXT,                   -- texto libre; entra al filtro de categorías del catálogo
  stock INTEGER NOT NULL DEFAULT 0,
  code TEXT,                       -- si vacío, se muestra "P<id>"
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE own_product_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_own_product_photos_product ON own_product_photos(product_id, sort_order);
