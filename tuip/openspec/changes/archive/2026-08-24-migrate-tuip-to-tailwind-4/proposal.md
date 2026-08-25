## Why

tuip compila con Tailwind 3.4 y publica su hoja de estilos ya generada. La app que lo consume compila con Tailwind 4.3. Las dos hojas definen **las mismas clases con implementaciones de versiones distintas**, y el navegador aplica las dos.

Se midió sobre el modal de eliminar una célula, en `/app/lead/celulas`:

```
tuip (v3)  .-translate-y-1/2 { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) … }
app  (v4)  .-translate-x-1/2 { translate: var(--tw-translate-x) var(--tw-translate-y) }
```

`transform` y `translate` son propiedades independientes y el navegador **las compone**, así que el desplazamiento de −50% se aplica dos veces. El diálogo quedó en `transform: matrix(1,0,0,1,-240,-93.5)` **y** `translate: -50% -50%` a la vez: 93.5 px arriba y 240 px a la izquierda de donde debería, exactamente medio alto y medio ancho.

No es un problema del modal ni de esa pantalla. Es de toda utilidad cuya implementación cambió entre v3 y v4 —traslación, rotación, escala, sesgo— y hoy se descubre sólo cuando alguien mira una pantalla y ve algo corrido. La causa es que el paquete y su consumidor hablan versiones distintas del mismo lenguaje de clases.

## What Changes

- **tuip pasa a Tailwind 4**, en `packages/components` y en `apps/docs`. Las clases que publica pasan a tener la misma implementación que las que genera cualquier app en v4, así que dejan de componerse entre sí.
- **El preset de tokens se adapta a la forma de v4** sin cambiar una sola entrada del vocabulario: los mismos nombres de color, espaciado, radio, sombra, altura y capa que hoy, resolviendo a los mismos valores. Este change **no** rediseña el vocabulario ni agrega tokens.
- **La paleta nativa sigue cerrada.** Es el requisito que más cuidado necesita en la migración: en v3 se cerraba reemplazando los namespaces de color del tema; en v4 hay que hacerlo explícitamente, y si se hace mal la paleta entera de Tailwind vuelve a compilar sin que nada falle.
- **El `safelist` cambia de forma.** v4 no tiene `safelist`; las clases que ningún componente de tuip usa pero las apps sí —la escala tipográfica, `bg-neutral-canvas`, los tres pasos de la escala de atención— tienen que seguir llegando al CSS publicado por otra vía.
- **Verificación de que el choque no vuelve**: una comprobación que compare la hoja publicada con la que genera un consumidor y falle si una misma clase resuelve a propiedades distintas.

### Fuera de alcance

- **Cambiar el contrato de consumo.** tuip sigue publicando utilidades ya generadas en `styles.css`; que en cambio publique su tema y el consumidor genere las suyas eliminaría la duplicación de raíz, pero es otro contrato y rompe a quien no compile Tailwind. Se discute en design.md y se descarta para este change.
- Cualquier cambio de aspecto. Si algo se ve distinto después de migrar, es un defecto de la migración, no una mejora.
- Animaciones, `Badge`, `FilterButton` y las pantallas de la app: son changes aparte, y tres de ellos se apoyan en éste.

## Capabilities

### Modified Capabilities

- `design-tokens`: el preset deja de expresarse como configuración de Tailwind 3 y pasa a la de Tailwind 4, conservando intacto el vocabulario y el cierre de la paleta nativa; y se agrega que las utilidades publicadas no deben componerse con las que genera el consumidor.

## Impact

- tuip: `packages/components` (config, entrada CSS, plugin de PostCSS, y las clases cuyo nombre cambió entre versiones), `packages/tokens` (el preset y lo que lo consume), `apps/docs`.
- **Toda pantalla de la app**: la hoja publicada se regenera entera. Es una migración de infraestructura con superficie visual total, y por eso la verificación es mirar pantallas, no sólo correr pruebas.
- **Orden**: el requisito que este change modifica —"El preset de Tailwind expone exclusivamente el vocabulario de tuip"— todavía no está en `openspec/specs`: vive en el change `close-native-tailwind-palette`, sin archivar. El bloque MODIFIED de este change se escribió sobre ese texto pendiente, y `close-native-tailwind-palette` debe archivarse antes que éste.
- Bloquea: `animate-component-catalog` (animar en v3 y migrar después sería rehacerlo) y el arreglo del modal que espera `refine-squad-management`.
