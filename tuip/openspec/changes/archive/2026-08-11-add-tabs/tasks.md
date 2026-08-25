## 1. Dependencias

- [x] 1.1 Agregar `@radix-ui/react-tabs` a `packages/components/package.json`
- [x] 1.2 Verificar que el monorepo instala y compila con la dependencia nueva

## 2. Componente Tabs

- [x] 2.1 Construir `Tabs` sobre `Root`, `TabsList` sobre `List`, `TabsTrigger` sobre `Trigger` y `TabsContent` sobre `Content`, estilados con tokens
- [x] 2.2 Indicador de pestaña activa con la línea de marca (mismo tratamiento visual que la navegación lateral)
- [x] 2.3 Contador opcional en `TabsTrigger` (`count`), en fuente monoespaciada junto a la etiqueta
- [x] 2.4 Estado deshabilitado por pestaña
- [x] 2.5 Verificar con teclado: flechas mueven foco y pestaña activa, Home/End saltan a los extremos, el panel activo es el único accesible
- [x] 2.6 Declarar props públicas con tipos explícitos y descripciones

## 3. Registro

- [x] 3.1 Añadir la entrada `tabs` a `definitions.ts`, categoría `layout`, `status: "stable"`, con `npmDependencies` declarada
- [x] 3.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos

## 4. Documentación

- [x] 4.1 Escribir `content/tabs.tsx`: guía de uso con el límite de cinco pestañas y nunca dos filas; anatomía de las cuatro partes; notas de accesibilidad
- [x] 4.2 Escribir los ejemplos en vivo de `examples/tabs/*.tsx`: básico, y con contador
- [x] 4.3 Registrar el módulo de contenido en `content/index.ts`

## 5. Cierre

- [x] 5.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 5.2 Confirmar con lector de pantalla: la pestaña activa se anuncia, el contenido inactivo no se anuncia, el contador se distingue de la etiqueta
- [x] 5.3 Confirmar que ningún estilo de Tabs usa un valor fuera de los tokens del sistema
- [x] 5.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
