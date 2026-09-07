CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  category VARCHAR(100) NOT NULL,
  image TEXT NOT NULL,
  short_description VARCHAR(300) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  dimensions VARCHAR(160) NOT NULL DEFAULT '',
  material VARCHAR(220) NOT NULL DEFAULT '',
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability VARCHAR(160) NOT NULL DEFAULT 'В наявності',
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_active_idx ON products(active);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  customer_first_name VARCHAR(80) NOT NULL,
  customer_last_name VARCHAR(80) NOT NULL,
  customer_phone VARCHAR(40) NOT NULL,
  customer_email VARCHAR(120) NOT NULL DEFAULT '',
  delivery JSONB NOT NULL,
  payment VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  total INTEGER NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT,
  name VARCHAR(150) NOT NULL,
  selected_color VARCHAR(80) NOT NULL DEFAULT '',
  price INTEGER NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);


-- NordHome v2.3 admin extensions
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(80) NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);
CREATE INDEX IF NOT EXISTS products_stock_idx ON products(stock);

CREATE TABLE IF NOT EXISTS store_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO store_settings (id, data) VALUES (1, '{"storeName":"NordHome","phone":"","email":"","city":"Львів","instagram":"","lowStockThreshold":3}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- NordHome v2.6 merchandising fields
-- The DO block seeds the demo storefront badges only on the first migration.
DO $$
DECLARE
  merch_migration_needed BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'sale_percent'
  ) INTO merch_migration_needed;

  ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS bestseller BOOLEAN NOT NULL DEFAULT FALSE;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_percent SMALLINT NOT NULL DEFAULT 0 CHECK (sale_percent BETWEEN 0 AND 95);
  ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price INTEGER NOT NULL DEFAULT 0 CHECK (old_price >= 0);

  IF merch_migration_needed THEN
    UPDATE products SET bestseller = TRUE WHERE id IN (1,4,7);
    UPDATE products SET is_new = TRUE WHERE id IN (2,5,8);
    UPDATE products SET sale_percent = CASE id WHEN 3 THEN 12 WHEN 4 THEN 10 WHEN 6 THEN 15 ELSE sale_percent END WHERE id IN (3,4,6);
    UPDATE products
      SET old_price = ROUND(price::numeric / (1 - sale_percent::numeric / 100) / 100) * 100
      WHERE sale_percent > 0 AND old_price = 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS products_merch_idx ON products(active, bestseller, is_new, sale_percent);

-- v2.7 inventory availability modes and stock reservation tracking
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability_mode VARCHAR(20) NOT NULL DEFAULT 'auto';
UPDATE products SET availability_mode = CASE WHEN lower(availability) LIKE '%під замовлення%' THEN 'preorder' WHEN lower(availability) LIKE '%немає%' THEN 'out' ELSE 'auto' END WHERE availability_mode = 'auto';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS stock_reserved INTEGER NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS stock_applied BOOLEAN NOT NULL DEFAULT FALSE;


-- NordHome v2.9 promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  discount_type VARCHAR(12) NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_order INTEGER NOT NULL DEFAULT 0 CHECK (min_order >= 0),
  max_uses INTEGER NOT NULL DEFAULT 0 CHECK (max_uses >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS promo_codes_active_idx ON promo_codes(active);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal INTEGER NOT NULL DEFAULT 0 CHECK (subtotal >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code VARCHAR(40) NOT NULL DEFAULT '';
UPDATE orders SET subtotal = total WHERE subtotal = 0 AND total > 0;
CREATE INDEX IF NOT EXISTS orders_promo_code_idx ON orders(promo_code);


-- NordHome v3.1 customer accounts
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL DEFAULT '',
  last_name VARCHAR(80) NOT NULL DEFAULT '',
  phone VARCHAR(40) NOT NULL,
  phone_normalized VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL DEFAULT '',
  email_normalized VARCHAR(120) NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  saved_delivery JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique_idx ON customers(email_normalized) WHERE email_normalized <> '';
CREATE TABLE IF NOT EXISTS customer_sessions (
  token_hash VARCHAR(64) PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS customer_sessions_expires_idx ON customer_sessions(expires_at);


-- NordHome v3.7 product reviews and ratings
CREATE TABLE IF NOT EXISTS product_reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(120) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS product_reviews_product_idx ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS product_reviews_status_idx ON product_reviews(status, created_at DESC);


-- NordHome v3.13 SEO fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(140) NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(180) NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description VARCHAR(320) NOT NULL DEFAULT '';
UPDATE products SET slug = 'product-' || id WHERE slug = '';
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON products(slug);
