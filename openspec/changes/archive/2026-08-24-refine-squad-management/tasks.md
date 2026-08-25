## 1. Requisitos previos

- [x] 1.1 Confirmar que la app tiene reinstalado el tuip con `adjust-badge-and-capacity-bar` —el badge sin punto y las partes de `CapacityBar` con color categórico—. Si falta, avisar y acordar el orden antes de tocar código. Si se levanta el dev server, usar un puerto que no se haya usado antes en la sesión: con la misma versión del paquete el navegador reusa el anterior.

## 2. Los controles dejan de desaparecer

- [x] 2.1 Que el estado de carga ocupe sólo la zona de resultados, y que la búsqueda y el filtro sigan montados mientras el listado recarga.
- [x] 2.2 Pruebas: al cambiar el filtro, los controles siguen en el documento y conservan su estado; se pueden marcar dos criterios seguidos sin que el panel del filtro se cierre en el medio; el estado de carga sigue apareciendo donde van los resultados.

## 3. BAU y Transformación

- [x] 3.1 Definir el par de colores en un solo lugar, con el vocabulario categórico, y consumirlo desde el listado y desde las tarjetas de resumen; hoy están duplicados.
- [x] 3.2 Pruebas: el tramo de la barra y su punto de leyenda toman el mismo color; ninguno de los dos usa ya un tono de la escala de acento.

## 4. El formulario

- [x] 4.1 La descripción pasa a un campo de varias líneas, con alto para más de un renglón y conservando su validación de 500 caracteres y su texto de ayuda.
- [x] 4.2 Pruebas: el campo acepta saltos de línea, el límite sigue señalándose al excederlo, y el alta y la edición siguen guardando la descripción como antes.

## 5. La criticidad

- [x] 5.1 Quitar el punto de los badges de criticidad, en el listado y donde más aparezca la criticidad con ese tratamiento.
- [x] 5.2 Pruebas: el badge no dibuja punto y sigue diciendo el nivel por su etiqueta.

## 6. El registro del lenguaje

- [x] 6.1 Reescribir en español neutro todas las formas de voseo del texto de la interfaz. El inventario real es **56 ocurrencias en 27 archivos**, no las doce estimadas al proponer: el conteo original usaba un límite de palabra que no cierra tras vocal acentuada, y se perdía todo lo que termina en í o á —`Elegí` sola aparece 31 veces, en los marcadores de posición de casi todos los selectores—. Alcanza también a los mensajes de validación y a los estados vacíos.
- [x] 6.2 Que las tres confirmaciones de borrado compartan redacción: es la misma acción sobre objetos distintos, y el requisito pide que se diga igual.
- [x] 6.3 Pruebas: una búsqueda de las formas del voseo en el código de la interfaz da cero resultados, y las pruebas que afirmaban esos textos quedan actualizadas.

## 7. Cierre

- [x] 7.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 8. Verificación

- [x] 8.1 Con `pnpm dev:auth` y un puerto nuevo: en `/app/lead/celulas`, marcar dos criterios seguidos sin que el filtro se cierre; escribir en la búsqueda sin perder el foco; abrir el alta y comprobar que la descripción tiene varias líneas; ver la criticidad sin punto.
- [x] 8.2 El color de BAU y Transformación, mirado **junto a** la escala de seniority: abrir Células y Personas y comprobar que ya no se confunden. Es la razón del cambio, y el par elegido es una propuesta que se confirma acá o se cambia.
