## Why

Cuatro cosas de la pantalla de Iniciativas, tres de redacción y una de color.

- **"Cerrada" y "En evaluación" se ven idénticas.** Las dos usan la variante neutra, así que el badge no distingue una iniciativa que está esperando evaluación de una que ya terminó — que son los dos extremos del ciclo. El único estado con color propio es "Activa".
- **Tres textos hablan en registro coloquial y regional**: "Registrá qué es y quién la pide; después se evalúa para saber cuánta gente necesita", "Suma del FTE esperado de las activas", "Qué pide el negocio y cuánta gente necesita".
- **Y ese primer texto revela un problema más serio.** La app acaba de pasar por un barrido de voseo con una prueba que lo vigila, y `Registrá` sobrevivió: no estaba en la lista de formas que la prueba enumera. Es la tercera vez que la lista se queda corta — el conteo inicial dio 12 ocurrencias, el barrido encontró 56, la prueba encontró 24 más, y ahora aparecen tres que ninguno vio. Una lista escrita a mano no cierra este problema: cada verbo nuevo es un agujero, y el agujero sólo se descubre leyendo la pantalla.

## What Changes

- **Los tres estados de una iniciativa se distinguen entre sí por color.** "En evaluación" pasa a llevar el rol que el sistema usa para lo que está en curso, el mismo con el que la evaluación de una persona se marca "En curso". "Activa" y "Cerrada" no cambian.
- **Se reescriben los tres textos** en español neutro y con la terminología del dominio —solicitud, requerir— en vez del registro conversacional.
- **La verificación del registro deja de depender de una lista enumerada.** Pasa a reconocer la forma del voseo, con una lista de excepciones para las palabras corrientes que terminan igual. Un verbo nuevo deja de ser un agujero.

### Fuera de alcance

- Qué estados existen ni cómo se pasa de uno a otro.
- El resto del texto de la app: el barrido ya se hizo, y lo que este change agrega es que la próxima omisión se detecte sola.

## Capabilities

### Modified Capabilities

- `initiatives`: los tres estados pasan a exigir colores distinguibles entre sí, no sólo el componente de estado.
- `ui-writing`: la verificación del registro pasa a exigir que reconozca la forma y no una lista de palabras.

## Impact

- Frontend: `src/features/initiatives` — el mapa de variantes de estado y cuatro textos (el drawer tiene dos variantes, alta y edición); y `uiWriting.test.ts`, en `src/shared`.
- **Orden**: `initiatives` todavía no existe en `openspec/specs` — vive en el change `add-initiative-evaluation`, sin archivar. El bloque MODIFIED de este change se escribió sobre ese texto pendiente, y `add-initiative-evaluation` debe archivarse antes que éste. `ui-writing` sí existe.
