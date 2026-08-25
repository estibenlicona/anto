## 1. Empaquetado de `@tuya-ui/components`

- [x] 1.1 Crear el paquete `packages/react` (o renombrar `packages/components`) con `package.json` de `@tuya-ui/components`: entrypoint ESM+CJS, `types`, `sideEffects: ["*.css"]`, `peerDependencies` de React con el rango soportado
- [x] 1.2 Configurar `tsup` para compilar todos los componentes existentes con exports nombrados desde un único entrypoint
- [x] 1.3 Configurar el build de CSS: correr Tailwind sobre el código fuente de los componentes + `@tuya-ui/tokens` para generar `dist/styles.css` autocontenido
- [x] 1.4 Verificar en un proyecto de prueba que `npm install` + `import '@tuya-ui/components/styles.css'` + `import { Button } from '@tuya-ui/components'` renderiza sin configuración adicional de Tailwind (verificado vía `apps/docs`, que ahora consume el paquete compilado sin escanear el código fuente de los componentes en su propio Tailwind; confirmación final en 6.3)
- [x] 1.5 Verificar tree-shaking: un bundle que solo importa un componente no incluye el código de los demás (confirmado con esbuild: ~48kb importando solo Button vs ~69kb importando el catálogo completo, con Radix/cmdk/date-fns/react-day-picker externalizados)

## 2. Migración del catálogo de componentes

- [x] 2.1 Migrar los componentes del catálogo (Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover) al nuevo paquete sin cambiar su comportamiento observable (código fuente sin cambios; solo cambió el empaquetado)
- [x] 2.2 Correr la suite de pruebas y de accesibilidad existente de cada componente contra el paquete compilado (no existe una suite automatizada de comportamiento/accesibilidad en el repo más allá del type-check; `tsc --noEmit` pasa sin errores sobre el paquete compilado)
- [x] 2.3 Confirmar que las dependencias de terceros (Radix, `cmdk`, `date-fns`, `react-day-picker`) quedan declaradas como dependencias del paquete, no como peer dependencies adicionales para el consumidor

## 3. Versionado y publicación

- [x] 3.1 Configurar Changesets en el monorepo para `@tuya-ui/components` — `@changesets/cli` instalado (`pnpm add -Dw @changesets/cli`, red disponible en un intento posterior), `pnpm changeset init` corrido (detectó el `.changeset/config.json` ya existente y no lo tocó). `access` actualizado a `"restricted"` en `.changeset/config.json` y en `packages/components/package.json` (`publishConfig`), acorde a la decisión de no publicar a npm público y distribuir vía un registro/repositorio privado.
- [x] 3.2 Documentar en `CONTRIBUTING` (o equivalente) cómo declarar un changeset por PR que toca el paquete
- [x] 3.3 Configurar el pipeline de release: build, verificación estándar del proyecto, y publicación solo si ambas pasan (`pnpm run release` en la raíz)
- [x] 3.4 Publicar `@tuya-ui/components@0.1.0` — **decisión posterior**: el proyecto no publica al registro público de npm; se distribuye vía un repositorio/registro privado (igual que el resto de los paquetes), pendiente de definir cuál. `pnpm run publish:local` (ver el change siguiente) cubre la instalación local mientras tanto.

## 4. Retiro del CLI `tuip`

- [x] 4.1 Eliminar `packages/cli` del monorepo
- [x] 4.2 Publicar una última versión de `tuip` en npm y marcarla como deprecada (`npm deprecate`) apuntando a `@tuya-ui/components` — **no aplica**: verificado contra el registro público (`npm view tuip` → 404 Not Found), `tuip` nunca se publicó en npm, así que no hay nada que deprecar ahí
- [x] 4.3 Quitar las referencias a `tuip` de los scripts raíz del monorepo (`release:cli` reemplazado por `release`; dependencia `tuip` quitada de `apps/docs/package.json`)

## 5. Sitio de documentación

- [x] 5.1 Reemplazar el bloque de instalación en la cabecera de cada página de componente por el comando de instalación del paquete y el import correspondiente
- [x] 5.2 Reescribir la página de instalación para documentar `npm install @tuya-ui/components` y el import de estilos
- [x] 5.3 Eliminar la página de referencia del CLI y la página de anatomía de proyecto (con redirect a `/instalacion` para no romper enlaces existentes)
- [x] 5.4 Eliminar la sección de "peso del componente" de la cabecera de cada página de componente
- [x] 5.5 Actualizar la página de inicio para indicar cómo instalar y empezar a usar `@tuya-ui/components`
- [x] 5.6 Verificar que la pestaña de código fuente de cada componente sigue funcionando como referencia de solo lectura (verificación final de build/render en 6.3)

## 6. Verificación final

- [x] 6.1 Correr `openspec validate adopt-published-component-library --strict`
- [x] 6.2 Correr la comprobación estándar del proyecto (lint, test, build, auditoría de dependencias) de punta a punta
- [x] 6.3 Confirmar que el sitio de documentación construye y navega correctamente con las páginas actualizadas (`vite build` exitoso; verificado en navegador: Home, `/components/button` con el nuevo chip de instalación/import y la pestaña Código, y el redirect `/cli` → `/instalacion`)
