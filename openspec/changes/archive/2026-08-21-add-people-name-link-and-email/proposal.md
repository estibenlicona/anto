## Why

En el listado de Personas la primera columna muestra sólo avatar + nombre. Dos carencias: el correo corporativo no aparece en ningún lado del listado, aunque es el identificador con el que se reconoce a una persona cuando hay nombres parecidos; y no hay forma de llegar desde una fila a la persona — el único camino es el menú de acciones, que sólo ofrece editar y eliminar.

## What Changes

- Mostrar el correo corporativo (UPN) como segunda línea bajo el nombre, siempre visible, con tratamiento de texto secundario para que el nombre siga siendo lo que se lee primero.
- Convertir el nombre en un hipervínculo a la pantalla de detalle de la persona, en `/app/lead/personas/:id`.
- **El destino todavía no existe**: esta propuesta establece el enlace y la forma de la URL, no la pantalla. Hasta que se construya, un click cae en la pantalla de "no encontrado" de la aplicación. Es una decisión explícita del usuario — se prefiere fijar ahora el contrato de la URL y dejar la pantalla para un change posterior, antes que un nombre que se ve como enlace pero no navega.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `people`: el requisito "Listar personas" cambia lo que la primera columna muestra (suma el correo) y suma un punto de entrada navegable desde cada fila hacia el detalle de esa persona.

## Impact

- `frontend/src/features/people/components/PeopleList.tsx`: la celda de la primera columna pasa a apilar nombre (como enlace) y correo.
- Sin cambios en `routes.tsx` ni en la navegación lateral: la ruta de detalle se agrega junto con la pantalla, en un change posterior.
- Sin cambios de API ni de datos: `userPrincipalName` ya viaja en el DTO de persona y ya está en el modelo de UI; hoy simplemente no se muestra en el listado.
