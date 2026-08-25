## Why

El chapter evalúa a sus capacidades contra un conjunto de habilidades —humanas y técnicas— donde cada una tiene 4 niveles y cada nivel su lista de criterios. Hoy eso vive en un documento: no se puede consultar mientras se evalúa, no se sabe con qué versión se evaluó a alguien, y el nivel que cada rol exige —lo único que convierte un nivel en brecha— no está en ninguna parte.

Este es el primero de los changes del módulo de plan de carrera (canvas "Plan de Carrera del Chapter", artboard "Catálogo de habilidades"): sin catálogo no hay con qué evaluar, así que va antes que la evaluación, la matriz del span y el plan individual.

## What Changes

- Nueva pantalla de Administración **Habilidades** en `/app/admin/habilidades`: listado del catálogo agrupado en humanas y técnicas, con el detalle de la habilidad abierta a la derecha.
- **Habilidad**: nombre, grupo (humana | técnica), una descripción de una línea y sus 4 niveles fijos de la escala Tuya (Principiante · Competente · Avanzado · Experto).
- **Criterios por nivel**: cada nivel lleva una lista ordenada de criterios de largo variable —suelen ser 5, pero cambia por nivel y por habilidad—, que se agregan, editan, reordenan y quitan uno por uno. Un nivel puede quedar sin criterios y la habilidad avisa que está incompleta.
- **Nivel esperado por rol**: por cada habilidad, qué nivel exige cada rol del chapter. Un rol sin nivel definido se muestra como tal y no genera brechas.
- **Versionado del catálogo**: cada cambio publicado crea una versión nueva; las evaluaciones ya cerradas conservan la versión con la que se hicieron y no se recalculan.
- Nueva entrada **Habilidades** en el grupo "Configuración" del menú de Admin.
- Handler de mock para el catálogo, las versiones y los perfiles por rol.

### Fuera de alcance

- Evaluar personas, registrar brechas y el plan de acciones: son los changes siguientes.
- Cambiar la escala de 4 niveles o sus nombres — es la escala Tuya que la app ya usa para seniority y stacks.
- Importar el catálogo desde un archivo; la carga inicial se hace en la pantalla.

## Capabilities

### New Capabilities

- `skills-catalog`: catálogo de habilidades con sus niveles, criterios y el nivel esperado por rol, versionado.

### Modified Capabilities

- `admin-shell`: la navegación lateral gana la entrada "Habilidades" en el grupo "Configuración".
- `api-mocking`: handler nuevo del catálogo de habilidades.

## Impact

- Frontend: nueva feature `src/features/skills` (service, adapter, hooks, contenedor y componentes), página `AdminSkillsPage`, ruta y entrada de navegación.
- Mocks: `skills.handlers.ts` + semillas con las 9 habilidades del diseño, sus criterios y los perfiles de los roles que hoy existen en el mock de personas.
- tuip: sin cambios. Se compone con `Table`, `Card`, `Tag`, `Input`, `Textarea`, `Select`, `Drawer`, `Alert` y `Checkbox`, todos publicados.
- El nivel esperado por rol se ancla al `role` que ya lleva `Person`; no se crea un catálogo de roles nuevo.
