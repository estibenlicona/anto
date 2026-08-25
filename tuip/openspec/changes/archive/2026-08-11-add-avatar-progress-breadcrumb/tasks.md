## 1. Componente Avatar

- [x] 1.1 Construir `Avatar` con iniciales sobre `bg-neutral-bold`/`text-neutral-inverse`, tres tamaños (`small`/`medium`/`large`)
- [x] 1.2 Construir `AvatarGroup`: superposición con borde, `max` opcional (por defecto 3), avatar final de conteo restante cuando se excede
- [x] 1.3 Declarar props públicas con tipos explícitos y descripciones

## 2. Componentes Progress y SegmentedBar

- [x] 2.1 Construir `Progress` (`value: number`), con saturación a `bg-danger-bold` sobre 100 en vez de desbordar
- [x] 2.2 Construir `SegmentedBar` (`segments: { value, label?, role }[]`), ancho proporcional por segmento sobre los tonos `bold` de los roles de estado
- [x] 2.3 Declarar props públicas con tipos explícitos y descripciones

## 3. Componente Breadcrumb

- [x] 3.1 Construir `Breadcrumb` (`items: { label, href? }[]`) sobre `<nav>`/`<ol>`, último nivel sin enlace
- [x] 3.2 Colapsar los niveles intermedios en un indicador no interactivo cuando hay más de tres niveles, conservando primero y último visibles
- [x] 3.3 Declarar props públicas con tipos explícitos y descripciones

## 4. Registro

- [x] 4.1 Añadir las entradas `avatar`, `progress` y `breadcrumb` a `definitions.ts`, todas `status: "stable"`
- [x] 4.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos para los tres

## 5. Documentación

- [x] 5.1 Escribir `content/avatar.tsx`, `content/progress.tsx`, `content/breadcrumb.tsx`: guía de uso, anatomía y accesibilidad de cada uno
- [x] 5.2 Escribir los ejemplos en vivo de `examples/avatar/*.tsx` (individual, grupo con overflow), `examples/progress/*.tsx` (valor normal, sobre 100, SegmentedBar), `examples/breadcrumb/*.tsx` (ruta corta, ruta colapsada)
- [x] 5.3 Registrar los tres módulos de contenido en `content/index.ts`

## 6. Cierre

- [x] 6.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 6.2 Confirmar accesibilidad: Progress anuncia su valor (`role="progressbar"` + `aria-valuenow`), Breadcrumb usa `nav`/`aria-label` y `aria-current="page"` en el último nivel, AvatarGroup no pierde el conteo restante para tecnologías de asistencia
- [x] 6.3 Confirmar que ningún estilo de los cinco componentes usa un valor fuera de los tokens del sistema
- [x] 6.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
