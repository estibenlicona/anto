## Context

El catálogo tiene cuatro maneras de dibujar una cantidad y ninguna de dibujar una evolución:

- `Progress` y `Meter`: un valor contra un máximo.
- `SegmentedBar` y `CapacityBar`: un total repartido entre partes, en horizontal.
- `DistributionCard`: un reparto con su titular y sus cifras.

Ninguno sirve para "cómo viene cambiando esto", que es lo que una card de resumen necesita al lado de un delta.

El vocabulario de color ya está resuelto y acota el diseño: los tonos de acento (`sky`, `blue`, `violet`, `magenta`) son para elementos gráficos que responden *cuánto*, y los roles semánticos son para estado. Una serie temporal es lo primero.

## Goals / Non-Goals

**Goals:**

- Que una card pueda mostrar la forma de una serie corta sin salir del sistema de diseño.
- Que el presente se distinga del pasado sin que el componente opine sobre si el cambio es bueno.
- Que un cero se vea, porque un cero medido no es un dato faltante.

**Non-Goals:**

- Un gráfico: ejes, cuadrícula, leyenda, tooltips propios, cifras.
- Otras formas de serie (línea, área) mientras no haya un caso.
- Interacción de cualquier tipo.

## Decisions

### 1. Barras y no línea

Con seis u ocho puntos, la línea obliga a inventar la interpolación entre períodos que no existen —entre dos semestres no hay nada— y a decidir grosor, curvatura y extremos. Las barras dicen exactamente lo que hay: un valor por período.

### 2. La escala es relativa al mayor de la serie

`Sparkline` no conoce el máximo posible de lo que dibuja: cuántas brechas puede haber, cuántas historias caben. Escalar contra el mayor punto es lo único honesto que puede hacer sola, y es lo que hace que la forma se lea como variación relativa.

**Consecuencia asumida**: dos sparklines de dos cards no son comparables entre sí. Es correcto: cada uno describe su propia serie, y compararlos sería leer dos escalas como si fueran una.

### 3. El último punto se destaca; su color lo elige el consumidor

La serie sabe que el último punto es el presente —es una propiedad del dato, no una opinión—, así que lo dibuja distinto siempre. Lo que **no** sabe es si ese presente es una buena noticia: en brechas, bajar es mejorar; en historias entregadas, es lo contrario.

Por eso el tono del último punto es una prop (`tone`, del vocabulario de acento) y el resto de la serie va en neutro. La alternativa —colorear según la pendiente— metería una semántica que el componente no puede saber.

**Descartado**: usar roles semánticos (`success`, `danger`) para la pendiente. Es la clase de decisión que el sistema deja en la pantalla, y además pinta de estado algo que es una cantidad.

### 4. Un cero mide lo mínimo visible

Una barra de altura 0 desaparece, y una serie con un hueco se lee como un período sin datos. Con un piso de 2px, el cero se ve como lo que es: medido y en cero.

### 5. Accesible como una imagen, no como una lista

El árbol de accesibilidad recibe **un** elemento con `role="img"` y el nombre que el consumidor pasa; las barras van `aria-hidden`. Seis elementos sin texto no le dicen nada a nadie, y obligar a recorrerlos convierte un adorno de contexto en un obstáculo.

La etiqueta y el valor de cada punto viajan en el `title` de su barra: quien apunta con el mouse llega al dato exacto, y quien no, tiene el número grande de la card al lado.

## Risks / Trade-offs

- **Sin escala absoluta, la forma puede exagerar.** Una serie que va de 12 a 11 se ve casi tan alta como una que va de 12 a 2, si el máximo es el mismo. Se acepta: el sparkline acompaña a una cifra que sí dice cuánto.
- **El `title` no es accesible por teclado.** Es el mismo trato que el catálogo ya le da a los datos de apoyo en `CapacityBar`; el dato exacto nunca vive sólo ahí.
- **Un componente más que mantener** en un catálogo que ya tiene varios de la familia "dibujar cantidades". Se justifica porque responde otra pregunta —*cómo viene cambiando*— y hoy no hay ninguno que la responda.
