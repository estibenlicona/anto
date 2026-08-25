## Why

Los dos shells de la app (Chapter Lead y Admin) componen `Navbar` + `Sidebar` a mano con la disposición que el usuario pidió corregir: el navbar a lo ancho arriba, el sidebar debajo sin llegar al tope, y el control de colapso escondido en la franja al pie del sidebar. La corrección ya está diseñada (canvas "Tuya AppShell") y construida en `tuip` como el componente `AppShell` (change `add-app-shell-component`, publicado en el `.tgz` local): sidebar a toda altura con la marca en su cabecera, barra al lado con la hamburguesa como primer elemento, colapso persistente.

Este change es la adopción: los dos layouts dejan de armar la fusión a mano y pasan a `AppShell`.

## What Changes

- **`ChapterLeadLayout` y `AdminLayout` se reescriben sobre `AppShell`**: `product`, `groups`/`activeId`/`onNavigate`, `user`/`userMenu` y `ariaLabel` — los mismos datos que hoy pasan a `Navbar` y `Sidebar` por separado — y el contenido (franja de breadcrumb + `main`) como hijos. Desaparecen de los layouts el `div` de columnas y la composición manual.
- **Comportamiento visible nuevo, heredado del componente**: el sidebar llega arriba con la marca en su cabecera, la hamburguesa de la barra contrae/expande (con `aria-expanded`), la franja "Colapsar" del pie desaparece, la preferencia guardada se conserva (misma clave de almacenamiento), y el colapso automático bajo 1120px sigue funcionando.
- **Se actualiza la dependencia** al `.tgz` que trae `AppShell` (ya publicado).
- **`main` gana `id="main-content"`** en ambos layouts: hoy el enlace "Saltar al contenido" del Navbar apunta a un ancla que no existe en la app — defecto latente preexistente. AppShell aún no trae ese enlace (hueco anotado abajo); darle el ancla al `main` ahora deja el destino listo para cuando lo traiga, y no cuesta nada.

### Fuera de alcance

- **El enlace "Saltar al contenido"**: `Navbar` lo traía (roto, sin ancla); `AppShell` no lo trae todavía. Queda registrado como seguimiento en `tuip` (sumar el enlace a la barra de AppShell, como lo tiene Navbar); la mitad de la app (el ancla) queda lista desde este change.
- Mover el breadcrumb dentro de la barra (pregunta abierta del canvas, no decidida).
- `AuthLayout`, `EmptyLayout`, `MainLayout`: no usan Navbar/Sidebar.
- Búsqueda (`onSearch`), notificaciones y switcher de apps: los layouts hoy no los pasan y siguen sin pasarlos.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — este change declara `skip_specs`. Los specs de `chapter-lead-shell` y `admin-shell` prometen entradas de navegación, estados activos, redirecciones y breadcrumbs — todo eso queda idéntico: las mismas entradas, el mismo `activeId`, la misma franja de breadcrumb. La geometría de la fusión y el comportamiento del colapso están especificados en `tuip` ("Opciones del componente AppShell"), que es de donde la app los hereda al usar la pieza. Ningún requisito de la app cambia de texto.)

## Impact

- **Dependencias**: reinstalar `@tuya-ui/components` desde el `.tgz` con `AppShell` (publicado por `add-app-shell-component`).
- **Layouts**: `frontend/src/layouts/ChapterLeadLayout/ChapterLeadLayout.tsx` y `frontend/src/layouts/AdminLayout/AdminLayout.tsx` — la estructura de render; los datos de navegación, breadcrumb y guardas no cambian. `Navbar`/`Sidebar` dejan de importarse ahí.
- **Pruebas**: los casos existentes de ambos layouts assertan entradas, activo y breadcrumbs — sobreviven; se suma cobertura de lo nuevo (hamburguesa presente y funcional, sin franja de colapso, marca en la cabecera).
- **Sin impacto**: rutas, navegación, features, mocks, `tuip`.
- **Nota de verificación**: la preferencia de colapso guardada por el Sidebar actual se respeta al migrar (clave compartida) — se verifica en pantalla.
