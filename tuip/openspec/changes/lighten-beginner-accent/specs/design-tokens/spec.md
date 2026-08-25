## MODIFIED Requirements

### Requirement: Vocabulario de acento sin significado de estado
El sistema SHALL definir una paleta de acento como vocabulario de color propio, separado del semántico, para las escalas ordinales que necesitan distinguir sus pasos por color sin afirmar nada sobre el estado de lo que describen. La paleta SHALL contener cuatro matices nombrados por su color —`sky`, `blue`, `violet` y `magenta`— y cada matiz SHALL exponer un paso de relleno, previsto para teñir elementos gráficos y no texto.

Cada matiz SHALL tener un valor de relleno por tema (claro y oscuro). Los matices `blue`, `violet` y `magenta` SHALL alcanzar en cada tema el contraste mínimo de un componente de interfaz (3:1) contra todas las superficies sobre las que el sistema los coloca: fila, lienzo y fila seleccionada en claro; fila en oscuro.

`sky` SHALL responder a un piso distinto, y el sistema SHALL declarar por qué. Es el primer paso de la progresión y tiene que **leerse como el más leve**; oscurecerlo hasta 3:1 contra la superficie le da el peso del segundo y borra la diferencia que la escala existe para mostrar. El piso de 3:1 protege a un elemento gráfico del que depende entender el contenido, y en las piezas que consumen esta escala eso no es el matiz: un medidor de nivel dice el nivel por **cuántos segmentos están llenos**, y dibuja el segmento vacío con su propio aro, de modo que la cuenta se lee sin recurrir al color. Por eso `sky` SHALL mantenerse distinguible de un segmento vacío —que es de lo que la lectura depende— y NO SHALL exigírsele 3:1 contra la superficie.

La verificación automática SHALL comprobar los cuatro matices en cada build, cada uno contra el piso que le corresponde, y SHALL fallar el build cuando alguno lo baje. `sky` NO SHALL quedar exento de comprobación: una excepción que apaga un control es cómo una paleta se reabre sin que nadie se entere.

Una pieza que quiera usar un matiz de acento como **único** portador de una distinción SHALL resolver su propio contraste, y NO SHALL apoyarse en el piso de esta paleta para darlo por hecho.

Los tokens de acento SHALL distribuirse bajo un prefijo propio, distinto del que usan los tokens semánticos, de modo que el nombre del token diga por sí solo a qué vocabulario pertenece. El nombre SHALL conservar el rol del paso, de modo que agregar un segundo paso más adelante no obligue a renombrar el primero. La paleta de acento NO SHALL sustituir ni duplicar el papel de los roles de estado `success`, `warning`, `danger` e `info`: un matiz de acento no comunica que algo esté bien, en riesgo o roto. La documentación del sistema SHALL afirmar esa distinción de forma explícita en vez de dejarla implícita en los nombres.

#### Scenario: Un paso por matiz, nombrado por su rol
- **WHEN** se inspecciona cualquiera de los cuatro matices de acento
- **THEN** expone un paso de relleno, cuyo nombre dice para qué sirve y no de qué escala salió

#### Scenario: El mismo valor sirve en los dos temas
- **WHEN** la aplicación consumidora cambia entre modo claro y modo oscuro
- **THEN** cada matiz de acento resuelve al valor de ese tema, y en ambos temas el paso de relleno supera 3:1 contra las superficies donde se lo coloca

#### Scenario: El acento no reemplaza a un rol de estado
- **WHEN** una interfaz necesita comunicar que un valor está fuera de rango o que una operación falló
- **THEN** usa el rol de estado correspondiente del vocabulario semántico, no un matiz de acento

#### Scenario: El acento no tiñe texto
- **WHEN** una interfaz necesita color para un texto
- **THEN** usa un token de texto del vocabulario semántico; la paleta de acento no expone un paso de texto

#### Scenario: El prefijo distingue el vocabulario
- **WHEN** se inspecciona el nombre distribuido de un token de acento
- **THEN** lleva un prefijo propio que lo separa de los tokens semánticos, sin que haga falta conocer la lista de matices para reconocerlo como un color de acento

#### Scenario: La escala se lee como progresión de dominio
- **WHEN** se recorren los cuatro matices en el orden en que la paleta los documenta
- **THEN** avanzan de celeste a azul, de azul a violeta y de violeta a magenta, una progresión que se lee como avance y no como escala de riesgo

#### Scenario: El primer matiz se lee como el más leve
- **WHEN** se comparan los cuatro matices de acento en el orden de la escala
- **THEN** `sky` pesa visiblemente menos que `blue`, de modo que el primer paso de una progresión se distingue del segundo por algo más que el matiz

#### Scenario: El piso de sky es el segmento vacío, no la superficie
- **WHEN** se verifica el paso de relleno de `sky` en su tema
- **THEN** se comprueba que se distingue de un segmento vacío del medidor de nivel, y no se le exige 3:1 contra la fila, el lienzo ni la fila seleccionada

#### Scenario: La excepción se verifica, no se apaga
- **WHEN** un cambio futuro aclara `sky` más allá de su piso
- **THEN** la verificación automática falla el build igual que con los otros tres matices, porque `sky` se comprueba contra su propia regla y no queda fuera de la comprobación

#### Scenario: El acento como único portador de una distinción
- **WHEN** una pieza necesita que el color de acento sea lo único que separa un caso de otro
- **THEN** resuelve el contraste que esa lectura necesita por su cuenta, porque el piso de esta paleta no se lo garantiza

#### Scenario: El tercer matiz supera el piso de contraste
- **WHEN** se verifica el paso de relleno de `blue`, `violet` y `magenta` en su tema contra las superficies donde el sistema coloca un segmento teñido (fila clara, lienzo y fila seleccionada para los valores de claro; fila oscura para los de oscuro)
- **THEN** los tres superan el mínimo de 3:1 de un componente de interfaz, y la verificación automática falla el build si un cambio futuro baja alguno
