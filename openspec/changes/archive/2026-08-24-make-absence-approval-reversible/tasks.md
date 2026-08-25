## 1. Aprobar pide confirmación

- [x] 1.1 Que aprobar deje de aplicarse en el acto y pase por una confirmación que diga de quién es la ausencia y cuánto FTE descuenta del mes. Los datos concretos son el punto: un texto fijo se aprende a saltar en dos días.
- [x] 1.2 Cancelar deja la ausencia como estaba, con sus dos acciones y sin mover el impacto del mes.
- [x] 1.3 Pruebas: el estado no cambia hasta confirmar; cancelar no llama al servicio; y el texto de la confirmación nombra a la persona y la cifra de esa ausencia, no una fija.

## 2. Revertir una aprobación

- [x] 2.1 Ofrecer rechazar en las filas Aprobadas, reutilizando el panel de motivo que ya existe. Cambia de dónde se invoca y qué dice su encabezado, no la mecánica: dos caminos que hacen lo mismo se desincronizan.
- [x] 2.2 Habilitar en el mock la transición de Aprobada a Rechazada: hoy la rechaza con 400 porque exige que el origen sea Solicitada. Aprobar sigue permitido sólo desde Solicitada, y una Rechazada queda terminal.
- [x] 2.3 Que una Rechazada siga siendo terminal: sin acciones en la fila, venga de donde venga.
- [x] 2.4 Pruebas: revertir deja la ausencia Rechazada con su motivo trazado, **no** Solicitada; el impacto del mes deja de contarla; y una Rechazada no ofrece acciones.

## 3. La tarjeta de impacto

- [x] 3.1 Mostrar el descuento como fracción del FTE del chapter en el mes, en vez de una cifra suelta.
- [x] 3.2 Reescribir el pie como frase entera. Hoy empieza a mitad de oración —"de lo aprobado · la más afectada: …"— y sólo se entiende leyendo el número de arriba primero.
- [x] 3.3 Resolver el caso en que el total del chapter no está disponible o es cero: mostrar el descuento solo, sin una fracción sobre cero.
- [x] 3.4 Pruebas: la tarjeta nombra el total contra el que descuenta; revertir la aprobación que más pesaba baja el impacto y cambia la célula más afectada; y sin nada aprobado no aparece una fracción vacía.

## 4. El aviso al pie

- [x] 4.1 Reescribir el aviso para que diga qué pasa con lo que se registra —una sola vez, y de ahí salen la factura del proveedor y la capacidad de la célula—, sin referirse a fases ni etapas del plan de trabajo.
- [x] 4.2 Pruebas: actualizar las que afirmen ese texto.

## 5. Cierre

- [x] 5.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 6. Verificación

- [x] 6.1 Con `pnpm dev:auth`, en `/app/lead/ausencias`: aprobar una ausencia y comprobar que pregunta antes, con el nombre y la cifra correctos.
- [x] 6.2 Rechazar esa misma ausencia ya aprobada y comprobar que queda Rechazada con el motivo, y que el impacto del mes y la célula más afectada se mueven.
- [x] 6.3 Leer la tarjeta de impacto y el aviso al pie **como si fuera la primera vez**: si hay que deducir de qué total sale la cifra, o qué es "la más afectada", el punto no está resuelto.
