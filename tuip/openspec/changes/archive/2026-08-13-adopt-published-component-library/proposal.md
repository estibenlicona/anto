## Why

Hoy `tuip` distribuye los componentes copiando su código fuente al repositorio de cada consumidor (enfoque shadcn). Eso significa que no existe una única versión en producción de cada componente: cada copia diverge de forma independiente, un fix de accesibilidad o un cambio de token no llega a quien ya instaló el componente, y no hay forma de saber qué consumidores quedaron en qué estado. A medida que crecen la cantidad de componentes (~39) y de equipos consumidores, ese costo de gobierno se vuelve insostenible. Se necesita una única fuente de verdad versionada y publicada que todos los consumidores instalen y actualicen de la misma forma.

## What Changes

- Se publica `@tuya-ui/components`, un paquete npm compilado que expone todo el catálogo de componentes existente (Button, Input, Card, Badge, Select, Combobox, Checkbox, RadioGroup, Switch, Table, Pagination, Chip, SegmentedControl, TableToolbar, Tabs, Alert, Avatar, AvatarGroup, Progress, SegmentedBar, Breadcrumb, DateField, DateRangeField, EmptyState, Skeleton, Toast, Tooltip, Menu, Modal, Drawer, ActivityTimeline, Stepper, NotificationMenu, FileInput, FileUploader, Navbar, Sidebar, Accordion, Popover) como dependencia de runtime versionada, en vez de código fuente copiable.
- Se establece una política de versionado semántico y de publicación para la librería: cómo se corta una release, cómo se documentan breaking changes, y cómo un consumidor se entera de que hay una versión nueva.
- **BREAKING**: El CLI `tuip` se retira por completo. `@tuya-ui/components` distribuye su propio CSS autocontenido, así que ya no hay nada que un CLI deba inicializar en el proyecto consumidor (ver design.md): instalar y usar la librería se resuelve con `npm install @tuya-ui/components` más un `import` de su hoja de estilos.
- El sitio de documentación deja de mostrar "copiar código fuente" como la vía de instalación de un componente y pasa a mostrar `npm install @tuya-ui/components` más el import del componente.
- Los consumidores existentes que ya copiaron componentes no se migran automáticamente: este change no incluye una migración retroactiva de proyectos consumidores, solo la nueva vía de distribución hacia adelante.

## Capabilities

### New Capabilities
- `component-library-publishing`: versionado semántico, proceso de release y política de breaking changes para `@tuya-ui/components` como paquete publicado.

### Modified Capabilities
- `component-library`: el requisito de que los componentes se distribuyan como código fuente copiable cambia a distribución como paquete npm compilado y versionado.
- `cli-installer`: se retiran todos sus requisitos junto con el CLI `tuip`, que deja de tener trabajo que hacer una vez que instalar la librería no requiere copiar código ni inicializar configuración en el proyecto consumidor.
- `docs-site`: las instrucciones de instalación mostradas por componente cambian de "copiar código fuente" a "instalar el paquete".

## Impact

- `packages/cli`: se retira del monorepo; el paquete `tuip` publicado en npm se marca como deprecado.
- `packages/components`: pasa de ser código fuente-para-copiar a ser el paquete fuente que se compila y publica como `@tuya-ui/components`.
- `packages/tokens`: sigue siendo dependencia de `@tuya-ui/components`; su propio modelo de publicación no cambia.
- `apps/docs`: actualiza las instrucciones de instalación mostradas por componente.
- Pipeline de publicación (`security-audit`, `release:cli`): se extiende o se agrega un flujo equivalente de release para `@tuya-ui/components`.
- Consumidores existentes que instalaron componentes por copia: sin cambios retroactivos; siguen en su copia actual hasta que migren manualmente.
