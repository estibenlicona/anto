## 1. Estructura en pestañas

- [x] 1.1 Importar `Tabs`, `TabsList`, `TabsTrigger` y `TabsContent` de `@tuya-ui/components` en `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx`.
- [x] 1.2 Reemplazar los dos `div` de grid (`grid-cols-1 ... lg:grid-cols-2`) por un único `Tabs` con `defaultValue` en la primera sección.
- [x] 1.3 Crear un `TabsTrigger` por sección con los rótulos actuales: "Bandas de talla", "Mix de capacidades y SFIA", "Pool de preguntas", "Versionado y auditoría".
- [x] 1.4 Envolver el contenido de cada sección en su `TabsContent`, conservando el `Card` como superficie del panel.
- [x] 1.5 Eliminar los cuatro `CardHeader`: la pestaña ya nombra la sección. Dejar de importar `CardHeader` si queda sin uso.

## 2. Adopción de Table

- [x] 2.1 Pasar `flush` a las cuatro `Table`, para que cada sección muestre un solo borde — el de la `Card`.
- [x] 2.2 Bandas de talla: `align="right"` en cabecera y celdas de Puntaje %, PM mín y PM máx. Talla y Lectura quedan a la izquierda.
- [x] 2.3 Mix de capacidades: `align="right"` en cabecera y celdas de las cinco columnas de conteo (XS, S, M, L, XL). Capacidad queda a la izquierda.
- [x] 2.4 Pool de preguntas: `align="right"` en cabecera y celdas de Preguntas, Peso total y Máx. puntos. Dimensión queda a la izquierda.
- [x] 2.5 Versionado: sin `align`, sus cuatro columnas son texto.

## 3. Tag en la columna de talla

- [x] 3.1 Agregar el color por talla al arreglo `tallas` (XS gray, S green, M blue, L amber, XL red), junto a los datos de cada banda.
- [x] 3.2 Renderizar la celda de talla con `Tag` usando ese color, dejando el texto de la talla como contenido.
- [x] 3.3 No usar `Tag` en las cabeceras XS…XL de la tabla de mix: son nombres de columna, no valores.

## 4. Pruebas

- [x] 4.1 Ajustar el caso que verifica los cuatro rótulos: bajo pestañas los cuatro `TabsTrigger` siguen en el DOM, así que confirmar que sigue pasando y que verifica los rótulos de pestaña. Reescrito con `getByRole("tab")`, que además cubre la semántica de pestaña.
- [x] 4.2 Ajustar el caso de "Editar parámetros": activar la pestaña de Versionado y auditoría antes de afirmar que el botón está deshabilitado, ya que el panel no está montado hasta seleccionarlo.
- [x] 4.3 Agregar un caso que cubra el cambio de pestaña: al activar otra sección se muestra su contenido y desaparece el de la anterior.
- [x] 4.4 Correr `pnpm test` en `frontend` y confirmar que la suite pasa. Los 5 casos de esta pantalla pasan. La suite completa queda en 126/127 por dos fallos PREEXISTENTES y ajenos: `App.test.tsx` importa `./App` en vez de `../App`, y `httpClient.test.ts` depende de una variable de entorno.

## 5. Verificación

- [x] 5.1 Abrir la pantalla y confirmar que carga en "Bandas de talla" con las otras tres como pestañas, y que ningún nombre de sección se repite dentro del panel.
- [x] 5.2 Confirmar que cada tabla muestra un solo borde dentro de su `Card`.
- [x] 5.3 Confirmar que las columnas numéricas quedan a la derecha con los dígitos en columna entre filas.
- [x] 5.4 Confirmar que las tallas salen como etiquetas de color, todas del mismo tamaño.
- [x] 5.5 Recorrer las pestañas con el teclado y confirmar que se pueden activar sin mouse. La flecha derecha avanza y activa la pestaña, con anillo de foco visible.
- [x] 5.6 Correr `tsc --noEmit` en `frontend`. Sin errores en esta pantalla; el único que reporta es el import roto preexistente de `App.test.tsx`.
