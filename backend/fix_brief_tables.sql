-- =====================================================
-- Script para ARREGLAR las tablas Brief completamente
-- =====================================================
-- Base de datos: dbappclc
-- Servidor: 192.168.50.202:3306
-- Usuario: clc
-- 
-- INSTRUCCIONES:
-- 1. Conectarse a la base de datos dbappclc en 192.168.50.202
-- 2. Ejecutar este script completo
-- 3. Refrescar la vista de tablas en tu cliente gráfico
-- =====================================================

USE dbappclc;

-- Verificar conexión
SELECT 'Conectado a base de datos:' as mensaje, DATABASE() as base_datos;

-- Mostrar tablas Brief actuales
SELECT 'Tablas Brief antes de la corrección:' as mensaje;
SHOW TABLES LIKE 'brief_%';

-- 1. ELIMINAR tablas problemáticas
DROP TABLE IF EXISTS brief_briefhistory;
DROP TABLE IF EXISTS brief_briefitem;  
DROP TABLE IF EXISTS brief_briefitems;  -- versión incorrecta con 's'

SELECT 'Tablas eliminadas. Recreando estructuras correctas...' as mensaje;

-- 2. CREAR tabla brief_briefitem (SIN DEFAULT en campos LONGTEXT)
CREATE TABLE brief_briefitem (
    id char(32) NOT NULL,
    product varchar(200) NOT NULL,
    quantity decimal(10,2) NOT NULL,
    specifications longtext NOT NULL,
    notes longtext NOT NULL,
    precio_estimado decimal(10,2) DEFAULT NULL,
    orden int unsigned NOT NULL DEFAULT 1,
    brief_id char(32) NOT NULL,
    product_reference_id bigint DEFAULT NULL,
    unit_id bigint NOT NULL,
    PRIMARY KEY (id),
    KEY idx_brief_briefitem_brief_id (brief_id),
    KEY idx_brief_briefitem_unit_id (unit_id),
    KEY idx_brief_briefitem_product_ref_id (product_reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CREAR tabla brief_briefhistory (SIN DEFAULT en campos LONGTEXT)
CREATE TABLE brief_briefhistory (
    id bigint NOT NULL AUTO_INCREMENT,
    change_date datetime(6) NOT NULL,
    field_changed varchar(50) NOT NULL,
    old_value longtext NOT NULL,
    new_value longtext NOT NULL,
    change_reason longtext NOT NULL,
    brief_id char(32) NOT NULL,
    changed_by_id bigint NOT NULL,
    PRIMARY KEY (id),
    KEY idx_brief_briefhistory_brief_id (brief_id),
    KEY idx_brief_briefhistory_changed_by_id (changed_by_id),
    KEY idx_brief_briefhistory_change_date (change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. VERIFICAR que todas las tablas fueron creadas
SELECT 'VERIFICACIÓN DE TABLAS CREADAS:' as mensaje;
SHOW TABLES LIKE 'brief_%';

-- 5. MOSTRAR estructura de todas las tablas Brief
SELECT '=== ESTRUCTURA DE brief_brief ===' as mensaje;
DESCRIBE brief_brief;

SELECT '=== ESTRUCTURA DE brief_briefitem ===' as mensaje;  
DESCRIBE brief_briefitem;

SELECT '=== ESTRUCTURA DE brief_briefhistory ===' as mensaje;
DESCRIBE brief_briefhistory;

-- 6. CONTAR registros existentes
SELECT '=== CONTEO DE REGISTROS ===' as mensaje;
SELECT 'brief_brief:' as tabla, COUNT(*) as registros FROM brief_brief
UNION ALL
SELECT 'brief_briefitem:' as tabla, COUNT(*) as registros FROM brief_briefitem  
UNION ALL
SELECT 'brief_briefhistory:' as tabla, COUNT(*) as registros FROM brief_briefhistory;

-- 7. RESULTADO FINAL
SELECT '🎉 ¡CORRECCIÓN COMPLETADA EXITOSAMENTE!' as mensaje;
SELECT 'Todas las tablas Brief han sido recreadas correctamente.' as detalle;
SELECT 'Ahora deberías ver las 3 tablas en tu interfaz gráfica:' as instruccion;
SELECT '- brief_brief (tabla principal)' as tabla1;
SELECT '- brief_briefitem (items de brief)' as tabla2; 
SELECT '- brief_briefhistory (historial de cambios)' as tabla3;
SELECT 'Si no aparecen, REFRESCA tu cliente de base de datos.' as nota;