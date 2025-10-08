-- Agregar columna paginasEditables a la tabla confirmacion_reserva
ALTER TABLE confirmacion_reserva
ADD COLUMN paginasEditables LONGTEXT COMMENT 'Páginas editables en formato JSON' AFTER telefono;

