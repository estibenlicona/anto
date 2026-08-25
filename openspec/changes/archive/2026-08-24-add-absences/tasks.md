## 1. Datos: mock, service y adapter

- [x] 1.1 Crear el handler de mock de ausencias (`GET ?month=`, `POST` alta con validación de rango y solape, `PUT` de estado con motivo obligatorio en el rechazo; 400/404 según spec), derivando `businessDays`, `businessDaysInMonth` y `squadImpacts` de los snapshots de personas y asignaciones; semillas con los tres tipos, los tres estados, una persona repartida entre dos células y una ausencia que cruza fin de mes; registro en Node y navegador con función de reinicio.
- [x] 1.2 Escribir las pruebas del handler (listar por mes incluyendo rangos que lo tocan parcialmente, solape → 400, transiciones de estado válidas e inválidas, impactos derivados y no digitados).
- [x] 1.3 Crear `absenceService` + `AbsenceAdapter` (DTO en inglés → etiquetas de tipo/estado, formato de rango de fechas, célula de mayor dedicación, lecturas del período: total de ausencias y días, impacto aprobado con célula más afectada, conteo por aprobar) con pruebas del adapter.

## 2. Pantalla de ausencias

- [x] 2.1 Construir `AbsencesContainer` con el mes en la URL (`?mes=`, default mes actual), selector de mes en el encabezado, las tres cards KPI y la tabla según el artboard "Ausencias" del canvas aprobado; estado vacío del mes sin ausencias; callout informativo del pie.
- [x] 2.2 Drawer de registro (persona del chapter, tipo, rango; muestra los días hábiles contados antes de enviar; errores de rango y solape del servidor en el formulario) — al crear, la fila aparece Solicitada.
- [x] 2.3 Acciones de fila: aprobar directo; rechazar abre drawer con motivo obligatorio (mismo patrón del rechazo de curación); tras cada acción se refrescan listado y KPIs.
- [x] 2.4 Pruebas de componentes y contenedor (KPIs calculados del mes, fila con proveedor/Planta, acciones sólo en Solicitadas, flujo aprobar y rechazar con motivo, estado vacío, navegación de mes).

## 3. Ruta y navegación

- [x] 3.1 Registrar la ruta `/app/lead/ausencias`, la entrada "Ausencias" en el grupo Capacidad (después de Personas) y el título "Gestionar Ausencias" para el breadcrumb; ajustar las pruebas del shell y de rutas.
- [x] 3.2 Correr typecheck, lint y la suite completa de la app sin regresiones frente al baseline conocido.

## 4. Verificación en pantalla

- [x] 4.1 Con `pnpm dev:auth`: recorrer el mes actual y uno anterior, registrar una ausencia (ver los días contados), aprobarla y ver moverse el KPI de impacto, rechazar otra con motivo, y comprobar la ausencia que cruza fin de mes en ambos meses.
