## Why

Checkbox y RadioGroup se dibujan con la misma forma. Los dos miden 16 px de lado; el radio del radio es `pill` y el del checkbox es `control`, que vale **8 px** — exactamente la mitad del lado, que es la definición de un círculo. La única diferencia que queda entre los dos controles es la marca de adentro: un tilde contra un punto, unos pocos píxeles.

Eso rompe la convención más vieja de los formularios: **cuadrado es "elegí los que quieras", redondo es "elegí uno"**. La forma es lo que se percibe antes de leer nada, y cuando miente, la interfaz dice lo contrario de lo que puede hacer.

Ya está pasando. En el drawer de asignar personas a una línea de expertise hay trece casillas —checkboxes, con selección múltiple— dibujadas como círculos. Quien lo abre lee "elegí una persona" y elige una, cuando podía asignar varias de una vez. Ninguna prueba falla y nadie reporta un bug: el control funciona perfecto, sólo que dice otra cosa.

El token no está mal. `control` son 8 px porque está pensado para botones y campos, que miden 32 px o más y donde 8 px se leen como un redondeo suave. Lo que está mal es aplicarle un radio fijo a un control ocho veces más chico, donde ese mismo valor deja de ser un redondeo y pasa a ser una circunferencia.

## What Changes

- **El Checkbox se dibuja cuadrado**, con un redondeo que se lea como esquina redondeada y no como círculo, a su tamaño real.
- **La distinción de forma pasa a ser una regla escrita**, no una consecuencia de qué token le tocó a cada uno: Checkbox y RadioGroup SHALL distinguirse por su forma, y no sólo por la marca de adentro.

### Fuera de alcance

- El valor del token `control`, que es correcto para lo que fue pensado. Lo que cambia es cómo lo usa un control chico.
- El RadioGroup, que ya es redondo y así debe quedar.
- El Switch, que tiene su propia forma y ya se distingue.

## Capabilities

### Modified Capabilities

- `component-library`: el Checkbox gana una regla de forma, y la distinción visual con RadioGroup deja de depender de la marca interior.

## Impact

- **Componentes**: `packages/components/src/checkbox.tsx`.
- **Consumidores**: toda casilla del catálogo cambia de aspecto al reinstalar. Es el efecto buscado — hoy todas mienten sobre lo que permiten — y no cambia ninguna prop: nadie tiene que tocar código.
- **Dónde se nota primero**: el drawer de asignar personas a una línea de expertise, que es donde el engaño tiene consecuencia práctica.
- **Advertencia declarada**: el mismo error puede repetirse con cualquier control chico que tome `rounded-control`. El requisito fija la forma del Checkbox; si aparece otro control de 16 px, hay que mirarlo con el mismo criterio.
- **Orden**: `component-library` está en `openspec/specs` y no tiene deltas pendientes.
