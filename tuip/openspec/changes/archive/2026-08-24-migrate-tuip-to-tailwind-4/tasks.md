## 1. Punto de partida

- [x] 1.1 Dejar registrado el estado actual antes de tocar nada: el tamaño de la hoja publicada, cuántas reglas emite y la lista de clases que contiene. Es contra eso que se compara después, y sin la foto previa "se ve igual" no se puede afirmar.
- [x] 1.2 Anotar el caso testigo con su medida: el modal de eliminar una célula está desplazado medio alto y medio ancho de más. Es la prueba de que la migración logró lo que se propuso.

## 2. Migrar el paquete de componentes

- [x] 2.1 Pasar `packages/components` a Tailwind 4: dependencias, plugin de PostCSS y entrada CSS con la forma que v4 espera.
- [x] 2.2 Declarar qué fuentes se escanean, cubriendo lo mismo que hoy.
- [x] 2.3 Reemplazar el `safelist` por el mecanismo de v4, con las mismas clases y conservando escrito el motivo por el que están listadas: son vocabulario para las pantallas, y ningún componente de este paquete las usa.
- [x] 2.4 Corregir las clases del catálogo cuyo nombre cambió entre versiones, sin cambiar ningún aspecto. Las escalas que el preset reemplaza conservan sus nombres propios y no se tocan.

## 3. El preset

- [x] 3.1 Adaptar el preset a lo que v4 necesita **sin cambiar una sola entrada del vocabulario**: los mismos nombres resolviendo a los mismos valores, y la misma separación entre namespaces —los pasos de acento y de atención siguen existiendo sólo como fondo, nunca como texto.
- [x] 3.2 Comprobar que el setup de pruebas del paquete sigue pudiendo generar su hoja desde el preset; es lo que sostiene las pruebas de dimensión en jsdom.
- [x] 3.3 Cerrar la paleta nativa de forma explícita, y dejarlo cubierto por una verificación automática: no cerrarla no rompe nada, sólo vuelve a aceptar toda la paleta de Tailwind, así que sin comprobación la regresión pasa inadvertida.
- [x] 3.4 Pruebas: un color nativo que no sea rol de tuip no compila; `transparent` y `current` sí; todo el vocabulario propio compila igual que antes; y la verificación falla si la paleta se reabre.

## 4. Que el choque no vuelva

- [x] 4.1 Comprobación automática que cruce la hoja publicada con la que genera un consumidor en v4 y falle cuando una misma clase declare propiedades distintas. Comparar por nombre no alcanza: el problema no es que la clase esté repetida, sino que lo esté con otra implementación.
- [x] 4.2 Pruebas: con las dos hojas alineadas la comprobación pasa; introduciendo a mano una clase con la implementación vieja, falla y nombra la clase y las propiedades en conflicto.

## 5. La documentación

- [x] 5.1 Migrar `apps/docs` a Tailwind 4 y comprobar que el sitio se construye y se ve igual.

## 6. Cierre

- [x] 6.1 Pruebas, lint y build de todo el workspace. La verificación de tokens y la de colores literales tienen que seguir pasando sin cambios.
- [x] 6.2 Comparar la hoja publicada contra la foto del paso 1.1: qué clases desaparecieron, cuáles aparecieron y por qué. Una clase que se fue sin explicación es una regresión, no una simplificación.
- [x] 6.3 Changeset. Es una migración de infraestructura sin cambio de API, pero con superficie visual total: el changeset tiene que decir eso, y decir qué hay que mirar al actualizar.

## 7. Verificación

- [x] 7.1 Empacar, reinstalar en la app y levantar `pnpm dev:auth` en un puerto que no se haya usado antes en la sesión.
- [x] 7.2 El caso testigo primero: el modal de eliminar en `/app/lead/celulas` tiene que quedar centrado en el viewport, y medirlo para confirmarlo en vez de darlo por bueno a ojo.
- [x] 7.3 Recorrer las pantallas de la app comparando contra el estado previo: listados y sus tablas, formularios en drawer, superposiciones (modal, drawer, popover, menú, toast), el mapa de calor del span, la evaluación y el plan individual. Anotar toda diferencia, por chica que sea — el objetivo de este change es que **no** haya ninguna.
