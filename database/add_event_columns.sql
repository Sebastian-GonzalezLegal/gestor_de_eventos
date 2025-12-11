-- Script para agregar las columnas de subsecretaría, tipo y subtipo a la tabla eventos existente
-- Ejecutar solo si estas columnas no existen en la tabla eventos

USE gestor_eventos;

-- Verificar si las columnas existen antes de agregarlas
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'gestor_eventos'
    AND TABLE_NAME = 'eventos'
    AND COLUMN_NAME = 'subsecretaria_id'
);

-- Agregar las columnas solo si no existen
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE eventos
     ADD COLUMN subsecretaria_id INT AFTER lugar,
     ADD COLUMN tipo_id INT AFTER subsecretaria_id,
     ADD COLUMN subtipo_id INT AFTER tipo_id,
     ADD INDEX idx_subsecretaria (subsecretaria_id),
     ADD INDEX idx_tipo (tipo_id),
     ADD INDEX idx_subtipo (subtipo_id)',
    'SELECT "Las columnas ya existen en la tabla eventos"'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar las claves foráneas (si no existen)
-- Nota: Esto puede fallar si las tablas relacionadas no existen
-- En ese caso, ejecutar primero los CREATE TABLE de subsecretarias, tipos y subtipos
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'gestor_eventos'
    AND TABLE_NAME = 'eventos'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND CONSTRAINT_NAME = 'fk_eventos_subsecretaria'
);

SET @fk_sql = IF(@fk_exists = 0,
    'ALTER TABLE eventos
     ADD CONSTRAINT fk_eventos_subsecretaria FOREIGN KEY (subsecretaria_id) REFERENCES subsecretarias(id) ON DELETE SET NULL,
     ADD CONSTRAINT fk_eventos_tipo FOREIGN KEY (tipo_id) REFERENCES tipos(id) ON DELETE SET NULL,
     ADD CONSTRAINT fk_eventos_subtipo FOREIGN KEY (subtipo_id) REFERENCES subtipos(id) ON DELETE SET NULL',
    'SELECT "Las claves foráneas ya existen"'
);

PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;