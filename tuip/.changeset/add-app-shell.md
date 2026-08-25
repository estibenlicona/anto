---
"@tuya-ui/components": minor
---

`AppShell`: la fusión de Navbar y Sidebar como una sola pieza de estructura.

- **`AppShell`** (nuevo, beta): el sidebar a toda altura con la marca en su cabecera (56px, alineada con la barra para que el filete corra continuo), la barra al lado con la **hamburguesa como primer elemento** — que contrae y expande la navegación, con `aria-label` según estado y `aria-expanded` —, y el contenido de la app como hijos. La franja de colapso del pie de Sidebar no existe en la fusión: la hamburguesa la reemplaza.
- **Composición pura**: se construye sobre `Sidebar` controlado (`collapsible={false}`), `NavbarSearch` y `NavbarUtilities`. **`Navbar` y `Sidebar` no cambian de contrato** — quien los usa sueltos no nota nada.
- El colapso **persiste bajo la misma clave que Sidebar** (`tuya-ui:sidebar-collapsed`), así que migrar una app al shell conserva la preferencia de cada persona, y se **auto-colapsa bajo 1120px** con la misma técnica.
- Cuándo cada cosa: con navegación lateral, `AppShell`; sólo barra, `Navbar`; sólo navegación lateral, `Sidebar`. Las guías de Navbar y Sidebar remiten al shell para el caso combinado.

**Actualizar es seguro**: la adición es puramente aditiva.
