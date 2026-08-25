## 1. El nivel esperado deja de leerse del rol

- [x] 1.1 Mover la llave del modelo de competencias del rol al **cargo**: las expectativas del catálogo de habilidades, el nivel que la evaluación dice que pide la persona, y el que fija la brecha de cada celda del span. Hoy los tres se resuelven contra `person.role`, y las expectativas están sembradas con nombres de disciplina —"Backend Dev", "Data Engineer"—, que son cargos. Sin esto, cerrar el rol vacía Competencias sin que nada falle.
- [x] 1.2 Que la interfaz nombre el cargo donde hoy dice rol: la fila del span, el detalle de la celda, la tabla del catálogo de habilidades y el pendiente "roles sin nivel declarado".
- [x] 1.3 Pruebas: una persona conserva su nivel exigido y su brecha después del traslado; cambiarle el rol a alguien no mueve ninguna brecha; y ninguna expectativa se resuelve contra el rol.

## 2. Rol y cargo dejan de ser lo mismo

- [x] 2.1 Definir el catálogo de roles en los mocks: Administrador, Líder Técnico, Líder de Expertise, Product Owner y Colaborador, con el nombre en español para mostrar y el nombre en inglés en el contrato. Colaborador es el de quien participa sin liderar: sin él, el rol obligatorio obligaría a inventarle un liderazgo a la mayoría de la gente.
- [x] 2.2 Que `role` deje de ser texto libre: pasa a ser un valor del catálogo en el DTO, en el adapter, en la validación y en el formulario, donde el campo cambia de entrada de texto a selector.
- [x] 2.3 Elegir el rol real de cada persona sembrada, en vez del copiado del cargo. Sembrar **al menos dos** con rol de Líder Técnico y dejar a alguien sin líder técnico asignado: con un solo líder el selector no prueba nada.
- [x] 2.4 Pruebas: el selector ofrece los cinco roles en español; un rol fuera del catálogo se rechaza; y ninguna persona sembrada tiene el rol igual al cargo, que es la comprobación que detecta la recaída.

## 3. El líder técnico

- [x] 3.1 Agregar el líder técnico al contrato de persona como referencia opcional a otra persona, y al formulario como selector que ofrece únicamente a quienes tienen el rol de Líder Técnico, excluyendo a la persona que se edita.
- [x] 3.2 Resolver el estado vacío del selector: sin ningún líder técnico registrado, decirlo y decir cómo registrarlos, en vez de abrir una lista vacía.
- [x] 3.3 Avisar antes de guardar cuando se le cambia el rol a alguien que figura como líder técnico de otras personas, diciendo a cuántas afecta. Es el caso que rompe en silencio.
- [x] 3.4 Pruebas: el selector filtra por rol y excluye a la persona editada; el campo es opcional; el estado vacío aparece cuando corresponde; y el aviso aparece con el número correcto.

## 4. La línea de expertise, de sólo lectura

- [x] 4.1 Mostrar en el formulario la línea a la que pertenece la persona, sin selector, con la forma de ir al módulo de Líneas para cambiarla. Una persona sin línea lo dice explícitamente.
- [x] 4.2 Pruebas: el formulario muestra la línea y **no** ofrece elegirla —lo que sigue cumpliendo el requisito de `add-expertise-lines`—, y guardar la persona no cambia su línea.

## 5. El costo en pesos

- [x] 5.1 Cambiar el campo de costo mensual para que muestre la cifra en pesos colombianos con separador de miles mientras se escribe. Hoy es `type="number"`, que no puede llevar separadores, así que hay que separar lo que se ve de lo que se envía.
- [x] 5.2 Pruebas: al backend viaja el número sin formato. Es la parte que se rompe callada — la pantalla se ve bien y el valor guardado es otro.
- [x] 5.3 Comprobar que la validación de mínimo y de obligatorio sigue funcionando sobre el valor, no sobre el texto con puntos.

## 6. Cierre

- [x] 6.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 7. Verificación

- [x] 7.1 Con `pnpm dev:auth`, en el alta y en la edición de una persona: el rol se elige de una lista en español, el líder técnico ofrece sólo a quienes lo son, la línea se ve sin poder cambiarse, y el costo se escribe con separadores.
- [x] 7.2 Cambiarle el rol a un líder técnico y comprobar que avisa a cuántas personas afecta antes de guardar.
- [x] 7.3 Guardar una persona con costo de siete cifras y volver a abrirla: el valor tiene que ser el mismo, no uno truncado por el formato.
