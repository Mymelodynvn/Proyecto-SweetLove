# Imágenes de productos

Las imágenes seleccionadas desde el administrador se envían como Data URL. El backend las convierte en archivos dentro de `public/uploads/products` y guarda en MySQL únicamente la ruta pública, por ejemplo `/uploads/products/producto-5-....jpg`. Así se mantiene compatible con la columna `imagen VARCHAR(255)`.
