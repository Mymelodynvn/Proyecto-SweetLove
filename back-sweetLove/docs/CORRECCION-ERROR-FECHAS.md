# Corrección del error de fechas del dashboard

Se corrigió el error `Invalid time value` que podía aparecer al abrir el panel principal.

## Causa

La API de pedidos convertía la fecha de MySQL a un texto localizado como `3/3/2026`. La página del dashboard volvía a añadir `T00:00:00` e intentaba construir un objeto `Date` con ese valor. Ese formato no es seguro para el constructor de `Date` en todos los navegadores.

## Solución

- Las APIs devuelven las fechas en formato ISO simple `YYYY-MM-DD`.
- El dashboard utiliza una función segura que acepta fechas ISO y fechas localizadas.
- Si una fecha no puede interpretarse, se muestra `Fecha no disponible` en lugar de lanzar una excepción.

De esta forma, las fechas provenientes de MySQL se mantienen en un formato estable entre el backend y la interfaz.
