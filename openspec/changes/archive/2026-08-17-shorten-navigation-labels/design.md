## Context

Ver proposal.md — Why. Lo que da forma al enfoque:

- `adminRouteTitles` y `leadRouteTitles` son mapas separados de las etiquetas del menú, y son los que alimentan el breadcrumb. Hoy dicen casi lo mismo que el menú (`Calendario de sprints` en los dos lados), así que la información no se pierde al acortar uno.
- `AdminPageHeader` ya renderiza el título de la pantalla como un `<h1>` `sr-only`, con la nota de que el sidebar y el breadcrumb ya lo nombran. La app ya trata la redundancia entre menú y título como algo a evitar.
- Los dos requisitos de navegación dicen que las entradas replican `NAV.admin` / `NAV.lead` del mockup de referencia. Ese mockup es un archivo de diseño que este cambio no puede editar.
- Las pestañas de Parámetros no tienen breadcrumb ni encabezado propio: el rótulo de la pestaña es el único lugar donde esa sección se nombra.

## Goals / Non-Goals

**Goals:**
- Que el menú se pueda recorrer de un vistazo, que es para lo que existe.
- Repartir el trabajo: el sustantivo corto en el menú, la frase completa en el breadcrumb, en vez de la misma frase en los dos.

**Non-Goals:**
- No cambian rutas, identificadores de navegación ni el orden ni la agrupación de las entradas.
- No se tocan los `RouteTitles`: son el otro extremo del reparto y tienen que seguir siendo largos.
- No se renombra el producto en el Navbar; ver la nota más abajo.
- No se agregan ni se quitan entradas de menú.

## Decisions

- **El mockup pasa a gobernar estructura y orden, no redacción.** Los requisitos decían "replicando `NAV.admin`", lo que ata el texto a un archivo de diseño que este cambio no puede editar. En vez de dejar el requisito mintiendo o de inventar que el mockup cambió, se acota qué parte del mockup sigue siendo normativa: el qué y en qué orden, no con qué palabras. Descartado: quitar la referencia al mockup por completo, que perdería la trazabilidad del orden y la agrupación, que sí vienen de ahí.
- **La regla se enuncia, no sólo se aplica.** El requisito dice que cada etiqueta es el término más corto que distingue su pantalla, además de listar las etiquetas concretas. Sin la regla, la próxima entrada que alguien agregue vuelve a la frase descriptiva y la lista queda despareja; con la regla, hay contra qué revisarla.
- **El nombre completo se declara como requisito, no como consecuencia.** Se agrega un escenario que dice que el breadcrumb sigue mostrando el nombre largo. Hoy eso es cierto por cómo están escritos los mapas, pero nada lo obligaba: alguien podría "simplificar" acortando también los `RouteTitles` y dejar la pantalla sin ningún lugar donde diga qué es.
- **`Capacidades` para la pestaña que hoy dice `Mix de capacidades y SFIA`.** El término que la distingue de las otras tres es la capacidad, no el mix. `Mix` a secas no dice nada fuera de contexto, y `SFIA` no aparece en ninguna columna de esa tabla, así que la sigla no estaba sosteniendo nada visible.
- **El Navbar entra en la revisión y sale sin cambios.** Se incluyó por pedido expreso de cubrir todo lo navegable. Sus rótulos ya son de una o dos palabras (`Ayuda`, `Cerrar sesión`); el único texto largo es el nombre del producto, que es identidad de marca y aparece una vez por pantalla, no una entrada de menú que compita con otras. Se deja registrado que se miró, para que no parezca un olvido.

## Risks / Trade-offs

- [Las pestañas pierden palabras sin tener dónde recuperarlas: `Mix de capacidades y SFIA` → `Capacidades` deja fuera "SFIA", y a diferencia del sidebar no hay breadcrumb que lo diga] → Es la parte más discutible del cambio. Se acepta porque esas palabras tampoco aparecían en el contenido de la sección; si SFIA importa, el lugar donde tiene que estar es dentro de la tabla o en su descripción, no en el rótulo de la pestaña. Vale revisarlo con quien conozca el modelo.
- [`Inicio` queda igual en los dos roles, donde antes se distinguían por `Estado plataforma` y `Torre de control`] → No se confunden porque nunca conviven: cada shell muestra sólo su propia navegación, y el breadcrumb sigue diciendo cuál de las dos pantallas es.
- [El texto del menú deja de coincidir con el mockup, así que quien compare los dos va a ver una diferencia] → Es intencional y queda escrito en el requisito. El costo real aparecería si el mockup se usara para validar la implementación palabra por palabra, cosa que la estructura y el orden siguen cubriendo.
