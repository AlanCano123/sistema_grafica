// Tipos que reflejan la respuesta real de la API de Maya Publicidad
// (verificados a mano contra /api/v1/article/without-print y /api/v1/categories).

export interface MayaLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // segundos
}

export interface MayaCategory {
  id: number;
  name: string;
  url: string;
}

export interface MayaColor {
  id: string;
  name: string;
  hex_code: string;
  url_picture_color: string;
  group: string;
  url: string;
}

export interface MayaPhoto {
  id: number;
  title: string;
  name: string;
  placeholder: boolean;
  url_large: string;
  url_normal: string;
  url_thumb: string;
  primary: 0 | 1;
}

export interface MayaStock {
  quantity: number;
  last_update: string;
}

export interface MayaVariant {
  id: string;
  name: string;
  code: string;
  url?: string;
  description?: string;
  units_per_package?: string;
  price: string;
  stock: MayaStock;
  color?: MayaColor;
  photos?: MayaPhoto[];
}

export interface MayaArticle {
  id: string;
  name: string;
  code: string;
  url: string;
  category: MayaCategory;
  description?: string;
  material?: string;
  product_size?: string;
  printing_area?: string;
  sales_tips?: string;
  keywords?: string;
  youtube?: string | null;
  photos: MayaPhoto[];
  variants: MayaVariant[];
}
