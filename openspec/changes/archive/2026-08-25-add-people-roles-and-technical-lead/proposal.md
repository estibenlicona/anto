## Why

El formulario de Personas captura **Cargo** y **Rol**, y las semillas ponen el mismo valor en los dos: "Backend Dev" y "Backend Dev". Dos campos de texto libre que dicen lo mismo no son un duplicado inocente — son un campo que perdió su significado. Y hace falta, porque en la organización *cargo* y *rol* son cosas distintas: el cargo es a qué se dedica alguien (Desarrollador Backend, QA, Frontend); el rol es cómo participa en esta aplicación (Administrador, Líder Técnico, Líder de Expertise, Product Owner), y de él dependen los permisos.

Sin esa distinción escrita, el sistema no puede responder una pregunta que la interfaz necesita hacer: **quién es líder técnico**. Hoy no hay forma de saberlo, así que tampoco hay forma de ofrecer un selector de líder técnico que no sea la lista entera de personas.

Y hay tres cosas de la pantalla que arrastran su propio ruido: el costo mensual se escribe sin separadores de miles (`COP 12000000`), la línea de expertise a la que pertenece una persona no se ve en el listado ni al editarla, y el nombre —el dato que manda en cada fila— es el único de los tres listados del rol que no tiene peso tipográfico; Células e Iniciativas ya lo destacan.

## What Changes

- **Rol y cargo dejan de ser lo mismo.** El **cargo** sigue describiendo a qué se dedica la persona. El **rol** pasa a elegirse de un catálogo cerrado —Administrador, Líder Técnico, Líder de Expertise, Product Owner— en vez de escribirse a mano.
- **Se incorpora el Líder técnico de una persona**, elegido con un selector que ofrece a las personas registradas cuyo rol es Líder Técnico. Es un dato informativo: no decide qué ve nadie.
- **La línea de expertise se muestra sin editarse**, en el formulario y como columna del listado. Se infiere de la línea asignada, y se sigue cambiando sólo desde el módulo de Líneas de expertise.
- **El costo mensual se escribe y se lee en pesos colombianos**, con separadores de miles.
- **El nombre de la persona gana peso** en el listado, igual que el de la célula y el de la iniciativa en los suyos.

### Fuera de alcance

- **Atar los roles nuevos a la sesión y a los permisos.** El contrato de sesión y su lista de roles viven en la capability `auth-session`, que todavía no está archivada —existe sólo dentro de `add-auth-port-and-simulator`, con 27 de 30 tareas—. Modificar desde acá un requisito que no está en las specs principales obliga a inventar una fusión que ese change no sancionó. Este change deja el rol como **dato de la persona**, escrito y elegible; conectarlo a lo que cada rol puede hacer es el paso siguiente, cuando ese change se archive.
- Cambiar la línea de expertise desde Personas: sigue siendo del módulo de Líneas, como su requisito exige.
- Administrar el catálogo de roles desde la interfaz.

## Capabilities

### Modified Capabilities

- `people`: el alta y la edición capturan el rol desde un catálogo y el líder técnico desde un selector de personas, muestran la línea de expertise sin editarla y escriben el costo en pesos; el listado gana la columna de línea y el nombre gana peso.

## Impact

- **Contrato de API**: `Person.role` deja de ser texto libre y pasa a ser un valor del catálogo; se agrega el líder técnico de una persona (referencia a otra persona, opcional) y viaja la línea de expertise como dato de sólo lectura. Es un acuerdo con quien implemente el backend.
- **Datos**: hoy las semillas ponen en `role` el mismo texto que en `position`. Hay que decidir el rol real de cada persona —y sembrar **más de una** con rol de Líder Técnico, porque con una sola el selector no se puede probar.
- Frontend: `features/people` (servicio, adapter, formulario, validación y listado) y los mocks de personas.
- **Advertencia declarada**: el Líder técnico es la tercera relación que nombra a un responsable, junto al Chapter Lead y al lead de la línea de expertise. `scope-people-to-chapter` exige que **una sola** decida el alcance de lo que alguien ve; por eso este requisito dice explícitamente que el líder técnico no lo decide. Si mañana se le dan permisos, esa regla es la que hay que revisar primero.
- **Orden**: `Crear persona` y `Editar persona` no tienen deltas pendientes. `Listar personas` tiene **cuatro** —`add-capacity-columns-to-people-list`, `add-person-stacks`, `scope-people-to-chapter` y `tint-utilization-blue`—, así que su delta parte de la unión de los cuatro y del texto principal, no de uno solo.
