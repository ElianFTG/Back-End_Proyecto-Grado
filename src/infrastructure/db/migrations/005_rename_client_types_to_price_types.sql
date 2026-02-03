-- Migration: Rename client_types to price_types and move price type to business
-- Date: 2026-02-03

-- 1) Rename table client_types -> price_types (preserve data)
RENAME TABLE client_types TO price_types;

-- 2) Add price_type_id to business and populate from clients.client_type_id
ALTER TABLE business ADD COLUMN price_type_id SMALLINT UNSIGNED NULL AFTER client_id;

UPDATE business b
JOIN clients c ON c.id = b.client_id
SET b.price_type_id = c.client_type_id
WHERE c.client_type_id IS NOT NULL;

-- 3) Update product_prices: client_type_id -> price_type_id
ALTER TABLE product_prices
  DROP FOREIGN KEY fk_product_prices_client_type,
  DROP PRIMARY KEY;

ALTER TABLE product_prices
  CHANGE COLUMN client_type_id price_type_id SMALLINT UNSIGNED NOT NULL,
  ADD PRIMARY KEY (product_id, price_type_id),
  ADD CONSTRAINT fk_product_prices_price_type FOREIGN KEY (price_type_id) REFERENCES price_types(id) ON DELETE RESTRICT;

-- 4) Update presale_details: client_type_id -> price_type_id
ALTER TABLE presale_details
  DROP INDEX idx_presale_detail_client_type;

ALTER TABLE presale_details
  CHANGE COLUMN client_type_id price_type_id SMALLINT UNSIGNED NOT NULL,
  ADD INDEX idx_presale_detail_price_type (price_type_id);

-- 5) Drop client_type_id from clients (now on business)
ALTER TABLE clients DROP COLUMN client_type_id;

-- NOTE: Update any application code to use price_type_id in product_prices and presale_details, and to read price_type_id from business.