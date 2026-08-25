## 1. Componente Alert

- [x] 1.1 Construir `Alert` con las cuatro variantes (`danger`, `warning`, `success`, `info`), estilado con los tokens de estado ya existentes (fondo sutil, texto, borde izquierdo)
- [x] 1.2 Ícono fijo por variante (`status-error`, `status-warning`, `status-success`, `status-info`), no configurable
- [x] 1.3 Título opcional
- [x] 1.4 Slot de acción opcional (`action?: ReactNode`)
- [x] 1.5 Declarar props públicas con tipos explícitos y descripciones

## 2. Registro

- [x] 2.1 Añadir la entrada `alert` a `definitions.ts`, categoría `feedback`, `status: "stable"`
- [x] 2.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos

## 3. Documentación

- [x] 3.1 Escribir `content/alert.tsx`: guía de uso (nunca flotante, ícono obligatorio, cuándo usar cada severidad); anatomía; notas de accesibilidad
- [x] 3.2 Escribir los ejemplos en vivo de `examples/alert/*.tsx`: las cuatro severidades, con título, con acción
- [x] 3.3 Registrar el módulo de contenido en `content/index.ts`

## 4. Cierre

- [x] 4.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 4.2 Confirmar que las cuatro severidades son distinguibles sin depender solo del color (ícono + texto)
- [x] 4.3 Confirmar que ningún estilo de Alert usa un valor fuera de los tokens del sistema
- [x] 4.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
