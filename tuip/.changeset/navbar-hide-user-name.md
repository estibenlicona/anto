---
"@tuya-ui/components": minor
---

`Navbar` acepta `showUserName` para dejar la cuenta en sólo el avatar.

**`@tuya-ui/components`**

- **`Navbar` gana `showUserName`** (aditivo, por defecto `true`): con `false`, el nombre deja de acompañar al avatar en la barra y queda únicamente donde ya estaba, dentro del panel de cuenta junto al rol. Es la misma forma que ya tenía `showNotifications`: una prop que apaga un elemento de la barra sin quitarle su función al panel.
- **No se pierde el nombre accesible**: el disparador se sigue nombrando por la persona porque el `Avatar` lleva su `label`, así que un lector de pantalla anuncia lo mismo con la prop en `true` o en `false`. Lo único que cambia es el texto visible.
- Con `false` el padding derecho del disparador se equilibra con el izquierdo (`pr-0.5` en vez de `pr-2`), para que el avatar no quede empujado contra el borde.

**Actualizar no cambia nada a la vista**: el default mantiene el nombre en la barra; hay que pasar `showUserName={false}` para que desaparezca.
