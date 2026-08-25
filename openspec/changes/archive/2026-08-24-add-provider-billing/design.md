## Context

- Personas: `PersonDto.providerId` (null = interno), `monthlyCost`, catálogo `GET /companies` (5 proveedores); el mock expone `getPeopleSnapshot()` y `getCompaniesSnapshot()`. Hoy sólo dos personas son externas (María → GFT, Camila → QVision).
- Asignaciones: `getAllocationsSnapshot()` da la célula de cada persona (para la columna Célula de la línea).
- Shell: `leadNavGroups`/`leadRouteTitles`; breadcrumb de un nivel final (tuip colapsa >3 niveles).
- tuip: `Table`, `Card`, `DistributionCard` (headline/inline), `Badge`, `Drawer`, `Input`, `Textarea`, `Select`, `SegmentedControl`, `Menu`, `Modal`, `EmptyState`, `Link`. No hay input de moneda ni de monto con signo.

## Goals / Non-Goals

**Goals:** cierre mensual por proveedor, trazable (líneas congeladas, ajustes con motivo, aprobación), mock-first; un solo origen de externos y costos (personas).

**Non-Goals:** tarifas en Admin; documento de factura; exportación; horas como base.

## Decisions

1. **Período como `YYYY-MM`** en query y en el modelo; el selector muestra el mes en curso y los 5 anteriores con `Select` (etiqueta "agosto 2026"). Sin estado global: la ruta del listado lleva `?period=`.
2. **Líneas congeladas al generar**: `BillingLine` copia `monthlyCost`, `position` y `squadName` del snapshot en el momento de generar. Regenerar no toca cierres existentes; para reflejar un cambio de costo hay que quitar el cierre (fuera de alcance) o ajustarlo.
3. **Ajuste como entero con signo** (`amount`, pesos) + `reason` de catálogo (`UnworkedDays | PartialEntry | Exit | Other`) + `note`. Una línea tiene a lo sumo un ajuste; editarlo reemplaza. `line.total = monthlyCost + amount`.
4. **Cálculo en el mock**: subtotal = Σ monthlyCost, adjustments = Σ amount, total = subtotal + adjustments; el frontend no suma.
5. **Pantallas con tuip**: listado con `Select` de período, tres `Card` métricas (total del mes en `text-metric` con formato `es-CO` sin decimales), `Table flush` con `Badge` de estado, `Menu` por fila; detalle con `Table` de líneas, `Drawer` de ajuste (`Input type="number"` para el monto con hint "negativo descuenta", `Select` de motivo, `Textarea` de nota), `Modal` de confirmación al aprobar.
6. **Seeds**: dos externos más en personas (Andrés → TATA, Paula → GFT) para que haya tres proveedores con gente; cierres de ejemplo en el mes anterior (GFT aprobado, QVision borrador con un ajuste) y ninguno en el mes en curso.

## Risks / Trade-offs

- Pocos externos en el mock → pantallas con 2–3 filas; es el dato real del chapter de ejemplo, no se inventan personas.
- Un solo ajuste por línea simplifica el modelo; si hace falta más de uno, el DTO pasa a lista sin cambiar la UI.
- tuip: el monto con signo se captura con `Input type="number"`; anotar como brecha un `CurrencyInput`.
