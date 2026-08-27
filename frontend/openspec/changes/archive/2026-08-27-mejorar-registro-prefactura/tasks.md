## 1. Adaptador: helpers de formato

- [x] 1.1 En `BillingAdapter.ts`, añadir `digitsOnly(text)` (deja sólo dígitos), `formatDigits(digits)` ("11500000" → "11.500.000", "" → "") y `shortDate(iso)` ("2026-07-08T16:20:00Z" → "8 jul", con las abreviaturas de `MONTHS`)
- [x] 1.2 En `billingHooks.test.ts`, cubrir los tres helpers (incluido `digitsOnly("$ 11.500.000") === "11500000"` y `shortDate` con un día de un dígito)

## 2. FormSection: etiqueta y descripción opcionales

- [x] 2.1 En `src/shared/components/FormSection.tsx`, añadir `badge?: ReactNode` (se pinta a la derecha del título, en la misma fila) y `description?: ReactNode` (párrafo `text-body-sm text-neutral-subtle` entre la fila del título y los hijos); sin ellos el markup queda idéntico al actual
- [x] 2.2 Correr las suites de people, squads y allocations para confirmar que sus formularios no cambian

## 3. Drawer: nueva firma y encabezado

- [x] 3.1 En `RegisterInvoiceDrawer.tsx`, reemplazar `providerName`, `period`, `expected`, `isCorrection` por `billing: PrefactureDto`; derivar `isCorrection = billing.status === "Objected"` y `expected = billing.expected`
- [x] 3.2 Subtítulo `${billing.personName} · ${billing.providerName} · ${periodLabel(billing.period)}` (más " · vuelve a revisión con las cifras nuevas" en la corregida)
- [x] 3.3 Actualizar `BillingContainer.tsx` (`billing={invoiceTarget}`) y `BillingDetailContainer.tsx` (`billing={billing}`), retirando las cuatro props viejas

## 4. Drawer: el documento

- [x] 4.1 Envolver "Número de prefactura" y "Fecha de recepción" en un `div className="grid grid-cols-2 gap-4"` dentro de la sección "El documento"; conservar mensajes de error y comportamiento de `DateField`
- [x] 4.2 "Valor total": estado `amountDigits` (string de dígitos); `Input` de texto con `inputMode="numeric"`, `prefix="COP"`, `value={formatDigits(amountDigits)}`, `onChange` con `digitsOnly`; rótulo armado a mano en una fila `flex justify-between` con `<label htmlFor>` "Valor total" y `Button variant="link" size="small"` "Usar el esperado" que escribe `String(billing.expected)`; `parsedAmount = Number(amountDigits)`
- [x] 4.3 Bloque de conciliación bajo el valor: fila "Esperado del período" + `money(expected)`; desglose "Tarifa $X" + " − N días de ausencia $Y" (si `absenceDiscount`) + " + ajuste $Z" / " − ajuste $Z" (si `adjustment`); con valor válido, lectura de diferencia: `Icon status-success` + "Sin diferencia contra lo esperado" (`text-success-default`) o `Icon status-warning` + "Difiere en +$X"/"Difiere en −$X" (`text-warning-default`) con la nota "Se registra igual: el detalle dirá de dónde sale la diferencia."; retirar el `hint` y el párrafo ámbar anteriores; `serverError` se conserva debajo del bloque
- [x] 4.4 En la corregida, antes de la fila número/fecha: bloque `bg-neutral-subtle rounded-control` con `Icon status-error` y dos líneas: "Objetada el {shortDate(objection.objectedAtUtc)} · {document.number} por {money(document.amount)}" y el motivo entre «»; sólo cuando `billing.objection` y `billing.document` existen

## 5. Drawer: imputación

- [x] 5.1 `FormSection` "Imputación" con `badge={<Badge variant="neutral">Opcional</Badge>}` y `description="Suele llegar después que el documento. Lo que falte queda marcado en el detalle para ir a buscarlo."`
- [x] 5.2 Disposición explícita: "Célula o CoE" y "Concepto" (con `placeholder="Servicios profesionales"`) a ancho completo; `grid grid-cols-2 gap-4` con "Cuenta contable", "Número de cuenta contable", "Centro de costos", "Orden de compra"; "Cuenta destinada al pago" a ancho completo. Rótulos y `keys` desde `IMPUTATION_FIELDS` para no duplicar textos
- [x] 5.3 Estado inicial con `useState(() => …)`: primer registro → `costObject: billing.squadName ?? ""` y el resto vacío; corregida → los siete de `billing.document.imputation` con `?? ""`. El envío sigue mandando lo vacío como `null`
- [x] 5.4 Botón de envío: "Registrar" o "Registrar corregida" según el caso; "Cancelar" igual que hoy

## 6. Tests

- [x] 6.1 En `BillingComponents.test.tsx`, `renderDrawer` pasa `billing={prefacture("Pending", {...})}` (con `absenceDiscount` para que haya desglose) y admite overrides del DTO; retirar las cuatro props viejas
- [x] 6.2 Actualizar "avisa cuando el monto difiere de lo esperado, y registra igual": el assert pasa a `/Difiere en \+\$/` y el envío conserva `amount: 11300000`; el `expected` del fixture debe hacer que 11300000 difiera
- [x] 6.3 Añadir: el subtítulo nombra persona · proveedor · mes; el valor se muestra con puntos ("11300000" → "11.300.000"); "Usar el esperado" llena el valor y muestra "Sin diferencia contra lo esperado"; con valor vacío no hay lectura de diferencia; el desglose muestra tarifa y ausencias
- [x] 6.4 Añadir: "Célula o CoE" prellenada con `squadName` y `concept` enviado como `null` con el placeholder visible; persona sin célula abre vacía
- [x] 6.5 Actualizar "la corregida de una objetada se anuncia como tal": fixture `Objected` con `objection` y `document`; afirmar el bloque "Objetada el …", el motivo, la imputación heredada en los campos y el botón "Registrar corregida"
- [x] 6.6 `BillingContainers.test.tsx`: el flujo de la corregida desde el detalle busca el botón "Registrar corregida" dentro del diálogo (la página tiene otro con el mismo texto); el resto sigue en verde sin cambios

## 7. Verificación

- [x] 7.1 `pnpm vitest run src/features/billing src/features/people src/features/squads src/features/allocations src/shared` en verde; `pnpm lint` sin errores nuevos en los archivos tocados; `prettier --write` sobre ellos
- [x] 7.2 En el navegador (`pnpm dev:mock`, `/app/lead/facturacion`): abrir "Registrar prefactura" de una fila sin documento y comparar con el tablero "Propuesta" del canvas — subtítulo con la persona, número y fecha en una fila, valor con puntos, bloque de conciliación con desglose y diferencia ámbar/verde, "Usar el esperado", imputación con "Opcional", descripción, grid y célula prellenada
- [x] 7.3 En el navegador: objetar una prefactura y abrir "Registrar prefactura" desde su menú o su detalle; comparar con el tablero "Propuesta · corregida" — bloque de objeción, imputación heredada, botón "Registrar corregida"; registrar y confirmar que vuelve a "En revisión"
- [x] 7.4 Abrir un formulario de Personas o Células y confirmar que `FormSection` se ve igual que antes

## 8. Ajustes tras la revisión

- [x] 8.1 Renombrar la zona "El documento" a "Prefactura" (drawer y spec)
- [x] 8.2 Añadir en la zona "Prefactura" el control "Cargar PDF" (input de archivo `application/pdf` oculto + botón secundario con `attach-doc`); con archivo, mostrar su nombre, "Cambiar PDF" y "Quitar"; sin archivo, la explicación de la lectura futura. El archivo no viaja en la petición
- [x] 8.3 Corregir el padding doble del cuerpo del drawer (`DrawerBody` con `style={{ padding: 0 }}` además de `p-0`, porque `cn` de tuip no resuelve conflictos y `.px-6` gana a `.p-0`)
- [x] 8.4 Alinear el título de `FormSection` con su icono (`m-0` en el `h3`: el margen inferior por defecto subía el texto 6px respecto de la pastilla)
- [x] 8.5 Tests: adjuntar/quitar PDF; verificación en el navegador de padding (24px por lado, como el encabezado) y alineación
