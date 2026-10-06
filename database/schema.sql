-- Sweet Love: ESQUEMA de la base de datos (solo estructura, sin datos).
-- Modelo normalizado para un comercio electrónico.
-- ADVERTENCIA: borra y recrea las tablas. Para una base nueva usa `npm run db:init`.
--
-- Relación principal de pedidos:
-- usuario 1 ───< pedido 1 ───< itempedido >─── 1 producto
-- pedido   1 ───< pago
-- pago     1 ───< envio
-- envio    >─── 1 estadoenvio
-- producto >─── 1 proveedor
-- usuario  >─── 1 rol

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
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

SET FOREIGN_KEY_CHECKS = 1;
