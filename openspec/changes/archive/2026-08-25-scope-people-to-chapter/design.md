## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El dato no existe.** `Person.chapterId` está en el DTO y vale `null` en las dieciocho semillas. No hay catálogo de chapters ni relación chapter → lead.
- **La sesión no identifica a nadie.** El perfil `chapter-lead` del simulador trae `oid 2222…` y el nombre "Carlos Chapter Lead", que no corresponde a ninguna persona sembrada.
- **Ya existe una relación de responsabilidad distinta.** Las líneas de expertise tienen `leadName`, y `personDetail.handlers` resuelve `chapterLeadName: line?.leadName ?? null`. Es de ahí que sale hoy el "Chapter Lead" que la ficha muestra.
- **Seis capabilities enumeran personas** —`people`, `career-plan`, `squads`, `control-tower`, `allocations` y `absences`, esta última todavía en un change sin archivar— con 36 requisitos entre todas.
- La app consume una API real y usa mocks en desarrollo; el contrato es el mismo para las dos.

## Goals / Non-Goals

**Goals:**

- Que el alcance por responsabilidad sea una regla del rol, escrita una vez.
- Que la app quede lista para un backend que la implemente, sin fingir mientras tanto una protección que no tiene.

**Non-Goals:**

- Administrar chapters desde la interfaz.
- Filtrar en el cliente. Está descartado explícitamente en el requisito, no sólo omitido.
- Reescribir las seis capabilities requisito por requisito.

## Decisions

- **Un requisito transversal en el shell del rol, y no un párrafo en cada capability.** Las seis capabilities suman 36 requisitos; tocarlos todos para decir seis veces la misma frase produce seis lugares donde la regla puede quedar desactualizada de a una. La excepción son los dos requisitos de `people` que hoy dicen explícitamente "las personas registradas" y "sobre el total de personas registradas": ésos afirman lo contrario de la regla nueva y hay que corregirlos donde están.
- **El servidor acota; la interfaz no filtra, y el requisito lo dice.** No alcanza con omitirlo: si sólo se dijera "el lead ve lo suyo", filtrar en el cliente parecería una forma válida de cumplirlo. Y no lo es — los datos ya viajaron al navegador, y además cada pantalla tendría que acordarse de repetir la regla.
- **Una sola relación de responsabilidad, y este change tiene que elegir.** Se eligió el chapter. Eso deja a las líneas de expertise con un líder que ya no decide el alcance, y obliga a que la ficha de persona deje de mostrar el líder de la línea como su Chapter Lead. Es el punto más fácil de olvidar del change, porque hoy funciona y seguiría "funcionando" — mostrando un nombre equivocado. Alternativa considerada: usar las líneas, que ya tienen el dato y ya alimentan la ficha; se descartó por decisión de producto.
- **Los mocks implementan el contrato de una vez.** Es lo que permite ver y probar el comportamiento antes de que el backend exista, sin que el front tenga lógica que después haya que sacar. Cuando el backend lo implemente, la app no cambia.
- **La sesión se ata a un lead concreto.** Sin eso no hay a quién resolverle la responsabilidad, y el simulador seguiría entrando como alguien que no está en los datos.
- **Cada total se revisa uno por uno.** No es mecánico: algunos son "del chapter" y pasan a acotarse, y otros —una capacidad objetivo, un catálogo de stacks— pueden ser del sistema y no cambiar. Confundirlos hace que una cifra diga otra cosa sin que nada falle.

## Risks / Trade-offs

- **[En producción no cambia nada hasta que el backend lo implemente]** → Es la consecuencia asumida de poner la regla donde corresponde. La alternativa —filtrar en el cliente— daría un efecto visible inmediato sin restringir el acceso, que es peor que no hacerlo: parecería resuelto.
- **[Dos jerarquías de responsabilidad conviviendo]** → El requisito exige que sólo una decida y que la ficha salga de ésa. Queda advertido en la propuesta y es trabajo explícito de este change; sin eso, el sistema puede decir que alguien está a cargo de un lead que no la ve.
- **[Los totales cambian de significado en silencio]** → Una cifra acotada que sigue diciendo "del chapter" no falla: muestra otro número. Por eso la revisión es uno por uno y la verificación es mirar pantallas con datos de más de un chapter.
- **[Inventar el modelo de chapters desde la app]** → Los mocks tienen que elegir algo para ser probables. Lo que este change fija es el **contrato** —el servidor acota por el titular del token—; cómo se representa un chapter del lado del servidor es decisión de quien lo implemente.

## Migration Plan

1. El dato: catálogo de chapters, su lead, y el chapter de cada persona.
2. La sesión atada a un lead concreto.
3. Los endpoints de los mocks acotando por el titular del token.
4. La ficha de persona tomando su Chapter Lead de la misma relación.
5. Revisión de los totales "del chapter", uno por uno.
6. Verificación en pantalla con más de un chapter poblado.

Rollback: la app no filtra nada, así que revertir es volver los mocks a devolver todo. Ninguna pantalla depende de que el acotado exista.

## Open Questions

- Si una persona puede pertenecer a más de un chapter a la vez. Se puede responder al poblar el dato sin cambiar el requisito: la regla dice "las personas del chapter que ese lead lidera", y eso vale igual si la pertenencia resulta ser múltiple.
