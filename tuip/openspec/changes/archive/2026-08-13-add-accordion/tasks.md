## 1. Dependencia

- [x] 1.1 Agregar `@radix-ui/react-accordion` a `packages/components/package.json`

## 2. Componente

- [x] 2.1 Crear `packages/components/src/accordion.tsx` con `Accordion` (envoltorio de `Root`, `type="single" | "multiple"`, `single` por defecto)
- [x] 2.2 Implementar `AccordionItem` (envoltorio de `Item`, soporta `disabled`) con el divisor `border-neutral-default` entre ítems
- [x] 2.3 Implementar `AccordionTrigger` (monta `Header` + `Trigger` internamente) con el ícono `chevron-down` que rota 180° vía `data-[state=open]`, y el tratamiento `text-neutral-disabled` cuando el ítem está deshabilitado
- [x] 2.4 Implementar `AccordionContent`, sin animación de expandir/colapsar, igual que el resto del catálogo
- [x] 2.5 Verificar navegación por teclado (flechas arriba/abajo, Home/End) y que el modo `single` cierra el ítem previamente abierto

## 3. Registro en el catálogo

- [x] 3.1 Agregar la entrada `accordion` en `packages/components/registry/definitions.ts` (categoría `layout`, `status: "stable"`, `npmDependencies: ["react", "@radix-ui/react-accordion"]`, `files` apuntando a `src/accordion.tsx`)
- [x] 3.2 Exportar `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` desde `packages/components/src/index.ts`

## 4. Documentación

- [x] 4.1 Crear `apps/docs/src/content/accordion.tsx` con uso, anatomía y accesibilidad, incluida la aclaración de que Accordion es para contenido de página y no para navegación anidada (a diferencia de Sidebar)
- [x] 4.2 Crear `apps/docs/src/examples/accordion/01-single.tsx` (modo por defecto)
- [x] 4.3 Crear `apps/docs/src/examples/accordion/02-multiple.tsx`
- [x] 4.4 Crear `apps/docs/src/examples/accordion/03-deshabilitado.tsx`
- [x] 4.5 Registrar `accordionContent` en `apps/docs/src/content/index.ts`

## 5. Spec

- [x] 5.1 Confirmar que `openspec/specs/component-library/spec.md` refleja, tras archivar el cambio, el catálogo actualizado y los requisitos de `Accordion`
