## ADDED Requirements

### Requirement: Realce del disparador de cuenta de Navbar

El disparador del panel de cuenta de Navbar no SHALL pintar una superficie de realce con forma distinta de la del avatar que contiene: no SHALL mostrar fondo al recibir el puntero ni mientras su panel está abierto. El anillo de foco por teclado SHALL seguir presente y visible: es la única señal del estado del control que no puede perderse. Ese anillo SHALL corresponderse con un recorrido por teclado y no con uno por puntero: cerrado el panel que se abrió con un clic, el disparador no SHALL quedar enfocado ni mostrar anillo; cerrado el que se abrió por teclado, el foco SHALL volver al disparador con su anillo. El resto de los controles de la zona de utilidades —enlaces de utilidad, botón de notificaciones y botón de menú de la variante compacta— SHALL conservar el realce rectangular que ya tienen, porque su anatomía sí es rectangular.

#### Scenario: El puntero sobre el avatar no pinta un rectángulo

- **WHEN** una persona pasa el puntero sobre el disparador de cuenta
- **THEN** no aparece ninguna superficie de fondo detrás del avatar, ni rectangular ni de ninguna otra forma

#### Scenario: Con el panel abierto tampoco hay superficie

- **WHEN** el panel de cuenta está abierto
- **THEN** el disparador sigue sin pintar fondo, y la señal de que el control está activo es el propio panel desplegado

#### Scenario: El foco por teclado sigue siendo visible

- **WHEN** una persona que navega por teclado lleva el foco al disparador de cuenta
- **THEN** el disparador muestra su anillo de foco, distinguible de su estado en reposo

#### Scenario: Cerrado con el mouse, el avatar no queda con anillo

- **WHEN** una persona abre el panel de cuenta con un clic y después lo cierra
- **THEN** el disparador queda sin foco y sin anillo, sin importar que el panel devuelva el foco al cerrarse

#### Scenario: Cerrado por teclado, el foco vuelve al disparador

- **WHEN** una persona abre el panel de cuenta desde el teclado y después lo cierra
- **THEN** el foco vuelve al disparador y su anillo se ve, para que sepa dónde quedó parada

#### Scenario: Sin el nombre visible, el avatar queda solo

- **WHEN** el ancho disponible oculta el nombre de la persona y el disparador queda reducido al avatar
- **THEN** el puntero sobre el avatar no dibuja un contenedor alrededor del círculo

#### Scenario: Las demás utilidades conservan su realce

- **WHEN** una persona pasa el puntero sobre el botón de notificaciones o sobre un enlace de utilidad
- **THEN** ese control sí muestra su superficie de realce, igual que antes de este cambio
