-- Sweet Love: datos de DEMOSTRACIÓN. Se carga después de schema.sql y datos-base.sql.
-- No usar en producción: contiene cuentas de ejemplo (para una base real: npm run db:init -- --sin-demo).
--
-- Cuentas de ejemplo, todas con la contraseña SweetLove2026:
--   admin@example.com   Administrador (entra al panel)
--   laura@example.com   Cliente con 6 pedidos (nivel VIP)
--   mateo@example.com   Cliente con 2 pedidos (nivel Frecuente)
--   sofia@example.com   Cliente con 1 pedido sin terminar de pagar (nivel Nuevo)
--   camila@example.com  Cliente con 1 pedido cancelado (nivel Nuevo)
--   ana@example.com     Proveedora
-- Los correos usan example.com (reservado para ejemplos): "Olvidé mi contraseña" nunca escribe a una persona real.
-- Las fechas de los pedidos son relativas al día en que se carga el archivo, así el panel siempre muestra actividad reciente.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO usuario (idUser, nombre, apellido, email, celular, direccion, contrasena, idRol) VALUES
(1, 'Admin', 'Sweet Love', 'admin@example.com', '3000000000', 'Medellín', '$2b$10$VyBfTfmkjaXhA4UJMmfnvuHh6nZ3XRM8XfoPzC7vdKyn0QkPRhqaC', 1),
(2, 'Laura', 'Gómez', 'laura@example.com', '3001112233', 'Bogotá', '$2b$10$VyBfTfmkjaXhA4UJMmfnvuHh6nZ3XRM8XfoPzC7vdKyn0QkPRhqaC', 2),
(3, 'Mateo', 'Rojas', 'mateo@example.com', '3002223344', 'Medellín', '$2b$10$VyBfTfmkjaXhA4UJMmfnvuHh6nZ3XRM8XfoPzC7vdKyn0QkPRhqaC', 2),
(4, 'Sofía', 'Herrera', 'sofia@example.com', '3003334455', 'Cali', '$2b$10$VyBfTfmkjaXhA4UJMmfnvuHh6nZ3XRM8XfoPzC7vdKyn0QkPRhqaC', 2),
(5, 'Camila', 'Duarte', 'camila@example.com', '3004445566', 'Barranquilla', '$2b$10$VyBfTfmkjaXhA4UJMmfnvuHh6nZ3XRM8XfoPzC7vdKyn0QkPRhqaC', 2),
(6, 'Ana', 'Martínez', 'ana@example.com', '3005556677', 'Cali', '$2b$10$VyBfTfmkjaXhA4UJMmfnvuHh6nZ3XRM8XfoPzC7vdKyn0QkPRhqaC', 3);

INSERT INTO proveedor (idProveedor, nombre, email, celular, idUser) VALUES
(1, 'Dulces del Valle', 'ventas@dulcesdelvalle.example.com', '3101112233', 6),
(2, 'ChocoSweet', 'contacto@chocosweet.example.com', '3102223344', NULL);

-- Los diez primeros usan las fotos de la propia tienda (frontend/public/tienda/assets/images);
-- el resto enlaza fotos de Wikimedia Commons, que pertenecen a sus autores.
INSERT INTO producto (idProducto, nombre, descripcion, precio, cantidad, imagen, estado, idProveedor) VALUES
(1, 'Combo bento cake y 2 cupcakes', 'Un bento cake decorado con mensaje y dos cupcakes con crema en tonos pastel, en una caja lista para regalar.', 68000, 12, '/tienda/assets/images/combox3.jpeg', 1, 1),
(2, 'Combo bento cake y 5 cupcakes', 'Un bento cake decorado con mensaje y cinco cupcakes con rosas de crema, en caja. Ideal para celebrar en compañía.', 120000, 8, '/tienda/assets/images/combox6.jpeg', 1, 2),
(3, 'Fresas con chocolate x12', 'Doce fresas frescas bañadas en chocolate de colores pastel y decoradas a mano. Se preparan el mismo día de la entrega.', 40000, 18, '/tienda/assets/images/fresas.jpeg', 1, 1),
(4, 'Cake pops x10', 'Diez cake pops de bizcocho cubiertos de chocolate pastel con perlas de azúcar. Perfectos para mesas dulces y recuerdos de fiesta.', 35000, 28, '/tienda/assets/images/trufas.jpeg', 1, 2),
(5, 'Suspiros de colores x24', 'Veinticuatro suspiros crocantes en forma de rosa, en tonos rosa, lila y menta. Livianos, dulces y muy fotogénicos.', 22000, 40, '/tienda/assets/images/suspiros.jpeg', 1, 1),
(6, 'Torta decorada con flores', 'Torta verde menta con bordes de crema y flores de buttercream en rosa y lila. Se puede personalizar con un mensaje.', 95000, 6, '/tienda/assets/images/minicake.jpeg', 1, 2),
(7, 'Cupcakes con chocolate rosado x6', 'Seis cupcakes con crema bicolor, chocolate rosado, crispetas dulces y confites. Hechos al día.', 42000, 20, '/tienda/assets/images/cupcakes.jpeg', 1, 1),
(8, 'Macarons x12', 'Doce macarons en tonos rosa y menta con relleno cremoso. Delicados, coloridos y perfectos para regalar.', 48000, 20, '/tienda/assets/images/macarons.jpeg', 1, 2),
(9, 'Torta de dos pisos', 'Torta de dos pisos en verde menta con volantes de crema y rosas. Para celebraciones grandes; se encarga con anticipación.', 185000, 4, '/tienda/assets/images/cake.jpeg', 1, 1),
(10, 'Mini donas pastel x12', 'Doce mini donas horneadas con glaseado en tonos pastel y confites. Un bocado pequeño, divertido y lleno de sabor.', 40000, 22, '/tienda/assets/images/Mini%20donas%20pastel.jpeg', 1, 2),
(11, 'Mini cupcakes de vainilla x12', 'Doce mini cupcakes de vainilla con crema de mantequilla y decoración en tonos pastel. Ideales para cumpleaños, baby showers y reuniones.', 36000, 25, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Perfect_Vanilla_Cupcakes_%28Unsplash%29.jpg/500px-Perfect_Vanilla_Cupcakes_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(12, 'Cupcakes de chocolate x6', 'Seis cupcakes de chocolate húmedos con cobertura cremosa y chispas de colores. Hechos al día con ingredientes frescos.', 28000, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/Chocolate_Cupcakes.jpg/500px-Chocolate_Cupcakes.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(13, 'Brownies de chocolate x6', 'Brownies artesanales de chocolate oscuro, crujientes por fuera y suaves por dentro. Se entregan empacados en caja.', 26000, 40, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Chocolate_brownies_without_table.jpg/500px-Chocolate_brownies_without_table.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(14, 'Cheesecake de fresa', 'Cheesecake cremoso sobre base de galleta con cobertura de fresas frescas y salsa de fresa. Rinde 8 porciones.', 45000, 10, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Strawberry_cheesecake_round.jpg/500px-Strawberry_cheesecake_round.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(15, 'Torta de chocolate con fresas', 'Torta de chocolate esponjosa con ganache y fresas frescas por encima. Perfecta para celebrar; rinde 10 porciones.', 55000, 8, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Vegan_chocolate_cake_with_sliced_strawberries.jpg/500px-Vegan_chocolate_cake_with_sliced_strawberries.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(16, 'Galletas decoradas x8', 'Ocho galletas de mantequilla decoradas a mano con glaseado real y confites. Se pueden personalizar según la ocasión.', 32000, 35, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Decorated_sugar_cookies_2.jpg/500px-Decorated_sugar_cookies_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(17, 'Galletas con chips de chocolate x12', 'Doce galletas recién horneadas con trozos de chocolate semiamargo. Doradas por fuera y suaves por dentro.', 24000, 50, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Chocolate_chip_cookies_on_cutting_board.jpg/500px-Chocolate_chip_cookies_on_cutting_board.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(18, 'Caja de trufas surtidas x16', 'Dieciséis trufas y bombones de chocolate negro, con leche y blanco en una caja de regalo. Un detalle dulce y elegante.', 62000, 15, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Chocolate_truffles_2.jpg/500px-Chocolate_truffles_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(19, 'Alfajores x10', 'Diez alfajores de maicena rellenos de arequipe y bañados en coco rallado. Una receta clásica, suave y mantecosa.', 25000, 40, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Alfajorartes.JPG/500px-Alfajorartes.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(20, 'Tartaleta de limón', 'Tartaleta individual de masa quebrada con crema de limón y detalles de chocolate. Equilibrio perfecto entre dulce y ácido.', 9500, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Lemon_tart_%28cropped%29.jpg/500px-Lemon_tart_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(21, 'Tiramisú (porción)', 'Porción de tiramisú con capas de bizcocho, café y crema de mascarpone, espolvoreado con cacao.', 12000, 25, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Tiramisu_dessert.jpg/500px-Tiramisu_dessert.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(22, 'Tres leches (porción)', 'Porción de pastel tres leches: bizcocho empapado en leches y cubierto con crema chantilly y fruta.', 11000, 30, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Tres_leches_cake.jpg/500px-Tres_leches_cake.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2),
(23, 'Muffins de arándanos x6', 'Seis muffins esponjosos con arándanos naturales y un toque de limón. Horneados al día.', 24000, 35, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Blueberry_muffins%2C_whole_and_partial.jpg/500px-Blueberry_muffins%2C_whole_and_partial.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 1),
(24, 'Rollos de canela x6', 'Seis rollos de canela suaves y calientes con glaseado de queso crema. El aroma perfecto para la tarde.', 30000, 24, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Homemade_Cinnamon_rolls_03.jpg/500px-Homemade_Cinnamon_rolls_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 1, 2);

-- Pedidos: todos pagados con Mercado Pago, con los datos de entrega propios del pedido.
-- Hay de todos los estados para que el panel tenga qué mostrar; ninguno vence solo (los sin pagar vencen a los 30 minutos).
INSERT INTO pedido (idPedido, precioTotal, fecha, estadoPedido, idUser, creadoEn, nombreEnvio, celularEnvio, direccionEnvio) VALUES
(1, 185000, CURDATE() - INTERVAL 12 DAY, 'Completado', 2, TIMESTAMP(CURDATE() - INTERVAL 12 DAY, '10:30:00'), 'Laura Gómez', '3001112233', 'Carrera 15 # 85-20, Bogotá'),
(2, 118000, CURDATE() - INTERVAL 10 DAY, 'Completado', 2, TIMESTAMP(CURDATE() - INTERVAL 10 DAY, '10:30:00'), 'Laura Gómez', '3001112233', 'Carrera 15 # 85-20, Bogotá'),
(3, 40000, CURDATE() - INTERVAL 8 DAY, 'Completado', 2, TIMESTAMP(CURDATE() - INTERVAL 8 DAY, '10:30:00'), 'Laura Gómez', '3001112233', 'Carrera 15 # 85-20, Bogotá'),
(4, 87000, CURDATE() - INTERVAL 6 DAY, 'Completado', 2, TIMESTAMP(CURDATE() - INTERVAL 6 DAY, '10:30:00'), 'Laura Gómez', '3001112233', 'Carrera 15 # 85-20, Bogotá'),
(5, 120000, CURDATE() - INTERVAL 3 DAY, 'Enviado', 2, TIMESTAMP(CURDATE() - INTERVAL 3 DAY, '10:30:00'), 'Laura Gómez', '3001112233', 'Carrera 15 # 85-20, Bogotá'),
(6, 77000, CURDATE() - INTERVAL 1 DAY, 'Pendiente', 2, TIMESTAMP(CURDATE() - INTERVAL 1 DAY, '10:30:00'), 'Laura Gómez', '3001112233', 'Carrera 15 # 85-20, Bogotá'),
(7, 108000, CURDATE() - INTERVAL 5 DAY, 'Completado', 3, TIMESTAMP(CURDATE() - INTERVAL 5 DAY, '10:30:00'), 'Mateo Rojas', '3002223344', 'Calle 10 # 40-15, Medellín'),
(8, 95000, CURDATE() - INTERVAL 2 DAY, 'En preparación', 3, TIMESTAMP(CURDATE() - INTERVAL 2 DAY, '10:30:00'), 'Mateo Rojas', '3002223344', 'Calle 10 # 40-15, Medellín'),
(9, 67000, CURDATE() - INTERVAL 0 DAY, 'Pendiente', 4, TIMESTAMP(CURDATE() - INTERVAL 0 DAY, '10:30:00'), 'Sofía Herrera', '3003334455', 'Avenida 6N # 25-30, Cali'),
(10, 36000, CURDATE() - INTERVAL 4 DAY, 'Cancelado', 5, TIMESTAMP(CURDATE() - INTERVAL 4 DAY, '10:30:00'), 'Camila Duarte', '3004445566', 'Calle 72 # 54-18, Barranquilla');

INSERT INTO itempedido (idItem, cantidad, precioUnitario, subTotal, idPedido, idProducto) VALUES
(1, 1, 185000, 185000, 1, 9),
(2, 2, 48000, 96000, 2, 8),
(3, 1, 22000, 22000, 2, 5),
(4, 1, 40000, 40000, 3, 3),
(5, 1, 62000, 62000, 4, 18),
(6, 1, 25000, 25000, 4, 19),
(7, 1, 120000, 120000, 5, 2),
(8, 1, 42000, 42000, 6, 7),
(9, 1, 35000, 35000, 6, 4),
(10, 1, 68000, 68000, 7, 1),
(11, 1, 40000, 40000, 7, 10),
(12, 1, 95000, 95000, 8, 6),
(13, 1, 45000, 45000, 9, 14),
(14, 2, 11000, 22000, 9, 22),
(15, 1, 36000, 36000, 10, 11);

INSERT INTO pago (idPago, proveedorPago, monto, estadoPago, idPedido) VALUES
(1, 'Mercado Pago', 185000, 'Aprobado', 1),
(2, 'Mercado Pago', 118000, 'Aprobado', 2),
(3, 'Mercado Pago', 40000, 'Aprobado', 3),
(4, 'Mercado Pago', 87000, 'Aprobado', 4),
(5, 'Mercado Pago', 120000, 'Aprobado', 5),
(6, 'Mercado Pago', 77000, 'Aprobado', 6),
(7, 'Mercado Pago', 108000, 'Aprobado', 7),
(8, 'Mercado Pago', 95000, 'Aprobado', 8),
(9, 'Mercado Pago', 67000, 'En proceso', 9),
(10, 'Mercado Pago', 36000, 'Expirado', 10);

INSERT INTO envio (idEnvio, idPago, idEstado) VALUES
(1, 1, 3),
(2, 2, 3),
(3, 3, 3),
(4, 4, 3),
(5, 5, 2),
(6, 6, 1),
(7, 7, 3),
(8, 8, 1),
(9, 9, 1),
(10, 10, 1);

ALTER TABLE usuario AUTO_INCREMENT = 7;
ALTER TABLE proveedor AUTO_INCREMENT = 3;
ALTER TABLE producto AUTO_INCREMENT = 25;
ALTER TABLE pedido AUTO_INCREMENT = 11;
ALTER TABLE itempedido AUTO_INCREMENT = 16;
ALTER TABLE pago AUTO_INCREMENT = 11;
ALTER TABLE envio AUTO_INCREMENT = 11;

SET FOREIGN_KEY_CHECKS = 1;
