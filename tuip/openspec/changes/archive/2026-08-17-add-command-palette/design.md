## Context

Ver `proposal.md` - Why. Ninguna de las dos dependencias necesarias es nueva: `@radix-ui/react-dialog` ya está instalado y en uso por `Modal` (overlay centrado, foco atrapado, cierre con Escape, retorno de foco); `cmdk` ya está instalado y en uso por `Combobox` (lista filtrable por texto). `Navbar` ya declara `onSearch?: () => void` con la nota "Abre el command palette. Sin handler, el buscador no se muestra." — la prop existe desde antes de este cambio y no se modifica.

## Goals / Non-Goals

**Goals:**
- Definir la anatomía de `CommandPalette` y sus partes (`CommandPaletteGroup`, `CommandPaletteItem`), combinando `Dialog` (contenedor modal) con `cmdk` (lista filtrable) de la misma forma en que cada uno ya se usa por separado en el catálogo.
- Fijar cómo y cuándo se registra el atajo `⌘K`/`Ctrl+K`, para que sea el propio componente el que lo posee mientras está montado, sin exigir al consumidor un listener global aparte.

**Non-Goals:**
- No se define una lista de comandos por defecto ni una taxonomía de comandos (navegación vs. acción vs. búsqueda de entidades): eso es contenido específico de cada producto, igual que `MenuItem` no impone qué acciones lleva `Menu`.
- No se agrega búsqueda asíncrota/remota resuelta por el propio componente: `CommandPaletteItem` es JSX normal filtrado por `cmdk` en el cliente, igual que `Combobox` filtra localmente salvo que el consumidor le pase su propio resultado ya resuelto.

## Decisions

**Combinar `Dialog` + `cmdk`, no envolver `Combobox`.**
`Combobox` ancla su lista a un campo de formulario vía `Popover` (el trigger es el propio input). `CommandPalette` no tiene un campo anclable — se abre desde cualquier punto de la pantalla — así que necesita el mismo contenedor centrado y con foco atrapado que ya resuelve `Dialog` en `Modal`, no un `Popover`. Es la misma decisión que ya separa a `Modal` (decidir, `Dialog`) de `Popover`/`Combobox` (consultar sin bloquear, `Popover`): `CommandPalette` bloquea la pantalla mientras está abierto, así que le corresponde `Dialog`.

**El atajo de teclado vive dentro de `CommandPalette`, con un `useEffect` que se limpia al desmontar.**
Ningún componente del catálogo hoy registra un listener de teclado global (se comprobó: no hay ningún `keydown` a nivel de documento en `packages/components/src`). Como el propósito explícito del componente es responder a `⌘K` desde cualquier parte de la pantalla — no solo mientras algo dentro de él tiene foco — el listener no puede ir en un elemento particular; se agrega y se quita en el nivel del documento, scoped al ciclo de vida del componente montado, igual que `Toast` monta y desmonta su propia cola sin exigir un provider global aparte del árbol.

**Apertura controlada, sin estado propio no controlable.**
`CommandPalette` recibe `open`/`onOpenChange` como `Modal`, no un estado interno inaccesible: así el mismo callback puede dispararse tanto desde el atajo de teclado interno como desde `onSearch` de `Navbar`, sin que el consumidor tenga que sincronizar dos fuentes de verdad para "¿está abierto?".

## Risks / Trade-offs

- [Un listener de `keydown` a nivel de documento puede chocar con atajos del navegador o del sistema operativo en algunas combinaciones] → Riesgo aceptado y ya resuelto por la convención `⌘K`/`Ctrl+K`: es el atajo estándar de este patrón en el ecosistema (la propia definición lo da por hecho), y el componente llama `preventDefault()` solo sobre esa combinación específica, no sobre teclas sueltas.
- [Si dos instancias de `CommandPalette` llegan a montarse a la vez, ambas responderían al mismo atajo] → Se documenta en el contenido de uso que debe montarse una sola vez por aplicación, igual que la propia definición de Navbar asume "un command palette" (singular) por producto.
