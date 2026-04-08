-- ============================================================================
-- MIGRACIÓN SIMPLIFICADA: Crear tabla areas con GEOMETRY desde cero
-- ============================================================================
-- 
-- Usar esta migración si la tabla no existe o si se prefiere empezar limpio.
-- Para migración de datos existentes, usar 001_areas_json_to_geometry.sql
-- ============================================================================

-- Eliminar tabla si existe (solo en desarrollo)
-- DROP TABLE IF EXISTS areas;

-- Crear tabla con geometría espacial
CREATE TABLE IF NOT EXISTS areas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    area POLYGON NOT NULL SRID 4326,
    state BOOLEAN NOT NULL DEFAULT TRUE,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_areas_name (name),
    INDEX idx_areas_state (state),
    SPATIAL INDEX idx_areas_area (area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS DE EJEMPLO (opcional)
-- ============================================================================

-- Área de ejemplo: Zona Centro (cuadrado simple)
-- INSERT INTO areas (name, area, state, user_id) VALUES (
--     'Zona Centro',
--     ST_GeomFromText('POLYGON((-68.15 -16.50, -68.13 -16.50, -68.13 -16.48, -68.15 -16.48, -68.15 -16.50))', 4326),
--     1,
--     1
-- );

-- Área de ejemplo: Zona Norte (triángulo)
-- INSERT INTO areas (name, area, state, user_id) VALUES (
--     'Zona Norte',
--     ST_GeomFromText('POLYGON((-68.14 -16.45, -68.12 -16.45, -68.13 -16.43, -68.14 -16.45))', 4326),
--     1,
--     1
-- );

-- ============================================================================
-- VERIFICAR FUNCIONES ESPACIALES DISPONIBLES
-- ============================================================================
-- Estas son las funciones MySQL que usamos:
-- - ST_GeomFromText(wkt, srid): Crear geometría desde WKT
-- - ST_AsText(geom): Convertir geometría a WKT
-- - ST_Intersects(geom1, geom2): Verificar si dos geometrías se intersectan
-- - ST_IsValid(geom): Verificar si una geometría es válida
-- - ST_SRID(geom): Obtener el SRID de una geometría

-- Verificar que ST_Intersects funciona:
-- SELECT ST_Intersects(
--     ST_GeomFromText('POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))', 4326),
--     ST_GeomFromText('POLYGON((0.5 0.5, 1.5 0.5, 1.5 1.5, 0.5 1.5, 0.5 0.5))', 4326)
-- ) as should_be_1;
