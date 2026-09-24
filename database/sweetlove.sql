-- Base de datos Sweet Love
-- Modelo normalizado para un comercio electrónico.
--
-- Relación principal de pedidos:
-- usuario 1 ───< pedido 1 ───< itempedido >─── 1 producto
-- pedido   1 ───< pago
-- pago     1 ───< envio
-- envio    >─── 1 estadoenvio
-- producto >─── 1 proveedor
-- usuario  >─── 1 rol

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
START TRANSACTION;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS envio;
DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS itempedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS estadoenvio;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol;

CREATE TABLE rol (
  idRol INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (idRol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE usuario (
  idUser INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  direccion VARCHAR(150) DEFAULT NULL,
  contrasena VARCHAR(255) NOT NULL,
  idRol INT DEFAULT NULL,
  PRIMARY KEY (idUser),
  UNIQUE KEY uk_usuario_email (email),
  KEY idx_usuario_rol (idRol),
  CONSTRAINT usuario_ibfk_1 FOREIGN KEY (idRol) REFERENCES rol (idRol)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE proveedor (
  idProveedor INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  celular VARCHAR(20) NOT NULL,
  idUser INT DEFAULT NULL,
  PRIMARY KEY (idProveedor),
  KEY idx_proveedor_usuario (idUser),
  CONSTRAINT proveedor_ibfk_1 FOREIGN KEY (idUser) REFERENCES usuario (idUser)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE producto (
  idProducto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  precio INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  imagen VARCHAR(255) DEFAULT NULL,
  estado TINYINT(1) DEFAULT 1,
  idProveedor INT DEFAULT NULL,
  PRIMARY KEY (idProducto),
  KEY idx_producto_proveedor (idProveedor),
  CONSTRAINT producto_ibfk_1 FOREIGN KEY (idProveedor) REFERENCES proveedor (idProveedor)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE pedido (
  idPedido INT NOT NULL AUTO_INCREMENT,
  precioTotal INT NOT NULL,
  fecha DATE NOT NULL,
  estadoPedido VARCHAR(100) NOT NULL DEFAULT 'Pendiente',
  idUser INT NOT NULL,
  PRIMARY KEY (idPedido),
  KEY idx_pedido_usuario (idUser),
  CONSTRAINT pedido_ibfk_1 FOREIGN KEY (idUser) REFERENCES usuario (idUser)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE itempedido (
  idItem INT NOT NULL AUTO_INCREMENT,
  cantidad INT NOT NULL,
  precioUnitario INT NOT NULL,
  subTotal INT NOT NULL,
  idPedido INT NOT NULL,
  idProducto INT NOT NULL,
  PRIMARY KEY (idItem),
  KEY idx_item_pedido (idPedido),
  KEY idx_item_producto (idProducto),
  CONSTRAINT itempedido_ibfk_1 FOREIGN KEY (idPedido) REFERENCES pedido (idPedido)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT itempedido_ibfk_2 FOREIGN KEY (idProducto) REFERENCES producto (idProducto)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE pago (
  idPago INT NOT NULL AUTO_INCREMENT,
  proveedorPago VARCHAR(100) DEFAULT NULL,
  monto INT DEFAULT NULL,
  estadoPago VARCHAR(50) DEFAULT 'Pendiente',
  idPedido INT DEFAULT NULL,
  PRIMARY KEY (idPago),
  KEY idx_pago_pedido (idPedido),
  CONSTRAINT pago_ibfk_1 FOREIGN KEY (idPedido) REFERENCES pedido (idPedido)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE estadoenvio (
  idEstado INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (idEstado),
  UNIQUE KEY uk_estadoenvio_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE envio (
  idEnvio INT NOT NULL AUTO_INCREMENT,
  idPago INT DEFAULT NULL,
  idEstado INT DEFAULT NULL,
  PRIMARY KEY (idEnvio),
  KEY idx_envio_pago (idPago),
  KEY idx_envio_estado (idEstado),
  CONSTRAINT envio_ibfk_1 FOREIGN KEY (idPago) REFERENCES pago (idPago)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT envio_ibfk_2 FOREIGN KEY (idEstado) REFERENCES estadoenvio (idEstado)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO rol (idRol, nombre) VALUES
(1, 'Administrador'),
(2, 'Cliente'),
(3, 'Proveedor');

INSERT INTO usuario (idUser, nombre, apellido, email, celular, direccion, contrasena, idRol) VALUES
(1, 'Laura', 'Gomez', 'laura@gmail.com', '3001112233', 'Bogotá', '1234', 2),
(2, 'Carlos', 'Ramirez', 'carlos@gmail.com', '3002223344', 'Medellín', '1234', 1),
(3, 'Ana', 'Martinez', 'ana@gmail.com', '3003334455', 'Cali', '1234', 3);

INSERT INTO proveedor (idProveedor, nombre, email, celular, idUser) VALUES
(1, 'Dulces del Valle', 'ventas@dulces.com', '3101112233', 3),
(2, 'ChocoSweet', 'contacto@choco.com', '3102223344', 3);

INSERT INTO producto (idProducto, nombre, descripcion, precio, cantidad, imagen, estado, idProveedor) VALUES
(1, 'Caja de chocolates', 'Caja de chocolates premium', 45000, 50, 'chocolate.jpg', 1, 1),
(2, 'Ramo dulce', 'Ramo con chocolates y dulces', 65000, 30, 'ramo.jpg', 1, 1),
(3, 'Oso con chocolates', 'Oso de peluche + chocolates', 85000, 20, 'oso.jpg', 1, 2),
(4, 'Corazon de chocolates', 'Caja en forma de corazón', 55000, 25, 'corazon.jpg', 1, 2);

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
COMMIT;
