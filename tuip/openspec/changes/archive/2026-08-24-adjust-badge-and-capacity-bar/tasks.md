## 1. Badge

- [x] 1.1 Agregar la opción que omite el punto, con el punto puesto por defecto, sin que omitirlo cambie forma, variante ni relleno.
- [x] 1.2 Pruebas: por defecto el badge lleva punto; pedido sin punto no lo lleva y conserva todo lo demás; el texto sigue diciendo por sí solo lo que el badge clasifica en los dos casos.

## 2. CapacityBar

- [x] 2.1 Que una parte pueda declarar el vocabulario **categórico** además del de acento, con los dos tipos excluyéndose entre sí: una parte declara uno, nunca los dos.
- [x] 2.2 Que la leyenda tome el color de la misma fuente que el tramo, para que el punto y su tramo no puedan quedar de colores distintos.
- [x] 2.3 Pruebas: partes con acento se dibujan como antes; partes categóricas toman el color categórico en el tramo y en su punto de leyenda; declarar los dos vocabularios a la vez no compila.
- [x] 2.4 Exportar el vocabulario categórico. Llegaba sólo como `TagColor`, que alcanzaba mientras `Tag` era su único consumidor; sin el tipo a mano, una parte con color categórico no se puede escribir con tipos desde afuera.

## 3. Documentación

- [x] 3.1 Documentar cuándo un badge lleva punto y cuándo no —estado sí, clasificación no— donde se lo vaya a leer al elegir, y no sólo en la referencia de props.
- [x] 3.2 Documentar en `CapacityBar` el criterio para elegir vocabulario: acento si las partes son pasos de una escala, categórico si son categorías que no se ordenan entre sí. Nombrar el caso que lo motivó, para que se entienda el criterio y no sólo la regla.
- [x] 3.3 Ejemplos en la referencia: un badge de estado y uno de clasificación; una barra con partes de acento y otra con partes categóricas.

## 4. Publicación

- [x] 4.1 Changeset `minor`, diciendo que las dos opciones nacen con el comportamiento actual por defecto y que ningún consumidor cambia de aspecto.
- [x] 4.2 Pruebas, lint y build del workspace; las dos verificaciones de la hoja de estilos —paleta cerrada y utilidades que no se componen— tienen que seguir pasando.
- [x] 4.3 Empacar en `.local-packages` y reinstalar en la app; comprobar en el paquete instalado que las dos opciones llegaron. Si se levanta el dev server, usar un puerto que no se haya usado antes en la sesión.
