## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- Bandas y Capacidades ya resolvieron esta misma pantalla dos veces: servicio con GET/PUT sobre `httpClient`, handler de MSW con estado en memoria y función de reinicio, hook con valores vigentes contra guardados, un `save` que devuelve su resultado, y un editor que confirma todo junto. Copiar esa forma es más barato que inventar otra.
- El modelo de referencia (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`, array `QUESTIONS` y `DIMS`) define 30 preguntas con código, dimensión, texto y peso, agrupadas en 7 dimensiones fijas. El máximo de puntos por dimensión se calcula ahí como `peso_total * 4`, porque cada pregunta se califica en una escala cualitativa de 5 niveles (0 a 4).
- No hay ningún modelo de preguntas en `backend/` todavía: el HTML es la única fuente de verdad hoy.

## Goals / Non-Goals

**Goals:**

- Que la sección Preguntas muestre datos reales del modelo de scoring, no relleno.
- Que las 30 preguntas existan como datos editables, no sólo como un resumen por dimensión.
- Que editarlas siga el mismo patrón ya establecido en esta pantalla.

**Non-Goals:**

- Crear, quitar o renombrar dimensiones. Son fijas — ver la decisión.
- Cambiar la escala de calificación (0–4) ni el multiplicador que da el máximo de puntos.
- Construir el motor de scoring que consume estas preguntas para evaluar una iniciativa: esta pantalla sólo mantiene el pool, igual que Bandas mantiene los rangos sin calcular tallas.
- Tocar `@tuya-ui/components`: no hace falta ningún componente nuevo.

## Decisions

- **Las dimensiones son una lista fija; las preguntas son la entidad editable.** Es la misma relación que Bandas (cinco tallas fijas, contenido editable) y no la de Capacidades (filas dinámicas sobre columnas fijas que vienen de otra fuente). Acá las "columnas fijas" son las dimensiones, embebidas como constante del dominio (`QUESTION_DIMENSIONS`), y las preguntas son las filas dinámicas. Tratar las dimensiones como datos editables habría significado resolver qué pasa con las preguntas de una dimensión que se borra o se renombra — un problema que el modelo de referencia no plantea porque las dimensiones son los ejes del scoring, no contenido de negocio.

- **El pool se guarda como lista plana, no agrupado por dimensión.** Cada pregunta lleva su `dimension` como campo propio (`{ id, dimension, texto, peso }`), igual que el mix de capacidades es una lista plana de filas con su talla implícita en `porTalla`. Un payload anidado (`{ dimension, preguntas: [...] }[]`) obligaría a mantener sincronizados el orden de las dimensiones y el de sus grupos; la lista plana no tiene ese problema y el agrupamiento se hace en el cliente, donde ya se necesita para pintar la tabla resumen.

- **El editor agrupa visualmente por dimensión y no ofrece un selector de dimensión por fila.** Con la dimensión fija por sección del editor (no por campo editable), agregar una pregunta ya sabe a qué dimensión pertenece — la que agregó — sin necesitar un control adicional. Evita construir un Select por fila para una decisión que, por diseño, no debería tomarse fila por fila.

- **El código de pregunta (N1, F2, I3…) es el id de la fila, y no se edita.** Misma razón que en capacidad mix: el texto es lo que se edita, así que no puede ser también la identidad de la fila. El modelo de referencia ya trae códigos estables por pregunta; se reutilizan en vez de generar ids nuevos para las 30 preguntas semilla, y una pregunta agregada por el editor recibe un id generado (no un código con el mismo formato, para no fingir que pertenece al modelo de referencia).

- **El peso se valida como entero positivo, no como no-negativo.** A diferencia de las cantidades del mix de capacidades (donde 0 es un valor válido — una capacidad puede no necesitar nadie en una talla), una pregunta con peso 0 no aporta nada al puntaje y no tiene sentido en el modelo: se valida `peso >= 1`.

- **El máximo de puntos por dimensión se deriva, no se guarda.** `maxPuntos = pesoTotal * 4`, calculado al mostrar la tabla — el mismo criterio que ya usa `bandRange` para las bandas de talla: un valor que es función de otros datos no se persiste aparte, porque hacerlo abre la puerta a que diverja.

## Risks / Trade-offs

- [Cargar 30 preguntas en un editor puede sentirse largo] → Se agrupan por las 7 dimensiones con subtítulo propio, en vez de una lista plana de 30 filas sin quiebres — es la misma cantidad de contenido que hoy ya cabe en la tabla resumen, sólo que expandida. Si en el uso real resulta pesado, el siguiente paso sería colapsar dimensiones cerradas, no rehacer el modelo.
- [Las dimensiones fijas no cubren un modelo de scoring distinto] → Aceptado: este cambio no construye un configurador de modelos, mantiene el que ya existe como referencia. Si el modelo cambia de raíz, es un cambio de alcance mayor y no una edición de parámetros.
- [Los 30 códigos semilla (N1…D4) y sus pesos son juicio experto trasladado del MVP, no un endpoint del backend real] → Mismo estado que las bandas de talla y el mix de capacidades: valores por defecto mockeados, reemplazables cuando el backend real exista.
