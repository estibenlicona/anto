## 1. Componente Badge

- [x] 1.1 Cambiar `BadgeVariant` a `"success" | "info" | "warning" | "danger" | "neutral" | "discovery"`, eliminando `primary`; variante por defecto `neutral`
- [x] 1.2 Cambiar el radio de `radius.pill` a `radius.control`
- [x] 1.3 Agregar el punto de color como parte no textual (`aria-hidden`), antes del texto, en las seis variantes
- [x] 1.4 Mapear cada variante de estado (`success`, `info`, `warning`, `danger`, `discovery`) a `bg-{role}-subtle` (fondo), `text-{role}-default` (texto) y `bg-{role}-bold` (punto)
- [x] 1.5 Mapear `neutral` a `bg-neutral-subtle` (fondo) y `text-neutral-default` (texto); el punto usa `bg-current` sobre un `text-neutral-subtle` propio, según design.md
- [x] 1.6 Confirmar que ninguna clase del componente referencia el rol `brand`
- [x] 1.7 Declarar la prop `variant` con su tipo y descripción actualizados para la tabla de API derivada

## 2. Documentación del componente

- [x] 2.1 Reescribir `content/badge.tsx`: anatomía con las seis variantes (punto + texto), notas de accesibilidad actualizadas para mencionar el punto como decorativo y el texto como portador del significado
- [x] 2.2 Reescribir `examples/badge/01-variantes.tsx` con los seis estados de la definición (`Sincronizado`, `En progreso`, `Al límite`, `Error`, `Sin iniciar`, `Sugerido por IA`)
- [x] 2.3 Revisar que ningún texto de la documentación de Badge siga refiriéndose a `primary` o a la forma de píldora

## 3. Cierre

- [x] 3.1 Regenerar `registry.json` y confirmar que la tabla de props de Badge en el sitio refleja las seis variantes
- [x] 3.2 Recorrer los escenarios de `specs/component-library/spec.md` (Badge) en el sitio corriendo y confirmar que se cumplen, incluida la comparación visual con Chip (píldora) para la forma cuadrada
- [x] 3.3 Confirmar que ningún estilo de Badge usa un valor fuera de los tokens del sistema
- [x] 3.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
