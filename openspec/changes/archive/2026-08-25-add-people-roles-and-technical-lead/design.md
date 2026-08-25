## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **`role` ya existe, y sí significa algo — aunque no lo que parece.** `PersonDto.role` es texto libre y las semillas le ponen el mismo valor que a `position` ("Backend Dev" en los dos), así que a simple vista es un duplicado sin uso. No lo es: **es la llave del modelo de competencias**. El catálogo de habilidades declara el nivel exigido por rol con nombres de disciplina (`"Backend Dev": 2`, `"Data Engineer": 3`), y el span, la evaluación y la brecha de cada celda lo resuelven contra `person.role`. Cerrar el rol sin mover esa llave deja todas las celdas sin nivel exigido: Competencias no falla, se vacía.
- **La sesión no sabe de estos roles.** `APP_ROLES` son dos —`admin` y `chapter-lead`— y viven en la capability `auth-session`, que **sólo existe dentro de `add-auth-port-and-simulator`** (27/30, sin archivar). Nada de lo que este change escriba puede tocar eso.
- **Ya hay dos relaciones de responsabilidad**: el Chapter Lead (por chapter, según `scope-people-to-chapter`) y el lead de la línea de expertise. El líder técnico sería la tercera.
- **La línea de una persona ya tiene dueño**: `add-expertise-lines` establece que se cambia desde el módulo de Líneas y que el formulario de persona no la captura.
- **`Crear persona`, `Editar persona` y el requisito del catálogo no tienen deltas pendientes.** `Listar personas` tiene cuatro, y dos de ellos se contradicen sobre si "rol" es una columna del listado.

## Goals / Non-Goals

**Goals:**

- Que cargo y rol dejen de decir lo mismo, y que el rol sirva para responder quién es líder técnico.
- Que el formulario deje de pedir a mano lo que puede ofrecer de una lista.

**Non-Goals:**

- Los permisos. Este change deja el rol como dato; qué puede hacer cada rol es otro trabajo, y hoy está bloqueado.
- Tocar el listado de Personas. Está fuera por una razón concreta, no por olvido — ver Riesgos.
- Administrar el catálogo de roles desde la interfaz.

## Decisions

- **El nivel esperado pasa a leerse del cargo.** Es la condición para que el rol pueda cerrarse, y además es lo que las expectativas ya decían: "Backend Dev exige nivel 2" es una frase sobre a qué se dedica alguien, no sobre cómo participa en la aplicación. El traslado alcanza al catálogo de habilidades, a la evaluación y al span, y por eso este change toca las specs de esas tres capabilities y no sólo la de `people`. Alternativa considerada: dejar el rol como está e introducir el catálogo en un campo nuevo — se descartó porque deja cargo y rol duplicados, que es exactamente el problema que el change viene a resolver.
- **El catálogo lleva un quinto valor, Colaborador.** Los cuatro roles enumerados son de liderazgo, y el rol es obligatorio: sin un valor para quien participa sin liderar, sembrar a las dieciocho personas obligaría a inventarle un liderazgo a la mayoría, y la pantalla mostraría ese invento como un hecho. Alternativa considerada: volver el rol opcional — se descartó porque el requisito lo lista entre los obligatorios y "sin rol" y "colaborador" no son lo mismo: el primero se lee como un dato que falta.
- **El rol es un dato de la persona, no todavía un rol de sesión.** Es la única forma de avanzar sin inventar una fusión: la lista de roles de sesión vive en una capability que no está archivada, y modificar desde acá un requisito que no está en las specs principales no es una unión, es una invención. Cuando `add-auth-port-and-simulator` se archive, atar estos cuatro roles a la sesión es un paso corto y bien definido. Alternativa considerada: escribir igual el requisito de sesión — se descartó porque `openspec validate` no tiene contra qué compararlo y porque le pisaría el texto a un change que todavía está en curso.
- **El catálogo va donde ya vive el de seniority y modalidad.** Ese requisito existe justamente para decir "esto se elige, no se escribe". Meter el rol ahí lo deja al lado de sus pares en vez de abrir un requisito nuevo que diga lo mismo por tercera vez.
- **El líder técnico se declara explícitamente como informativo.** No basta con omitir que decide el alcance: si no lo dice, quien lea "líder" va a asumir que sí, y va a tener motivos para asumirlo, porque ése es el patrón de las otras dos relaciones. El requisito lo niega en la misma frase que lo introduce.
- **Quitarle el rol a un líder técnico avisa.** Es el caso que rompe en silencio: cambiar el rol de una persona deja colgando las referencias de quienes la tenían como líder. Sin el aviso, el dato desaparece y nadie se entera hasta que alguien lo busca.
- **El costo se formatea al escribir, no sólo al leer.** El detalle ya lo muestra en pesos; lo que falta es el campo, que hoy es numérico y por eso no puede llevar separadores. Cambiarlo a texto con formato obliga a separar lo que se ve de lo que se envía, y ésa es la parte que hay que probar: que al backend viaje el número.
- **La línea se muestra sin editarse, y el requisito de `add-expertise-lines` sigue en pie.** Ese requisito prohíbe *elegirla* en el formulario, no *verla*. Mostrarla de sólo lectura con un enlace a donde sí se cambia respeta la razón por la que se prohibió: sigue habiendo un solo lugar que la edita.

## Risks / Trade-offs

- **[El listado de Personas queda fuera]** → La columna de línea de expertise y el peso del nombre viven en *Listar personas*, que tiene cuatro deltas sin archivar. Dos de ellos **no coinciden**: `add-capacity-columns-to-people-list` incluye "rol" entre las columnas y `add-person-stacks` no, y cada uno trae un párrafo que el otro no tiene. Escribir la unión obligaría a decidir por sus autores cuál es la lista de columnas correcta. Se resuelve archivando: cuatro de esos changes ya están completos.
- **[Tres relaciones que nombran a un responsable]** → El requisito dice que ésta no decide el alcance. Es una defensa escrita, no estructural: el día que alguien le dé permisos al líder técnico, la regla de `scope-people-to-chapter` —una sola relación decide— es lo primero que hay que revisar.
- **[Un catálogo en español con nombres en inglés por debajo]** → Dos vocabularios significan un mapa que mantener. Es la regla que el equipo eligió, y el requisito la escribe para que el mapa exista en un solo lugar y no se improvise en cada pantalla.
- **[El rol vuelve a llenarse con el cargo]** → Es lo que pasó la primera vez. Lo que lo impide ahora es que el rol deja de admitir texto: no hay dónde copiarlo.
- **[Sembrar un solo líder técnico]** → Con uno solo, el selector "funciona" y no prueba nada. Hacen falta al menos dos, y alguien sin líder técnico.

## Migration Plan

0. El nivel esperado deja de leerse del rol y pasa a leerse del cargo, en el catálogo de habilidades, en la evaluación y en el span. Va primero: si se hace después, entre un paso y el otro el span queda sin brechas.
1. El catálogo de roles en los mocks, con sus nombres en español para mostrar y en inglés en el contrato.
2. `role` deja de ser texto libre en el contrato y en el formulario; las semillas eligen el rol real de cada persona.
3. El líder técnico: campo opcional, selector filtrado por rol, y el aviso al quitarle el rol a quien lo es.
4. La línea de expertise, de sólo lectura, en el formulario.
5. El costo mensual con formato de pesos al escribir.

Rollback: los pasos 3 a 5 se revierten solos. El 1 y el 2 no, porque son el contrato.

## Open Questions

- Si el cargo también debería salir de un catálogo. Hoy es texto y este change lo deja así; la pregunta se puede responder después sin cambiar nada de lo que acá se decide.
