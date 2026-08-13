-- Panel de negocio: deudas (ambas direcciones) + ventas simples.
-- Datos de ejemplo (ficticios) incluidos al final para el prototipo.

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('receivable', 'payable')),
  -- receivable = te deben a vos (cliente) | payable = vos debés (proveedor/tercero)
  counterparty_name text not null,
  amount numeric(12, 2) not null,
  description text,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(12, 2) not null,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table debts enable row level security;
alter table sales enable row level security;

-- Datos de ejemplo ficticios (prototipo, no son reales).
insert into debts (direction, counterparty_name, amount, description, due_date, status) values
  ('receivable', 'Kiosco Don Mario', 45000, 'Impresión 500 volantes A5', '2026-08-20', 'pending'),
  ('receivable', 'Estudio Jurídico Pérez & Asoc.', 128000, 'Tarjetas personales x1000', '2026-08-15', 'pending'),
  ('receivable', 'Panadería La Espiga', 18500, 'Cartelería vidriera', '2026-07-30', 'pending'),
  ('receivable', 'Gimnasio Fuerza Total', 62000, 'Banners lona 2x1m', null, 'paid'),
  ('receivable', 'Farmacia Central', 9800, 'Etiquetas adhesivas', '2026-08-25', 'pending'),
  ('payable', 'Papelera San Martín', 210000, 'Resmas + insumos de impresión', '2026-08-18', 'pending'),
  ('payable', 'Tintas & Toners SRL', 87500, 'Cartuchos láser color', '2026-08-22', 'pending'),
  ('payable', 'Electricista Gómez', 15000, 'Arreglo tablero eléctrico', null, 'paid'),
  ('payable', 'Distribuidora Vinilos Norte', 54200, 'Rollos vinilo adhesivo', '2026-09-01', 'pending');

insert into sales (description, amount, sale_date) values
  ('Impresión 500 volantes A5 - Kiosco Don Mario', 45000, '2026-08-10'),
  ('Tarjetas personales x1000 - Estudio Jurídico', 128000, '2026-08-09'),
  ('Banners lona 2x1m - Gimnasio Fuerza Total', 62000, '2026-08-05'),
  ('Cartelería vidriera - Panadería La Espiga', 18500, '2026-08-03'),
  ('Etiquetas adhesivas - Farmacia Central', 9800, '2026-08-01'),
  ('Folletería tríptico x200 - Cliente varios', 22000, '2026-07-28'),
  ('Stickers troquelados x300', 15400, '2026-07-25'),
  ('Impresión planos A1 x10', 31000, '2026-07-20');
