-- Migration: Normalize product prices from JSON to relational table
-- Date: 2026-01-31

-- 1. Create the product_prices table
CREATE TABLE IF NOT EXISTS product_prices (
    product_id SMALLINT UNSIGNED NOT NULL,
    price_type_id SMALLINT UNSIGNED NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, price_type_id),
    CONSTRAINT fk_product_prices_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_prices_price_type FOREIGN KEY (price_type_id) REFERENCES price_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Migrate existing data from JSON to the new table
-- Assuming client_types: 1=regular, 2=minorista, 3=mayorista (verify order in your DB)
INSERT INTO product_prices (product_id, price_type_id, price)
SELECT 
    p.id,
    ct.id,
    CASE 
        WHEN ct.name = 'regular' THEN COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.sale_price, '$.regular')), 0)
        WHEN ct.name = 'minorista' THEN COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.sale_price, '$.minorista')), 0)
        WHEN ct.name = 'mayorista' THEN COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p.sale_price, '$.mayorista')), 0)
    END
FROM products p
CROSS JOIN price_types ct
WHERE ct.name IN ('regular', 'minorista', 'mayorista')
  AND p.sale_price IS NOT NULL
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- 3. Drop the sale_price column (EXECUTE ONLY AFTER VERIFYING DATA MIGRATION)
-- ALTER TABLE products DROP COLUMN sale_price;
