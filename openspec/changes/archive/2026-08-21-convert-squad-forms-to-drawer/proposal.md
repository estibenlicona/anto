## Why

El módulo de Células quedó con sus dos formularios en `Modal` (`SquadFormModal` para crear/editar célula y `AllocationFormModal` para asignar/editar una persona del equipo, que hoy vive dentro del detalle de la célula) mientras Personas ya migró a un `Drawer` con secciones, grilla de dos columnas, rótulos con ícono, ayudas, obligatorios marcados y contador de faltantes en el pie (change `modernize-person-form`). La app tiene dos lenguajes de captura distintos para el mismo tipo de tarea. Este change lleva los dos formularios de Células al mismo patrón.

## What Changes

- **`SquadFormModal` → `SquadFormDrawer`**: `Drawer` lateral (`size="lg"`), encabezado con título y subtítulo según el modo ("Crear célula" / "Editar célula"), dos secciones con ícono en pastilla: **Identificación** (nombre, tribu en grilla de 2 columnas) y **Clasificación** (criticidad como `Select` con etiquetas en español, descripción como campo de una columna con ayuda "Opcional, máx. 500 caracteres"); obligatorios marcados con `required`; `placeholder`s de ejemplo; pie con contador de obligatorios sin completar y botones Cancelar / "Crear célula" o "Guardar cambios" (con ícono).
- **`AllocationFormModal` → `AllocationFormDrawer`**: mismo `Drawer`, encabezado con título y subtítulo que nombra la célula; dos secciones: **Persona** (el `Select` de persona en alta; persona fija en edición, presentada como texto) y **Dedicación** (los tres porcentajes en grilla con sufijo "%" y ayuda "BAU + Transformación debe igualar la dedicación"); pie con contador y botones "Asignar persona" / "Guardar cambios".
- **`FormSection` compartida**: la sección con ícono en pastilla que hoy está dentro de `PersonFormDrawer` pasa a `shared/components/FormSection.tsx` y la usan los tres drawers.
- Los diálogos de confirmación de eliminar/quitar **siguen en `Modal`**, igual que en Personas: son confirmaciones, no formularios.
- **Sin cambios de datos ni de validación**: mismos campos, mismos límites, mismos requests. El spec suma, como en Personas, el escenario del contador de obligatorios sin completar.

### Supuestos registrados

- Descripción sigue siendo un `Input` de texto: `tuip` no tiene `Textarea`, y agregarlo es un change aparte en ese root.
- Criticidad sigue como `Select` (4 opciones), misma desviación consciente de la guía de `Select` que se aceptó para Seniority/Modalidad en Personas, por consistencia entre formularios.

### Fuera de alcance

- Rediseñar la validación, los textos de error o el flujo de alta/edición.
- `Textarea` o cualquier cambio en `tuip`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `squads`: "Crear célula" suma el escenario de contador de obligatorios sin completar (lo hereda "Editar célula", que aplica las mismas reglas) y describe la presentación del formulario (panel lateral con secciones).
- `allocations`: "Asignar una persona a la célula" suma el mismo escenario y describe la presentación; "Editar una asignación existente" aclara cómo se presenta la persona fija.

## Impact

- **Frontend — squads**: nuevo `components/SquadFormDrawer.tsx` (reemplaza `SquadFormModal.tsx`), `squadFormValidation.ts` (+`countMissingRequiredFields`), `SquadsContainer.tsx` y `SquadDetailContainer.tsx` (import/nombre).
- **Frontend — allocations**: nuevo `components/AllocationFormDrawer.tsx` (reemplaza `AllocationFormModal.tsx`), `allocationFormValidation.ts` (+`countMissingRequiredFields`), `AllocationsContainer.tsx`.
- **Frontend — shared**: `shared/components/FormSection.tsx` (extraída de `PersonFormDrawer.tsx`, que pasa a importarla).
- **Pruebas**: `SquadFormModal.validate.test.ts` → `SquadFormDrawer.validate.test.ts` (+ contador), test equivalente para allocations, y los tests de contenedores que buscan el diálogo por título.
