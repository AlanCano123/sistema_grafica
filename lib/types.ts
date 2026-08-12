// Tipos que reflejan la respuesta real de la API de CDO Promocionales (v2/products)

export interface Picture {
  small: string;
  medium: string;
  original: string;
}

// id es number|string porque CDO usa ids numéricos y Maya usa ids string.
export interface Color {
  id: number | string;
  name: string;
  hex_code: string;
  picture: string;
}

export interface Category {
  id: number | string;
  name: string;
}

export interface Icon {
  id: number;
  label: string;
  short_name: string;
  picture: string;
}

export interface OtherPicture {
  index: number;
  small: string;
  medium: string;
  original: string;
}

export interface Variant {
  id: number | string;
  sku: string;
  novedad: boolean;
  stock_available: number;
  stock_existent: number;
  list_price: string;
  net_price: string;
  picture: Picture;
  detail_picture: Picture;
  other_pictures: OtherPicture[];
  color?: Color;
  colors?: Color[];
}

export interface Packing {
  width: string | null;
  height: string | null;
  depth: string | null;
  volume: string | null;
  quantity: number | null;
  weight: string | null;
}

export interface Product {
  id: number | string;
  code: string;
  name: string;
  description: string;
  categories?: Category[];
  icons?: Icon[];
  packing?: Packing;
  variants: Variant[];
  /** De qué API vino el producto (para debug / trazabilidad, no se muestra en UI) */
  provider?: "cdo" | "maya";
}

export interface Pagination {
  current_page: number;
  prev_page: number | null;
  next_page: number | null;
  total_pages: number;
  total_count: number;
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    pagination: Pagination;
  };
}
