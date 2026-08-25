## Purpose

Define y distribuye los tokens de identidad visual de Tuya CA (color, tipografía, espaciado, radios, sombras, elevación, motion) como una fuente única de verdad consumible por los componentes y por cualquier aplicación que integre el sistema de diseño, con una arquitectura de dos capas (primitivos → semánticos) equivalente en madurez a la de Atlassian Design System.

## ADDED Requirements

### Requirement: Tokens definidos como fuente única
El sistema SHALL definir los tokens de marca de Tuya CA (color, tipografía, espaciado, radio de bordes, sombras, ancho de borde, elevación, motion, breakpoints) en una fuente única versionada dentro del paquete de tokens.

#### Scenario: Un token cambia de valor
- **WHEN** se actualiza el valor de un token (ej. el color primario de marca) en la fuente de tokens
- **THEN** todos los componentes que usan ese token reflejan el nuevo valor sin requerir cambios en su propio código

### Requirement: Paleta primitiva de color
El sistema SHALL definir una paleta primitiva de color: escalas numeradas crudas para las familias `neutral`, `brand`, `danger`, `warning`, `success` y `discovery`. Los tokens semánticos de color SHALL derivar sus valores exclusivamente de esta paleta primitiva, nunca de valores hexadecimales sueltos.

#### Scenario: Un token semántico referencia un primitivo
- **WHEN** se inspecciona el valor de un token semántico de color (ej. `color.background.brand.bold`)
- **THEN** su valor corresponde a un paso específico de la escala primitiva `brand` (ej. `brand.700`), no a un color definido de forma independiente

### Requirement: Tokens semánticos de color por rol y variante
El sistema SHALL exponer tokens semánticos de color organizados por categoría (`background`, `text`, `border`, `icon`), rol (`neutral`, `brand`, `danger`, `warning`, `success`, `discovery`) y variante (`default`, `subtle`, `bold`, `subtlest`, `disabled`, `inverse`, `selected`), de modo que cada combinación tenga un nombre estable y predecible.

#### Scenario: Consumo de un token semántico desde un componente
- **WHEN** un componente necesita el fondo de una acción primaria
- **THEN** usa el token `color.background.brand.bold` (o su equivalente en Tailwind) en vez de un valor de color embebido

### Requirement: Tokens de estado de interacción
El sistema SHALL definir variantes `hover` y `pressed` para los tokens semánticos de fondo de los roles `brand` y `neutral`, que son los roles usados por componentes interactivos (botones, campos, elementos seleccionables).

#### Scenario: Estado hover de una acción primaria
- **WHEN** un usuario pasa el cursor sobre un elemento que usa `color.background.brand.bold`
- **THEN** el elemento cambia a `color.background.brand.bold.hover` sin que el componente defina ese color de forma independiente

### Requirement: Tokens distribuidos como CSS Variables
El sistema SHALL exponer todos los tokens (primitivos y semánticos) como CSS Variables agrupadas por categoría, de modo que puedan consumirse desde Tailwind CSS o CSS plano.

#### Scenario: Consumo de un token de color desde Tailwind
- **WHEN** un componente usa una clase de Tailwind mapeada a un token semántico de color
- **THEN** el valor renderizado corresponde a la CSS Variable definida por el paquete de tokens

### Requirement: Escala tipográfica de encabezados
El sistema SHALL definir una escala de tokens de tipografía para encabezados (`heading.xxsmall` a `heading.xxlarge`), independiente de la escala de tamaños de texto de interfaz, cada una con tamaño, peso y alto de línea definidos.

#### Scenario: Uso de un token de encabezado
- **WHEN** un componente de texto necesita renderizarse como encabezado de sección
- **THEN** usa un token `heading.*` en vez de combinar manualmente tamaño, peso y alto de línea

### Requirement: Elevación con nombre
El sistema SHALL definir tokens de elevación con nombre (`elevation.surface.raised`, `elevation.surface.overlay`, `elevation.surface.sunken`), cada uno combinando un color de fondo y una sombra coherentes entre sí.

#### Scenario: Aplicar elevación a un contenedor
- **WHEN** un componente necesita destacarse visualmente sobre el fondo de la página (ej. una tarjeta)
- **THEN** usa un token `elevation.surface.*` que define fondo y sombra de forma conjunta, en vez de combinar manualmente tokens de color y sombra sueltos

### Requirement: Tokens de motion
El sistema SHALL definir tokens de duración (`motion.duration.fast`, `.normal`, `.slow`) y de curva de animación (`motion.easing.standard`, `.entrance`, `.exit`) para transiciones de interfaz.

#### Scenario: Transición de estado usando tokens de motion
- **WHEN** un componente anima un cambio de estado (ej. hover, apertura de un overlay)
- **THEN** la duración y la curva de animación provienen de los tokens `motion.*`, no de valores hardcoded en el componente

### Requirement: Ancho de borde
El sistema SHALL definir al menos dos tokens de ancho de borde (`border.width.default`, `border.width.bold`).

#### Scenario: Borde destacado
- **WHEN** un componente necesita un borde más prominente que el estándar (ej. un estado de error)
- **THEN** usa `border.width.bold` en vez de un valor de píxeles hardcoded

### Requirement: Contraste de color conforme a WCAG AA
Cada combinación semántica de texto sobre fondo documentada en el sistema de tokens SHALL cumplir con la relación de contraste mínima de WCAG AA: 4.5:1 para texto normal y 3:1 para texto grande o componentes de interfaz. El cumplimiento SHALL verificarse de forma automática.

#### Scenario: Verificación de contraste falla
- **WHEN** una combinación semántica documentada de texto/fondo no alcanza la relación de contraste mínima requerida
- **THEN** la verificación automática de tokens falla y reporta qué combinación incumple

### Requirement: Tokens instalables en un proyecto consumidor
El sistema SHALL permitir que una aplicación React externa incorpore el archivo de tokens (CSS Variables) en su proyecto mediante el CLI, sin requerir configuración manual adicional más allá de importar el archivo generado.

#### Scenario: Inicialización de tokens en una app nueva
- **WHEN** el usuario ejecuta el comando de inicialización del CLI en una app React sin tokens previos
- **THEN** el archivo de CSS Variables de Tuya CA se agrega al proyecto y queda listo para ser importado

### Requirement: Soporte de modo claro y oscuro
El sistema SHALL definir valores de tokens semánticos de color tanto para modo claro como para modo oscuro, manteniendo los mismos nombres de rol y variante en ambos modos.

#### Scenario: Cambio de tema
- **WHEN** la aplicación consumidora activa el modo oscuro
- **THEN** las CSS Variables de color resuelven a los valores definidos para modo oscuro sin que el componente necesite lógica adicional
