## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El diseño visual ya está decidido y aprobado**: el canvas "Facturación de Terceros y Ausencias" (artboard "Ausencias") fija encabezado con selector de mes, tres cards KPI, tabla con acciones por fila y el callout informativo. La pantalla se compone sólo con piezas publicadas de tuip.
- **La app compila sin Tailwind**: consume `styles.css` del paquete; cualquier medida calculada va en estilos inline. Patrón ya establecido en las demás features.
- **Los mocks son la fuente de datos** (patrón de toda la app): el handler nuevo deriva los impactos del snapshot de personas y asignaciones, como el handler de iniciativas expone su snapshot para backlog.
- **Deltas en unión**: `add-backlog-triage` y `add-initiative-evaluation` (activos) también modifican la navegación del shell; el delta de este change parte del texto más completo (el de iniciativas) y sólo agrega "Ausencias".

## Goals / Non-Goals

**Goals:**

- Ausencia registrada una vez, con estados trazables y impacto calculado — la base que `add-provider-billing` consumirá tal cual.
- Pantalla nativa: misma anatomía que Personas/Backlog (header + KPIs + tabla + drawer).

**Non-Goals:**

- No se tocan detalle de célula, Torre ni sprint (fase C); no hay badge en la entrada de menú.
- No hay edición ni borrado de ausencias: corregir = rechazar + registrar de nuevo (queda trazado).
- Sin festivos colombianos en el conteo de días hábiles (L–V solamente); se anota como mejora cuando exista un calendario administrable.

## Decisions

- **Los días y los impactos los calcula el handler/servicio, no el formulario.** El alta manda persona, tipo y rango; `businessDays`, `businessDaysInMonth` y `squadImpacts` vuelven calculados. Alternativa considerada: calcular en el cliente con la lista de asignaciones. Se descarta: duplicaría la regla en dos lugares justo antes de que `add-provider-billing` la necesite del lado del dato.
- **Fórmula del impacto**: días hábiles dentro del mes ÷ días hábiles del mes × FTE disponible × (dedicación de cada célula ÷ 100). La fila muestra la célula de mayor dedicación; los KPIs suman el reparto completo. Empates de dedicación: gana la primera por orden alfabético (determinista y sin importancia real).
- **Toda ausencia nace Solicitada aunque la registre el propio lead.** Aprobar es el acto que dispara impactos (y mañana, descuentos de factura); fundir registro+aprobación en un paso borraría esa traza. El drawer no ofrece "aprobar de inmediato": aprobar es un click en la fila recién creada.
- **El rechazo reusa el patrón del backlog**: drawer con motivo obligatorio (`Textarea`), trazado en el registro. Mismo vocabulario que la curación (RN-53) para que el usuario ya lo conozca.
- **Estados y tipos viajan en inglés en el DTO** (`Requested/Approved/Rejected`, `Vacation/Leave/SickLeave`) y el adapter traduce a etiquetas — igual que seniority y modality en personas.
- **El mes visible vive en la URL** (`?mes=2026-07`): navegar meses es refetch con el query param, y un enlace compartido abre el mismo mes. Default: mes actual.
- **Tipos como `Tag` (categoría), estados como `Badge` (estado)** — la distinción que tuip ya documenta; el proveedor bajo el nombre reusa la anatomía persona+subtexto de las tablas existentes.

## Risks / Trade-offs

- **[El impacto usa la dedicación vigente, no la del mes de la ausencia]** → Aceptado en Fase A: no hay historial de asignaciones. Queda dicho acá; la calibración histórica es problema del backend real.
- **[Sin festivos, los días hábiles pueden sobrecontar]** → Aceptado y anotado en Non-Goals; el número sigue siendo mejor que la memoria. El formulario muestra los días contados antes de enviar, así el lead lo ve.
- **[Solape validado sólo contra no-rechazadas]** → Una rechazada no bloquea re-registrar el mismo rango — es exactamente el camino de corrección elegido.

## Migration Plan

1. Handler de mock + service + adapter (fórmula y traducciones) con sus pruebas.
2. Feature `absences` (contenedor, KPIs, tabla, drawers de alta y rechazo) con sus pruebas.
3. Ruta + entrada de navegación + breadcrumb; ajuste de pruebas del shell.
4. Verificación en pantalla con `pnpm dev:auth`.

Rollback: retirar la ruta y la entrada del menú deja la app como hoy — nada existente depende de la feature.
