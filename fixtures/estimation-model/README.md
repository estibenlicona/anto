# Casos dorados del motor de estimación

Este directorio es el contrato del motor. Lo leen **las dos** implementaciones:

- `backend/src/GestionCapacidad.Application/Initiatives/EvaluationEngine.cs`
- `frontend/src/features/initiatives/services/evaluationModel.ts`

El motor está escrito dos veces a propósito —el servidor manda al persistir, el
cliente calcula la vista en vivo mientras se responde— y lo único que impide que
diverjan en silencio es que las dos suites corran **este mismo archivo**. Si una
de las dos deja de leerlo, la protección no existe. Ver `design.md` — D5 del
cambio `modelo-de-estimacion-versionado`.

## Archivos

| Archivo | Qué es |
|---|---|
| `casos-dorados.json` | Los modelos de entrada y los casos con su resultado esperado |
| `casos-dorados.schema.json` | El esquema del archivo anterior (JSON Schema draft-07) |

## El algoritmo

### 1. Puntaje normalizado de una respuesta

Cada opción de respuesta trae su `score` entre 0 y 1.

- **Evaluativa** y **Binaria**: la respuesta es el índice de la opción elegida
  (`{"option": 2}`) y el puntaje es el `score` de esa opción.
- **Cuantitativa**: la respuesta es un número (`{"number": 25}`) y el puntaje es
  el `score` del tramo que lo contiene. Un tramo es `(from, to]`, con `from`
  exclusivo y `to` inclusivo, salvo el primero, cuyo `from` es inclusivo, y el
  último, cuyo `to` en `null` significa "sin tope".
- Una pregunta **sin responder** vale 0, pero sigue contando en el máximo.

### 2. Las tres salidas

Para cada salida `O` en `Size`, `Effort` y `Risk`, sobre las preguntas activas
que **declaran un peso** para `O`:

```
maxPoints(O) = Σ  peso(q, O)                  · el score máximo es 1
points(O)    = Σ  peso(q, O) · score(q)
pct(O)       = round1( points(O) / maxPoints(O) · 100 )   ó 0 si maxPoints = 0
```

**Un peso ausente no es un peso de cero.** Una pregunta sin peso en `O` queda
fuera de la suma y fuera de `contributes`; una con peso `0` está en las dos y
suma cero. Numéricamente da igual; en la lectura y en el editor no.

`round1` redondea a un decimal alejándose del cero (`MidpointRounding.AwayFromZero`).

### 3. Talla

`pct(Size)` cae en la primera regla de talla cuyo `maxPct` no supera; por encima
de todas, la última.

### 4. Esfuerzo

Cada talla trae `pmMin`, `pmExpected` y `pmMax`. `pmExpected` es un **parámetro
propio**, no el punto medio del rango. `pct(Effort)` ubica el esfuerzo dentro de
ese rango, con el esperado en la mitad de la escala:

```
pm = pct(Effort) ≤ 50
   ? pmMin      + (pmExpected - pmMin) · (pct(Effort) / 50)
   : pmExpected + (pmMax - pmExpected) · ((pct(Effort) - 50) / 50)
```

El resultado se redondea a un decimal. Con `pct(Effort) = 50` da exactamente
`pmExpected`.

```
fteEsperado = pm     / meses
fteMin      = pmMin  / meses
fteMax      = pmMax  / meses
```

Los meses son el plazo objetivo, con piso en 1. **El plazo sólo divide**: no
mueve la talla ni el persona-mes (RN-34).

### 5. Mix

El mix base viene en porcentaje por talla y cada columna suma 100.

Un **modificador** se dispara cuando su talla está en la lista y el puntaje de su
driver cumple la condición. El puntaje de un driver es el promedio de los
puntajes de sus preguntas activas, ponderado por el peso de cada una en `Mix`:

```
driverScore(d) = Σ peso(q, Mix) · score(q)  /  Σ peso(q, Mix)
```

sobre las preguntas activas cuyo driver es `d` y que declaran peso en `Mix`. Sin
esas preguntas el driver no participa del mix y ningún modificador suyo se
dispara.

Un modificador **reparte y no agrega**: sus ajustes suman cero en puntos
porcentuales, de modo que el mix siga sumando 100. Después de aplicarlos:

```
fte(capacidad) = pct(capacidad) / 100 · fteEsperado
```

La suma de los FTE por perfil es igual al FTE esperado total. Los FTE **no se
redondean**: tres porciones redondeadas no suman el total.

### 6. Riesgo

`pct(Risk)` cae en la primera banda de riesgo cuyo `maxPct` no supera. El riesgo
**no** entra en el tamaño ni en el esfuerzo: la incertidumbre afecta la confianza
en el resultado, no su magnitud.

### 7. Dimensiones

El desglose por dimensión es sobre la salida de **tamaño**:

```
answered(dim)  = preguntas activas de la dimensión que fueron respondidas
total(dim)     = preguntas activas de la dimensión
maxPoints(dim) = Σ peso(q, Size)   sobre las que declaran peso en Size
points(dim)    = Σ peso(q, Size) · score(q)
pct(dim)       = round0( points / maxPoints · 100 )
weightPct(dim) = round0( maxPoints(dim) / maxPoints(Size) · 100 )
```

Una dimensión cuyas preguntas no pesan en tamaño da `weightPct` 0: es correcto,
y es lo que hace visible que una dimensión de riesgo no agranda la iniciativa.

### 8. Tamizaje

Una crítica en sí, o tres o más síes, exigen evaluación completa (`Required`);
uno o dos síes la recomiendan (`Recommended`); ninguno habilita la vía rápida
(`FastTrack`).

## Cómo se comparan los valores

- `pct`, `pm*`, `points`, `maxPoints`, y los enteros de dimensión: **exactos**.
- `fte*` y los FTE del mix: con la `tolerance` declarada en el archivo.
