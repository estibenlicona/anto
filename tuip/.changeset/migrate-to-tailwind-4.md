---
"@tuya-ui/components": minor
---

tuip compila con Tailwind 4. **La API no cambia y el vocabulario tampoco**, pero la hoja publicada se regenera entera: al actualizar, conviene mirar pantallas.

**Por qué.** tuip publicaba CSS de Tailwind 3 y las apps que lo consumen compilan Tailwind 4. Las dos hojas definían las mismas clases con implementaciones de versiones distintas, y el navegador aplicaba las dos:

```
tuip (v3)  .-translate-y-1/2 { transform: translate(var(--tw-translate-x), …) }
app  (v4)  .-translate-x-1/2 { translate: var(--tw-translate-x) var(--tw-translate-y) }
```

`transform` y `translate` son propiedades independientes y se **componen**, así que el desplazamiento de −50% se aplicaba dos veces. Un `Modal` quedaba medio alto y medio ancho fuera de su lugar, sin un solo error en ningún lado. Ahora las clases publicadas y las del consumidor son la misma implementación, y no hay nada que sumar.

**Qué se conserva.** El vocabulario entero —color, espaciado, radios, sombras, alturas, capas— con los mismos nombres y los mismos valores. La paleta nativa de Tailwind sigue cerrada: `bg-blue-500` no compila. De 501 selectores publicados quedaron 498, y las diferencias son de forma y no de significado: las variantes `peer-*` y `group-*` pasaron a la sintaxis `:is(:where(…))` de v4, `divide-*` y `space-*` a `:where(& > :not(:last-child))`, y desapareció el prefijo `::-moz-placeholder`, que Firefox ya no necesita.

**Dos comprobaciones nuevas** corren con las pruebas del paquete, porque las dos cosas que pueden romperse acá no fallan solas:

- Que la paleta nativa siga cerrada. Si esa configuración se pierde, nada falla: Tailwind simplemente vuelve a compilar toda su paleta.
- Que ninguna clase publicada declare propiedades distintas de las que el consumidor genera para ese mismo nombre. Es lo que detecta la clase de defecto que motivó esta migración.

**Si consumís tuip compilando Tailwind**, necesitás v4. Si lo consumís sólo como CSS ya hecho —importando `@tuya-ui/components/styles.css`—, no hay nada que hacer.
