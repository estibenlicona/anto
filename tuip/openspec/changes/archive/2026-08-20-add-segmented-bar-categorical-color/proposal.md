## Why

`SegmentedBar` solo colorea sus segmentos con los 4 roles de estado (`info`/`warning`/`success`/`danger`), pensados para significar algo (éxito, peligro...). Un consumidor que necesita mostrar una distribución categórica — por ejemplo personas por seniority — no tiene ningún estado que asignarle a cada categoría, y forzar un rol de estado le da un significado falso (¿por qué "Avanzado" sería `warning`?). El sistema ya resuelve exactamente este problema para `Avatar` y `Tag` con el vocabulario `CategoricalColor` (`gray`/`green`/`blue`/`amber`/`red`/`purple`, sin significado de estado). `SegmentedBar` es el único de los tres que no lo soporta.

## What Changes

- `SegmentedBarSegment` acepta `color?: CategoricalColor` como alternativa a `role`: cada segmento se colorea por uno u otro, nunca ambos a la vez.
- Nuevo mapa de clases `bg-*-bold` por `CategoricalColor`, mismo tratamiento sólido que ya usa `Avatar` (`bg-neutral-bold`, `bg-success-bold`, `bg-info-bold`, `bg-warning-bold`, `bg-danger-bold`, `bg-discovery-bold`), escrito literal por la misma razón que en `avatar.tsx`/`tag.tsx` (Tailwind necesita el nombre completo de la clase en el código fuente).
- `role` se mantiene sin cambios para el caso de uso de estado (ej. barra de progreso de salud/severidad). No es una migración — son dos vocabularios de color coexistiendo, igual que `Tag` ya distingue implícitamente entre uso categórico y de estado.
- Documentación del componente en `apps/docs` actualizada con un ejemplo de uso categórico.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `component-library`: el requisito "Opciones del componente SegmentedBar" gana la capacidad de colorear segmentos por categoría (`CategoricalColor`), además del coloreo por rol de estado que ya tenía.

## Impact

- `packages/components/src/progress.tsx`: tipo `SegmentedBarSegment`, nuevo mapa de clases, lógica de resolución de color por segmento.
- `apps/docs/src/content/*` (página de SegmentedBar/Progress): nuevo ejemplo.
- Sin cambios en `Progress` (barra simple) ni en el resto de componentes.
- Desbloquea, en el root de `app-gestion-capacidad`, las tareas 4.3 (card "Distribución por seniority") del change `add-people-dashboard-cards`, actualmente pausadas a la espera de esta extensión.
