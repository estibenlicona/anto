## MODIFIED Requirements

### Requirement: Variantes y estados de componente
Cada componente SHALL soportar al menos una variante visual (ej. primario/secundario) y SHALL usar los tokens semánticos de estado de interacción (`hover`, `pressed`, `disabled`, `focus`) del sistema de diseño para sus estados, en vez de valores de color definidos de forma independiente por componente.

El estado de interacción SHALL incluir el **cursor**, no sólo el color: todo elemento accionable con el puntero SHALL mostrar el cursor de puntero al pasar por encima, y todo elemento deshabilitado SHALL mostrar el de no permitido. El cursor es la señal con la que el puntero distingue lo accionable de lo que sólo se lee; sin ella, un botón se ve igual que un párrafo hasta que el usuario lo prueba.

Esta condición SHALL sostenerse desde la base de estilos del paquete y NO SHALL depender de que cada componente la declare por su cuenta: el catálogo la dio por sentada mientras el framework la traía, y cuando dejó de traerla se perdió en la mitad de los componentes sin que nada fallara. Un componente nuevo SHALL heredarla sin tener que acordarse de ella.

#### Scenario: El cursor distingue lo accionable
- **WHEN** un usuario pasa el puntero sobre un Button, un Chip accionable, una cabecera ordenable de Table o el cierre de un Modal
- **THEN** ve el cursor de puntero en todos, sin que ninguno dependa de una clase propia para tenerlo

#### Scenario: Lo deshabilitado no invita a hacer clic
- **WHEN** un usuario pasa el puntero sobre un control deshabilitado
- **THEN** ve el cursor de no permitido, nunca el de puntero

#### Scenario: Un componente nuevo hereda el cursor
- **WHEN** se agrega al catálogo un componente accionable que no declara ninguna clase de cursor
- **THEN** muestra igual el cursor de puntero, porque la base del paquete lo provee

#### Scenario: Estado deshabilitado de Button
- **WHEN** el componente Button recibe la propiedad de deshabilitado
- **THEN** el componente se renderiza con estilo deshabilitado y no dispara eventos de click

#### Scenario: Estado hover usa tokens de interacción
- **WHEN** un usuario pasa el cursor sobre un Button de variante primaria
- **THEN** el color de fondo cambia al token de estado `hover` correspondiente al rol `brand`, no a un valor de color propio del componente

