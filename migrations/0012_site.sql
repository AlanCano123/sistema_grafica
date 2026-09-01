-- Sitio web: multiplicador del catálogo + fotos por servicio.

-- Multiplicador que se aplica al precio crudo de proveedor (CDO/Maya) en el
-- catálogo público — reemplaza el "* 2" hardcodeado de estimateArsPrice.
-- Editable desde /panel/sitio. Default 3.
ALTER TABLE pricing_settings ADD COLUMN catalog_multiplier REAL NOT NULL DEFAULT 3;

-- Fotos del carrusel de cada servicio del sitio público. Los bytes van en
-- KV (clave `sitephoto:<service_slug>:<id>`); esta tabla es orden + metadata.
CREATE TABLE service_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_slug TEXT NOT NULL,   -- slug de lib/services.ts
  content_type TEXT NOT NULL,   -- 'image/webp' | 'image/jpeg' | 'image/png'
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_service_photos_slug ON service_photos(service_slug, sort_order);
