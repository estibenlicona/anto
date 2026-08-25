## 1. Derivación de iniciales

- [x] 1.1 Crear una función que reciba `Person.name` y devuelva las iniciales: primera letra del primer token + primera letra del segundo token (si existe), en mayúsculas.
- [x] 1.2 Agregar pruebas unitarias de la función: nombre de dos tokens ("María González" → "MG"), un solo token, nombre compuesto de 3+ tokens (documentando el comportamiento decidido en design.md), espacios extra/dobles.

## 2. Listado de Personas

- [x] 2.1 Importar `Avatar` de `@tuya-ui/components` en `PeopleList.tsx`.
- [x] 2.2 Renderizar el avatar (`size="small"`, `label={person.name}`, iniciales derivadas como `children`) junto al nombre en la celda "Nombre".
- [x] 2.3 Verificar visualmente que el avatar no rompe el layout de la fila ni la altura de la tabla.

## 3. Mocks

- [x] 3.1 Confirmar que los nombres en `people.handlers.ts` siguen el formato "Nombre Apellido" esperado (ya lo cumplen); no se requiere cambio de datos.

## 4. Verificación

- [x] 4.1 Ejecutar la suite de pruebas del frontend y confirmar que pasan.
- [x] 4.2 Probar en el navegador: listado de Personas muestra el avatar con iniciales correctas para los tres registros mock.
