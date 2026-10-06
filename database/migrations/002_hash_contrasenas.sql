-- Migración: reemplaza las contraseñas de demostración en texto plano ('1234')
-- por un hash bcrypt (contraseña nueva: SweetLove#2026).
-- Solo actualiza las cuentas que aún conservan el valor antiguo.
-- Úsala en una base que ya existe; una base nueva con sweetlove.sql no la necesita.
UPDATE usuario
SET contrasena = '$2b$10$dn.c5GI2LJ/SpDysL0gofu0s2.DFj5njRd.AeCFLIBZXy/0tnNbW.'
WHERE contrasena = '1234';
