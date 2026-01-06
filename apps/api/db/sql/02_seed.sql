
INSERT INTO categories (slug, name, hero_image, display_order) VALUES
  ('hair-care', 'Hair Care', '/images/categories/hair-care.jpg', 1),
  ('beard-care', 'Beard Care', '/images/categories/beard-care.jpg', 2),
  ('shaving', 'Shaving', '/images/categories/shaving.jpg', 3),
  ('skin-care', 'Skin Care', '/images/categories/skin-care.jpg', 4),
  ('fragrance', 'Fragrance', '/images/categories/fragrance.jpg', 5),
  ('bath-body', 'Bath & Body', '/images/categories/bath-body.jpg', 6),
  ('styling-tools', 'Styling Tools', '/images/categories/styling-tools.jpg', 7),
  ('gift-sets', 'Gift Sets', '/images/categories/gift-sets.jpg', 8)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO products (category_id, slug, title, description, price_cents, thumbnail, currency, is_featured)
SELECT c.id, p.slug, p.title, p.description, p.price_cents, p.thumbnail, 'USD', p.is_featured
FROM categories c
JOIN (
  VALUES
    ('anti-dandruff-shampoo', 'Anti-Dandruff Shampoo',
      'Gentle yet effective formula to fight flakes and soothe the scalp.',
      1299, '/images/products/anti-dandruff-shampoo.jpg', true),
    ('daily-revitalizing-shampoo', 'Daily Revitalizing Shampoo',
      'Lightweight daily shampoo that refreshes and cleanses hair.',
      1199, '/images/products/daily-revitalizing-shampoo.jpg', false)
) AS p(slug, title, description, price_cents, thumbnail, is_featured)
ON c.slug = 'hair-care'
ON CONFLICT (slug) DO NOTHING;


INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('demo@grooming.local', NULL, 'Demo', 'User', 'customer')
ON CONFLICT (email) DO NOTHING;