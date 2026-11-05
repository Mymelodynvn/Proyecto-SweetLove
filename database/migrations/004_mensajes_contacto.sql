-- Migración 004: mensajes del formulario "Contáctanos" de la tienda (se muestran en "Novedades" del panel)

CREATE TABLE mensaje_contacto (
  idMensaje INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  asunto VARCHAR(100) NOT NULL,
  mensaje VARCHAR(1000) NOT NULL,
  creadoEn DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idMensaje),
  KEY idx_mensaje_creado (creadoEn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
