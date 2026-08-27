---
"@tuya-ui/components": patch
---

El disparador de cuenta de `Navbar` deja de pintar un rectángulo de realce detrás del avatar.

El helper interno de realce dibuja una superficie de esquinas redondeadas, que es la forma de los controles rectangulares de la barra —enlaces de utilidad, notificaciones, botón de menú— pero no la de un avatar circular: por debajo de 1120px, donde el nombre de la persona se oculta, quedaba un cuadrado gris alrededor de un círculo. Ahora ese disparador no pinta superficie ni al pasar el puntero ni mientras su panel está abierto, donde el panel desplegado ya es la señal de que está activo.

El anillo de foco por teclado se conserva sin cambios. `AppShell` hereda la corrección: reusa la misma zona de utilidades. El resto de los controles de la barra mantienen su realce, y no cambia ninguna prop.
