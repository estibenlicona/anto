# prefacture-register-form Specification

## Purpose

Define el comportamiento del formulario con el que el chapter lead registra la prefactura de una persona externa: qué contexto muestra, cómo se agrupan y validan los datos del documento, cómo se compara el valor digitado contra lo esperado, qué es opcional en la imputación y con qué llega prellenada, y qué cambia al registrar la corregida de una objetada.

## Requirements

### Requirement: El encabezado nombra a la persona, el proveedor y el período
El formulario SHALL abrir con el título "Registrar prefactura" y, debajo, un subtítulo con la persona, el proveedor y el mes del período, en ese orden y separados por " · ".

#### Scenario: Abrir el registro desde el listado o el detalle
- **WHEN** el usuario abre el registro de la prefactura de Carlos López (GFT) de agosto de 2026
- **THEN** el formulario muestra "Registrar prefactura" y el subtítulo "Carlos López · GFT · agosto 2026"

### Requirement: Los datos del documento se agrupan y validan como hoy
La zona "Prefactura" SHALL mostrar el número de prefactura y la fecha de recepción en una misma fila, y el valor total debajo a ancho completo. Al enviar, el formulario SHALL exigir número, fecha válida y valor mayor que cero, señalando cada campo vacío o inválido con su mensaje ("Escribe el número", "Selecciona la fecha de recepción", "Escribe el valor de la prefactura") y sin enviar nada.

#### Scenario: Enviar sin completar
- **WHEN** el usuario pulsa "Registrar" sin haber completado número, fecha y valor
- **THEN** cada uno de los tres campos muestra su mensaje y no se registra nada

### Requirement: El valor total se escribe y se lee con separadores de miles
El campo "Valor total" SHALL aceptar únicamente dígitos y SHALL mostrar lo escrito con puntos de miles mientras se digita (por ejemplo "11.500.000"), conservando el prefijo "COP". El valor enviado SHALL ser el entero digitado, sin separadores.

#### Scenario: Escribir un valor
- **WHEN** el usuario escribe 11500000 en "Valor total"
- **THEN** el campo muestra "11.500.000"
- **AND** al registrar se envía `amount: 11500000`

#### Scenario: Pegar texto con caracteres que no son dígitos
- **WHEN** el usuario pega "$ 11.500.000" en "Valor total"
- **THEN** el campo conserva sólo los dígitos y muestra "11.500.000"

### Requirement: El valor se concilia contra el esperado a la vista
Bajo el valor total, el formulario SHALL mostrar un bloque de conciliación con el esperado del período y su desglose: la tarifa mensual, menos el descuento por ausencias cuando existe (con sus días), más el ajuste cuando existe. Mientras el valor está vacío o no es válido, el bloque SHALL mostrar sólo el esperado y su desglose. Con un valor válido, el bloque SHALL añadir la lectura de la diferencia: "Sin diferencia contra lo esperado" en tono de éxito cuando coincide, o "Difiere en +$X" / "Difiere en −$X" en tono de advertencia cuando no, acompañado de la nota de que se registra igual y que el detalle dirá de dónde sale la diferencia. La diferencia NO SHALL impedir el registro.

#### Scenario: Esperado con descuento por ausencias
- **WHEN** la prefactura tiene tarifa $ 11.500.000 y un descuento de 3 días de ausencia por $ 547.619
- **THEN** el bloque muestra "Esperado del período $ 10.952.381" y el desglose "Tarifa $ 11.500.000 − 3 días de ausencia $ 547.619"

#### Scenario: Valor por encima del esperado
- **WHEN** el esperado es $ 10.952.381 y el usuario escribe 11.500.000
- **THEN** el bloque muestra "Difiere en +$ 547.619" en tono de advertencia y la nota de que se registra igual
- **AND** pulsar "Registrar" envía la prefactura con ese valor

#### Scenario: Valor igual al esperado
- **WHEN** el usuario escribe exactamente el esperado
- **THEN** el bloque muestra "Sin diferencia contra lo esperado" en tono de éxito

#### Scenario: Valor vacío
- **WHEN** el usuario aún no ha escrito el valor
- **THEN** el bloque muestra el esperado y su desglose, sin lectura de diferencia

### Requirement: "Usar el esperado" llena el valor
Junto al rótulo "Valor total" el formulario SHALL ofrecer la acción "Usar el esperado", que SHALL escribir el esperado del período en el campo.

#### Scenario: Usar el esperado
- **WHEN** el usuario pulsa "Usar el esperado" con el esperado en $ 10.952.381
- **THEN** el campo muestra "10.952.381" y el bloque de conciliación pasa a "Sin diferencia contra lo esperado"

### Requirement: Los datos de prefactura se anuncian como opcionales y llegan prellenados
La zona "Datos de prefactura" SHALL mostrar junto a su título la etiqueta "Opcional" y ningún texto explicativo debajo: lo que falte queda marcado en el detalle. "Célula o CoE" y "Concepto" SHALL ir a ancho completo; "Cuenta contable", "Número de cuenta contable", "Centro de costos" y "Orden de compra" SHALL compartir filas a dos columnas; "Cuenta destinada al pago" SHALL ir a ancho completo. En un primer registro, "Célula o CoE" SHALL llegar prellenada con la célula de la persona cuando la tiene, y todos los campos SHALL llevar un placeholder de ejemplo ("Ej. …") que no se envía. Los siete datos SHALL seguir siendo opcionales: lo vacío se envía como ausente.

#### Scenario: Primer registro de una persona con célula
- **WHEN** el usuario abre el registro de una persona asignada a "Backend Platform"
- **THEN** "Célula o CoE" muestra "Backend Platform" y "Concepto" muestra el placeholder "Ej. Servicios profesionales"
- **AND** al registrar sin tocar la imputación se envía `costObject: "Backend Platform"` y `concept: null`

#### Scenario: Persona sin célula
- **WHEN** la persona no tiene célula asignada
- **THEN** "Célula o CoE" abre vacía y el registro sigue siendo posible

### Requirement: La corregida muestra la objeción y hereda la imputación
Cuando la prefactura está objetada, el formulario SHALL titularse "Registrar prefactura corregida", el subtítulo SHALL terminar en "· vuelve a revisión con las cifras nuevas", y la zona del documento SHALL abrir con un bloque que muestre la fecha de la objeción, el número y valor del documento anterior y el motivo de la objeción. Los siete datos de imputación SHALL llegar prellenados con los del documento objetado. El botón de envío SHALL decir "Registrar corregida".

#### Scenario: Registrar la corregida
- **WHEN** el usuario abre el registro de una prefactura objetada el 8 de julio, con documento PF-2049 por $ 11.500.000 y motivo "No descontaron la incapacidad de Carlos"
- **THEN** el formulario muestra "Registrar prefactura corregida", el bloque "Objetada el 8 jul · PF-2049 por $ 11.500.000" con el motivo, y la imputación del documento anterior en sus campos
- **AND** el botón de envío dice "Registrar corregida"

### Requirement: La zona "Prefactura" permite adjuntar el PDF del documento
La zona "Prefactura" SHALL abrir con el campo "Cargar PDF" del sistema de diseño (zona de arrastre sobre un campo de archivo real), que SHALL aceptar únicamente archivos PDF. Con un archivo elegido, el campo SHALL mostrar su nombre y tamaño y ofrecer "Quitar archivo". Adjuntar el PDF NO SHALL ser obligatorio ni cambiar lo que se envía al registrar: la lectura automática del documento es del backend y no forma parte de este cambio.

#### Scenario: Adjuntar un PDF
- **WHEN** el usuario elige "prefactura-agosto.pdf" desde "Cargar PDF"
- **THEN** el campo muestra "prefactura-agosto.pdf" con su tamaño y "Quitar archivo"
- **AND** al pulsar "Quitar archivo" el campo vuelve a quedar vacío

#### Scenario: Registrar sin PDF
- **WHEN** el usuario completa número, fecha y valor sin adjuntar ningún PDF
- **THEN** la prefactura se registra igual que hoy
