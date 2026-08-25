## Context

Ver proposal.md — Why. Lo que da forma al enfoque:

- Las bandas ya dejaron el camino hecho: servicio con GET/PUT sobre `httpClient`, hook con valores vigentes contra guardados, `save` que devuelve su resultado, handler de MSW con función de reinicio, y un modal que confirma todo junto. Copiar esa forma es más barato que inventar otra, y quien conozca una entiende la otra.
- El mix no tiene la interdependencia que tenían las bandas. Ahí los límites eran compartidos y por eso el editor era una barra; acá son quince enteros que no se afectan entre sí, así que el editor es una matriz y no hay nada gráfico que agregar.
- Las tallas son cinco y fijas hoy, pero viven en las bandas. El mix las repetía como campos propios.
- La lista de capacidades sí crece: Backend Dev, QA Engineer y Arquitecto son las tres de hoy, no las tres que van a ser.

## Goals / Non-Goals

**Goals:**
- Que el mix se pueda editar, incluidas altas y bajas, sin desplegar.
- Que haya una sola definición de qué tallas existen.

**Non-Goals:**
- No se toca la sección de bandas, más allá de leer de ella la lista de tallas.
- No se editan las tallas desde acá: se agregan y se quitan capacidades, no columnas.
- No se valida que el mix "cierre" contra ningún otro parámetro del modelo — no hay regla de negocio que diga cuánta gente debería sumar una talla.
- No hay confirmación al quitar una capacidad; cancelar el editor ya deshace todo.

## Decisions

- **Las cantidades se indexan por talla y las columnas salen de las bandas.** Con `xs`, `s`, `m`… como campos fijos hay dos listas de tallas —la de las bandas y la implícita en el tipo del mix— y nada obliga a que coincidan. Es el mismo problema que los límites compartidos: cuando un concepto vive en dos lados, la pregunta deja de ser si van a divergir y pasa a ser cuándo. Indexando por talla, agregar una banda mañana no deja al mix con una columna fantasma; deja una celda por completar, que es un estado visible en vez de silencioso.
- **La fila se identifica por un id propio, no por su nombre.** El nombre es justamente lo que se edita, así que usarlo como identidad significa que renombrar "QA Engineer" a "QA" es indistinguible de borrar una fila y crear otra: se pierden sus cantidades, o se confunden con las de otra. Un id estable separa "qué fila es" de "cómo se llama".
- **Editar, agregar y quitar viven en el mismo editor y se confirman juntos.** Alta y baja no son operaciones aparte con su propio guardado: son cambios sobre la misma matriz, y separarlas obligaría a decidir qué pasa si alguien agrega una fila y después cancela. Con una sola transacción, cancelar deshace todo por igual.
- **La sección pasa a depender de que las bandas carguen, y lo dice.** Es la consecuencia directa de derivar las columnas: sin bandas no se sabe qué representa cada columna. Mostrar la matriz igual, con encabezados inventados o vacíos, sería peor que decir que no se puede mostrar. Queda como requisito para que no se resuelva con una matriz muda.
- **La tabla muestra lo guardado; el editor, lo que se está editando.** Los dos salen del mismo hook —para que guardar se vea sin recargar— pero de valores distintos: el hook expone también lo último guardado, y la tabla lee eso. Leer los valores vigentes haría que una capacidad recién agregada, todavía sin nombre y en ceros, apareciera en la tabla como si ya estuviera acordada. Se vio al verificar: con el editor abierto, la fila nueva ya figuraba detrás del diálogo.
- **Sin confirmación al quitar una capacidad.** El editor es transaccional: mientras no se confirme, quitar es reversible con cancelar, y agregar un segundo diálogo sobre el primero cuesta más de lo que protege. Si alguien confirma sin querer, es un caso para deshacer a nivel del recurso, no para un `¿estás seguro?`.

## Risks / Trade-offs

- [Quitar una capacidad borra sus cantidades sin aviso al confirmar] → Aceptado: el editor entero es una transacción y cancelar la deshace. Si aparece evidencia de que se pierde trabajo real, lo que corresponde es versionar el recurso, no interponer un diálogo.
- [Con muchas capacidades la matriz crece a lo alto y el modal necesita scroll] → Con tres filas y cinco columnas entra holgado. El límite práctico llega bastante después, y cuando llegue el problema no será el modal sino que una lista larga pide búsqueda o paginado, que es otro cambio.
- [Derivar las columnas acopla dos secciones que hoy son independientes] → Es el acoplamiento que se está buscando: hoy son independientes de una forma que permite que divergan. Lo que sí trae es que un fallo al cargar bandas ahora se ve en dos secciones en vez de una, y por eso el estado de "sin bandas" es explícito.
