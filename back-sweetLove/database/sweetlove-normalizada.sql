SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS sweetlove CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sweetlove;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS envio, estadoenvio, pago, itempedido, pedido, producto, proveedor, usuario, rol;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE rol (idRol INT NOT NULL AUTO_INCREMENT, nombre VARCHAR(100) NOT NULL, PRIMARY KEY (idRol));
CREATE TABLE usuario (idUser INT NOT NULL AUTO_INCREMENT, nombre VARCHAR(20) NOT NULL, apellido VARCHAR(20) NOT NULL, email VARCHAR(30) NOT NULL, celular VARCHAR(15) NOT NULL, direccion VARCHAR(30) DEFAULT NULL, contrasena VARCHAR(20) NOT NULL, idRol INT DEFAULT NULL, PRIMARY KEY (idUser), KEY idx_usuario_rol (idRol), CONSTRAINT fk_usuario_rol FOREIGN KEY (idRol) REFERENCES rol(idRol) ON UPDATE CASCADE ON DELETE RESTRICT);
CREATE TABLE proveedor (idProveedor INT NOT NULL AUTO_INCREMENT, nombre VARCHAR(30) NOT NULL, email VARCHAR(30) DEFAULT NULL, celular VARCHAR(15) NOT NULL, idUser INT DEFAULT NULL, PRIMARY KEY (idProveedor), KEY idx_proveedor_usuario (idUser), CONSTRAINT fk_proveedor_usuario FOREIGN KEY (idUser) REFERENCES usuario(idUser) ON UPDATE CASCADE ON DELETE SET NULL);
CREATE TABLE producto (idProducto INT NOT NULL AUTO_INCREMENT, nombre VARCHAR(30) NOT NULL, descripcion VARCHAR(100) DEFAULT NULL, precio INT NOT NULL, cantidad INT NOT NULL, imagen VARCHAR(255) DEFAULT NULL, estado TINYINT(1) DEFAULT 1, idProveedor INT DEFAULT NULL, PRIMARY KEY (idProducto), KEY idx_producto_proveedor (idProveedor), CONSTRAINT fk_producto_proveedor FOREIGN KEY (idProveedor) REFERENCES proveedor(idProveedor) ON UPDATE CASCADE ON DELETE SET NULL);
CREATE TABLE pedido (idPedido INT NOT NULL AUTO_INCREMENT, precioTotal INT NOT NULL, fecha DATE DEFAULT NULL, estadoPedido VARCHAR(100) DEFAULT NULL, idUser INT NOT NULL, PRIMARY KEY (idPedido), KEY idx_pedido_usuario (idUser), CONSTRAINT fk_pedido_usuario FOREIGN KEY (idUser) REFERENCES usuario(idUser) ON UPDATE CASCADE ON DELETE RESTRICT);
CREATE TABLE itempedido (idItem INT NOT NULL AUTO_INCREMENT, cantidad INT NOT NULL, precioUnitario INT NOT NULL, subTotal INT NOT NULL, idPedido INT NOT NULL, idProducto INT NOT NULL, PRIMARY KEY (idItem), KEY idProducto (idProducto), KEY idx_item_pedido (idPedido), CONSTRAINT fk_item_producto FOREIGN KEY (idProducto) REFERENCES producto(idProducto) ON UPDATE CASCADE ON DELETE RESTRICT, CONSTRAINT fk_item_pedido FOREIGN KEY (idPedido) REFERENCES pedido(idPedido) ON UPDATE CASCADE ON DELETE CASCADE);
CREATE TABLE pago (idPago INT NOT NULL AUTO_INCREMENT, proveedorPago VARCHAR(100) DEFAULT NULL, monto INT DEFAULT NULL, estadoPago VARCHAR(50) DEFAULT NULL, idPedido INT DEFAULT NULL, PRIMARY KEY (idPago), KEY idx_pago_pedido (idPedido), CONSTRAINT fk_pago_pedido FOREIGN KEY (idPedido) REFERENCES pedido(idPedido) ON UPDATE CASCADE ON DELETE CASCADE);
CREATE TABLE estadoenvio (idEstado INT NOT NULL AUTO_INCREMENT, nombre VARCHAR(100) NOT NULL, PRIMARY KEY (idEstado));
CREATE TABLE envio (idEnvio INT NOT NULL AUTO_INCREMENT, idPago INT DEFAULT NULL, idEstado INT DEFAULT NULL, PRIMARY KEY (idEnvio), KEY idx_envio_pago (idPago), KEY idx_envio_estado (idEstado), CONSTRAINT fk_envio_pago FOREIGN KEY (idPago) REFERENCES pago(idPago) ON UPDATE CASCADE ON DELETE CASCADE, CONSTRAINT fk_envio_estado FOREIGN KEY (idEstado) REFERENCES estadoenvio(idEstado) ON UPDATE CASCADE ON DELETE SET NULL);

INSERT INTO rol VALUES (1,'Administrador'),(2,'Cliente'),(3,'Proveedor');
INSERT INTO usuario VALUES (1,'Laura','Gomez','laura@gmail.com','3001112233','Bogotá','1234',2),(2,'Carlos','Ramirez','carlos@gmail.com','3002223344','Medellín','1234',1),(3,'Ana','Martinez','ana@gmail.com','3003334455','Cali','1234',3);
INSERT INTO proveedor VALUES (1,'Dulces del Valle','ventas@dulces.com','3101112233',3),(2,'ChocoSweet','contacto@choco.com','3102223344',3);
INSERT INTO producto VALUES (1,'Caja de chocolates','Caja de chocolates premium',50000,10,'chocolate.jpg',1,1),(2,'Ramo dulce','Ramo con chocolates y dulces',65000,30,'ramo.jpg',1,1),(3,'Oso con chocolates','Oso de peluche + chocolates',85000,20,'oso.jpg',1,2),(4,'Corazon de chocolates','Caja en forma de corazón',55000,25,'corazon.jpg',1,2);
INSERT INTO pedido VALUES (1,45000,'2026-03-01','Completado',1),(2,130000,'2026-03-02','Completado',1),(3,85000,'2026-03-03','Pendiente',1);
INSERT INTO itempedido VALUES (1,1,45000,45000,1,1),(2,2,65000,130000,2,2),(3,1,85000,85000,3,3);
INSERT INTO pago VALUES (1,'Nequi',45000,'Aprobado',1),(2,'Daviplata',130000,'Aprobado',2),(3,'Tarjeta',85000,'Pendiente',3);
INSERT INTO estadoenvio VALUES (1,'Pendiente'),(2,'En camino'),(3,'Entregado');
INSERT INTO envio VALUES (1,1,3),(2,2,2),(3,3,1);

COMMIT;
