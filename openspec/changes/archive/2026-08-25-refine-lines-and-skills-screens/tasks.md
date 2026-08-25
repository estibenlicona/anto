## 1. El encabezado

- [x] 1.1 Dar a Líneas de expertise su encabezado: título, descripción de qué es una línea, y "Nueva línea" como acción primaria. Hoy la pantalla abre con el botón flotando sobre un espacio vacío.
- [x] 1.2 Comprobar que el encabezado de Habilidades coincide en estructura con el de Líneas y con los cinco módulos del Chapter Lead. Es lo que hace que la reversión valga la pena: si quedan distintos entre sí, cambiamos una inconsistencia por otra.
- [x] 1.3 Pruebas: las dos pantallas muestran título, descripción y acción primaria; y las que afirmaban la ausencia del título en Líneas se actualizan — no se borran, porque el escenario sigue existiendo con la afirmación contraria.

## 2. La jerarquía de las acciones

- [x] 2.1 Que en Líneas la acción de archivar deje de compartir tratamiento con la de editar. Archivar cambia el estado de la línea y saca a sus personas de la vista habitual.
- [x] 2.2 Que en Habilidades **Eliminar** se distinga de **Editar**, y que **Desactivar** se lea como la opción reversible que es. Hoy las tres son idénticas salvo por la palabra.
- [x] 2.3 No nombrar variantes concretas en la spec, sólo en el código: lo que el requisito exige es que se distingan, y atarlo a un nombre de variante lo rompe cuando el sistema de diseño renombre.
- [x] 2.4 Pruebas: en cada pantalla, la acción destructiva y la de editar no comparten tratamiento.

## 3. Los indicadores de una línea

- [x] 3.1 Presentar las cuatro cifras —personas, FTE disponible, FTE asignado, FTE libre— con el mismo tratamiento de indicador que los resúmenes del resto de la aplicación, en vez de la rejilla pelada de hoy.
- [x] 3.2 Pruebas: las cifras siguen diciendo lo mismo; lo que cambia es cómo se presentan.

## 4. El buscador del drawer

- [x] 4.1 Agregar al drawer de asignar personas un buscador por nombre, con la misma mecánica que el índice de líneas ya usa en la misma pantalla. Dos formas de buscar a diez centímetros es cómo se acumulan los patrones.
- [x] 4.2 Conservar la separación entre quienes no tienen línea y quienes están en otra al filtrar, y avisar cuando nada coincide.
- [x] 4.3 Que **filtrar no desmarque**: marcar a alguien, buscar a otra persona y marcarla también tiene que dejar a las dos elegidas. Es el defecto clásico de un selector múltiple con filtro —la selección vive en la lista visible y filtrar la vacía— y el que nadie prueba.
- [x] 4.4 Pruebas: el filtro acota manteniendo los dos grupos; sin coincidencias lo dice; y la selección sobrevive a dos búsquedas seguidas.

## 5. Cierre

- [x] 5.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 6. Verificación

- [x] 6.1 Con `pnpm dev:auth` y perfil Admin, en `/app/admin/lineas`: la pantalla se presenta con encabezado y no con un botón suelto.
- [x] 6.2 En `/app/admin/habilidades`: eliminar no se ve igual que editar.
- [x] 6.3 Abrir **Asignar personas**, buscar a alguien, marcarla, buscar a otra y marcarla: las dos tienen que quedar seleccionadas.
- [x] 6.4 Anotar que las casillas siguen redondas si `square-the-checkbox` todavía no está aplicado — es dependencia declarada, no un defecto de este change.
