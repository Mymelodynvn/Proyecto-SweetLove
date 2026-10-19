-- Sweet Love: DATOS BASE. Los necesita el sistema para funcionar, en cualquier ambiente (incluida producción).
-- Se carga después de schema.sql. No contiene cuentas ni productos: eso va en seed.sql (solo demostración).
SET NAMES utf8mb4;

-- Roles de las cuentas: 1 es el único que entra al panel (ver ADMIN_ROLE_ID en backend/src/middleware/auth.js)
INSERT INTO rol (idRol, nombre) VALUES
(1, 'Administrador'),
(2, 'Cliente'),
(3, 'Proveedor');

-- Estados de un envío; cada pedido nuevo crea su envío en 'Pendiente'
INSERT INTO estadoenvio (idEstado, nombre) VALUES
(1, 'Pendiente'),
(2, 'En camino'),
(3, 'Entregado');

ALTER TABLE rol AUTO_INCREMENT = 4;
ALTER TABLE estadoenvio AUTO_INCREMENT = 4;
