## Context

`PersonFormDrawer.tsx` es la referencia: `Drawer size="lg"` + `<form className="flex h-full flex-col">`, `DrawerHeader` con título y subtítulo, `DrawerBody className="p-0"` con `FormSection` (ícono en pastilla + título, filete entre secciones, `px-6 py-5`), campos en `grid grid-cols-1 gap-4 sm:grid-cols-2`, `Input`/`Select` con `required`, `hint`, `placeholder`, y `DrawerFooter` con `justify-between` (contador de faltantes a la izquierda, Cancelar / primario con ícono a la derecha). `FormSection` es una función local de ese archivo. Ver proposal.md - Why.

Los dos formularios de Células (`SquadFormModal`, `AllocationFormModal`) usan `Modal` con campos apilados; sus validaciones viven en `squadFormValidation.ts` y `allocationFormValidation.ts` (ambas con `validate(values)` → `FieldErrors`). `AllocationFormModal` recibe `squadName`, `people`, `peopleLoading` y muestra la persona fija en edición. `SquadFormModal.validate.test.ts` prueba sólo `validate`.

## Goals / Non-Goals

**Goals:**
- Tres formularios con el mismo esqueleto y el mismo componente de sección.
- Cero cambios en validación, adapters, hooks, servicios ni mocks.

**Non-Goals:**
- Cambiar los diálogos de confirmación (siguen `Modal`).
- `Textarea` en `tuip`.

## Decisions

### D1. `FormSection` compartida

Se mueve tal cual a `shared/components/FormSection.tsx` (mismo markup y comentarios), exportada con nombre; `PersonFormDrawer` la importa y deja de definirla. No se lleva a `tuip` en este change: es composición de `Icon` + tokens y todavía sólo tiene consumidores en esta app.

### D2. `SquadFormDrawer`

- Props: las mismas de `SquadFormModal` (`open`, `onOpenChange`, `squad?`, `criticalities`, `criticalitiesLoading`, `saving`, `serverError`, `onSubmit`).
- Secciones:
  - **Identificación** (`icon="cell"`): `Input` Nombre (`required`, placeholder "Ej. Backend Platform") y `Input` Tribu (`required`, placeholder "Ej. Ecosistema Digital") en grilla de 2.
  - **Clasificación** (`icon="status-warning"`… no: el ícono de sección no es un estado; se usa `"layers"`/`"grid"` si existe, si no `"document"`): `Select` Criticidad (`required`, opciones de `CRITICALITY_OPTIONS`) y `Input` Descripción (`hint="Opcional, máximo 500 caracteres."`, placeholder "Propósito y alcance de la célula") a ancho completo (`sm:col-span-2`).
- Subtítulo: "Registra una nueva célula del chapter." / "Actualiza la información de esta célula."
- Pie: `countMissingRequiredFields(values)` (nombre, tribu, criticidad) mostrado sólo tras un intento de envío (`submitted`, igual que Personas); botones Cancelar y primario `iconBefore` `plus`/`save` con "Crear célula" / "Guardar cambios" / "Guardando…".
- `serverError` se muestra como `Alert variant="danger"` al final del cuerpo, como hoy (texto en rojo) → se mantiene el `<p>` actual para no cambiar de patrón respecto a Personas (que también usa `<p>`).

### D3. `AllocationFormDrawer`

- Props: las mismas de `AllocationFormModal`.
- Subtítulo: "Célula: {squadName}" en ambos modos.
- Secciones:
  - **Persona** (`icon="user"`): en alta, `Select` (`required`, placeholder "Seleccionar persona…", `loading`); en edición, la persona como par rótulo/valor en texto (`text-label` "Persona" + `text-body`), no editable.
  - **Dedicación** (`icon="fte"`): grilla de 2 con `Input type="number"` "% Dedicación" (`required`, `suffix="%"`, `sm:col-span-2`), "% BAU" (`suffix="%"`), "% Transformación" (`suffix="%"`); `hint` en Dedicación: "BAU + Transformación debe ser igual a la dedicación."
- Pie: contador (persona en alta, dedicación siempre) tras `submitted`; botones "Asignar persona" / "Guardar cambios".

### D4. Contador compartido por helper propio

Cada validación expone su `countMissingRequiredFields(values)` (Personas ya lo tiene). No se abstrae un helper genérico: las reglas de qué es obligatorio son de cada formulario.

### D5. Pruebas

- `SquadFormDrawer.validate.test.ts` (renombrado): `validate` + `countMissingRequiredFields` (0/1/3).
- `allocationFormValidation.test.ts`: `countMissingRequiredFields` (alta vs edición — en edición la persona no cuenta).
- `SquadsContainer.test.tsx` / `SquadDetailContainer.test.tsx` / `AllocationsContainer.test.tsx`: el `dialog` sigue abriéndose (el `Drawer` de `tuip` también es un `dialog` de Radix); se ajustan los textos buscados ("Asignar persona" aparece en botón y título → usar `getByRole("heading")`).
- `PersonFormDrawer` sin cambio de comportamiento: sus tests siguen verdes tras mover `FormSection`.

## Risks / Trade-offs

- [Ícono de sección "Clasificación"] → Se elige entre los del catálogo de `tuip` (`grid`, `document`, `layers` si existe) al implementar; no se agrega ícono nuevo.
- [`Input type="number"` con `suffix`] → Ya probado en Personas (FTE); misma API.
- [Dos títulos "Asignar persona" en pantalla (botón del encabezado del detalle y título del drawer)] → Es lo mismo que "Nueva persona"/"Crear persona" en Personas; los tests usan roles (`heading` vs `button`).
