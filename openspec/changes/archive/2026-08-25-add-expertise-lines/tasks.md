## 1. Datos y mocks

- [x] 1.1 Extraer a un módulo compartido de los mocks el `round1` y la fórmula de FTE asignado tal como está hoy (Σ dedicación / 100, sin mirar `availableFte`), y hacer que `chapter.handlers` la consuma sin cambiar ninguno de sus números. Documentar en ese módulo la rareza heredada y por qué no se corrige acá.
- [x] 1.2 Modelar la línea en el mock: id, nombre, código, descripción, estado (`Active | Archived`), `leadPersonId` o `null`, más el mapa `personId → lineId` del que el handler de líneas es dueño único.
- [x] 1.3 Semillas: Backend, QA, AS-400 y Frontend repartiendo las personas ya sembradas; al menos una línea activa sin lead, una archivada y sin personas, y dos personas sin línea.
- [x] 1.4 `expertise-lines.handlers`: `GET` listado (estado, lead, conteo de personas, FTE disponible) y `GET` detalle (personas con cargo, seniority, FTE, célula y dedicación derivadas de los snapshots de personas/asignaciones/células, más el resumen de capacidad).
- [x] 1.5 Handlers de escritura: `POST` alta y `PUT` edición con 400 por campos faltantes o largos y 409 por nombre repetido entre activas o código repetido entre todas; código normalizado a mayúsculas.
- [x] 1.6 `PUT` del lead: incorpora a la persona a la línea si estaba en otra o sin línea, y responde 409 si esa persona ya lidera otra línea.
- [x] 1.7 `POST` de incorporación de una o varias personas y `DELETE` de una persona de la línea, con 409 al intentar quitar al lead; ninguna de las dos toca el mock de asignaciones.
- [x] 1.8 `POST` de archivado (409 si la línea tiene personas) y de reactivación (vuelve activa, sin personas y sin lead); `GET` de personas sin línea.
- [x] 1.9 404 en todas las operaciones sobre un id de línea inexistente; registrar el handler en `handlers/index.ts`.
- [x] 1.10 Pruebas del handler: unicidad de nombre y código, lead que ya lidera otra, mover a alguien deja intacta su asignación a células, archivar con gente, reactivar, y que el FTE de la línea coincide con el que calcula `chapter.handlers` sobre las mismas personas.

## 2. Servicio y adaptador

- [x] 2.1 `expertiseLinesService`: DTOs y llamadas del listado, el detalle, el alta/edición, el lead, la incorporación y baja de personas, el archivado/reactivación y las personas sin línea. Documentar en el encabezado que la UI dice "línea de expertise" y el código existente dice `chapter`.
- [x] 2.2 `ExpertiseLinesAdapter`: separar activas de archivadas, marca de línea incompleta (activa sin lead), etiquetas de seniority desde la escala Tuya, y el resumen de capacidad formateado (FTE con un decimal, porcentaje sin asignar).
- [x] 2.3 Pruebas del adapter: línea sin personas (cero personas, cero FTE, sin división por cero), línea archivada sin lead que NO se marca incompleta, y la persona que es lead señalada dentro de su listado.

## 3. Pantalla de Líneas de expertise

- [x] 3.1 Índice: activas y archivadas separadas, nombre, código, personas, FTE disponible y marca de incompleta; buscador por nombre o código con aviso de "ninguna coincide"; estado vacío que explica qué es una línea y ofrece crear la primera.
- [x] 3.2 Detalle: encabezado de la línea con nombre, código y descripción, sus acciones (editar, archivar o reactivar) y el bloque de lead con la acción de designarlo cuando falta.
- [x] 3.3 Resumen de capacidad de la línea: personas, FTE disponible, asignado, libre y porcentaje sin asignar, recalculado tras cada cambio sin recargar la aplicación.
- [x] 3.4 Listado de personas de la línea con cargo, seniority, FTE disponible y célula o "Sin célula", con el lead señalado y el estado vacío con la acción de asignar la primera.
- [x] 3.5 Drawer de alta y edición de línea, con las validaciones del cliente (obligatorios, longitudes, nombre y código repetidos) y el error del servidor conservando lo escrito.
- [x] 3.6 Selector de lead: excluye a quien ya lidera otra línea señalando cuál, y permite quitar el lead.
- [x] 3.7 Asignar personas: multi-selección distinguiendo las de "sin línea" de las que están en otra, con el aviso de qué línea saldrán antes de confirmar; quitar de la línea con su confirmación y el rechazo explicado cuando es el lead.
- [x] 3.8 Bloque de personas sin línea: contador, lista con nombre, cargo, seniority y FTE, acción de asignar línea desde ahí, y el mensaje explícito cuando no queda nadie sin línea.
- [x] 3.9 Archivar con diálogo de confirmación, el rechazo que dice cuántas personas hay que mover y enlaza a su listado, y la reactivación.
- [x] 3.10 Estados de carga y de error de la pantalla, sin desplazar la estructura y con la acción de reintentar.
- [x] 3.11 Aplicar el criterio de marca del proyecto: enlaces neutros y acciones de fila subtle/secondary; sólo la acción primaria de la pantalla lleva el rojo.
- [x] 3.12 Pruebas de componentes y contenedor: nombre y código repetidos, lead que ya lidera otra, traer a alguien de otra línea, quitar al lead, archivar con gente, línea vacía y nadie sin línea.

## 4. Ruta y navegación

- [x] 4.1 Página `AdminExpertiseLinesPage` y ruta `/app/admin/lineas`, accesible sin sesión como el resto de Admin.
- [x] 4.2 Entrada "Líneas" en el grupo "Configuración" de `admin-shell/navigation.ts` con el icono `team`, y "Líneas de expertise" en `adminRouteTitles` para el breadcrumb.
- [x] 4.3 Actualizar las pruebas del shell de Admin y de rutas al nuevo conteo de entradas.

## 5. Detalle de persona contra el maestro

- [x] 5.1 `personDetail.handlers` deja de usar la constante `CHAPTER` y resuelve la línea y su lead desde el handler de líneas; `null` cuando la persona no tiene línea o la línea no tiene lead. Retirar `CHAPTER` de `personDetail.seeds.ts` si nadie más la usa.
- [x] 5.2 `personDetailService`/`PersonDetailAdapter`: `chapterName` y `chapterLeadName` pasan a `string | null` y se resuelven los sitios de uso que el compilador señale.
- [x] 5.3 Ficha del detalle de persona: línea y lead reales; "sin línea de expertise" con enlace a la pantalla de Líneas; "sin lead" cuando la línea no lo tiene; y la persona que es lead de su propia línea señalada como tal sin repetir su nombre.
- [x] 5.4 Verificar que el formulario de alta y edición de persona sigue sin capturar la línea y que guardar una persona no altera su pertenencia.
- [x] 5.5 Pruebas: detalle con línea y lead, sin línea, línea sin lead, la persona es su propio lead, y que mover a la persona de línea en la misma sesión se refleja en el siguiente detalle.

## 6. Cierre

- [x] 6.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido.
- [x] 6.2 `openspec validate add-expertise-lines --strict` sin hallazgos.
- [x] 6.3 Verificación manual con `pnpm dev:auth` y perfil Admin: crear una línea, designarle lead, traer a alguien desde otra línea comprobando que su célula no cambia, repartir a las personas sin línea, intentar archivar con gente, vaciarla y archivarla, y confirmar en el detalle de una de esas personas que la Ficha muestra la línea y el lead nuevos.

  Recorrido hecho: se creó "Movilidad" con el código escrito en minúscula, que quedó normalizado a `MOV`, y nació marcada "Sin lead". Al designar lead, el selector señaló a quienes ya lideran otra línea ("Lidera QA", "Lidera Backend") y no dejó elegirlos; la persona designada se trajo desde su línea anterior. Al asignar, el selector separó "Sin línea · 4" de "En otra línea · 13" y avisó "Diego Salazar saldrá de Backend" antes de confirmar; **Diego conservó su célula** ("100 % en Canales Digitales"), igual que Valentina ("60 % en Fraude Tarjetas"), y el aviso de personas sin línea del índice desapareció al repartir a las cuatro. Con gente adentro, **Archivar quedó deshabilitado**. El "Quitar" del lead también, hasta quitarle la designación: hecho eso, la persona siguió en la línea, la línea volvió a marcarse incompleta y recién ahí se pudo sacar. Vacía, archivar pidió confirmación explícita y la línea pasó a la sección de archivadas. En el detalle de una persona, la Ficha muestra "Línea de expertise: Backend · Lead: María González".

  Un límite del entorno, no del cambio: el ida y vuelta entre Líneas (Admin) y el detalle de una persona (Chapter Lead) obliga a cambiar de perfil, lo que recarga la página y vuelve a sembrar los mocks en memoria. Por eso la Ficha se comprobó contra una línea y un lead de las semillas, no contra los creados en el mismo recorrido.
