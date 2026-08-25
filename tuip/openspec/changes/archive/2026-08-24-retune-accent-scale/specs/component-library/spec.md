## MODIFIED Requirements

### Requirement: Opciones del componente LevelMeter
El componente LevelMeter SHALL representar una posición dentro de una escala ordinal discreta como una fila de segmentos de igual ancho, donde los segmentos hasta la posición alcanzada aparecen llenos y los restantes vacíos. SHALL aceptar la cantidad de pasos de la escala, con cuatro como valor por defecto, de modo que una escala futura de otra longitud lo reutilice sin bifurcarlo.

Los segmentos SHALL repartir el ancho disponible entre sí con una separación uniforme tomada de los alias de espaciado del sistema, nunca de un valor suelto. Los segmentos llenos SHALL usar el paso de relleno del matiz de acento que el componente recibe —uno de `sky`, `blue`, `violet` o `magenta`, el vocabulario vigente de la escala, que resuelve al valor del tema activo—; los vacíos SHALL dibujarse sobre la superficie neutra con un aro que los mantenga distinguibles del fondo sobre el que se los coloque.

LevelMeter SHALL aceptar además una **posición esperada** opcional y, cuando la recibe, dibujar una marca sobre los segmentos en el límite de esa posición, de modo que se lea "hasta acá" y no "en este escalón". La marca SHALL distinguirse de los segmentos por forma y no sólo por color, y SHALL quedar dentro del ancho del componente sin desplazar los segmentos ni cambiar su reparto. Sin posición esperada, LevelMeter SHALL dibujarse exactamente como antes de este requisito.

Cuando hay posición esperada, LevelMeter SHALL exponerla también a tecnologías de asistencia junto con la posición alcanzada, para que la comparación entre las dos no dependa de ver la marca.

LevelMeter NO SHALL dibujar fondo ni borde propios alrededor de la fila de segmentos: se apoya en lo que lo contenga, que es lo que le permite ir dentro de otra pieza sin recortarla.

LevelMeter NO SHALL comunicar su valor únicamente por color: SHALL exponer a tecnologías de asistencia la posición alcanzada y el total de pasos de la escala.

El componente SHALL exportarse desde el paquete publicado y SHALL declararse en el manifiesto del catálogo con su estado de madurez, de modo que aparezca en el inventario del sistema junto con los demás componentes.

#### Scenario: Posición dentro de la escala
- **WHEN** LevelMeter recibe una posición dentro de una escala de cuatro pasos
- **THEN** muestra llenos los segmentos hasta esa posición y vacíos los restantes, todos del mismo ancho

#### Scenario: Escala de otra longitud
- **WHEN** LevelMeter recibe una cantidad de pasos distinta de la de por defecto
- **THEN** dibuja esa cantidad de segmentos, repartiendo entre ellos el mismo ancho disponible

#### Scenario: Marca de la posición esperada
- **WHEN** LevelMeter recibe una posición esperada además de la alcanzada
- **THEN** dibuja una marca en el límite de esa posición, sin mover ni reducir los segmentos

#### Scenario: Sin posición esperada no hay marca
- **WHEN** LevelMeter no recibe una posición esperada
- **THEN** se dibuja igual que antes de existir esta opción, sin marca ni espacio reservado para ella

#### Scenario: La posición esperada llega a tecnologías de asistencia
- **WHEN** un lector de pantalla recorre un LevelMeter que tiene posición esperada
- **THEN** anuncia también esa posición, de modo que la comparación con la alcanzada no dependa de ver la marca

#### Scenario: Los segmentos se distinguen del fondo que los sostiene
- **WHEN** LevelMeter se coloca sobre cualquiera de las superficies del sistema, en tema claro u oscuro
- **THEN** tanto el relleno de los segmentos llenos como el aro de los vacíos alcanzan al menos 3:1 contra esa superficie

#### Scenario: El valor llega a tecnologías de asistencia
- **WHEN** un lector de pantalla recorre un LevelMeter
- **THEN** anuncia la posición alcanzada y el total de pasos, sin depender de que el usuario perciba el color de los segmentos

#### Scenario: Presente en el inventario del sistema
- **WHEN** se consulta el manifiesto del catálogo de componentes
- **THEN** LevelMeter figura con su nombre, su descripción, su estado de madurez y sus dependencias internas
