## 1. Sección compartida

- [x] 1.1 Crear `shared/components/FormSection.tsx` con el componente (y comentarios) que hoy vive en `PersonFormDrawer.tsx`; `PersonFormDrawer` pasa a importarlo. Tests de Personas sin regresiones.

## 2. Célula

- [x] 2.1 En `squadFormValidation.ts`, agregar `countMissingRequiredFields(values)` (nombre, tribu, criticidad).
- [x] 2.2 Crear `components/SquadFormDrawer.tsx` según design D2 (Drawer lg, subtítulo por modo, secciones Identificación / Clasificación, `required`, `hint`, placeholders, pie con contador y botones con ícono); eliminar `SquadFormModal.tsx`.
- [x] 2.3 Reemplazar el uso en `SquadsContainer.tsx` y `SquadDetailContainer.tsx`.
- [x] 2.4 Renombrar `SquadFormModal.validate.test.ts` → `SquadFormDrawer.validate.test.ts` y sumar el test del contador; ajustar `SquadsContainer.test.tsx` / `SquadDetailContainer.test.tsx` si buscaban el diálogo por título.

## 3. Asignación

- [x] 3.1 En `allocationFormValidation.ts`, agregar `countMissingRequiredFields(values, { editing })` (persona sólo en alta; dedicación siempre).
- [x] 3.2 Crear `components/AllocationFormDrawer.tsx` según design D3 (subtítulo con la célula, secciones Persona / Dedicación, sufijo "%", ayuda de suma, contador, botones "Asignar persona" / "Guardar cambios"); eliminar `AllocationFormModal.tsx`.
- [x] 3.3 Reemplazar el uso en `AllocationsContainer.tsx`.
- [x] 3.4 Tests: contador en `allocationFormValidation.test.ts`; `AllocationsContainer.test.tsx` (el `createRequestKey` abre el drawer: buscar el título por `heading`).

## 4. Verificación

- [x] 4.1 `npx vitest run src/features` + typecheck + lint sin regresiones frente al baseline (fallos pre-existentes: `App.test.tsx`, `httpClient.test.ts`); `grep` de que no queda `SquadFormModal` ni `AllocationFormModal`.
- [x] 4.2 Levantar la app en modo mock: crear y editar una célula desde el listado y desde el detalle; asignar y editar una persona desde el detalle; comprobar secciones, obligatorios, ayudas, contador de faltantes al enviar vacío, y que los errores del servidor siguen mostrándose sin perder lo ingresado.
