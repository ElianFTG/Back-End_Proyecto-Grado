-- =====================================================
-- ÍNDICES RECOMENDADOS PARA OPTIMIZACIÓN (~30.000 productos)
-- Ejecutar en MySQL si TypeORM synchronize no los crea
-- =====================================================

-- Índices en tabla products
-- -------------------------
-- Búsqueda por nombre (LIKE '%...%' no usa índice, pero LIKE 'abc%' sí)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Búsqueda por códigos
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_internal_code ON products(internal_code);

-- Filtros comunes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_state ON products(state);

-- Índices compuestos para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_products_state_category ON products(state, category_id);
CREATE INDEX IF NOT EXISTS idx_products_state_brand ON products(state, brand_id);

-- Índices en tabla product_branches
-- ---------------------------------
-- Ya tiene PK compuesta (product_id, branch_id)

-- Para búsquedas por sucursal con filtro de disponibilidad
CREATE INDEX IF NOT EXISTS idx_pb_branch_has_stock ON product_branches(branch_id, has_stock);

-- Para JOIN eficiente
CREATE INDEX IF NOT EXISTS idx_pb_branch_product ON product_branches(branch_id, product_id);


-- =====================================================
-- OPCIONAL: FULLTEXT para búsqueda más eficiente
-- (solo si se necesita búsqueda tipo "contiene" en nombre)
-- =====================================================
-- ALTER TABLE products ADD FULLTEXT INDEX ft_products_name (name);
-- 
-- Uso en query:
-- SELECT * FROM products 
-- WHERE MATCH(name) AGAINST('+cable +hdmi' IN BOOLEAN MODE);


-- =====================================================
-- VERIFICAR ÍNDICES EXISTENTES
-- =====================================================
-- SHOW INDEX FROM products;
-- SHOW INDEX FROM product_branches;


-- =====================================================
-- ESTADÍSTICAS Y ANÁLISIS
-- =====================================================
-- Ver plan de ejecución de queries:
-- EXPLAIN SELECT p.*, pb.has_stock, pb.stock_qty 
-- FROM products p 
-- LEFT JOIN product_branches pb ON pb.product_id = p.id AND pb.branch_id = 1
-- WHERE p.state = 1 
-- AND p.name LIKE 'cable%'
-- ORDER BY p.name
-- LIMIT 50;
