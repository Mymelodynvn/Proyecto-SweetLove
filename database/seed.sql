-- Sweet Love: datos de DEMOSTRACIÓN. Se carga después de schema.sql y datos-base.sql.
-- No incluir en producción: contiene cuentas de ejemplo.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

-- 20 productos de repostería con la imagen por URL (fotos de Wikimedia Commons; ver CREDITOS-IMAGENES.md)
INSERT INTO producto (idProducto, nombre, descripcion, precio, cantidad, imagen, estado, idProveedor) VALUES
(5, 'Mini cupcakes de vainilla x12', 'Doce mini cupcakes de vainilla con crema de mantequilla y decoración en tonos pastel. Ideales para cumpleaños, baby showers y reuniones.', 36000, 25, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Perfect_Vanilla_Cupcakes_%28Unsplash%29.jpg/500px-Perfect_Vanilla_Cupcakes_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(6, 'Cupcakes de chocolate x6', 'Seis cupcakes de chocolate húmedos con cobertura cremosa y chispas de colores. Hechos al día con ingredientes frescos.', 28000, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Chocolate_Cupcakes.jpg/500px-Chocolate_Cupcakes.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(7, 'Brownies de chocolate x6', 'Brownies artesanales de chocolate oscuro, crujientes por fuera y suaves por dentro. Se entregan empacados en caja.', 26000, 40, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Chocolate_brownies_without_table.jpg/500px-Chocolate_brownies_without_table.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(8, 'Cheesecake de fresa', 'Cheesecake cremoso sobre base de galleta con cobertura de fresas frescas y salsa de fresa. Rinde 8 porciones.', 45000, 10, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Strawberry_cheesecake_round.jpg/500px-Strawberry_cheesecake_round.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(9, 'Torta de chocolate con fresas', 'Torta de chocolate esponjosa con ganache y fresas frescas por encima. Perfecta para celebrar; rinde 10 porciones.', 55000, 8, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Vegan_chocolate_cake_with_sliced_strawberries.jpg/500px-Vegan_chocolate_cake_with_sliced_strawberries.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(10, 'Macarons x12', 'Doce macarons franceses en sabores surtidos con relleno cremoso. Delicados, coloridos y perfectos para regalar.', 48000, 20, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/French_macaroons.jpg/500px-French_macaroons.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(11, 'Galletas decoradas x8', 'Ocho galletas de mantequilla decoradas a mano con glaseado real y confites. Se pueden personalizar según la ocasión.', 32000, 35, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Decorated_sugar_cookies_2.jpg/500px-Decorated_sugar_cookies_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(12, 'Galletas con chips de chocolate x12', 'Doce galletas recién horneadas con trozos de chocolate semiamargo. Doradas por fuera y suaves por dentro.', 24000, 50, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Chocolate_chip_cookies_on_cutting_board.jpg/500px-Chocolate_chip_cookies_on_cutting_board.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(13, 'Donas glaseadas x6', 'Seis donas esponjosas con glaseado dulce brillante, horneadas cada mañana. Ideales para el desayuno o la tarde.', 27000, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Glazed-Donut.jpg/500px-Glazed-Donut.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(14, 'Caja de trufas surtidas x16', 'Dieciséis trufas y bombones de chocolate negro, con leche y blanco en una caja de regalo. Un detalle dulce y elegante.', 62000, 15, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Chocolate_truffles_2.jpg/500px-Chocolate_truffles_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(15, 'Fresas con chocolate x12', 'Doce fresas frescas bañadas en chocolate y decoradas a mano. Se preparan el mismo día de la entrega.', 40000, 18, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Chocolate_covered_strawberries.jpg/500px-Chocolate_covered_strawberries.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(16, 'Alfajores x10', 'Diez alfajores de maicena rellenos de arequipe y bañados en coco rallado. Una receta clásica, suave y mantecosa.', 25000, 40, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Alfajorartes.JPG/500px-Alfajorartes.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(17, 'Tartaleta de limón', 'Tartaleta individual de masa quebrada con crema de limón y detalles de chocolate. Equilibrio perfecto entre dulce y ácido.', 9500, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Lemon_tart_%28cropped%29.jpg/500px-Lemon_tart_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(18, 'Tiramisú (porción)', 'Porción de tiramisú con capas de bizcocho, café y crema de mascarpone, espolvoreado con cacao.', 12000, 25, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Tiramisu_dessert.jpg/500px-Tiramisu_dessert.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(19, 'Mini donas de chocolate x12', 'Doce mini donas cubiertas de chocolate y trocitos de galleta. Un bocado pequeño, divertido y lleno de sabor.', 40000, 22, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Choco_Mini_Donuts%2C_Mar_2025.jpg/500px-Choco_Mini_Donuts%2C_Mar_2025.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(20, 'Cake pops x10', 'Diez cake pops de bizcocho cubiertos de chocolate y confites de colores. Perfectos para mesas dulces y recuerdos de fiesta.', 35000, 28, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Cake_pops_with_sprinkles_in_Adelaide%2C_March_2012.jpg/500px-Cake_pops_with_sprinkles_in_Adelaide%2C_March_2012.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(21, 'Caja de cupcakes decorados x6', 'Seis cupcakes decorados con flores y detalles de fondant en una caja lista para regalar. Cada uno es único.', 60000, 14, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Box_of_Cupcakes.jpg/500px-Box_of_Cupcakes.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(22, 'Tres leches (porción)', 'Porción de pastel tres leches: bizcocho empapado en leches y cubierto con crema chantilly y fruta.', 11000, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Tres_leches_cake.jpg/500px-Tres_leches_cake.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(23, 'Muffins de arándanos x6', 'Seis muffins esponjosos con arándanos naturales y un toque de limón. Horneados al día.', 24000, 35, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Blueberry_muffins%2C_whole_and_partial.jpg/500px-Blueberry_muffins%2C_whole_and_partial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(24, 'Rollos de canela x6', 'Seis rollos de canela suaves y calientes con glaseado de queso crema. El aroma perfecto para la tarde.', 30000, 24, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Homemade_Cinnamon_rolls_03.jpg/500px-Homemade_Cinnamon_rolls_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2);

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

ALTER TABLE usuario AUTO_INCREMENT = 4;
ALTER TABLE proveedor AUTO_INCREMENT = 3;
ALTER TABLE producto AUTO_INCREMENT = 25;
ALTER TABLE pedido AUTO_INCREMENT = 4;
ALTER TABLE itempedido AUTO_INCREMENT = 4;
ALTER TABLE pago AUTO_INCREMENT = 4;
ALTER TABLE envio AUTO_INCREMENT = 4;

SET FOREIGN_KEY_CHECKS = 1;
