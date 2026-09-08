## REMOVED Requirements

### Requirement: El Chapter Lead sólo ve las personas a su cargo

**Reason**: La gestión de capacidad pasa a leerse completa. Ninguna pantalla acota ya por el titular del token, así que este requisito no describe nada que el sistema haga: cada una de sus afirmaciones —el listado que excluye a los ajenos, los totales calculados sobre el subconjunto, el estado vacío del lead sin gente— queda contradicha por el comportamiento nuevo.

La regla de que la interfaz NO filtre por su cuenta no se pierde por eso: deja de tener objeto acá porque ya no hay nada que acotar, y volverá con el módulo de vista personal ("Mi Espacio de Trabajo" / "Mi Línea"), que es donde acotar por titular vuelve a ser lo correcto. Ahí también vuelve la exigencia de que el acotado lo haga el servidor.

La afirmación de que una persona pertenece a un chapter con su lead, y de que esa relación es la única de responsabilidad, tampoco desaparece del sistema: `Person.chapterId` se conserva y el módulo de vista personal la retomará. Lo que se retira es su papel como regla de alcance de estas pantallas.

**Migration**: Ninguna acción para quien usa el producto: las pantallas pasan a mostrar más datos, no menos, y ninguna deja de funcionar. Quien dependa de leer "lo mío" debe esperar al módulo de vista personal; hasta entonces, los filtros y buscadores de cada listado son la vía para recortar la vista a mano.
