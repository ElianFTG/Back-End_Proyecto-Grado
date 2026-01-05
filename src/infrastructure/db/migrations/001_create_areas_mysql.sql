-- ============================================================================
-- MIGRACIÓN: Tabla de Áreas Geográficas para MySQL
-- ============================================================================
-- Proyecto de Grado: Sistema de Gestión con Áreas
-- Base de datos: MySQL 5.7+ / MariaDB 10.2+
-- 
-- EJECUCIÓN:
-- mysql -u usuario -p nombre_bd < 001_create_areas_mysql.sql
-- ============================================================================

-- 1. Crear tabla de áreas
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    
    -- Array de coordenadas como JSON
    -- Formato: [{"lat": -17.40, "lng": -66.14}, ...]
    area JSON NOT NULL,
    
    -- Soft delete
    state BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Auditoría
    user_id INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    INDEX idx_areas_name (name),
    INDEX idx_areas_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS DE EJEMPLO
-- ============================================================================

-- Zona Centro - Cochabamba
INSERT INTO areas (name, area, state, user_id) VALUES (
    'Zona Centro',
    '[
        {"lat": -17.393500, "lng": -66.157300},
        {"lat": -17.383500, "lng": -66.157300},
        {"lat": -17.383500, "lng": -66.147300},
        {"lat": -17.393500, "lng": -66.147300}
    ]',
    TRUE,
    NULL
);

-- Zona Norte
INSERT INTO areas (name, area, state, user_id) VALUES (
    'Zona Norte',
    '[
        {"lat": -17.370000, "lng": -66.160000},
        {"lat": -17.380000, "lng": -66.160000},
        {"lat": -17.380000, "lng": -66.145000},
        {"lat": -17.370000, "lng": -66.145000}
    ]',
    TRUE,
    NULL
);

-- Zona Sur
INSERT INTO areas (name, area, state, user_id) VALUES (
    'Zona Sur',
    '[
        {"lat": -17.395000, "lng": -66.158000},
        {"lat": -17.410000, "lng": -66.158000},
        {"lat": -17.410000, "lng": -66.140000},
        {"lat": -17.395000, "lng": -66.140000}
    ]',
    TRUE,
    NULL
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver estructura de la tabla
DESCRIBE areas;

-- Ver datos insertados
SELECT 
    id, 
    name, 
    JSON_LENGTH(area) as puntos,
    state,
    created_at
FROM areas;

-- Ejemplo de consulta extrayendo coordenadas
SELECT 
    id,
    name,
    JSON_EXTRACT(area, '$[0].lat') as primer_lat,
    JSON_EXTRACT(area, '$[0].lng') as primer_lng
FROM areas
WHERE state = TRUE;

-- ============================================================================
-- NOTAS
-- ============================================================================
/*
VENTAJAS DE JSON EN MYSQL:
1. No requiere extensiones especiales (vs PostGIS)
2. Fácil de leer y debuggear
3. Mapeo directo a JavaScript/TypeScript arrays
4. Soporte nativo en MySQL 5.7+
5. Funciones JSON_EXTRACT, JSON_ARRAY, etc. disponibles

LIMITACIONES (aceptables para este caso):
1. No hay consultas espaciales nativas (ST_Contains, etc.)
2. Para "punto en polígono" se necesitaría lógica en aplicación
3. Índices JSON son limitados vs índices espaciales

PARA TESIS:
- Solución pragmática y de bajo costo
- Funciona con cualquier hosting MySQL estándar
- Fácil de mantener y escalar horizontalmente
*/

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
