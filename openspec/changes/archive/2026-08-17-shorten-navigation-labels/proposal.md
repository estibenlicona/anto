## Why

Las etiquetas de navegación describen la pantalla en vez de nombrarla, y quedan largas para lo que un índice tiene que hacer: `Inicio · Estado plataforma`, `Conexión y job de ingesta`, `Mix de capacidades y SFIA` van de 25 a 26 caracteres. Un sidebar se recorre de un vistazo buscando dónde ir, no se lee.

Lo que hace barato acortarlas es que el nombre completo ya vive en otro lado: `adminRouteTitles` y `leadRouteTitles` son mapas aparte de las etiquetas del menú, y son los que alimentan el breadcrumb y el `<h1>` de cada pantalla. Hoy los dos lugares dicen casi lo mismo. Dejando el sustantivo corto en el menú y la frase completa en el breadcrumb, cada uno hace un trabajo distinto en vez de repetirse.

## What Changes

- Acortar las entradas del sidebar de Admin al sustantivo que distingue cada pantalla: `Inicio`, `Sprints`, `Parámetros`, `Ingesta`; y el rótulo de grupo `Integración DevOps` a `DevOps`.
- Acortar las del sidebar de Chapter Lead del mismo modo: `Inicio`, `Células`; y el grupo `Gestión de Capacidad` a `Capacidad`.
- Acortar las cuatro pestañas de Parámetros del modelo: `Bandas`, `Capacidades`, `Preguntas`, `Versionado`.
- Dejar intactos los `RouteTitles`, que son los que nombran la pantalla en el breadcrumb — este cambio los vuelve la única fuente del nombre largo, en vez de una copia del menú.
- No tocar los rótulos del Navbar. Se revisaron por pedido expreso y ya son de una o dos palabras (`Ayuda`, `Cerrar sesión`); el único texto largo ahí es el nombre del producto, que es identidad de marca y no una etiqueta de navegación.
- Sin cambios **BREAKING**: cambian textos visibles, no rutas ni identificadores de navegación.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `admin-shell`: cambian las etiquetas de la navegación lateral y de las pestañas de Parámetros del modelo, y la navegación deja de replicar el texto del mockup de referencia.
- `chapter-lead-shell`: cambian las etiquetas de la navegación lateral, con el mismo criterio.

## Impact

- `frontend/src/features/admin-shell/navigation.ts` y `frontend/src/features/chapter-lead-shell/navigation.ts` — las etiquetas de entrada y de grupo. Los `RouteTitles` de ambos quedan como están.
- `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx` — los rótulos de las cuatro pestañas.
- Las pruebas que buscan entradas o pestañas por su texto, en ambos shells y en la página de Parámetros.
