## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Los dos layouts son estructuralmente gemelos**: `Navbar` con `product`/`user`/`userMenu` + fila con `Sidebar` (`groups`/`activeId`/`onNavigate`/`ariaLabel`) + columna de contenido (franja de breadcrumb sobre `bg-neutral-canvas` + `main`). Difieren sólo en datos (producto, usuario, grupos, breadcrumb propio de cada rol) y en que ChapterLead envuelve con `LeadBreadcrumbProvider`.
- **`AppShell` recibe exactamente esos datos** y pone la geometría: los layouts quedan en `AppShell` + hijos (breadcrumb + main). El `ToastProvider` envuelve por fuera, como hoy.
- **El CSS del paquete ya trae todo**: `AppShell` viene compilado en `styles.css` del `.tgz` nuevo; la app no compila nada.
- **Las pruebas de layout existentes** montan las rutas y assertan entradas/activo/breadcrumb por roles y texto — nada depende de la geometría vieja. La franja "Colapsar" del pie no está asertada en ningún caso (verificado con grep).
- **El enlace de salto**: `Navbar` renderiza "Saltar al contenido" hacia `#main-content`, ancla que no existe en la app — roto desde siempre. `AppShell` no trae el enlace (hueco conocido del componente).

## Goals / Non-Goals

**Goals:**

- Que los dos shells muestren la fusión corregida sin reescribir ningún dato de navegación, breadcrumb ni guarda.
- Que la migración conserve la preferencia de colapso ya guardada de cada persona.

**Non-Goals:**

- No se agrega búsqueda, notificaciones ni switcher: los layouts no los pasaban y no los pasan.
- No se arregla acá el enlace de salto de `AppShell` (es de `tuip`); sólo se deja el ancla lista.
- No se toca `MainLayout` (no usa estas piezas) ni el contenido de ninguna pantalla.

## Decisions

- **Los hijos de `AppShell` son la columna de contenido tal cual existe hoy**: la franja de breadcrumb (`bg-neutral-canvas px-6 py-3`) y el `main flex-1 px-6 py-6`, sin envoltorio nuevo. AppShell ya da la columna `flex-1 min-w-0 flex-col`; el `div` intermedio de los layouts desaparece.
- **`main` gana `id="main-content"` y nada más.** Es la mitad de la app del arreglo del enlace de salto; la otra mitad (el enlace en la barra de AppShell) es un seguimiento de `tuip` anotado en proposal. Alternativa considerada: no tocar nada hasta que AppShell traiga el enlace. Se descarta: el ancla es un atributo inerte, gratis hoy, y evita un tercer change coordinado mañana.
- **`onNavbarNavigate` no se pasa**: las utilidades por defecto ("Ayuda") no navegan a ninguna ruta interna, igual que hoy con `Navbar`.
- **Las pruebas nuevas van en los tests de layout existentes**, no en una suite aparte: es donde ya se monta el shell con router y mocks. Se asserta comportamiento del shell en el contexto de la app (hamburguesa presente con su `aria-label`, click colapsa — las etiquetas del menú desaparecen —, sin botón "Colapsar" al pie, marca visible en la cabecera); los detalles finos del componente ya están probados en `tuip`.
- **La clave de colapso compartida no necesita migración de datos**: `AppShell` lee `tuya-ui:sidebar-collapsed`, la misma que el `Sidebar` de hoy escribe. Se verifica en pantalla colapsando antes de migrar... eso no se puede "antes" en el mismo apply — se verifica seteando la clave a mano y recargando.

## Risks / Trade-offs

- **[El enlace "Saltar al contenido" desaparece del DOM hasta que AppShell lo traiga]** → Hoy está roto (sin ancla): ningún flujo de teclado funcional se pierde, y el seguimiento en `tuip` queda anotado en proposal con la mitad de la app ya resuelta. Si se prefiere no perder ni el enlace roto, la alternativa es esperar el fix de tuip antes de adoptar — decisión del usuario si le importa.
- **[La barra pierde el rótulo del producto (la marca se muda a la cabecera del sidebar); alguien podría extrañar el nombre arriba a la izquierda del contenido]** → Es el diseño aprobado en el canvas; el nombre sigue arriba a la izquierda de la pantalla, sólo que en la columna del sidebar. Colapsado queda sólo el cuadro — igual que el canvas.
- **[Cambio visual grande en todas las pantallas autenticadas de un solo change]** → Es la naturaleza de un shell: se cambia una vez y afecta todo. La verificación en pantalla recorre ambos roles y varias pantallas; el rollback es revertir dos archivos.

## Migration Plan

1. Reinstalar el `.tgz` (ya publicado con `AppShell`).
2. Reescribir los dos layouts sobre `AppShell` (+`id="main-content"`).
3. Pruebas y verificación en pantalla en ambos roles.

Rollback: revertir los dos layouts a la composición manual — `Navbar` y `Sidebar` siguen intactos en el paquete.
