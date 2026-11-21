-- Optional sample menu (delete it later from the Admin page). Run once.
insert into public.menu_items (category, name, description, price, sort_order) values
  ('Starters', 'Samosas (4 pieces)',       'Crispy pastry filled with spiced beef and vegetables.',      3000, 1),
  ('Starters', 'Vegetable soup',           'Fresh seasonal vegetables, served hot with bread.',          2500, 2),
  ('Mains',    'Beef brochette',           'Grilled skewers with roasted banana and a tomato salad.',    6000, 1),
  ('Mains',    'Grilled tilapia',          'Whole lake tilapia with chips or ugali and a green salad.',  9000, 2),
  ('Mains',    'Chicken stew with rice',   'Slow-cooked chicken in a tomato and onion sauce.',           7000, 3),
  ('Mains',    'Isombe with cassava',      'Cassava leaves cooked with groundnuts. Vegetarian.',         5000, 4),
  ('Desserts', 'Fresh fruit plate',        'Pineapple, mango, banana and passion fruit.',                3000, 1),
  ('Drinks',   'Fresh juice',              'Passion, mango or pineapple.',                               2000, 1),
  ('Drinks',   'Rwandan coffee',           'Freshly brewed, single origin.',                             1500, 2),
  ('Drinks',   'Soda or water',            '',                                                           1000, 3);
