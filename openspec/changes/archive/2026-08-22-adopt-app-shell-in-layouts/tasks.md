## 1. Dependencia

- [x] 1.1 Reinstalar `@tuya-ui/components` en `frontend/` y confirmar que `AppShell` y `AppShellProps` tipan, y que `styles.css` llega con las clases del shell.

## 2. Layouts

- [x] 2.1 Reescribir `ChapterLeadLayout.tsx` sobre `AppShell`: mismos `product`/`user`/`userMenu`, `groups`/`activeId`/`onNavigate`/`ariaLabel`, `ToastProvider` y `LeadBreadcrumbProvider` por fuera como hoy, y como hijos la franja de breadcrumb y el `main` con `id="main-content"`. Retirar los imports de `Navbar` y `Sidebar`.
- [x] 2.2 Reescribir `AdminLayout.tsx` con el mismo patrón (producto "Gestión De Capacidad", usuario Admin, sus grupos y su breadcrumb).
- [x] 2.3 Correr el typecheck.

## 3. Pruebas

- [x] 3.1 Confirmar que los casos existentes de ambos layouts pasan sin tocarse (entradas, activo, breadcrumbs, redirecciones).
- [x] 3.2 Sumar a cada suite de layout: la hamburguesa está presente con su `aria-label` y `aria-expanded`; clickearla colapsa (las etiquetas del menú salen del DOM y el estado accesible cambia); no existe el botón "Colapsar"/"Expandir" del pie; la marca del producto se ve en la cabecera del sidebar.
- [x] 3.3 Correr `npx vitest run src/layouts` y el lint sobre los archivos tocados, sin regresiones frente al baseline conocido.

## 4. Verificación en pantalla

- [x] 4.1 Levantar `pnpm dev:auth` y recorrer ambos roles: el sidebar llega arriba con la marca en su cabecera, la barra queda al lado con la hamburguesa primera, el filete corre continuo, y el breadcrumb y el contenido quedan como estaban.
- [x] 4.2 Probar el colapso en vivo: la hamburguesa contrae a sólo-íconos y re-expande; recargar conserva la preferencia; setear la clave `tuya-ui:sidebar-collapsed` en `true` y recargar arranca colapsado (la preferencia previa a la migración se respeta).
- [x] 4.3 Confirmar que las pantallas de contenido (Personas con sus columnas nuevas, Parámetros de Admin) no sufrieron reflows raros con la geometría nueva.
