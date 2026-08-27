## 1. Quitar el realce del disparador de cuenta

- [x] 1.1 En `packages/components/src/navbar.tsx`, `NavbarUtilities`: sacar `interactive` del `className` del `button` disparador del `Menu` de cuenta (hoy `cn("flex h-9 items-center gap-2 py-0.5 pl-0.5 pr-2", interactive)`), dejando la geometría intacta — mismo alto, mismos rellenos, misma separación entre avatar y nombre.
- [x] 1.2 Reponer en ese mismo `className` sólo el foco por teclado que traía `interactive`: `rounded-control outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring`. Sin `hover:bg-*` ni `data-[state=open]:bg-*`, en ninguna de las dos variantes de color.
- [x] 1.3 Comentar en el código por qué este disparador no usa `interactive`: el helper realza controles rectangulares y acá el contenido es un avatar circular. Deja dicho para el próximo que lo toque que la omisión es deliberada, no un olvido.
- [x] 1.4 Verificar que `getNavbarTone` y el resto de sus consumidores quedan sin tocar: marca de producto (línea ~289), enlaces de utilidad (~429), campana (~442) y botón de menú compacto (~516) conservan su realce.

## 2. Pruebas

- [x] 2.1 Agregar a `packages/components/src/navbar.test.tsx` (o crearlo si no existe) una prueba de que el disparador de cuenta no declara clases de fondo en hover ni en estado abierto, y sí las de `focus-visible`.
- [x] 2.2 Agregar una prueba equivalente para `AppShell` en `packages/components/src/app-shell.test.tsx`, que hereda el disparador vía `NavbarUtilities`, y confirmar que la prueba existente de apertura del panel de cuenta (`fireEvent.click`) sigue pasando.
- [x] 2.3 Correr `pnpm --filter @tuya-ui/components test` (incluye `tsc --noEmit`, `verify:colors` y `verify:stylesheet`).

## 3. Revisión visual y documentación

- [x] 3.1 Levantar el catálogo (`pnpm docs:dev`) y mirar el ejemplo de Navbar y el de AppShell en dos anchos: por encima de 1120px (avatar + nombre) y por debajo (sólo avatar). Confirmar que no aparece superficie en hover ni con el panel abierto, y que el anillo de foco sí se ve al tabular.
- [x] 3.2 Repetir la mirada en la variante oscura de Navbar: `interactive` traía un hover propio para `dark` y hay que confirmar que su ausencia no deja el avatar sin ninguna señal de foco sobre fondo oscuro.
- [x] 3.3 Si la página de Navbar del catálogo (`apps/docs/src/content/navbar.tsx`) describe el realce de la zona de utilidades, anotar la excepción del disparador de cuenta. — No lo describe: la página habla de las tres zonas y del anuncio de panel abierto, nunca del hover. Sin cambios.

## 4. Entrega a los consumidores

- [x] 4.1 Registrar un changeset (`pnpm changeset`) como cambio de parche de `@tuya-ui/components`: es corrección visual, sin cambio de API.
- [x] 4.2 Reempaquetar para `frontend` con `pnpm publish:local` y confirmar en Gestión de Capacidad que el avatar de la barra ya no pinta el cuadrado — que es donde se reportó.

## 5. El anillo no sobrevive a una interacción con el mouse

- [x] 5.1 En `NavbarUtilities`, recordar con qué se abrió el panel de cuenta (`onPointerDown`/`onKeyDown` en el disparador) y, si fue con el puntero, soltarle el foco al cerrarse — Radix lo reenfoca y Chrome cuenta ese `focus()` como recorrido de teclado, así que el anillo quedaba pintado tras un clic.
- [x] 5.2 Pruebas de los dos caminos en `navbar.test.tsx`: abierto con puntero, el disparador queda sin foco al cerrar; abierto por teclado, lo recupera.
- [x] 5.3 Correr la suite completa del paquete.
- [x] 5.4 Reempaquetar (`publish:local`), actualizar `frontend` y confirmar con el reporte original: clic, cerrar, sin anillo; Tab, cerrar, con anillo.
