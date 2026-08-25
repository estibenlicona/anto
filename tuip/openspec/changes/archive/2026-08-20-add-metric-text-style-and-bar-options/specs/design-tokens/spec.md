## MODIFIED Requirements

### Requirement: Escala tipográfica del sistema
El sistema SHALL definir una escala tipográfica cerrada de estilos con nombre, cada uno con tamaño, alto de línea y peso definidos, que cubra el título de pantalla, los títulos de sección y de tarjeta, el cuerpo, el cuerpo pequeño, la etiqueta y las cifras. El estilo de cifra SHALL ser un estilo propio, distinto del título de pantalla, para que una cifra dominante no tome prestado el rol de este último. La escala SHALL usar un conjunto acotado de pesos.

#### Scenario: Uso de un estilo de la escala
- **WHEN** un componente necesita renderizar el título de una tarjeta
- **THEN** usa el estilo de la escala que corresponde a ese rol, en vez de combinar manualmente tamaño, peso y alto de línea

#### Scenario: La escala es cerrada
- **WHEN** quien construye una interfaz necesita un tamaño que la escala no define
- **THEN** el sistema no ofrece ese tamaño, y la escala se mantiene sin valores intermedios

#### Scenario: Cifra dominante de un indicador
- **WHEN** una interfaz necesita mostrar la cifra dominante de un indicador, como el valor principal de una tarjeta de resumen
- **THEN** usa el estilo de cifra de la escala, que define su propio tamaño, alto de línea y peso, en vez del estilo de título de pantalla

## ADDED Requirements

### Requirement: Degradado de marca con nombre
El sistema SHALL definir un token de degradado de marca con nombre, cuyos extremos SHALL derivar de pasos de la escala primitiva de marca y nunca de valores hexadecimales sueltos. El degradado SHALL estar reservado a rellenos decorativos y no SHALL usarse donde el color comunique severidad.

#### Scenario: Aplicar el degradado de marca
- **WHEN** un componente necesita un relleno de marca con transición de color
- **THEN** usa el token de degradado, cuyos extremos provienen de la escala primitiva de marca

#### Scenario: El degradado no comunica severidad
- **WHEN** un elemento usa el color para indicar un estado, como estar dentro de rango o excedido
- **THEN** usa los tokens de severidad correspondientes y no el degradado de marca
