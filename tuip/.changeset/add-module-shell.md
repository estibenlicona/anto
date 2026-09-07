---
"@tuya-ui/components": minor
---

`ModuleShell`: la columna de un módulo bajo la barra de un host, sin cabecera propia y con el control de colapso al pie. `Navbar` y `AppShell` pueden omitir la campana.

- **`ModuleShell`** (nuevo, beta): la mitad "módulo" de `AppShell` — columna lateral a toda la altura disponible con la navegación de `Sidebar` en modo controlado, y el contenido como hijos. **Sin barra superior propia, sin hamburguesa y sin cabecera de marca**: el título del producto y del módulo los pone la barra del host, así que la columna empieza directamente por la navegación (el módulo se nombra en `ariaLabel`). El control de colapso es la franja al pie que `Sidebar` ya trae suelto (de borde a borde, chevron y rótulo "Colapsar"/"Expandir"). Se apoya debajo de la barra del host con `topOffset` (px), que fija la columna justo bajo esa barra y descuenta su altura.
- **`showNotifications`** (nuevo, default `true`) en `Navbar`, `NavbarUtilities` y `AppShell`: con `false`, ni el botón de notificaciones ni su panel se renderizan; `notifications` se ignora. Para un producto —o un host— que todavía no ofrece notificaciones. Sin la prop, nada cambia.
- **Refactor interno de `AppShell`**: la persistencia bajo `tuya-ui:sidebar-collapsed` y el auto-colapso bajo 1120px se extraen a un helper privado compartido con `ModuleShell`, para que las dos piezas no puedan divergir. **`AppShell`, `Navbar` y `Sidebar` no cambian de contrato.**
- Guía de elección con cuatro casos: aplicación completa con navegación lateral → `AppShell`; módulo bajo la barra de un host → `ModuleShell` (con `topOffset` igual a la altura de esa barra); sólo barra, o host sin navegación lateral → `Navbar`; sólo la navegación dentro de un layout propio → `Sidebar`. En una plataforma de host y módulos, ninguno de los dos usa `AppShell` ni repite el título en la columna.

**Actualizar es seguro**: la adición es puramente aditiva.
