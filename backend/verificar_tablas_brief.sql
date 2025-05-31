-- Script para verificar tablas Brief en tu cliente gráfico
-- Ejecuta este script línea por línea en tu interfaz

-- 1. Verificar conexión
SELECT 'Conectado a:' as mensaje, DATABASE() as base_datos, USER() as usuario;

-- 2. Listar TODAS las tablas
SHOW TABLES;

-- 3. Buscar específicamente tablas Brief
SHOW TABLES LIKE 'brief_%';

-- 4. Verificar existencia individual
SELECT 'brief_brief existe:' as tabla, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                         WHERE table_schema = 'dbappclc' 
                         AND table_name = 'brief_brief') 
            THEN 'SÍ' ELSE 'NO' END as existe;

SELECT 'brief_briefitem existe:' as tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                         WHERE table_schema = 'dbappclc' 
                         AND table_name = 'brief_briefitem') 
            THEN 'SÍ' ELSE 'NO' END as existe;

SELECT 'brief_briefhistory existe:' as tabla,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                         WHERE table_schema = 'dbappclc' 
                         AND table_name = 'brief_briefhistory') 
            THEN 'SÍ' ELSE 'NO' END as existe;

-- 5. Mostrar estructura de brief_brief
DESCRIBE brief_brief;

-- 6. Mostrar estructura de brief_briefitem  
DESCRIBE brief_briefitem;

-- 7. Mostrar estructura de brief_briefhistory
DESCRIBE brief_briefhistory;

-- 8. Contar registros
SELECT 'brief_brief' as tabla, COUNT(*) as registros FROM brief_brief
UNION ALL
SELECT 'brief_briefitem' as tabla, COUNT(*) as registros FROM brief_briefitem
UNION ALL  
SELECT 'brief_briefhistory' as tabla, COUNT(*) as registros FROM brief_briefhistory;

-- Si ves los resultados de este script, las tablas SÍ EXISTEN
-- El problema es tu interfaz gráfica que no las muestra correctamente