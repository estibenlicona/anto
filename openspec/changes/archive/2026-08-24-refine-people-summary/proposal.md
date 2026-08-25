## Why

El resumen de Personas tenía tres cards de distinta altura y lecturas dispersas (FTE que ya vive en la Torre, una lista de badges por stack en riesgo). El diseño nuevo abre cada card con la cifra que manda y la respalda con una barra o avatares, a igual altura.

## What Changes

- **Personas activas**: total + "N en M células" (asignadas y células con gente, del overview de capacidad) + avatares; enlace neutro **Ver células**.
- **Stacks sin respaldo**: cuántos dependen de una sola persona, "de N registrados · M con respaldo", barra éxito/advertencia con leyenda en línea (reemplaza la card "Cobertura por stack" con badges).
- **Distribución por seniority**: abre con el % en avanzado o superior y su lectura; barra y leyenda en línea con el tono de cada nivel derivado de `accentTones`.
- Todo sobre `Card` y `DistributionCard` (`headline`, `action`, `legend="inline"`, change `extend-distribution-card` de tuip); sin barras ni leyendas locales.

## Capabilities

### Modified Capabilities
- `people`: "Resumen del módulo de Personas" — tres lecturas nuevas y su anatomía.

## Impact

- `features/people/components/PeopleStatsCards.tsx` (+ test), `PeopleContainer.tsx` (usa `useCapacityOverview` para "N en M células"), `PeopleContainer.test.tsx`.
