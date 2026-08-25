## MODIFIED Requirements

### Requirement: Catálogo de habilidades
El sistema SHALL ofrecer al Admin una pantalla de Habilidades en `/app/admin/habilidades` que lista el catálogo agrupado en **humanas** y **técnicas**, indicando por cada habilidad cuántos criterios tiene en total y señalando la que tiene algún nivel sin criterios. Al elegir una habilidad, la pantalla SHALL mostrar su detalle: nombre, grupo, descripción, sus cuatro niveles con los criterios de cada uno, y el nivel esperado por cargo. El breadcrumb de la pantalla SHALL ser "Habilidades".

La pantalla SHALL encabezarse con su título, una descripción de para qué sirve el catálogo, y la acción de dar de alta una habilidad, con el mismo encabezado que presentan los demás módulos del producto.

Las acciones sobre una habilidad SHALL distinguirse por lo que hacen y no sólo por su texto. **Eliminar** una habilidad NO SHALL compartir tratamiento visual con **Editar**: una borra el trabajo de definir sus criterios y la otra lo corrige, y cuando las dos se ven igual la diferencia entre ellas queda a cargo de leer bien la palabra. **Desactivar**, que saca la habilidad de circulación sin destruirla, SHALL leerse como lo que es: reversible, y por eso distinta de eliminar.

Toda habilidad SHALL tener exactamente los cuatro niveles de la escala Tuya —Principiante, Competente, Avanzado y Experto— sin poder agregarlos ni quitarlos: la escala es la misma con la que la app ya representa seniority y stacks.

#### Scenario: Entrar al catálogo
- **WHEN** el Admin abre `/app/admin/habilidades`
- **THEN** ve el encabezado de la pantalla con su título, su descripción y la acción de alta, las habilidades agrupadas en humanas y técnicas con su conteo de criterios, y el detalle de la primera

#### Scenario: Habilidad incompleta
- **WHEN** una habilidad tiene algún nivel sin criterios
- **THEN** el listado la señala como incompleta indicando qué nivel le falta, y su detalle marca ese nivel

#### Scenario: Catálogo vacío
- **WHEN** no hay ninguna habilidad cargada
- **THEN** la pantalla muestra un estado vacío que invita a crear la primera

#### Scenario: Lo que elimina no se ve como lo que edita
- **WHEN** el Admin mira las acciones del detalle de una habilidad
- **THEN** eliminar se distingue de editar por su tratamiento visual y no sólo por su palabra, y desactivar se lee como la opción reversible que es
