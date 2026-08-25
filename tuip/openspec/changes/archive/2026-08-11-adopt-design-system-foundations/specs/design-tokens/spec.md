## ADDED Requirements

### Requirement: Familias tipográficas servidas por el sistema
El sistema SHALL definir una familia tipográfica para toda la interfaz y una monoespaciada reservada a cadenas literales, y SHALL servirlas él mismo en vez de suponerlas instaladas en la máquina de quien consume el sistema.

#### Scenario: La tipografía no depende de la máquina
- **WHEN** una aplicación consumidora se abre en un equipo que no tiene instaladas las familias del sistema
- **THEN** la interfaz se muestra con las familias del sistema, no con una tipografía de reemplazo

#### Scenario: La monoespaciada está reservada
- **WHEN** quien construye una interfaz consulta cuándo usar la familia monoespaciada
- **THEN** la documentación la reserva a cadenas literales, y no a cifras de negocio

### Requirement: Escala tipográfica del sistema
El sistema SHALL definir una escala tipográfica cerrada de estilos con nombre, cada uno con tamaño, alto de línea y peso definidos, que cubra el título de pantalla, los títulos de sección y de tarjeta, el cuerpo, el cuerpo pequeño, la etiqueta y las cifras. La escala SHALL usar un conjunto acotado de pesos.

#### Scenario: Uso de un estilo de la escala
- **WHEN** un componente necesita renderizar el título de una tarjeta
- **THEN** usa el estilo de la escala que corresponde a ese rol, en vez de combinar manualmente tamaño, peso y alto de línea

#### Scenario: La escala es cerrada
- **WHEN** quien construye una interfaz necesita un tamaño que la escala no define
- **THEN** el sistema no ofrece ese tamaño, y la escala se mantiene sin valores intermedios

### Requirement: Cifras tabulares en datos de negocio
El sistema SHALL definir un tratamiento tipográfico para las cifras de negocio en el que cada dígito ocupa el mismo ancho, de modo que las columnas de números se comparen verticalmente sin recurrir a una familia monoespaciada.

#### Scenario: Comparar una columna de cifras
- **WHEN** un usuario recorre una columna de valores numéricos en una tabla
- **THEN** los dígitos quedan alineados en columna, permitiendo comparar las magnitudes de un vistazo

### Requirement: Alias semánticos de espaciado
El sistema SHALL exponer, sobre la escala de espaciado, un conjunto de alias con nombre que expresan la relación entre los elementos que separan —desde lo pegado hasta el cierre inferior de la página—, y la documentación SHALL indicar que al maquetar se elige el alias y no el valor de la escala.

#### Scenario: Elegir separación por su relación
- **WHEN** quien construye una interfaz necesita separar una etiqueta de su campo
- **THEN** elige el alias que expresa esa relación, en vez de un valor numérico de la escala

#### Scenario: Recalibrar el espaciado del sistema
- **WHEN** se cambia el valor al que apunta un alias de espaciado
- **THEN** todas las interfaces que usan ese alias reflejan la nueva separación sin editar pantalla alguna

#### Scenario: La pertenencia se lee por el espacio
- **WHEN** quien construye una interfaz consulta cómo separar elementos de un mismo grupo frente a grupos distintos
- **THEN** la documentación establece que el salto dentro de un grupo es menor que el salto entre grupos

### Requirement: Alturas de control
El sistema SHALL definir un conjunto cerrado de alturas de control con su uso previsto, y SHALL documentar el área de toque mínima exigible en táctil aunque el control se vea más pequeño.

#### Scenario: Altura según el contexto del control
- **WHEN** quien construye una interfaz necesita un control dentro de una tabla y otro para la acción principal de una pantalla
- **THEN** el sistema le da una altura distinta para cada contexto

#### Scenario: Área de toque en táctil
- **WHEN** un control se renderiza en un dispositivo táctil con una altura menor que el área de toque mínima
- **THEN** su área activable alcanza igualmente el mínimo documentado

### Requirement: Anchos máximos por tipo de contenido
El sistema SHALL definir anchos máximos con nombre según el tipo de contenido —texto de lectura, formulario, panel de detalle y página—, y SHALL dejar sin tope el contenido tabular.

#### Scenario: El texto de lectura se topa
- **WHEN** una página de texto corrido se muestra en una pantalla muy ancha
- **THEN** la línea de texto deja de crecer al alcanzar su ancho máximo, para no perder el renglón

#### Scenario: Los datos aprovechan el ancho
- **WHEN** una tabla se muestra en una pantalla muy ancha
- **THEN** sigue creciendo en vez de toparse, de modo que se vean más columnas

### Requirement: Capas de superposición
El sistema SHALL definir un conjunto cerrado y ordenado de capas con nombre para los elementos que se superponen —desde el contenido hasta las notificaciones—, sin valores intermedios.

#### Scenario: Superponer un elemento
- **WHEN** un componente necesita mostrarse por encima de otro
- **THEN** usa la capa nombrada que le corresponde, en vez de un valor de profundidad arbitrario

#### Scenario: Orden entre superficies superpuestas
- **WHEN** un menú se abre dentro de un panel superpuesto
- **THEN** el menú se muestra por encima del panel, según el orden que definen las capas

### Requirement: Puntos de quiebre
El sistema SHALL definir los puntos de quiebre del layout con su número de columnas y con lo que cambia en cada rango, incluido el rango objetivo para el que se diseñan las pantallas.

#### Scenario: Consultar qué cambia en un rango
- **WHEN** quien diseña una pantalla consulta el comportamiento en un ancho determinado
- **THEN** encuentra cuántas columnas hay y qué elementos de la estructura cambian en ese rango

### Requirement: Foco visible definido desde el token
El sistema SHALL definir el anillo de foco —su grosor, su separación del control y su color— como token, de modo que todo control lo aplique de la misma forma y no lo resuelva por su cuenta.

#### Scenario: Foco al navegar con teclado
- **WHEN** un usuario mueve el foco a cualquier control con el teclado
- **THEN** ve un anillo de foco con el grosor y la separación que define el token, sin depender de la implementación de ese control

### Requirement: Capa de token de componente
El sistema SHALL admitir una tercera capa de tokens, propia de un componente, para la excepción que la capa semántica no cubre. Esa capa SHALL derivar siempre de la semántica y SHALL entenderse como señal de que la capa semántica está incompleta cuando se vuelve numerosa.

#### Scenario: Un componente necesita apartarse
- **WHEN** un componente necesita un valor que la capa semántica no expresa
- **THEN** define un token propio que referencia un token semántico, en vez de un valor crudo

## MODIFIED Requirements

### Requirement: Paleta primitiva de color
El sistema SHALL definir una paleta primitiva de color: escalas numeradas crudas para las familias `neutral`, `brand`, `danger`, `warning`, `success`, `info` y `discovery`. La familia `brand` SHALL ser la de la marca Tuya. Los tokens semánticos de color SHALL derivar sus valores exclusivamente de esta paleta primitiva, nunca de valores hexadecimales sueltos.

#### Scenario: Un token semántico referencia un primitivo
- **WHEN** se inspecciona el valor de un token semántico de color
- **THEN** su valor corresponde a un paso específico de una escala primitiva, no a un color definido de forma independiente

#### Scenario: La marca es la de Tuya
- **WHEN** se inspecciona el paso de la escala primitiva de marca que alimenta la acción principal
- **THEN** su valor es el rojo de la marca Tuya, no el de otro sistema de diseño

### Requirement: Tokens semánticos de color por rol y variante
El sistema SHALL exponer tokens semánticos de color organizados por propiedad (`bg`, `text`, `border`, `icon`), rol (`neutral`, `brand`, `danger`, `warning`, `success`, `info`, `discovery`), énfasis (`subtle`, `default`, `bold`) y estado (`hover`, `pressed`, `disabled`, `selected`), de modo que cada combinación tenga un nombre estable y predecible.

El nombre de un token SHALL describir su rol y no su apariencia, de modo que siga siendo cierto cuando cambie el tema.

#### Scenario: Consumo de un token semántico desde un componente
- **WHEN** un componente necesita el fondo de una acción primaria
- **THEN** usa el token semántico de fondo de marca en su énfasis mayor, en vez de un valor de color embebido

#### Scenario: El nombre no describe la apariencia
- **WHEN** se inspecciona el nombre de un token semántico de color
- **THEN** nombra su propiedad, su rol, su énfasis y su estado, sin nombrar el color que toma en un tema concreto

### Requirement: Tokens distribuidos como CSS Variables
El sistema SHALL exponer todos los tokens (primitivos y semánticos) como CSS Variables agrupadas por categoría, de modo que puedan consumirse desde Tailwind CSS o CSS plano. El nombre de cada variable SHALL seguir un esquema uniforme y legible en voz alta.

#### Scenario: Consumo de un token de color desde Tailwind
- **WHEN** un componente usa una clase de Tailwind mapeada a un token semántico de color
- **THEN** el valor renderizado corresponde a la CSS Variable definida por el paquete de tokens

#### Scenario: Deducir el nombre de una variable
- **WHEN** quien construye una interfaz conoce la propiedad, el rol, el énfasis y el estado que necesita
- **THEN** puede deducir el nombre de la CSS Variable correspondiente sin consultar un listado

### Requirement: Soporte de modo claro y oscuro
El sistema SHALL definir valores de tokens semánticos de color tanto para modo claro como para modo oscuro, manteniendo los mismos nombres de rol y variante en ambos modos. El modo oscuro SHALL construirse como un conjunto propio de valores y no como la inversión del claro: las superficies SHALL distinguirse entre sí por su claridad en vez de por sombras, los acentos SHALL aclararse para sostener el contraste sobre fondo oscuro, y el texto SHALL no alcanzar el blanco puro.

#### Scenario: Cambio de tema
- **WHEN** la aplicación consumidora activa el modo oscuro
- **THEN** las CSS Variables de color resuelven a los valores definidos para modo oscuro sin que el componente necesite lógica adicional

#### Scenario: Las superficies se distinguen por claridad
- **WHEN** en modo oscuro se superpone una superficie elevada sobre el lienzo
- **THEN** se distingue por ser más clara que el fondo, no por proyectar una sombra

#### Scenario: El texto claro no es blanco puro
- **WHEN** se inspecciona el token de texto principal en modo oscuro
- **THEN** su valor no es blanco puro

## REMOVED Requirements

### Requirement: Escala tipográfica de encabezados
**Reason**: La escala de seis pasos de encabezado, independiente de la escala de texto de interfaz, no es la que define el sistema de diseño. La definición establece una escala única y cerrada de siete estilos que cubre desde el título de pantalla hasta la etiqueta y las cifras, con un solo título de pantalla por vista. Mantener dos escalas paralelas —encabezados por un lado, tamaños de texto por otro— permitía componer combinaciones que la definición no contempla. Se reemplaza por el requisito "Escala tipográfica del sistema".

**Migration**: Los estilos de encabezado siguen existiendo dentro de la escala nueva, con menos pasos y con nombres que enuncian su rol. Cada uso de un token `heading.*` se traduce al estilo de la escala nueva que corresponde a ese rol; los pasos que no tienen equivalente indican una jerarquía que la definición resuelve cambiando de nivel en la pantalla, no agregando un tamaño.
