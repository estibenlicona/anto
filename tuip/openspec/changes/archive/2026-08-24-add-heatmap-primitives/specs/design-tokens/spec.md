## ADDED Requirements

### Requirement: Escala de atención graduada
El sistema SHALL definir una escala de atención como vocabulario de color propio, separado del semántico y del de acento, para graduar **cuánta** atención pide algo cuando un solo paso no alcanza. La escala SHALL contener tres pasos de relleno de intensidad creciente —`low`, `medium`, `high`—, previstos para teñir elementos gráficos y no texto, y SHALL distribuirse bajo un prefijo propio que diga a qué vocabulario pertenece el token.

La escala SHALL derivarse de los roles de estado que ya expresan atención en el sistema, de modo que su paso más alto sea el rojo del rol de peligro y los pasos anteriores se lean como versiones atenuadas del mismo mensaje, y no como una familia de color ajena.

Cuando un tema no permita reusar el valor exacto del rol —porque sobre las superficies de ese tema no alcanzaría el contraste mínimo—, el paso más alto SHALL tomarse igualmente de la familia de color del rol de peligro. El mínimo de contraste manda sobre la coincidencia exacta: un paso que no se ve no señala nada.

La escala NO SHALL definir un paso para "sin atención": lo que no pide atención SHALL representarse con la familia neutra. Una escala en la que todo lleva color deja de señalar, y ese es el punto de tener pasos graduados. La documentación SHALL afirmarlo de forma explícita.

La escala de atención NO SHALL sustituir al vocabulario de acento ni a los roles de estado: el acento distingue pasos ordinales sin afirmar nada sobre su estado, un rol de estado afirma un estado sin graduarlo, y la escala de atención gradúa un estado que ya se afirmó.

#### Scenario: Tres pasos de intensidad creciente
- **WHEN** se inspeccionan los pasos de la escala de atención
- **THEN** expone exactamente tres pasos de relleno nombrados por su intensidad, ordenados de menor a mayor

#### Scenario: El paso más alto es el rojo del rol de peligro
- **WHEN** se compara el paso más alto de la escala de atención con el relleno del rol de peligro, en un tema donde ese relleno alcanza el contraste mínimo
- **THEN** resuelven al mismo valor, de modo que el escalón más grave del mapa y una alerta del sistema no se contradigan

#### Scenario: Un tema donde el relleno del rol no se vería
- **WHEN** el relleno del rol de peligro no alcanza el contraste mínimo sobre las superficies de un tema
- **THEN** el paso más alto de ese tema se toma de la misma familia de color, y no de otra

#### Scenario: Lo que no pide atención no lleva color de la escala
- **WHEN** una interfaz representa un elemento que está en orden dentro de una escala de atención
- **THEN** usa la familia neutra y no un cuarto paso de la escala, para que los pasos que sí piden atención destaquen

#### Scenario: La escala de atención no reemplaza al acento
- **WHEN** una interfaz necesita distinguir los pasos de una escala ordinal sin decir que alguno esté mal
- **THEN** usa el vocabulario de acento, no la escala de atención

## MODIFIED Requirements

### Requirement: Contraste de color conforme a WCAG AA
Cada combinación de texto sobre fondo documentada en el sistema de tokens SHALL cumplir con la relación de contraste mínima de WCAG AA: 4.5:1 para texto normal y 3:1 para texto grande o componentes de interfaz. La exigencia SHALL alcanzar tanto a las combinaciones de la capa semántica como a las de los vocabularios de color que viven aparte de ella —identidad, acento y atención—, sin que un vocabulario nuevo pueda entrar al sistema sin verificarse. El cumplimiento SHALL verificarse de forma automática.

Para un paso de un vocabulario no semántico —uno que tiñe un elemento gráfico y no texto—, la verificación SHALL medirlo contra **todas** las superficies del sistema sobre las que puede quedar apoyado, y no sólo contra una elegida como representativa: un paso que sólo se verifica sobre el fondo más favorable no está verificado. El sistema SHALL registrar el valor medido junto al token en la documentación, en vez de dejarlo como una afirmación sin número.

#### Scenario: Verificación de contraste falla
- **WHEN** una combinación documentada de texto/fondo no alcanza la relación de contraste mínima requerida
- **THEN** la verificación automática de tokens falla y reporta qué combinación incumple

#### Scenario: Un vocabulario no semántico también se verifica
- **WHEN** se agrega un matiz nuevo a un vocabulario de color que no es el semántico
- **THEN** sus pasos entran a la verificación automática de contraste, y la verificación falla si alguno queda por debajo del mínimo

#### Scenario: Un paso sin superficie propia se mide contra todas las que puede tocar
- **WHEN** se verifica un paso de acento o de atención, que tiñe un elemento gráfico y no texto
- **THEN** se lo mide contra cada superficie del sistema sobre la que puede quedar apoyado, y la verificación falla si no alcanza el mínimo contra alguna de ellas

#### Scenario: El contraste medido queda registrado
- **WHEN** un usuario consulta la documentación de un paso de color
- **THEN** encuentra el contraste medido de ese paso contra las superficies previstas, expresado como una razón concreta
