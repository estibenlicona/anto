## 1. Datos

- [x] 1.1 Modelar el catálogo en el mock: habilidad (nombre, grupo, descripción, activa), sus cuatro niveles con lista ordenada de criterios, nivel esperado por rol, y el contador de versión con una copia por publicación.
- [x] 1.2 Semillas con las nueve habilidades del diseño y sus criterios, con cantidades distintas entre niveles y entre habilidades, una habilidad con un nivel vacío y un rol sin nivel esperado.
- [x] 1.3 Handlers: `GET` del vigente, alta y edición de habilidad (400 por nombre repetido o faltante), `PUT` de criterios de un nivel (400 con texto vacío), `PUT` del nivel esperado de un rol (acepta retirarlo), `DELETE` con 400 cuando está en uso; roles derivados del snapshot de personas; snapshot de sólo lectura del vigente y de cada versión.
- [x] 1.4 Pruebas del handler, incluida la que verifica que publicar sube la versión y que la copia anterior queda accesible.
- [x] 1.5 `skillsService` + `SkillsAdapter` (agrupación humanas/técnicas, conteo total y por nivel, marca de habilidad incompleta, etiquetas de nivel desde la escala Tuya) con pruebas del adapter.

## 2. Pantalla del catálogo

- [x] 2.1 Índice del catálogo: grupos, conteo de criterios por habilidad, marca de incompleta y selección; estado vacío cuando no hay ninguna.
- [x] 2.2 Detalle de la habilidad: encabezado editable (nombre, grupo, descripción) y los cuatro niveles con su lista de criterios y su contador, según el artboard aprobado.
- [x] 2.3 Editor de criterios: agregar, editar, reordenar y quitar dentro de un nivel, sin asumir cantidad; aviso visible de que editar no recalcula evaluaciones cerradas.
- [x] 2.4 Tabla de nivel esperado por rol, con los roles del chapter y la opción de dejar uno sin definir.
- [x] 2.5 Alta de habilidad y el camino de desactivar cuando está en uso.
- [x] 2.6 Pruebas de componentes y contenedor (cantidades distintas por nivel, nombre repetido, criterio vacío, rol sin definir, desactivar en uso).

## 3. Ruta y navegación

- [x] 3.1 Registrar `/app/admin/habilidades`, la entrada "Habilidades" en el grupo Configuración y el breadcrumb; ajustar las pruebas del shell de Admin y de rutas.
- [x] 3.2 Typecheck, lint y suite completa sin regresiones frente al baseline conocido.

## 4. Verificación

- [x] 4.1 Con `pnpm dev:auth` y perfil Admin: crear una habilidad, cargarle criterios de distinta cantidad por nivel, declarar y retirar el nivel esperado de un rol, y comprobar que el conteo del índice y la marca de incompleta acompañan.
