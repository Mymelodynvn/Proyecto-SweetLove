-- Sweet Love: datos de DEMOSTRACIÓN. Se carga después de schema.sql.
-- No incluir en producción: contiene cuentas de ejemplo.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO rol (idRol, nombre) VALUES
(1, 'Administrador'),
(2, 'Cliente'),
(3, 'Proveedor');

-- Usuarios de DEMOSTRACIÓN. Contraseña de los tres: SweetLove#2026 (hash bcrypt).
-- Cámbialas o elimínalas antes de publicar el sitio.
INSERT INTO usuario (idUser, nombre, apellido, email, celular, direccion, contrasena, idRol) VALUES
(1, 'Laura', 'Gomez', 'laura@gmail.com', '3001112233', 'Bogotá', '$2b$10$dn.c5GI2LJ/SpDysL0gofu0s2.DFj5njRd.AeCFLIBZXy/0tnNbW.', 2),
(2, 'Carlos', 'Ramirez', 'carlos@gmail.com', '3002223344', 'Medellín', '$2b$10$dn.c5GI2LJ/SpDysL0gofu0s2.DFj5njRd.AeCFLIBZXy/0tnNbW.', 1),
(3, 'Ana', 'Martinez', 'ana@gmail.com', '3003334455', 'Cali', '$2b$10$dn.c5GI2LJ/SpDysL0gofu0s2.DFj5njRd.AeCFLIBZXy/0tnNbW.', 3);

INSERT INTO proveedor (idProveedor, nombre, email, celular, idUser) VALUES
(1, 'Dulces del Valle', 'ventas@dulces.com', '3101112233', 3),
(2, 'ChocoSweet', 'contacto@choco.com', '3102223344', 3);

-- imagen en NULL: la tienda usa una imagen por defecto hasta que el administrador suba una.
INSERT INTO producto (idProducto, nombre, descripcion, precio, cantidad, imagen, estado, idProveedor) VALUES
(1, 'Caja de chocolates', 'Caja de chocolates premium', 45000, 50, NULL, 1, 1),
(2, 'Ramo dulce', 'Ramo con chocolates y dulces', 65000, 30, NULL, 1, 1),
(3, 'Oso con chocolates', 'Oso de peluche + chocolates', 85000, 20, NULL, 1, 2),
(4, 'Corazon de chocolates', 'Caja en forma de corazón', 55000, 25, NULL, 1, 2);

INSERT INTO estadoenvio (idEstado, nombre) VALUES
(1, 'Pendiente'),
(2, 'En camino'),
(3, 'Entregado');

-- Pedido 1: un producto.
INSERT INTO pedido (idPedido, precioTotal, fecha, estadoPedido, idUser) VALUES
(1, 45000, '2026-03-01', 'Completado', 1),
(2, 130000, '2026-03-02', 'Completado', 1),
(3, 85000, '2026-03-03', 'Pendiente', 1);

INSERT INTO itempedido (idItem, cantidad, precioUnitario, subTotal, idPedido, idProducto) VALUES
(1, 1, 45000, 45000, 1, 1),
(2, 2, 65000, 130000, 2, 2),
(3, 1, 85000, 85000, 3, 3);

INSERT INTO pago (idPago, proveedorPago, monto, estadoPago, idPedido) VALUES
(1, 'Nequi', 45000, 'Aprobado', 1),
(2, 'Daviplata', 130000, 'Aprobado', 2),
(3, 'Tarjeta', 85000, 'Pendiente', 3);

INSERT INTO envio (idEnvio, idPago, idEstado) VALUES
(1, 1, 3),
(2, 2, 2),
(3, 3, 1);

ALTER TABLE rol AUTO_INCREMENT = 4;
ALTER TABLE usuario AUTO_INCREMENT = 4;
ALTER TABLE proveedor AUTO_INCREMENT = 3;
ALTER TABLE producto AUTO_INCREMENT = 5;
ALTER TABLE estadoenvio AUTO_INCREMENT = 4;
ALTER TABLE pedido AUTO_INCREMENT = 4;
ALTER TABLE itempedido AUTO_INCREMENT = 4;
ALTER TABLE pago AUTO_INCREMENT = 4;
ALTER TABLE envio AUTO_INCREMENT = 4;

SET FOREIGN_KEY_CHECKS = 1;
