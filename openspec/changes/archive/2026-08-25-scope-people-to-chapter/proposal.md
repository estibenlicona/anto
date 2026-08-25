## Why

Hoy el Chapter Lead ve a **todas** las personas del sistema. Las specs lo dicen sin rodeos —"las personas registradas", "sobre el total de personas registradas"— porque el producto se pensó con un solo chapter, y con uno solo la distinción no existía.

Con más de un chapter deja de ser cierto, y no es un detalle de presentación: qué personas puede ver alguien es una regla de acceso. Hoy no hay nada que la sostenga:

- **`chapterId` existe en el modelo de persona y vale `null` en las dieciocho semillas.** El concepto estaba previsto y el dato nunca se llenó.
- **La sesión del Chapter Lead no corresponde a nadie.** El simulador entra como "Carlos Chapter Lead", `oid 2222…`, que no es ninguna persona sembrada. No hay forma de resolver a quién tiene a cargo.
- **Ya hay otra jerarquía de responsabilidad**: las líneas de expertise tienen líder, y de ahí sale hoy el "Chapter Lead" que la ficha de una persona muestra. Si el alcance se decide por chapter y la ficha lo dice por línea, el sistema puede afirmar que alguien está a cargo de un lead que no la ve en su listado.

## What Changes

- **El alcance por responsabilidad pasa a ser una regla declarada del rol**, no una decisión de cada pantalla: un requisito transversal que alcanza al listado de Personas y sus indicadores, la matriz del span, el equipo de cada célula, la ocupación de la torre de control, las ausencias y las asignaciones.
- **El acotado lo hace el servidor**, resolviendo la responsabilidad desde el titular del token. La interfaz consume lo que recibe y no filtra: filtrar en el cliente no restringe nada —los datos ya viajaron— y obliga a repetir la regla en cada pantalla.
- **Una persona pertenece a un chapter y ese chapter tiene un lead.** Se llena el dato que hoy es `null` y se ata la sesión a un lead concreto, para que la app sea probable en desarrollo.
- **Una sola relación de responsabilidad.** Lo que la ficha muestra como el Chapter Lead de una persona pasa a salir de la misma relación que decide qué ve ese lead. Hoy sale de la línea de expertise.
- **Los totales descritos como "del chapter" se calculan sobre el conjunto acotado.** "18 personas activas", "FTE del chapter", "39% del chapter" cambian de significado, y hay que revisarlos uno por uno.

### Fuera de alcance

- Administrar chapters —crearlos, renombrarlos, mover personas entre ellos—. Este change los introduce como dato, no como pantalla.
- Qué ve el rol de Administrador de plataforma, que no está acotado por chapter.
- Las líneas de expertise: siguen existiendo y siguen teniendo líder. Lo que cambia es cuál de las dos relaciones decide el alcance y qué muestra la ficha.

## Capabilities

### Modified Capabilities

- `chapter-lead-shell`: se agrega la regla de alcance del rol, transversal a todas sus pantallas, con el servidor como responsable de aplicarla.
- `people`: el listado y sus tres indicadores dejan de cubrir a todas las personas registradas y pasan a cubrir las que el Chapter Lead tiene a cargo.

## Impact

- **Contrato de API**: todos los endpoints que devuelven personas o cifras derivadas de personas pasan a acotar por el titular del token. Es un acuerdo con quien implemente el backend; en la app se ajustan los mocks para que ya se comporten así.
- **Datos**: `chapterId` deja de ser siempre `null`; hay que definir qué chapters existen, quién lidera cada uno y a cuál va cada persona.
- Frontend: `src/mocks/handlers` en varios archivos, el simulador de autenticación, y la revisión de cada total presentado como "del chapter" en Personas, Plan de carrera, Células, Torre de Control, Ausencias y Asignaciones.
- **Advertencia declarada**: elegir el chapter como jerarquía de responsabilidad convive con las líneas de expertise, que ya tienen líder. El requisito exige que sólo una decida, y el trabajo incluye alinear la ficha de persona; sin eso, las dos se contradicen.
- **Orden**: `chapter-lead-shell` y `people` ya existen en `openspec/specs`, así que no hay dependencias de archivado. Las pantallas cuya capability todavía vive en un change sin archivar —ausencias entre ellas— quedan cubiertas por el requisito transversal.
