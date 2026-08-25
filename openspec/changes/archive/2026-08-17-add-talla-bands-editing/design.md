## Context

Ver proposal.md — Why. Las restricciones que dan forma al enfoque:

- `useSprintConfig` ya fijó la forma de una pantalla de admin que edita y guarda: valores vigentes y guardados por separado para saber si hay cambios, errores por campo, `loading`/`saving`, y un `save` que **devuelve** su resultado en vez de dejarlo en el estado — con un comentario explicando que leer `saveError` justo después del `await` vería la closure del render anterior. Ese detalle es fácil de repetir mal, así que conviene copiar la forma, no reinventarla.
- Los mocks viven en `src/mocks/handlers/<feature>.handlers.ts`, con estado en memoria y una función de reinicio para los tests, y `handlers/index.ts` se declara a sí mismo "punto único de extensión".
- `Slider` ya resuelve la parte difícil: un valor por límite, sin cruce, con separación mínima, y un arrastre que toca exactamente dos tramos.
- La pantalla hoy tiene `tallas` como constante de módulo, con `puntaje` ya formateado (`"0–20%"`) y `pmMin`/`pmMax` como cadenas.
- El modal más ancho del catálogo es `lg` (880px); el drawer más ancho es 720px.

## Goals / Non-Goals

**Goals:**
- Que editar la partición sea imposible de hacer mal: sin huecos, sin solapes, sin bandas de ancho cero.
- Que el guardado se parezca tanto al de sprints que quien conozca uno entienda el otro sin leerlo entero.

**Non-Goals:**
- No se tocan las otras tres secciones ni sus datos, que siguen siendo marcadores de posición.
- No hay versionado ni auditoría del cambio: la sección de Versionado sigue siendo una propuesta no acordada, y este cambio no la implementa.
- No se edita el nombre de las tallas ni se agregan o quitan bandas; son cinco y se llaman como se llaman.
- No hay confirmación de descarte al cancelar con cambios pendientes.

## Decisions

- **El modelo guarda una lista de límites más los datos propios de cada banda, no un mínimo y un máximo por banda.** Es la decisión que sostiene todo lo demás. Con `{min, max}` por banda, el backend, el mock, el hook y la UI tendrían cada uno la oportunidad de dejar un hueco o un solape, y habría que validar contra eso en los cuatro lados. Con cuatro límites que parten 0–100, la contigüidad no se valida porque no se puede romper: entre dos bandas hay un solo número. Es el mismo argumento que llevó a modelar el `Slider` con pulgares sobre una pista compartida, aplicado ahora a los datos que viajan.
- **La lectura de la banda se presenta como rango inclusivo (`0–20`, `21–40`) pero se guarda como límite.** El formato es de la pantalla; el dato es la frontera. Guardar la cadena formateada obligaría a parsearla para poder editarla, que es como está hoy.
- **Dos editores separados, no uno solo.** Repartir porcentajes y cargar datos son tareas de naturaleza distinta: la primera es una decisión visual sobre el conjunto, que se toma arrastrando y mirando; la segunda es un formulario de quince campos que se completa leyendo. Juntas en un diálogo compiten — la barra queda arriba de una grilla de inputs y ninguna de las dos recibe la atención que pide. Separarlas también acota qué puede romperse en cada confirmación. Descartado: pasos dentro de un mismo modal, que conserva la transacción única a costa de esconder la mitad del contenido detrás de un "siguiente"; y una acción por fila, que fragmenta de más un conjunto de sólo cinco bandas.
- **Modal `lg` para el reparto; el de datos no necesita ese ancho.** La barra representa 0–100% de punta a punta, así que ahí el ancho es precisión de arrastre: 880px contra los 720 del drawer más grande. El editor de datos es un formulario y no gana nada con el ancho extra. En ambos casos la edición es transaccional —abrir, ajustar, confirmar o cancelar—, que es la forma de un modal y no la de un panel lateral que acompaña a la pantalla.
- **Cada editor acumula sus cambios y se confirma de una sola vez.** Mover un límite ya cambia dos bandas; si además cada movimiento guardara, un arrastre dispararía una ráfaga de peticiones y dejaría estados intermedios persistidos que nadie pidió. Cada modal es la unidad de su transacción.
- **Las acciones viven junto a las pestañas, condicionadas a la sección activa.** Es donde se busca una acción de sección, y no queda escondida al final de una tabla. Pero esa barra la comparten las cuatro secciones, así que las acciones tienen que aparecer sólo con la de bandas abierta: si no, dos botones que hablan de bandas quedarían flotando sobre el pool de preguntas.
- **Cada editor se presenta como la cosa que edita.** El de datos es una grilla con los rótulos de columna una sola vez arriba y una fila por banda, igual que la tabla de la pantalla: quien la está mirando reconoce lo mismo, ahora editable. La primera versión repetía "PM mín / PM máx / Lectura" en cada banda, lo que hacía que quince campos ocuparan más alto que el modal —la última banda quedaba fuera de vista— y que el editor no se pareciera en nada a su tabla. El costo es que los campos pierden su rótulo visible, así que cada uno lleva su nombre accesible con la banda adentro; sin eso quedan quince cajas indistinguibles para una tecnología de asistencia.
- **El editor de reparto muestra los números en columnas parejas, no proporcionales al tramo.** Poner cada número bajo el ancho real de su banda sería más fiel, pero con la separación mínima una banda puede quedar en 5% —unos 34px— donde "21–40%" no entra. Con columnas parejas la correspondencia la sostiene el color de la etiqueta, que es lo que sigue atando cada número a su tramo cuando los anchos se separan.
- **Dos editores, un solo recurso.** Las bandas viajan como un objeto único, así que confirmar cualquiera de los dos editores hace un `PUT` del objeto entero, no de la mitad que ese editor muestra. No es un problema —el otro lado va con lo último guardado— pero conviene tenerlo presente al leer el hook: no hay dos endpoints ni dos estados, hay dos vistas sobre el mismo.
- **El color de cada talla se queda en la pantalla y no viaja en el servicio.** Es presentación —qué color le toca a XS— y no un dato del modelo de estimación. Mezclarlo obligaría al backend real a opinar sobre la paleta.
- **El hook valida los campos de banda; la partición no necesita validación.** `pmMin` menor que `pmMax` y la lectura no vacía son condiciones que un campo de texto puede violar, así que se verifican. Que los límites estén ordenados y cubran el rango lo garantiza el `Slider` por construcción, así que no se agrega una validación que no puede fallar — salvo en el handler del mock, que sí la hace porque recibe un cuerpo arbitrario por HTTP.
- **El requisito de pantallas placeholder se reescribe entero incluyendo la mención a las pestañas.** No es alcance nuevo: esa frase se perdió al archivar un cambio anterior que modificaba el mismo requisito con una copia previa a las pestañas. Como este cambio ya tiene que tocarlo para sumar la excepción de las bandas, se aprovecha para dejar el texto correcto.

## Risks / Trade-offs

- [La pestaña de Versionado conserva un botón "Editar parámetros" deshabilitado, que ahora convive con un botón de edición que sí funciona] → Queda así a propósito: son alcances distintos —aquel prometía editar todos los parámetros del modelo— y removerlo o rehabilitarlo sería decidir sobre una sección que este cambio no aborda. Vale registrarlo porque dos botones parecidos, uno vivo y otro muerto, se leen como un error.
- [Las bandas pasan a cargarse por HTTP, así que la sección tiene ahora un estado de carga que antes no existía] → Es el mismo precio que ya pagó Calendario de sprints, y se resuelve igual; el resto de la pantalla sigue siendo síncrona.
- [Guardar todo junto significa que un error de red pierde el trabajo si además se cierra el modal] → Mitigado por el requisito de que el error no cierre el editor ni descarte lo editado; el usuario puede reintentar sin volver a cargar los datos.
- [Cancelar descarta sin preguntar] → Aceptado para no sumar un segundo diálogo sobre el primero; el modal es corto y lo editado es recuperable rehaciéndolo. Si aparece evidencia de que se pierde trabajo real, es un cambio chico agregarlo después.
