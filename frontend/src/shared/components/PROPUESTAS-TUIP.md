# Componentes propuestos para tuip

Estos componentes viven en `frontend/src/shared/components` y no en el catálogo
porque tuip se consume como **tarball local** (`file:../tuip/.local-packages/…`):
promover uno pide republicar el paquete y subir la dependencia, y eso acopla el
ritmo de una feature al de publicar el design system. Cada uno se escribió con
la API que tendría en el catálogo, así que el día que se promueva sólo cambia el
`import`.

El criterio para que algo esté acá y no sea composición: **no se arma con lo que
tuip ya tiene**. Cada ficha dice contra qué se intentó componerlo y por qué no
alcanzó.

| Componente | Archivo destino en tuip | Estado |
|---|---|---|
| `BandScale` | `packages/components/src/band-scale.tsx` | Propuesto |
| `MatrixNumberCell` | `packages/components/src/matrix-number-cell.tsx` | Propuesto |
| `ValidationList` | `packages/components/src/validation-list.tsx` | Propuesto |
| `ValueDiff` | `packages/components/src/value-diff.tsx` | Propuesto |
| `PairedBar` | `packages/components/src/paired-bar.tsx` | Propuesto |
| `TonedSegmentedControl` | extensión de `packages/components/src/segmented-control.tsx` | Propuesta de campo |

---

## BandScale → `band-scale.tsx`

Bandas contiguas de ancho desigual con la marca del valor medido encima.

**Por qué no se compone.** `Slider` con `segments` dibuja los mismos tramos pero
es el *editor* —manijas arrastrables, sin marca de valor—; `LevelMeter` sí tiene
la marca (`expected`) pero sus pasos son iguales a propósito, que es justo lo
contrario de lo que una escala de bandas necesita: acá el ancho de cada tramo es
la información.

## MatrixNumberCell → `matrix-number-cell.tsx`

Una celda de matriz con **tres** estados: un número, el guion de «no aporta», y
el vacío mientras se escribe.

**Por qué no se compone.** Un `Input type="number"` tiene dos estados —con valor
y vacío— y en él «vacío» significa «todavía no escribí», que es exactamente lo
que hay que distinguir de «no aporta». La diferencia no es cosmética: el motor
excluye del máximo a la pregunta que no aporta y le suma un cero a la que pesa
cero.

**API propuesta**

```ts
interface MatrixNumberCellProps {
  value: number | undefined;   // undefined = no aporta
  label: string;               // nombre accesible
  onChange?: (value: number | undefined) => void;  // ausente = sólo lectura
  disabled?: boolean;
  min?: number;
  max?: number;
}
```

## ValidationList → `validation-list.tsx`

Resultados de una validación, cada uno con su estado, qué falta y la acción que
lleva a donde se corrige.

**Por qué no se compone.** Una lista de `Alert` da el estado pero cada uno ocupa
un bloque con su propio borde, y nueve seguidos se leen como nueve problemas en
vez de como un informe; una `Table` da la densidad pero no el icono de estado ni
la acción por fila sin volver a armarlos a mano.

**API propuesta**

```ts
interface ValidationItem {
  id: string;
  title: string;
  status: "pasa" | "advertencia" | "impedimento";
  missing?: string | null;
  actionLabel?: string;
}

interface ValidationListProps {
  items: ValidationItem[];
  onGoTo?: (item: ValidationItem) => void;  // ausente = informa sin resolver
  label: string;
}
```

## ValueDiff → `value-diff.tsx`

Un cambio de valor: cómo estaba y cómo queda.

**Por qué no se compone.** Dos `Tag` con una flecha entre medio es justamente lo
que hay que escribir a mano cada vez, y ninguno de los dos lados debe leerse
como una etiqueta de estado. El valor viejo va tachado, que es lo que hace
innecesario leer la flecha para saber cuál es cuál.

**API propuesta**

```ts
interface ValueDiffProps {
  before: string | null;   // null = se agregó
  after: string | null;    // null = se quitó
  kind: "agregado" | "quitado" | "cambiado";
  label: string;
}
```

## PairedBar → `paired-bar.tsx`

Dos barras sobre la misma escala: lo que se pide y lo que hay.

**Por qué no se compone.** `ProgressBar` dibuja una sola barra sobre su propio
máximo, así que dos puestas una encima de otra dejan de ser comparables apenas
los máximos difieran — y comparar es lo único que esta pieza hace. El máximo
entra por parámetro justamente para que todas las filas de una tabla compartan
escala.

**API propuesta**

```ts
interface PairedBarProps {
  demand: number;
  available: number;
  max: number;                       // escala compartida por todas las filas
  label: string;
  format?: (value: number) => string;
}
```

## TonedSegmentedControl → campo `tone` en `SegmentedControlOption`

**El hueco.** Hoy `SegmentedControl` pinta todas las opciones igual, y hay
respuestas cuyo significado no es neutro: un «sí» en una pregunta crítica del
tamizaje no es lo mismo que un «no». Sin el matiz, quien lee un tamizaje
respondido tiene que leer pregunta por pregunta para ver dónde está el problema.

**Extensión propuesta**

```ts
export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
  /** Matiz de la opción cuando está elegida. Nunca es el único canal. */
  tone?: "neutral" | "success" | "warning" | "danger";
}
```

El matiz aplica **sólo a la opción elegida**: sin elegir todas se ven igual, para
que el color informe qué significa lo que se eligió y no invite a elegir una en
vez de otra. Mientras la extensión no exista, `TonedSegmentedControl` lo aplica
con una clase sobre el envoltorio; el día que tuip lo tenga, ese archivo se borra
y las llamadas pasan `tone` directo.
