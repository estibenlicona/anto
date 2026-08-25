## ADDED Requirements

### Requirement: Opciones del componente Sparkline
El sistema SHALL ofrecer un componente **Sparkline** que dibuja una serie corta de valores como barras verticales, ordenadas del más viejo al más reciente, dentro de un alto fijo y sin ejes, cuadrícula ni cifras: se lee como forma, para acompañar a un número que ya está escrito al lado.

Cada punto SHALL declarar su valor y la etiqueta de su período. La altura de cada barra SHALL ser proporcional al mayor valor de la serie, de modo que la forma describa la variación relativa y no una escala absoluta que el componente no conoce.

**El último punto es el presente** y SHALL distinguirse de los demás, porque una serie de esta clase se lee desde el ahora hacia atrás. El componente SHALL permitir elegir el tono de acento con el que se destaca, y SHALL NOT decidir por su cuenta si la variación es buena o mala: si bajar es una mejora lo sabe la pantalla, no la serie.

Un valor **cero** SHALL seguir dibujándose con una barra mínima visible: una barra que desaparece se lee como un dato que falta, y son cosas distintas.

El componente SHALL exponer un nombre accesible para la serie completa y SHALL NOT exigir que el lector recorra barra por barra: cada barra SHALL quedar fuera del árbol de accesibilidad, con su etiqueta y su valor disponibles al pasar el puntero.

Una serie de un solo punto SHALL dibujarse igual —es el caso de quien todavía no tiene historial— y una serie vacía SHALL NOT dibujar nada.

#### Scenario: Leer la forma de la serie
- **WHEN** una card muestra un Sparkline con los valores de los últimos ciclos
- **THEN** ve una barra por ciclo, del más viejo al más reciente, con alturas proporcionales al mayor de la serie

#### Scenario: El presente se distingue
- **WHEN** se dibuja una serie de varios puntos
- **THEN** el último se ve distinto de los anteriores, en el tono que la pantalla eligió

#### Scenario: Un cero se sigue viendo
- **WHEN** un punto de la serie vale cero
- **THEN** su barra se dibuja con una altura mínima visible, y no desaparece

#### Scenario: La serie se anuncia una sola vez
- **WHEN** un lector de pantalla recorre la card
- **THEN** encuentra la serie como una sola imagen con su nombre, y no seis elementos sueltos sin sentido

#### Scenario: Sin historial
- **WHEN** la serie tiene un único punto
- **THEN** se dibuja igual, sin tratar el caso como un error; y con la serie vacía no se dibuja nada
