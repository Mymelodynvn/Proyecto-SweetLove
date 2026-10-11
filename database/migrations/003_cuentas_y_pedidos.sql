-- Migración 003: cuentas (verificación de correo, invitados), pedidos (datos de entrega y hora) y tokens de un solo uso

-- Cuentas existentes: se consideran verificadas y no son de invitado
ALTER TABLE usuario ADD COLUMN emailVerificado TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE usuario ADD COLUMN esInvitado TINYINT(1) NOT NULL DEFAULT 0;

-- Pedidos: hora de creación (para cancelar los que no se pagan) y datos de entrega propios del pedido
ALTER TABLE pedido ADD COLUMN creadoEn DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE pedido ADD COLUMN nombreEnvio VARCHAR(100) DEFAULT NULL;
ALTER TABLE pedido ADD COLUMN celularEnvio VARCHAR(20) DEFAULT NULL;
ALTER TABLE pedido ADD COLUMN direccionEnvio VARCHAR(150) DEFAULT NULL;

-- Los pedidos anteriores solo tenían fecha: se toma como su hora de creación
UPDATE pedido SET creadoEn = fecha;

-- Tokens de un solo uso para verificar el correo y restablecer la contraseña (se guarda solo el hash)
CREATE TABLE token_cuenta (
  idToken INT NOT NULL AUTO_INCREMENT,
  idUser INT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  tokenHash CHAR(64) NOT NULL,
  expiraEn DATETIME NOT NULL,
  usadoEn DATETIME DEFAULT NULL,
  creadoEn DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idToken),
  UNIQUE KEY uk_token_hash (tokenHash),
  KEY idx_token_usuario (idUser),
  CONSTRAINT token_cuenta_ibfk_1 FOREIGN KEY (idUser) REFERENCES usuario (idUser)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
