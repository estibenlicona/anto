## Purpose

Define y distribuye los tokens de identidad visual de Tuya CA (color, tipografía, espaciado, radios, sombras, elevación, motion) como una fuente única de verdad consumible por los componentes y por cualquier aplicación que integre el sistema de diseño, con una arquitectura de dos capas (primitivos → semánticos) equivalente en madurez a la de Atlassian Design System.
## Requirements
### Requirement: Tokens definidos como fuente única
El sistema SHALL definir los tokens de marca de Tuya CA (color, tipografía, espaciado, radio de bordes, sombras, ancho de borde, elevación, motion, breakpoints) en una fuente única versionada dentro del paquete de tokens.

#### Scenario: Un token cambia de valor
- **WHEN** se actualiza el valor de un token (ej. el color primario de marca) en la fuente de tokens
- **THEN** todos los componentes que usan ese token reflejan el nuevo valor sin requerir cambios en su propio código

### Requirement: Paleta primitiva de color
El sistema SHALL definir una paleta primitiva de color: escalas numeradas crudas para las familias `neutral`, `brand`, `danger`, `warning`, `success`, `info` y `discovery`. La familia `brand` SHALL ser la de la marca Tuya. Los tokens semánticos de color SHALL derivar sus valores exclusivamente de esta paleta primitiva, nunca de valores hexadecimales sueltos.

#### Scenario: Un token semántico referencia un primitivo
- **WHEN** se inspecciona el valor de un token semántico de color
- **THEN** su valor corresponde a un paso específico de una escala primitiva, no a un color definido de forma independiente

#### Scenario: La marca es la de Tuya
- **WHEN** se inspecciona el paso de la escala primitiva de marca que alimenta la acción principal
- **THEN** su valor es el rojo de la marca Tuya, no el de otro sistema de diseño

### Requirement: Tokens semánticos de color por rol y variante
El sistema SHALL exponer tokens semánticos de color organizados por propiedad (`bg`, `text`, `border`, `icon`), rol (`neutral`, `brand`, `danger`, `warning`, `success`, `info`, `discovery`), énfasis (`subtle`, `default`, `strong`, `bold`) y estado (`hover`, `pressed`, `disabled`, `selected`), de modo que cada combinación tenga un nombre estable y predecible.

El nombre de un token SHALL describir su rol y no su apariencia, de modo que siga siendo cierto cuando cambie el tema.

#### Scenario: Consumo de un token semántico desde un componente
- **WHEN** un componente necesita el fondo de una acción primaria
- **THEN** usa el token semántico de fondo de marca en su énfasis mayor, en vez de un valor de color embebido

#### Scenario: Paso intermedio de la marca
- **WHEN** un componente necesita un relleno de marca de menor intensidad que el principal, sin ser una tinta de fondo
- **THEN** usa el token semántico de fondo de marca en su énfasis `strong`, definido en ambos temas, en vez de aplicar opacidad al énfasis mayor

#### Scenario: El nombre no describe la apariencia
- **WHEN** se inspecciona el nombre de un token semántico de color
- **THEN** nombra su propiedad, su rol, su énfasis y su estado, sin nombrar el color que toma en un tema concreto

### Requirement: Degradado de marca con nombre
El sistema SHALL definir un token de degradado de marca con nombre, cuyos extremos SHALL derivar de pasos de la escala primitiva de marca y nunca de valores hexadecimales sueltos. El degradado SHALL estar reservado a rellenos decorativos y no SHALL usarse donde el color comunique severidad.

#### Scenario: Aplicar el degradado de marca
- **WHEN** un componente necesita un relleno de marca con transición de color
- **THEN** usa el token de degradado, cuyos extremos provienen de la escala primitiva de marca

#### Scenario: El degradado no comunica severidad
- **WHEN** un elemento usa el color para indicar un estado, como estar dentro de rango o excedido
- **THEN** usa los tokens de severidad correspondientes y no el degradado de marca

### Requirement: Tokens de estado de interacción
El sistema SHALL definir variantes `hover` y `pressed` para los tokens semánticos de fondo de los roles `brand`, `neutral` y `danger`, que son los roles usados por componentes interactivos (botones, campos, elementos seleccionables y acciones destructivas).

#### Scenario: Estado hover de una acción primaria
- **WHEN** un usuario pasa el cursor sobre un elemento que usa `color.background.brand.bold`
- **THEN** el elemento cambia a `color.background.brand.bold.hover` sin que el componente defina ese color de forma independiente

#### Scenario: Estado hover de una acción destructiva
- **WHEN** un usuario pasa el cursor sobre un elemento que usa `color.background.danger.bold`
- **THEN** el elemento cambia a `color.background.danger.bold.hover`, y el texto sobre ese fondo sigue cumpliendo el contraste mínimo exigido

### Requirement: Tokens distribuidos como CSS Variables
El sistema SHALL exponer todos los tokens (primitivos y semánticos) como CSS Variables agrupadas por categoría, de modo que puedan consumirse desde Tailwind CSS o CSS plano. El nombre de cada variable SHALL seguir un esquema uniforme y legible en voz alta.

#### Scenario: Consumo de un token de color desde Tailwind
- **WHEN** un componente usa una clase de Tailwind mapeada a un token semántico de color
- **THEN** el valor renderizado corresponde a la CSS Variable definida por el paquete de tokens

#### Scenario: Deducir el nombre de una variable
- **WHEN** quien construye una interfaz conoce la propiedad, el rol, el énfasis y el estado que necesita
- **THEN** puede deducir el nombre de la CSS Variable correspondiente sin consultar un listado

### Requirement: Familias tipográficas servidas por el sistema
El sistema SHALL definir una familia tipográfica para toda la interfaz y una monoespaciada reservada a cadenas literales, y SHALL servirlas él mismo en vez de suponerlas instaladas en la máquina de quien consume el sistema.

#### Scenario: La tipografía no depende de la máquina
- **WHEN** una aplicación consumidora se abre en un equipo que no tiene instaladas las familias del sistema
- **THEN** la interfaz se muestra con las familias del sistema, no con una tipografía de reemplazo

#### Scenario: La monoespaciada está reservada
- **WHEN** quien construye una interfaz consulta cuándo usar la familia monoespaciada
- **THEN** la documentación la reserva a cadenas literales, y no a cifras de negocio

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

### Requirement: Cifras tabulares en datos de negocio
El sistema SHALL definir un tratamiento tipográfico para las cifras de negocio en el que cada dígito ocupa el mismo ancho, de modo que las columnas de números se comparen verticalmente sin recurrir a una familia monoespaciada.

#### Scenario: Comparar una columna de cifras
- **WHEN** un usuario recorre una columna de valores numéricos en una tabla
- **THEN** los dígitos quedan alineados en columna, permitiendo comparar las magnitudes de un vistazo

### Requirement: Elevación con nombre
El sistema SHALL definir tokens de elevación con nombre (`elevation.surface.raised`, `elevation.surface.overlay`, `elevation.surface.sunken`), cada uno combinando un color de fondo y una sombra coherentes entre sí.

#### Scenario: Aplicar elevación a un contenedor
- **WHEN** un componente necesita destacarse visualmente sobre el fondo de la página (ej. una tarjeta)
- **THEN** usa un token `elevation.surface.*` que define fondo y sombra de forma conjunta, en vez de combinar manualmente tokens de color y sombra sueltos

### Requirement: La escala de elevación se proyecta desde arriba
Cada escalón de la escala de sombras SHALL leerse como luz que viene de arriba: su presencia por debajo del elemento SHALL ser notoriamente mayor que por sus costados, y no SHALL asomar por encima del borde superior. Un escalón cuyo difuminado se derrama tanto hacia los lados como hacia abajo se percibe como un halo sucio alrededor del contorno en vez de como elevación, y contradice al resto de la escala.

#### Scenario: Un escalón de la escala se proyecta
- **WHEN** se compara la extensión de cualquier escalón de sombra por debajo del elemento contra la que tiene por sus costados
- **THEN** la de abajo es notoriamente mayor, y por encima del borde superior no asoma sombra

#### Scenario: Los escalones son coherentes entre sí
- **WHEN** se comparan los escalones de la escala entre sí
- **THEN** todos comparten el mismo carácter direccional, diferenciándose por intensidad y distancia y no por la forma en que se reparten alrededor del elemento

### Requirement: Tokens de motion
El sistema SHALL definir tokens de duración (`motion.duration.fast`, `.normal`, `.slow`) y de curva de animación (`motion.easing.standard`, `.entrance`, `.exit`) para transiciones de interfaz.

#### Scenario: Transición de estado usando tokens de motion
- **WHEN** un componente anima un cambio de estado (ej. hover, apertura de un overlay)
- **THEN** la duración y la curva de animación provienen de los tokens `motion.*`, no de valores hardcoded en el componente

### Requirement: Ancho de borde
El sistema SHALL definir al menos dos tokens de ancho de borde (`border.width.default`, `border.width.bold`), y todo componente del catálogo que dibuje un borde SHALL consumirlos por nombre en vez de la clase de ancho de borde nativa del framework de estilos o un valor de píxeles hardcoded.

#### Scenario: Borde estándar
- **WHEN** un componente dibuja un borde en su estado normal
- **THEN** usa `border.width.default` en vez de la clase nativa de ancho de borde del framework de estilos

#### Scenario: Borde destacado
- **WHEN** un componente necesita un borde más prominente que el estándar (ej. un estado de error)
- **THEN** usa `border.width.bold` en vez de un valor de píxeles hardcoded

### Requirement: Escala de radio de esquinas
El sistema SHALL definir una escala de radio de esquinas con cuatro pasos con nombre — `none` (0px), `control` (8px), `surface` (12px) y `pill` (círculo completo) — y SHALL documentar a qué tipo de elemento corresponde cada paso: `control` para controles y campos, `surface` para tarjetas, modales y menús, `pill` exclusivo de chips y avatares. Todo componente del catálogo que dibuje esquinas redondeadas SHALL usar el paso de esta escala que le corresponde, nunca un valor de radio nativo del framework de estilos ni un valor de píxeles hardcoded.

#### Scenario: Un control usa el paso que le corresponde
- **WHEN** se inspecciona el radio de esquinas de un control o campo del catálogo
- **THEN** su valor es el del paso `control` de la escala

#### Scenario: Una superficie usa el paso que le corresponde
- **WHEN** se inspecciona el radio de esquinas de una tarjeta, modal o menú del catálogo
- **THEN** su valor es el del paso `surface` de la escala

#### Scenario: Ningún componente usa un radio suelto
- **WHEN** se inspecciona la clase de radio de esquinas de cualquier componente del catálogo
- **THEN** corresponde a uno de los cuatro pasos con nombre de la escala, nunca a un valor nativo del framework de estilos ni a un valor de píxeles hardcoded

### Requirement: Trazo de límite translúcido
El sistema SHALL exponer un token de borde neutro translúcido, destinado a insinuar el límite de un control o de un contenedor sin declararlo con el peso de un trazo opaco. Por ser translúcido SHALL componerse sobre la superficie que tenga debajo, de modo que un mismo valor sirva en modo claro y en modo oscuro sin definirse dos veces. Este token NO SHALL presentarse como apto para cumplir el mínimo de contraste de elementos no textuales: su propósito es de refinamiento visual, y la documentación SHALL decirlo para que nadie lo elija creyendo que delimita un componente de forma accesible.

#### Scenario: Se comporta igual en ambos modos
- **WHEN** el trazo translúcido se dibuja sobre una superficie clara y sobre una oscura
- **THEN** en cada caso se compone sobre la superficie que tiene debajo y conserva una presencia equivalente, sin requerir un valor propio por modo

#### Scenario: No se ofrece como límite accesible
- **WHEN** alguien consulta la documentación de tokens para elegir el borde de un control
- **THEN** el trazo translúcido aparece descrito como refinamiento visual, y se distingue de los trazos que sí alcanzan el mínimo para delimitar un componente

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

### Requirement: Anillo de foco derivado del color del control
El sistema SHALL exponer tonos de anillo de foco derivados de los colores base sobre los que se construyen los controles —el de marca, el destructivo y el neutro—, cada uno translúcido, de modo que un control enfocado se destaque en su propio tono en vez de en un color ajeno al que lo pinta. El anillo de foco SHALL dibujarse contra el borde del control, sin separación intermedia.

#### Scenario: El anillo toma el tono del control
- **WHEN** un control cuyo color base es el de marca recibe el foco
- **THEN** su anillo se dibuja en el tono translúcido derivado del color de marca, y no en un color que el control no usa en ningún otro estado

#### Scenario: El anillo se apoya en el borde
- **WHEN** un control enfocado muestra su anillo
- **THEN** el anillo arranca en el borde del control, sin una franja intermedia que lo separe

### Requirement: Capa de token de componente
El sistema SHALL admitir una tercera capa de tokens, propia de un componente, para la excepción que la capa semántica no cubre. Esa capa SHALL derivar siempre de la semántica y SHALL entenderse como señal de que la capa semántica está incompleta cuando se vuelve numerosa.

#### Scenario: Un componente necesita apartarse
- **WHEN** un componente necesita un valor que la capa semántica no expresa
- **THEN** define un token propio que referencia un token semántico, en vez de un valor crudo

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

### Requirement: Tokens instalables en un proyecto consumidor
El sistema SHALL permitir que una aplicación React externa incorpore el archivo de tokens (CSS Variables) en su proyecto mediante el CLI, sin requerir configuración manual adicional más allá de importar el archivo generado.

#### Scenario: Inicialización de tokens en una app nueva
- **WHEN** el usuario ejecuta el comando de inicialización del CLI en una app React sin tokens previos
- **THEN** el archivo de CSS Variables de Tuya CA se agrega al proyecto y queda listo para ser importado

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

### Requirement: El preset de Tailwind expone exclusivamente el vocabulario de tuip
El preset de Tailwind SHALL reemplazar la paleta de color nativa de Tailwind en vez de extenderla, de modo que sólo los tokens semánticos de tuip —y los primitivos de CSS que el catálogo necesita, `transparent` y `current`— compilen a una utilidad de color. Un nombre de color de la paleta por defecto de Tailwind que no sea también un rol de tuip NO SHALL compilar a ninguna regla, en ningún proyecto que use el preset.

El cierre de la paleta SHALL verificarse de forma automática y no depender de que nadie escriba una clase nativa: una configuración que deje de cerrarla no falla al compilar —simplemente vuelve a aceptar toda la paleta—, así que sin una comprobación propia la regresión pasa inadvertida.

#### Scenario: Un color nativo de Tailwind no compila
- **WHEN** un componente escribe una clase con un color de la paleta nativa de Tailwind que no es un rol de tuip, como `bg-blue-500` o `text-purple-600`
- **THEN** esa clase no genera ninguna regla CSS

#### Scenario: Los primitivos de CSS siguen disponibles
- **WHEN** un componente escribe `transparent` o `current` como valor de color en cualquier propiedad
- **THEN** la clase compila normalmente, porque ninguno de los dos es un color de marca que compita con el vocabulario de tuip

#### Scenario: El vocabulario de tuip sigue completo
- **WHEN** un componente usa cualquier token semántico ya definido por tuip, en cualquier propiedad de color
- **THEN** la clase compila igual que antes de este cambio, sin que el cierre de la paleta nativa afecte al vocabulario propio

#### Scenario: La paleta se reabre sin que nadie lo note
- **WHEN** un cambio de configuración deja de cerrar la paleta nativa
- **THEN** la verificación automática falla y dice qué color nativo volvió a compilar, en vez de dejar que el sistema acepte en silencio un vocabulario que documenta como cerrado

### Requirement: Las utilidades publicadas no se componen con las del consumidor
El paquete distribuye su hoja de estilos con las utilidades ya generadas, y el proyecto que lo consume genera además las suyas. Una misma clase puede quedar definida en las dos hojas. Cuando eso ocurre, las dos definiciones SHALL ser equivalentes: SHALL declarar las mismas propiedades CSS, de modo que aplicarlas dos veces produzca el mismo resultado que aplicarlas una.

El sistema SHALL verificar esta condición de forma automática y SHALL fallar cuando una misma clase resuelva a propiedades distintas en las dos hojas. Sin esa verificación el síntoma aparece lejos de la causa: un elemento corrido en una pantalla cualquiera, sin ningún error que lo señale.

#### Scenario: La misma clase en las dos hojas
- **WHEN** una clase de utilidad está definida tanto en la hoja publicada como en la que genera el proyecto consumidor
- **THEN** ambas declaran las mismas propiedades CSS, y el elemento que la lleva se dibuja igual que si estuviera definida una sola vez

#### Scenario: Dos implementaciones de la misma clase
- **WHEN** una clase queda definida en las dos hojas con propiedades distintas, como una que desplaza con `transform` y otra que desplaza con `translate`
- **THEN** la verificación automática falla y nombra la clase y las propiedades en conflicto

#### Scenario: Un desplazamiento no se aplica dos veces
- **WHEN** un componente del catálogo se centra desplazándose la mitad de su tamaño y el proyecto consumidor define esa misma utilidad
- **THEN** el componente queda centrado, y no desplazado el doble

