-- Migración del modelo antiguo de pedidos al modelo normalizado.
--
-- Ejecutar sobre la base de datos Sweet Love que ya tiene información.
-- Esta migración conserva los productos, usuarios, pedidos y pagos existentes.
--
-- Modelo anterior:
-- pedido.idItem -> itempedido.idItem
-- itempedido.idUser -> usuario.idUser
--
-- Modelo nuevo:
-- pedido.idUser -> usuario.idUser
-- itempedido.idPedido -> pedido.idPedido
--
-- El nuevo diseño permite que un pedido tenga varios itempedido.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Agrega las nuevas columnas necesarias.
ALTER TABLE pedido ADD COLUMN idUser INT NULL AFTER estadoPedido;
ALTER TABLE itempedido ADD COLUMN idPedido INT NULL AFTER subTotal;

-- 2. Conserva las relaciones de los registros existentes.
UPDATE pedido p
INNER JOIN itempedido i ON i.idItem = p.idItem
SET p.idUser = i.idUser;

UPDATE itempedido i
INNER JOIN pedido p ON p.idItem = i.idItem
SET i.idPedido = p.idPedido;

-- 3. Normaliza el estado del pedido: el pago tiene su propio estado.
UPDATE pedido
SET estadoPedido = 'Completado'
WHERE estadoPedido = 'Pagado';

-- 4. Quita las restricciones e índices del modelo anterior.
ALTER TABLE pedido DROP FOREIGN KEY pedido_ibfk_1;
ALTER TABLE itempedido DROP FOREIGN KEY itempedido_ibfk_2;

ALTER TABLE pedido DROP INDEX idItem;
ALTER TABLE itempedido DROP INDEX idUser;

-- 5. Elimina las columnas que ya no corresponden al modelo normalizado.
ALTER TABLE pedido DROP COLUMN idItem;
ALTER TABLE itempedido DROP COLUMN idUser;

-- 6. Las nuevas columnas pasan a ser obligatorias.
ALTER TABLE pedido MODIFY idUser INT NOT NULL;
ALTER TABLE itempedido MODIFY idPedido INT NOT NULL;
ALTER TABLE itempedido MODIFY idProducto INT NOT NULL;
ALTER TABLE itempedido MODIFY subTotal INT NOT NULL;

-- 7. Crea las nuevas claves e índices.
ALTER TABLE pedido ADD INDEX idx_pedido_usuario (idUser);
ALTER TABLE itempedido ADD INDEX idx_item_pedido (idPedido);

ALTER TABLE pedido
  ADD CONSTRAINT pedido_ibfk_1
  FOREIGN KEY (idUser) REFERENCES usuario (idUser)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE itempedido
  ADD CONSTRAINT itempedido_ibfk_2
  FOREIGN KEY (idPedido) REFERENCES pedido (idPedido)
  ON UPDATE CASCADE ON DELETE CASCADE;

-- La clave foránea existente itempedido_ibfk_1 ya mantiene la relación con producto.
SET FOREIGN_KEY_CHECKS = 1;
