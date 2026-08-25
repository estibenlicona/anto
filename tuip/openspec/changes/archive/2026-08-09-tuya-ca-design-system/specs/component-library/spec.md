## Purpose

Provee el catálogo de componentes React de UI de Tuya UI (Button, Input, Card, Badge), construidos sobre los design tokens de marca, listos para ser copiados a proyectos consumidores mediante el CLI.

## ADDED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card y Badge.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card y Badge aparecen como componentes instalables

### Requirement: Componentes basados en design tokens
Cada componente SHALL usar exclusivamente los design tokens de Tuya CA (vía clases de Tailwind o CSS Variables) para color, tipografía, espaciado, radio y sombra — sin valores de estilo embebidos que no provengan de un token.

#### Scenario: Cambio de token de marca se refleja en el componente
- **WHEN** un token de color usado por Button cambia de valor
- **THEN** el Button renderizado refleja el nuevo color sin modificar el código del componente

### Requirement: Variantes y estados de componente
Cada componente SHALL soportar al menos una variante visual (ej. primario/secundario) y SHALL usar los tokens semánticos de estado de interacción (`hover`, `pressed`, `disabled`, `focus`) del sistema de diseño para sus estados, en vez de valores de color definidos de forma independiente por componente.

#### Scenario: Estado deshabilitado de Button
- **WHEN** el componente Button recibe la propiedad de deshabilitado
- **THEN** el componente se renderiza con estilo deshabilitado y no dispara eventos de click

#### Scenario: Estado hover usa tokens de interacción
- **WHEN** un usuario pasa el cursor sobre un Button de variante primaria
- **THEN** el color de fondo cambia al token de estado `hover` correspondiente al rol `brand`, no a un valor de color propio del componente

### Requirement: Accesibilidad básica
Cada componente SHALL cumplir con prácticas básicas de accesibilidad: roles ARIA correctos, navegación por teclado y foco visible.

#### Scenario: Navegación por teclado en Input
- **WHEN** un usuario navega el formulario usando la tecla Tab
- **THEN** el componente Input recibe el foco visualmente indicado y es operable desde el teclado

### Requirement: Componentes distribuidos como código fuente
El sistema SHALL distribuir cada componente como código fuente (TypeScript/TSX) legible y editable, no como una dependencia de runtime compilada obligatoria, de modo que el CLI pueda copiarlo al repositorio consumidor.

#### Scenario: Código fuente copiado es editable
- **WHEN** el CLI agrega el componente Card a un proyecto consumidor
- **THEN** el archivo fuente del componente queda disponible en el repositorio del consumidor y puede modificarse libremente sin afectar a otros consumidores
