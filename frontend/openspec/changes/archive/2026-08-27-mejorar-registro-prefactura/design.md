## Context

`RegisterInvoiceDrawer` recibe hoy `providerName`, `period`, `expected` e `isCorrection`, y apila con `FormSection` diez campos a una columna: tres del documento (número, `DateField`, valor `type="number"` con prefijo COP y `hint` "Esperado del período: $X") más un párrafo ámbar cuando difiere, y siete de imputación en un `map` sobre `IMPUTATION_FIELDS`. El envío arma `RegisterPrefactureRequest` con lo vacío como `null`. Lo montan `BillingContainer` (con `invoiceTarget: BillingRow`, que extiende `PrefactureDto`) y `BillingDetailContainer` (con `billing: PrefactureDto`). `FormSection` (compartido con Personas, Células y Asignaciones) pinta pastilla + título y apila hijos con `gap-4`.

El `PrefactureDto` ya trae todo lo que la propuesta muestra: `personName`, `squadName`, `monthlyCost`, `absenceDiscount {businessDays, amount}`, `adjustment`, `expected`, `status`, `objection {reason, objectedAtUtc}` y `document {number, amount, imputation}`. El sistema de diseño tiene `Badge variant="neutral"`, `Button variant="link"`, tonos `warning`/`success` y `Input` con `prefix`. Ver proposal.md — Why y el canvas "Registro de prefactura" para la disposición aprobada.

## Goals / Non-Goals

**Goals:**
- Implementar la propuesta tal como está en el canvas, con los componentes y tokens de tuip.
- Que la conciliación se entienda sin abrir el detalle: esperado, desglose y diferencia a la vista.
- Que la imputación diga que es opcional y llegue con lo que ya se sabe.
- No cambiar el contrato con el backend ni el flujo de estados.

**Non-Goals:**
- Tocar `AdjustLineDrawer`, `EditInvoicedDialog`, `BillingDecisionDialog` o el detalle de prefactura.
- Añadir validación nueva (la imputación sigue opcional; la diferencia no bloquea).
- Cambiar `Input` o `DateField` en tuip: todo se compone con lo que existe.

## Decisions

**1. El drawer recibe `billing: PrefactureDto` en vez de cuatro props.**
La propuesta necesita persona, célula, tarifa, ausencias, ajuste, objeción y documento anterior; pasarlos uno a uno es ocho props más. Los dos consumidores ya tienen el DTO a mano. `isCorrection` se deriva de `billing.status === "Objected"`. Alternativa descartada: mantener las props y añadir las nuevas — dispersa lo que es un solo objeto.

**2. El valor total es un `Input` de texto con `inputMode="numeric"`, no `type="number"`.**
`type="number"` no admite separadores de miles y en Chrome acepta "e" y signos. Se guarda el estado como dígitos (`"11500000"`) y se muestra formateado con un helper `formatDigits(digits)` → `"11.500.000"`; al escribir se hace `onChange` con `digitsOnly(value)`. El test existente que escribe `"11300000"` sigue valiendo: entra como dígitos y se envía como `11300000`. `type="number"` se conserva en los otros formularios: este change no lo generaliza.

**3. El bloque de conciliación es markup del drawer, no un componente de tuip.**
Es un `div` con borde `neutral`, fondo `neutral-subtlest`, radio `control`, y tres partes: fila "Esperado del período" + cifra, desglose en `text-neutral-subtlest`, y la lectura de diferencia con `Icon status-warning`/`status-success`. Se construye el desglose a partir del DTO: siempre "Tarifa $X"; "− N días de ausencia $Y" si `absenceDiscount`; "+ ajuste $Z" (o "−") si `adjustment`. Es específico de esta pantalla; promoverlo a tuip sería prematuro.

**4. "Usar el esperado" es `Button variant="link" size="small"` en la fila del rótulo.**
`Input` no tiene slot para un control junto al `label`, así que el rótulo de "Valor total" se arma a mano con `FieldLabel`-equivalente (mismas clases `text-body-sm font-medium`) y el botón a la derecha, y el `Input` va sin `label` pero con `id` + `<label htmlFor>` para que `getByLabelText("Valor total")` siga funcionando. El botón escribe `String(expected)` en el estado de dígitos.

**5. `FormSection` gana `badge?: ReactNode` y `description?: ReactNode`, ambos opcionales.**
La etiqueta "Opcional" va junto al título y la explicación bajo la fila del título, antes de los hijos. Con ambos ausentes el markup es el de hoy, así Personas, Células y Asignaciones no cambian. Alternativa descartada: meter la etiqueta y el texto como primer hijo — el `gap-4` de los hijos separaría el texto del título más de lo que la propuesta muestra.

**6. Los cuatro campos cortos de imputación van en un `grid grid-cols-2 gap-4` dentro de la sección.**
Se deja de iterar `IMPUTATION_FIELDS` a ciegas: el drawer declara el orden y la disposición (célula, concepto, grid de cuatro, cuenta de pago). `IMPUTATION_FIELDS` se conserva para el detalle y `missingImputationCount`. El rótulo "Número de cuenta contable" se mantiene completo (el mockup lo abrevió por espacio; a dos columnas de ~200px cabe en una línea con `text-body-sm`).

**7. Prellenado según el caso.**
Primer registro: `costObject = billing.squadName ?? ""`, resto vacío, `concept` con `placeholder="Servicios profesionales"`. Corregida: los siete de `billing.document.imputation` (con `?? ""`). El estado inicial se calcula una vez en `useState(() => …)`; los contenedores ya remontan el drawer con `key` por prefactura, así que no hay que sincronizar props → estado.

**8. La fecha de la objeción se formatea con un helper `shortDate(iso)` en el adaptador.**
No existe uno en billing (Ausencias tiene `dayMonth` privado). Devuelve "8 jul" a partir del ISO, con las abreviaturas de `MONTHS` en minúscula, como usa el resto de la pantalla. El bloque de objeción es un `div` con fondo `neutral-subtle`, `Icon status-error` en tono `neutral-subtle` y dos líneas: "Objetada el 8 jul · PF-2049 por $ 11.500.000" y el motivo entre comillas latinas.

**9. Subtítulo con `periodLabel` en minúscula.**
El mockup escribió "Agosto 2026"; en la app el mes a mitad de frase va en minúscula ("Prefacturas · agosto 2026") y `periodTitle` se reserva al navegador. Se sigue la convención de la app.

## Risks / Trade-offs

- [Cambiar la firma del drawer rompe a quien lo importe fuera de billing] → Verificado: sólo los dos contenedores y el test. Si aparece un tercero, TypeScript lo señala.
- [Formatear mientras se escribe mueve el cursor al final en cada tecla] → Aceptado: el valor es un entero corto que se escribe de corrido; se documenta en el código. Si molesta, el siguiente paso es un `Input` con máscara en tuip, fuera de este change.
- [El bloque de conciliación alarga la zona del documento] → Compensado por la fila a dos columnas y el grid de imputación: el drawer queda ~260px más corto que hoy con la misma información.
- [`FormSection` cambia de firma] → Sólo props opcionales; se corren los tests de Personas, Células y Asignaciones como red.
