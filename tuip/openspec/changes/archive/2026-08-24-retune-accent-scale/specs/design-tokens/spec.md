## MODIFIED Requirements

### Requirement: Vocabulario de acento sin significado de estado
El sistema SHALL definir una paleta de acento como vocabulario de color propio, separado del semántico, para las escalas ordinales que necesitan distinguir sus pasos por color sin afirmar nada sobre el estado de lo que describen. La paleta SHALL contener cuatro matices nombrados por su color —`sky`, `blue`, `violet` y `magenta`— y cada matiz SHALL exponer un paso de relleno, previsto para teñir elementos gráficos y no texto.

Cada matiz SHALL tener un valor de relleno por tema (claro y oscuro), de modo que en cada tema el paso alcance el contraste mínimo de un componente de interfaz (3:1) contra todas las superficies sobre las que el sistema lo coloca: fila, lienzo y fila seleccionada en claro; fila en oscuro. La verificación automática SHALL comprobar las cuatro combinaciones de cada tema y fallar el build cuando un valor baje del piso.

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

#### Scenario: El tercer matiz supera el piso de contraste
- **WHEN** se verifica el paso de relleno de cada matiz en su tema contra las superficies donde el sistema coloca un segmento teñido (fila clara, lienzo y fila seleccionada para los valores de claro; fila oscura para los de oscuro)
- **THEN** todos superan el mínimo de 3:1 de un componente de interfaz —incluido `sky`, el más claro, que por eso no es el celeste pálido de la referencia sino uno que llega al piso— y la verificación automática falla el build si un cambio futuro lo baja
