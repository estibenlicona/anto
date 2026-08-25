## ADDED Requirements

### Requirement: Paleta de acento sin significado de estado
El sistema SHALL definir una paleta de acento como vocabulario de color propio, separado del semántico, para las escalas ordinales que necesitan distinguir sus pasos por color sin afirmar nada sobre el estado de lo que describen. La paleta SHALL contener cuatro matices —`slate`, `blue`, `teal` y `purple`— y cada matiz SHALL exponer un paso de relleno, previsto para teñir elementos gráficos y no texto.

La paleta SHALL ser independiente del tema: un mismo valor por matiz SHALL servir en claro y en oscuro. Eso es posible porque el paso de relleno alcanza el contraste mínimo de un componente de interfaz contra todas las superficies sobre las que el sistema lo coloca, y es preferible a una asignación por tema que tendría que mantenerse sincronizada sin necesitarlo.

Los tokens de acento SHALL distribuirse bajo un prefijo propio, distinto del que usan los tokens semánticos, de modo que el nombre del token diga por sí solo a qué vocabulario pertenece. El nombre SHALL conservar el rol del paso, de modo que agregar un segundo paso más adelante no obligue a renombrar el primero. La paleta de acento NO SHALL sustituir ni duplicar el papel de los roles de estado `success`, `warning`, `danger` e `info`: un matiz de acento no comunica que algo esté bien, en riesgo o roto. La documentación del sistema SHALL afirmar esa distinción de forma explícita en vez de dejarla implícita en los nombres.

#### Scenario: Un paso por matiz, nombrado por su rol
- **WHEN** se inspecciona cualquiera de los cuatro matices de acento
- **THEN** expone un paso de relleno, cuyo nombre dice para qué sirve y no de qué escala salió

#### Scenario: El mismo valor sirve en los dos temas
- **WHEN** la aplicación consumidora cambia entre modo claro y modo oscuro
- **THEN** los matices de acento resuelven al mismo valor en ambos, sin una asignación por tema

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
- **THEN** avanzan de gris a azul, de azul a turquesa y de turquesa a morado, una progresión que se lee como avance y no como escala de riesgo

## MODIFIED Requirements

### Requirement: Contraste de color conforme a WCAG AA
Cada combinación de texto sobre fondo documentada en el sistema de tokens SHALL cumplir con la relación de contraste mínima de WCAG AA: 4.5:1 para texto normal y 3:1 para texto grande o componentes de interfaz. La exigencia SHALL alcanzar tanto a las combinaciones de la capa semántica como a las de los vocabularios de color que viven aparte de ella —identidad y acento—, sin que un vocabulario nuevo pueda entrar al sistema sin verificarse. El cumplimiento SHALL verificarse de forma automática.

Para un paso de un vocabulario no semántico que no lleva superficie propia, la verificación SHALL medirlo contra **todas** las superficies del sistema sobre las que puede quedar apoyado, y no sólo contra una elegida como representativa: un paso que sólo se verifica sobre el fondo más favorable no está verificado. El sistema SHALL registrar el valor medido junto al token en la documentación, en vez de dejarlo como una afirmación sin número.

#### Scenario: Verificación de contraste falla
- **WHEN** una combinación documentada de texto/fondo no alcanza la relación de contraste mínima requerida
- **THEN** la verificación automática de tokens falla y reporta qué combinación incumple

#### Scenario: Un vocabulario no semántico también se verifica
- **WHEN** se agrega un matiz nuevo a un vocabulario de color que no es el semántico
- **THEN** sus pasos entran a la verificación automática de contraste, y la verificación falla si alguno queda por debajo del mínimo

#### Scenario: Un paso sin superficie propia se mide contra todas las que puede tocar
- **WHEN** se verifica un paso de acento, que no trae fondo propio
- **THEN** se lo mide contra cada superficie del sistema sobre la que puede quedar apoyado, y la verificación falla si no alcanza el mínimo contra alguna de ellas

#### Scenario: El contraste medido queda registrado
- **WHEN** un usuario consulta la documentación de un paso de color
- **THEN** encuentra el contraste medido de ese paso contra las superficies previstas, expresado como una razón concreta
