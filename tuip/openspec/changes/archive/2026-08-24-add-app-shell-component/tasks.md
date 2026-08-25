## 1. Componente

- [x] 1.1 Crear `packages/components/src/app-shell.tsx` con `AppShell` y `AppShellProps`: `product`, `groups`, `activeId`, `onNavigate`, `user`, `userMenu`, `utilities?`, `notifications?`, `onSearch?`, `onMarkAllNotificationsRead?`, `onViewAllNotifications?`, `defaultCollapsed?`, `density?`, `sidebarFooter?`, `ariaLabel?`, `className?`, `children`.
- [x] 1.2 Columna lateral: cabecera de 56px (`h-14`) con cuadro de marca + producto (anatomía copiada de `NavbarBrand`, con comentario cruzado), `border-b` y `border-r`; colapsada muestra sólo el cuadro centrado. Debajo, `Sidebar` controlado con `collapsed`, `collapsible={false}`, `density`, `footer` y el resto de sus props tal cual.
- [x] 1.3 Barra superior: `h-14`, `border-b`, hamburguesa primero (36px, ícono `menu` 20px, `aria-label` según estado + `aria-expanded`), luego `NavbarSearch` sólo si llega `onSearch`, espaciador, y `NavbarUtilities` con la orquestación de paneles replicada de `Navbar` (un panel abierto a la vez).
- [x] 1.4 Estado de colapso en AppShell: inicial desde `defaultCollapsed ?? persistido`, persistencia en `tuya-ui:sidebar-collapsed` (comentario que la declara contrato compartido con Sidebar, también allá), y auto-colapso bajo 1119px con la técnica de `matchMedia` de Sidebar.
- [x] 1.5 Área de contenido: `children` en una columna `flex-1 min-w-0` junto a la barra; documentar cada prop con su comentario de documentación.
- [x] 1.6 Exportar desde `index.ts` y correr `verify:colors` + `tsc --noEmit`.

## 2. Pruebas

- [x] 2.1 Crear `app-shell.test.tsx`: la hamburguesa alterna el colapso (ancho del sidebar y `aria-expanded` cambian) y no existe la franja "Colapsar"/"Expandir" del pie de Sidebar.
- [x] 2.2 Probar la persistencia: colapsar escribe la clave compartida; montar con la clave en `true` arranca colapsado; `defaultCollapsed` manda sobre la clave ausente.
- [x] 2.3 Probar la vía asistida colapsada (los ítems conservan nombre accesible) y que la cabecera muestra el producto expandida y sólo el cuadro colapsada.
- [x] 2.4 Probar que utilidades/cuenta llegan a `NavbarUtilities` (la cuenta abre su panel) y que sin `onSearch` no hay búsqueda.
- [x] 2.5 Correr la suite completa del paquete.

## 3. Catálogo y documentación

- [x] 3.1 Declarar `app-shell` en `registry/definitions.ts`: categoría `layout`, `status: "beta"`, dependencias `["utils", "icon", "sidebar", "navbar"]`, `extendsElement: "div"`; regenerar el registry y confirmar la tabla de props.
- [x] 3.2 Escribir `content/app-shell.tsx` (Uso con el criterio AppShell vs. piezas sueltas y la advertencia de no recomponer la fusión a mano; Anatomía con la unión del filete; Accesibilidad con la hamburguesa y la herencia del panel-por-vez de Radix) y registrarlo en `content/index.ts`.
- [x] 3.3 Sumar a las guías de uso de Navbar y de Sidebar la remisión a AppShell para el caso combinado.
- [x] 3.4 Ejemplos ejecutables en `examples/app-shell/`: el shell completo con colapso funcionando, y el estado colapsado inicial (`defaultCollapsed`).
- [x] 3.5 Levantar el sitio y verificar la página, el catálogo, la búsqueda y que el filete corre continuo en los ejemplos, expandido y colapsado.

## 4. Distribución

- [x] 4.1 Changeset `MINOR` de `@tuya-ui/components`: `AppShell` nuevo, aditivo, `Navbar` y `Sidebar` intactos.
- [x] 4.2 `pnpm run build`, `pnpm test`, `pnpm lint` en la raíz.
- [x] 4.3 `pnpm run publish:local` y confirmar que el `.tgz` trae `AppShell`.
- [x] 4.4 Avisar que la adopción en la app queda desbloqueada como change propio del otro repo.
