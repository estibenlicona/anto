# Diseño — Backend: módulo Prefacturación

## Context

Ver proposal.md. Formas objetivo en `backend/oas.json` (`PrefactureDto`, `BillingAdjustmentDto`, `PrefactureDocumentDto`, `ImputationDto`, `ObjectionDto`, `AbsenceDiscountDto`, `GeneratePrefacturesRequest`, `RegisterPrefactureRequest`, `SetPrefacturedRequest`, `SetBillingStatusRequest`, enums `BillingStatus`, `AdjustmentReason`, `Currency`). La semántica canónica vive en `frontend/src/mocks/handlers/billing.handlers.ts` (`deriveDiscount`, `toDto`, `externals`, `blank`, `editBlocked`, `working`) y sus semillas en `billing.seeds.ts`. Las reglas de negocio están en `openspec/specs/provider-billing/spec.md`.

Convenciones ya asentadas en los siete módulos anteriores: agregados `AggregateRoot` con las invariantes en el constructor y en los métodos; value objects cerrados; derivados por request en una clase de contexto (`AbsenceContext`, `InitiativeContext`); FluentValidation → 400; `IEndpointDefinition` por módulo; ejemplos Swagger con `IExamplesProvider`; provider InMemory/Postgres con semillas en `DevelopmentDataSeeder`. Este módulo además lee `IAbsenceRepository` y `BusinessDayMath` de Ausencias (`[[backend-modulo-ausencias]]`) — el mismo patrón de composición entre repositorios de Application que ya usa `AbsenceContext` con Personas/Compañías/Asignaciones/Células, no un servicio nuevo.

## Goals / Non-Goals

**Goals**
- Los 8 endpoints en 🟢, con exactamente los números, transiciones y mensajes que hoy produce el mock.
- El descuento por ausencias leído de Ausencias, no recalculado con una copia de la aritmética.

**Non-Goals**
- Scope por chapter, monedas distintas de COP, editar una aprobada u objetada, limpiar la objeción anterior al registrar la corregida (el mock no lo hace y este cambio no le agrega comportamiento que no tiene).

## Decisions

1. **`Prefacture` como agregado con las invariantes de edición y transición adentro; el cálculo del esperado, afuera, en Application.** Que no se pueda tocar una aprobada u objetada, que aprobar exija nota con diferencia ≠ 0, que objetar exija motivo: son del agregado, no dependen de nada externo. El descuento por ausencias sí depende de un repositorio externo (`IAbsenceRepository`) y de la fecha en que se pregunta, así que vive en un método de Application (`BillingDiscountCalculator` o similar) que el use case invoca antes de pedirle al agregado que se recalcule — igual que `EvaluationEngine` queda fuera de `Initiative` en Iniciativas.

2. **Snapshot congelado como propiedades planas del agregado, no como referencia a `Person`.** `PersonName`, `Position`, `SquadName`, `ProviderId`, `MonthlyCost` se fijan en el constructor al generar y no tienen setter — corresponde a lo que el mock hace copiando el objeto entero en `blank()`. *Alternativa descartada*: guardar sólo `PersonId` y resolver el resto en vivo en cada respuesta, como hace `AbsenceContext`. Se descarta porque el mock demuestra la intención contraria: una prefactura de un período cerrado no debe cambiar de cargo o de célula si la persona se mueve después, y el propio mock nunca relee `Person` para una prefactura ya creada.

3. **`ProviderName` sí se resuelve en vivo, vía `ICompanyRepository` por el `ProviderId` congelado.** Es la única parte del snapshot que el mock recalcula en cada respuesta (`getCompaniesSnapshot().find(...)`) — si la empresa se renombra, las prefacturas históricas deben mostrar el nombre vigente. Distinto del resto del snapshot, que sí se congela.

4. **El descuento por ausencias no se persiste — salvo el congelado al aprobar.** `AbsenceDiscount` en el DTO es `null` cuando la persona no tiene ausencias aprobadas que toquen el período (nunca un descuento en cero), y se recalcula en cada respuesta mientras el estado no sea `Approved`; al aprobar, el agregado guarda `FrozenDiscount` con lo que dio el cálculo en ese instante, y de ahí en adelante la respuesta usa ese valor congelado en vez de recalcular — así una prefactura aprobada no se mueve si después se aprueba o revierte una ausencia del mismo período. Mismo mecanismo que `Initiative.SaveEvaluation` en Iniciativas: un campo que deja de ser derivado en cuanto algo lo fija.

5. **El cálculo del descuento reutiliza `IAbsenceRepository.GetAllAsync` y `BusinessDayMath`, filtrando por `Approved`.** Días hábiles ausentes de la persona en el período = suma de `BusinessDayMath.ClampRange` + conteo de cada ausencia **aprobada** que la toca (mismo cálculo que ya hace `AbsenceContext.ToDto` para el impacto por célula, aplicado aquí a una sola persona y sin el reparto de dedicación). Monto = `Math.Round(costoMensual × diasAusentes ÷ diasHabilesDelPeriodo)`. *Alternativa descartada*: exponer un método nuevo en `IAbsenceRepository` tipo `GetApprovedByPersonAndPeriod`. Se descarta por ahora — el volumen de ausencias por persona es pequeño y `GetAllAsync` ya es el patrón usado por `GetAbsencesByMonthUseCase`; si el volumen crece, se optimiza sin cambiar el contrato.

6. **`Esperado` y `Diferencia` son propiedades calculadas del DTO, no del agregado.** `Expected = MonthlyCost - (AbsenceDiscount?.Amount ?? 0) + (Adjustment?.Amount ?? 0)`; `Difference = Prefactured is null ? null : Prefactured - Expected`. Se calculan en el mapeo hacia el DTO, igual que el mock los calcula en `toDto` y nunca los guarda.

7. **`externals` (personas con proveedor asignado) se resuelve por request, no se persiste como lista.** `GET /billing?period=` arma una fila por cada persona con `ProviderId != null`: si ya existe un `Prefacture` de esa persona y período, se mapea; si no, se responde una fila sintética con `status: "None"` que **no se guarda** — igual que el mock construye `{ ...blank(e, period), status: "None" }` sin tocar el arreglo. `POST /billing/generate` es lo único que persiste: crea `Pending` sólo para quienes aún no tienen registro ese período (idempotente).

8. **Transiciones de estado como métodos del agregado, con `working()` como una sola regla compartida.** `RegisterDocument`, `SetPrefactured` y `SetAdjustment`/`ClearAdjustment` comparten la regla "si estaba `Received`, pasa a `InReview`; si no, no cambia" — un método privado `MoveToReview()` en el agregado, invocado por los tres. `Approve` y `Object` sólo se aceptan desde `Received` o `InReview`. `RegisterDocument` sobre una `Objected` es la única vía a un segundo documento (la corregida) y dispara `MoveToReview` con estado explícito `Received`, igual que sobre una fila sin documento.

9. **El ajuste es un value object con invariante propia: monto entero no cero.** `AdjustmentReason` cerrado a los 4 valores del contrato. La nota es opcional en la request pero el DTO la exige como string — se guarda `""` cuando no llega, igual que el mock (`body.note ?? ""`).

10. **La imputación normaliza cadena vacía a `null` al registrar el documento**, igual que `imputationField` del mock: un campo de imputación es texto con contenido o ausente, nunca `""`. Es la diferencia entre "no llegó la orden de compra" (semilla del período actual) y "llegó vacía", que el contrato distingue con `string | null`.

11. **`Currency` se valida contra el contrato, no contra el mock.** El mock acepta `currency` ausente en la request; el contrato ya lo declara requerido y cerrado a `"COP"`. Este cambio sigue el contrato (ya fijo, sin tocarlo) y exige el campo — sin discrepancia de resultado, porque el único valor válido en ambos lados es `COP`.

12. **Persistencia como entidad normal con columnas propias, no como documento JSON.** A diferencia de Admin (parámetros de fila única) o Iniciativas (evaluación como snapshot completo), acá cada campo del ajuste/documento/imputación/objeción es un value object dueño (`OwnsOne`), no una columna de texto — son pocos campos, tipados, y se consultan por sí mismos (p. ej. reportes futuros por `AdjustmentReason`). Índice único por `(PersonId, Period)`, que es la regla "una prefactura por persona y período" que hoy vive en el `id` determinístico del mock.

13. **Semillas relativas al período actual y al anterior**, como hace `billing.seeds.ts`, sobre las personas externas que Personas ya siembra con proveedor asignado: una aprobada del período anterior con documento completo, una objetada del período anterior con motivo, y una en revisión del período actual con documento pero sin orden de compra.

## Risks / Trade-offs

- [El snapshot congelado puede sorprender si alguien espera ver el cargo o la célula actual de la persona] → es la semántica del mock y de la spec ("líneas congeladas"); documentado en el DTO y en `ENDPOINTS.md`.
- [Sin scope por chapter, `GET /billing` y `POST /billing/generate` responden por todas las personas externas] → igual que los siete módulos anteriores; se cierra cuando llegue el ajuste de seguridad.
- [`GetAllAsync` de ausencias sobre todas las ausencias, no sólo las del período] → volumen pequeño hoy, mismo patrón que `GetAbsencesByMonthUseCase`; se optimiza si crece sin cambiar el contrato.
- [Reutilizar `IAbsenceRepository` desde Application de Prefacturación acopla los dos módulos] → es acoplamiento de Application a Application vía interfaces de Domain, el mismo patrón que `AbsenceContext` ya usa contra Personas/Compañías/Asignaciones; no hay servicio HTTP entre ambos.
- [Objetar no limpia el registro de una objeción anterior al recibir la corregida] → fidelidad al mock; queda como rastro de auditoría, no como error.

## Migration Plan

Sin datos que migrar: tabla `Prefactures` nueva. Orden: Domain (value objects + agregado) → Application (cálculo del descuento reutilizando Ausencias + DTOs + contexto + use cases) → Infrastructure (configuración EF con los `OwnsOne` + repositorio + índice único + semillas) → WebApi (endpoints + ejemplos) → tests → smoke → `ENDPOINTS.md`. Rollback: quitar el endpoint y la tabla; ningún otro módulo depende todavía de Prefacturación.

## Open Questions

(ninguna)
