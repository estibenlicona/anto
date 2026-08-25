## MODIFIED Requirements

### Requirement: Opciones del componente Progress
El componente Progress SHALL representar un valor de avance entre 0 y 100 como una barra horizontal, SHALL saturar su color a la severidad `danger` en vez de desbordar visualmente la barra cuando el valor supera 100, y SHALL aceptar una opción de relleno de marca que reemplaza el color de severidad por el degradado de marca del sistema. Esa opción SHALL ser explícita: por defecto el componente conserva el relleno por severidad. El componente SHALL aceptar además un umbral de advertencia (`warningFrom`, entre 0 y 100): cuando el valor lo alcanza o supera, y mientras no pase de 100, el relleno por severidad es `warning`; sin el umbral, el relleno es `success` hasta 100 inclusive, como hasta ahora.

Progress SHALL aceptar además un tono de la escala de acento (`tone`): con él, la barra se rellena con el paso de relleno de ese matiz —el mismo que usan LevelMeter y SegmentedBar— sobre la pista neutra, y NO SHALL cambiar de color por severidad ni por umbral, porque una cantidad pintada en acento no afirma estado. `tone` tiene precedencia sobre la opción de relleno de marca.

#### Scenario: Relleno por tono de acento
- **WHEN** Progress recibe `tone="blue"` y un valor que supera `warningFrom`
- **THEN** la barra se rellena en el paso de relleno de `blue` y no en advertencia ni peligro

#### Scenario: Valor dentro de rango
- **WHEN** Progress recibe un valor entre 0 y 100
- **THEN** la porción rellena de la barra es proporcional a ese valor

#### Scenario: Valor sobre el límite
- **WHEN** Progress recibe un valor mayor a 100
- **THEN** la barra se muestra completamente llena con el color de severidad `danger`, sin desbordar su contenedor

#### Scenario: Relleno de marca
- **WHEN** Progress recibe la opción de relleno de marca
- **THEN** la porción rellena usa el degradado de marca en vez del color de severidad

#### Scenario: Umbral de advertencia
- **WHEN** Progress recibe `warningFrom` y un valor igual o mayor que ese umbral pero no mayor que 100
- **THEN** la porción rellena usa el color de severidad `warning`

#### Scenario: Advertir exactamente al tope
- **WHEN** Progress recibe `warningFrom` igual a 100 y un valor de 100
- **THEN** la porción rellena usa `warning`, y un valor mayor a 100 sigue saturando a `danger`

#### Scenario: Sin umbral no hay advertencia
- **WHEN** Progress se usa sin `warningFrom`
- **THEN** conserva `success` para todo valor hasta 100 inclusive, como hasta ahora

#### Scenario: El relleno por severidad es el comportamiento por defecto
- **WHEN** Progress se usa sin especificar la opción de relleno de marca
- **THEN** conserva el relleno por severidad, sin que el consumidor tenga que pedirlo

### Requirement: Opciones del componente Meter
El componente Meter SHALL mostrar un Progress acompañado de su valor como texto (porcentaje con cifras tabulares y peso semibold), en una fila horizontal con un ancho mínimo que evita que la barra colapse dentro de una celda, y SHALL trasladar a Progress el umbral de advertencia (`warningFrom`) y el valor, de modo que la barra y la cifra describan el mismo número. El valor 0 SHALL dejar la barra vacía. Un valor mayor a 100 SHALL saturar la barra a `danger` y mostrar la cifra real.

Meter SHALL trasladar también `tone` a Progress: con un tono de acento, la barra es una cantidad sobre la pista neutra y la cifra sigue describiendo el mismo número, sin señal de estado.

#### Scenario: Utilización como cantidad
- **WHEN** Meter recibe 100 con `tone="blue"`
- **THEN** la barra se rellena completa en el relleno de `blue` y la cifra muestra "100%"

#### Scenario: Valor medio
- **WHEN** Meter recibe 80 con `warningFrom` 100
- **THEN** la barra se rellena al 80 % en `success` y la cifra muestra "80%"

#### Scenario: Exactamente al tope
- **WHEN** Meter recibe 100 con `warningFrom` 100
- **THEN** la barra se rellena completa en `warning` y la cifra muestra "100%"

#### Scenario: Sobreasignado
- **WHEN** Meter recibe 120
- **THEN** la barra se rellena completa en `danger` y la cifra muestra "120%"

#### Scenario: Cero
- **WHEN** Meter recibe 0
- **THEN** la barra queda vacía y la cifra muestra "0%"
