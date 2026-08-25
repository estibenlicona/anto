## Why

Todos los avatares de la aplicación se ven iguales: gris sólido con las iniciales en blanco. En una tabla de decenas de personas el avatar no aporta nada para distinguir una fila de otra — es sólo un adorno repetido. Microsoft Teams resuelve esto dando a cada persona un color propio y estable, que se vuelve parte de cómo se la reconoce de un vistazo.

## What Changes

- **Sumar a la paleta un vocabulario de color de identidad**: ~12 colores tomados de la paleta de personas de Fluent (la que usa Teams), bien separados en tono. Entran como una familia aparte, explícitamente **no semántica** — no significan estado ni acción, sólo distinguen personas — para no contaminar el vocabulario semántico existente (brand, neutral, danger, warning, success, info, discovery).
- **Cambiar el tratamiento visual de `Avatar`** de fondo sólido con texto inverso a fondo tenue con texto del mismo tono en un paso oscuro, como en la referencia. Reemplaza al sólido: queda un único tratamiento, no dos.
- **Permitir que `Avatar` derive su color de un identificador estable** que le pasa el consumidor, repartiendo entre los ~12 colores de forma determinista: la misma persona obtiene siempre el mismo color, en cualquier pantalla y entre sesiones.
- **BREAKING (interno)**: esto revierte una regla del design system hoy documentada en tres lugares — el JSDoc de `AvatarProps.color`, un par do/dont de la documentación y una nota de anatomía — que prohíbe derivar el color del nombre, del id o de cualquier dato de la persona. La regla se reescribe, no se ignora en silencio: pasa a prohibir derivarlo de datos **mutables** (el nombre), que es el riesgo real que la regla original describía, y a exigir un identificador estable. Ningún consumidor pasa `color` hoy, así que no hay llamadas que romper.
- Pasar el identificador de la persona desde los dos lugares de la aplicación que muestran avatares: el listado de Personas y el resumen de indicadores.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `people`: el requisito "Listar personas" y el de "Resumen del módulo de Personas" describen hoy el avatar sólo por sus iniciales; suman que cada persona se muestra con un color propio y estable.

## Impact

- `tuip/packages/tokens/src/`: familia de color de identidad nueva, con sus valores para tema claro y oscuro.
- `tuip/packages/components/src/avatar.tsx`: tratamiento tenue, reparto determinista y la prop del identificador.
- `tuip/packages/components/src/lib/`: el vocabulario de color de identidad y la función de reparto, separados del `CategoricalColor` semántico existente.
- `tuip/apps/docs/src/content/avatar.tsx`: reescribir el do/dont y la anatomía que hoy afirman lo contrario de lo que el componente pasará a hacer.
- `frontend/src/features/people/components/PeopleList.tsx` y `PeopleStatsCards.tsx`: pasar el id de la persona.
- Requiere `pnpm run publish:local` en `tuip/` y `pnpm install` en `frontend/` para que la aplicación tome los cambios del paquete.
- Sin cambios de API ni de datos: el id de la persona ya está en el modelo de UI.
