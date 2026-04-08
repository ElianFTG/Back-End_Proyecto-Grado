-- ============================================================================
-- MIGRACIÓN: Áreas JSON → GEOMETRY POLYGON (MySQL Spatial)
-- ============================================================================
-- 
-- Esta migración convierte la columna `area` de JSON a POLYGON geometry.
-- IMPORTANTE: Ejecutar ANTES de actualizar el código del backend.
--
-- Pasos:
-- 1. Hacer backup de la tabla
-- 2. Crear columna temporal geometry
-- 3. Migrar datos JSON a WKT
-- 4. Eliminar columna JSON
-- 5. Renombrar columna geometry
-- 6. Crear índice espacial
-- ============================================================================

-- PASO 0: Verificar datos actuales (ejecutar como SELECT primero)
-- SELECT id, name, area, state FROM areas;

-- ============================================================================
-- PASO 1: Backup de seguridad
-- ============================================================================
CREATE TABLE IF NOT EXISTS areas_backup_json AS SELECT * FROM areas;

-- ============================================================================
-- PASO 2: Agregar columna temporal para geometría
-- ============================================================================
ALTER TABLE areas ADD COLUMN area_geom POLYGON SRID 4326 AFTER name;

-- ============================================================================
-- PASO 3: Migrar datos JSON a GEOMETRY
-- ============================================================================
-- Esta función convierte el array JSON de puntos {lat,lng} a WKT POLYGON
-- Nota: JSON usa lat,lng pero WKT usa lng lat (X Y)

-- Actualizar registros existentes (ejecutar en un procedimiento o uno por uno)
-- Para cada registro con JSON válido:

DELIMITER //

CREATE PROCEDURE migrate_areas_to_geometry()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id INT;
    DECLARE v_area_json JSON;
    DECLARE v_wkt TEXT;
    DECLARE v_first_lng DECIMAL(20,15);
    DECLARE v_first_lat DECIMAL(20,15);
    DECLARE v_point_count INT;
    
    DECLARE cur CURSOR FOR 
        SELECT id, area FROM areas WHERE area IS NOT NULL;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_id, v_area_json;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Obtener cantidad de puntos
        SET v_point_count = JSON_LENGTH(v_area_json);
        
        IF v_point_count >= 3 THEN
            -- Construir WKT desde JSON
            SET v_wkt = 'POLYGON((';
            
            -- Iterar sobre los puntos
            SET @i = 0;
            SET @coords = '';
            
            WHILE @i < v_point_count DO
                SET @lng = JSON_EXTRACT(v_area_json, CONCAT('$[', @i, '].lng'));
                SET @lat = JSON_EXTRACT(v_area_json, CONCAT('$[', @i, '].lat'));
                
                IF @i = 0 THEN
                    SET v_first_lng = @lng;
                    SET v_first_lat = @lat;
                END IF;
                
                IF @i > 0 THEN
                    SET @coords = CONCAT(@coords, ', ');
                END IF;
                
                SET @coords = CONCAT(@coords, @lng, ' ', @lat);
                SET @i = @i + 1;
            END WHILE;
            
            -- Cerrar el polígono si no está cerrado
            SET @last_lng = JSON_EXTRACT(v_area_json, CONCAT('$[', v_point_count - 1, '].lng'));
            SET @last_lat = JSON_EXTRACT(v_area_json, CONCAT('$[', v_point_count - 1, '].lat'));
            
            IF v_first_lng != @last_lng OR v_first_lat != @last_lat THEN
                SET @coords = CONCAT(@coords, ', ', v_first_lng, ' ', v_first_lat);
            END IF;
            
            SET v_wkt = CONCAT(v_wkt, @coords, '))');
            
            -- Actualizar con geometría
            UPDATE areas 
            SET area_geom = ST_GeomFromText(v_wkt, 4326)
            WHERE id = v_id;
            
        END IF;
    END LOOP;
    
    CLOSE cur;
END //

DELIMITER ;

-- Ejecutar migración
CALL migrate_areas_to_geometry();

-- Limpiar procedimiento
DROP PROCEDURE IF EXISTS migrate_areas_to_geometry;

-- ============================================================================
-- PASO 4: Verificar migración
-- ============================================================================
-- SELECT id, name, ST_AsText(area_geom) as area_wkt FROM areas;

-- ============================================================================
-- PASO 5: Eliminar columna JSON y renombrar geometry
-- ============================================================================
ALTER TABLE areas DROP COLUMN area;
ALTER TABLE areas CHANGE area_geom area POLYGON SRID 4326 NOT NULL;

-- ============================================================================
-- PASO 6: Crear índice espacial
-- ============================================================================
CREATE SPATIAL INDEX idx_areas_area ON areas(area);

-- ============================================================================
-- PASO 7: Verificar resultado final
-- ============================================================================
-- DESCRIBE areas;
-- SELECT id, name, ST_AsText(area) as area_wkt, state FROM areas;

-- ============================================================================
-- ROLLBACK (si es necesario)
-- ============================================================================
-- DROP TABLE areas;
-- RENAME TABLE areas_backup_json TO areas;
