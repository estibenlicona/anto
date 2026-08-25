## MODIFIED Requirements

### Requirement: Ancho de borde
El sistema SHALL definir al menos dos tokens de ancho de borde (`border.width.default`, `border.width.bold`), y todo componente del catálogo que dibuje un borde SHALL consumirlos por nombre en vez de la clase de ancho de borde nativa del framework de estilos o un valor de píxeles hardcoded.

#### Scenario: Borde estándar
- **WHEN** un componente dibuja un borde en su estado normal
- **THEN** usa `border.width.default` en vez de la clase nativa de ancho de borde del framework de estilos

#### Scenario: Borde destacado
- **WHEN** un componente necesita un borde más prominente que el estándar (ej. un estado de error)
- **THEN** usa `border.width.bold` en vez de un valor de píxeles hardcoded

## ADDED Requirements

### Requirement: Escala de radio de esquinas
El sistema SHALL definir una escala de radio de esquinas con cuatro pasos con nombre — `none` (0px), `control` (8px), `surface` (12px) y `pill` (círculo completo) — y SHALL documentar a qué tipo de elemento corresponde cada paso: `control` para controles y campos, `surface` para tarjetas, modales y menús, `pill` exclusivo de chips y avatares. Todo componente del catálogo que dibuje esquinas redondeadas SHALL usar el paso de esta escala que le corresponde, nunca un valor de radio nativo del framework de estilos ni un valor de píxeles hardcoded.

#### Scenario: Un control usa el paso que le corresponde
- **WHEN** se inspecciona el radio de esquinas de un control o campo del catálogo
- **THEN** su valor es el del paso `control` de la escala

#### Scenario: Una superficie usa el paso que le corresponde
- **WHEN** se inspecciona el radio de esquinas de una tarjeta, modal o menú del catálogo
- **THEN** su valor es el del paso `surface` de la escala

#### Scenario: Ningún componente usa un radio suelto
- **WHEN** se inspecciona la clase de radio de esquinas de cualquier componente del catálogo
- **THEN** corresponde a uno de los cuatro pasos con nombre de la escala, nunca a un valor nativo del framework de estilos ni a un valor de píxeles hardcoded
