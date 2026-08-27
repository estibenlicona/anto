## Why

El disparador de cuenta de la barra pinta un rectángulo gris de esquinas redondeadas detrás de un avatar circular: la forma del realce no coincide con la forma de lo que realza, y por debajo de 1120px —donde el nombre de la persona se oculta— queda un cuadrado alrededor de un círculo, que es lo que se ve hoy en Gestión de Capacidad. El realce viene del helper `interactive`, pensado para los controles rectangulares de la barra (enlaces de utilidad, campana, botón de menú), y el disparador de cuenta lo heredó sin que su anatomía lo justifique.

## What Changes

- El disparador de cuenta de `NavbarUtilities` deja de pintar superficie: ni al pasar el puntero ni mientras su panel está abierto. Deja de usar el helper `interactive`.
- Conserva el anillo de foco por teclado: es la única señal que no puede perderse, y su ausencia sería un defecto de accesibilidad, no una mejora visual.
- El resto de la zona de utilidades —enlaces de utilidad, campana de notificaciones, botón de menú compacto— y la marca de producto conservan su realce actual sin cambios. Son controles rectangulares y el cuadrado les corresponde.
- No cambia cómo se abre el panel de cuenta: ya abre con clic (es un `DropdownMenu` de Radix, no un tooltip ni una apertura por hover). Lo que reportaba el pedido como «debe abrir con clic» ya se cumple; el defecto real era solo el realce.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `component-library`: se agrega un requisito sobre el realce del disparador de cuenta de Navbar — su forma no debe contradecir la del avatar, y el foco por teclado debe seguir siendo visible aunque no haya realce de puntero.

## Impact

- `packages/components/src/navbar.tsx` — `NavbarUtilities`, únicamente el `button` disparador del `Menu` de cuenta (hoy `cn("flex h-9 items-center gap-2 py-0.5 pl-0.5 pr-2", interactive)`).
- `AppShell` hereda el cambio sin tocarse: reusa `NavbarUtilities` tal cual.
- Documentación del catálogo: la página de Navbar (`apps/docs/src/content/navbar.tsx`) si describe el realce de la zona de utilidades.
- Consumidores: `frontend` (Gestión de Capacidad) recibe el cambio al reempaquetar `@tuya-ui/components`; no requiere cambios de código de su lado, no hay cambio de API ni de props.
- Sin cambios de API: ninguna prop nueva, ninguna removida, sin **BREAKING**.

## Assumptions

- «Sin realce alguno» incluye el estado abierto: el mismo rectángulo que pinta el hover es el que pinta `data-[state=open]`, y con el panel desplegado el panel mismo es la señal de que el control está activo.
