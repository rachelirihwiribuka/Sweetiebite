-- Simple restaurant website: database.
-- Paste this whole file into Supabase > SQL Editor > New query > Run. Safe to run again.

create table if not exists public.menu_items (
  id          bigint generated always as identity primary key,
  category    text    not null default 'Mains'  check (char_length(category) between 1 and 40),
  name        text    not null                  check (char_length(name) between 1 and 80),
  description text    not null default ''       check (char_length(description) <= 300),
  price       numeric(12,2) not null            check (price >= 0),
  image_url   text             check (image_url is null or image_url ~* '^https?://'),
  available   boolean not null default true,
  sort_order  int     not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.reservations (
  id           bigint generated always as identity primary key,
  name         text not null check (char_length(name) between 1 and 80),
  phone        text not null check (char_length(phone) between 5 and 30),
  guests       int  not null check (guests between 1 and 30),
  reserve_date date not null,
  reserve_time time not null,
  notes        text not null default '' check (char_length(notes) <= 300),
  status       text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  created_at   timestamptz not null default now()
);
create index if not exists reservations_date_idx on public.reservations (reserve_date, reserve_time);

-- Who may do what (Row Level Security).
alter table public.menu_items   enable row level security;
alter table public.reservations enable row level security;

-- Visitors (anon) can read the menu items that are switched on, and send a booking. Nothing else.
drop policy if exists "visitors read the menu"       on public.menu_items;
drop policy if exists "owner manages the menu"       on public.menu_items;
drop policy if exists "visitors can book"            on public.reservations;
drop policy if exists "owner manages reservations"   on public.reservations;

create policy "visitors read the menu" on public.menu_items for select to anon using (available);
create policy "owner manages the menu" on public.menu_items for all to authenticated using (true) with check (true);
create policy "visitors can book" on public.reservations for insert to anon
  with check (status = 'new' and reserve_date >= current_date and reserve_date <= current_date + 180);
create policy "owner manages reservations" on public.reservations for all to authenticated using (true) with check (true);

revoke all on public.menu_items, public.reservations from anon, authenticated;
grant select on public.menu_items to anon;
grant insert on public.reservations to anon;
grant select, insert, update, delete on public.menu_items, public.reservations to authenticated;
