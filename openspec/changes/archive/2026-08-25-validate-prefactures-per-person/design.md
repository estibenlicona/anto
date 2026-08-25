## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La unidad actual está en el proveedor.** `BillingDto` es un cierre por proveedor y período, con `lines: BillingLineDto[]` por persona. El listado (`BillingPeriodRowDto`) tiene una fila por proveedor. Todo el módulo —resumen, detalle, registro, objeción— cuelga de esa forma.
- **Los datos de imputación no existen.** De los doce que el control pide, el contrato guarda tres: `InvoiceDto.number`, `InvoiceDto.amount` y `BillingDto.period`. Concepto, cuenta contable y su número, centro de costos, orden de compra, cuenta de pago y moneda no están. `CoE` no aparece en ninguna parte del código.
- **La moneda está fija.** `BillingAdapter.money()` formatea COP literal, y el esperado sale de `Person.monthlyCost`, que es un número sin moneda.
- **El período ya vive en la URL** del listado, pero su selector se dibuja dentro del cuerpo, con el mismo peso visual que un filtro.
- **Base limpia**: ni `provider-billing` ni el requisito del handler de facturación tienen deltas pendientes.

## Goals / Non-Goals

**Goals:**

- Que la unidad de revisión sea la misma que la unidad de gestión: la persona.
- Que la pantalla permita responder "¿contra qué se imputó esto y con qué orden se paga?", no sólo "¿la cifra cuadra?".
- Que el módulo nombre lo que realmente se revisa.

**Non-Goals:**

- El paso de prefactura a factura emitida.
- Multi-moneda real. Se captura el campo; COP es el único valor admitido.
- Catálogos administrables de cuentas contables o centros de costos.

## Decisions

- **La persona es la unidad, y el proveedor queda como atributo.** Es lo que pediste y lo que hace consistente al módulo con quién lo usa. La consecuencia que hay que aceptar: un proveedor con cinco externos genera cinco prefacturas por período, así que el listado crece de "un puñado de proveedores" a "todas las personas externas". Por eso el proveedor sobrevive como criterio de agrupación y filtro — es con quien se reclama, aunque no sea la unidad de revisión.
- **La palabra cambia en todo el módulo, no sólo en los rótulos.** *Prefactura* y *factura* no son sinónimos: una se objeta, la otra se corrige contablemente. Si el contrato sigue diciendo `invoice`, el próximo que lo lea va a asumir que ya está emitida. El rename llega al DTO, al handler y a los nombres de requisito — por eso el delta usa bloques `RENAMED`.
- **La imputación puede llegar incompleta, y lo que falta se ve.** En la práctica la prefactura llega antes que la orden de compra. Exigirla al registrar esconde documentos que ya están sobre la mesa; dejarla en blanco los hace indistinguibles de los revisados. Por eso el contrato admite `null` y la interfaz muestra "faltante" — un campo vacío y un campo que nadie llenó se leen igual y no son lo mismo.
- **La moneda se captura pero se restringe.** Guardar el campo sin restringir el valor sería peor que no tenerlo: el módulo entero vale por `prefacturado − esperado`, y esa resta con dos monedas y sin tasa da un número que parece válido y no lo es. El handler rechaza con 400 y lo dice. Alternativa considerada: aceptar USD y no calcular diferencia — se descartó porque deja filas que no se pueden revisar dentro de una pantalla cuya razón de ser es revisarlas.
- **El período sube al encabezado.** No es un filtro: es el eje de la pantalla, y también manda sobre los indicadores. Un control que gobierna todo lo que se ve no puede tener el mismo peso que uno que acota una tabla.
- **La card de novedades dice qué se comprueba.** "Nacen en Ausencias y se comprueban acá" explica la procedencia del dato, que a quien revisa no le cambia la decisión. Lo que sí le sirve es que esos días son los que justifican el descuento. Se mantiene la card; cambia lo que dice.
- **El `Purpose` de la capability se escribe.** Quedó como `TBD - created by archiving` y este change trata precisamente del objetivo del módulo. Es una edición directa de `openspec/specs/provider-billing/spec.md`, porque el `Purpose` de un delta se ignora para una capability que ya existe.

## Risks / Trade-offs

- **[El listado crece y los indicadores cambian de significado]** → Las tres lecturas del período pasan a contar prefacturas por persona. La misma pantalla va a mostrar números más grandes sin que nada falle, que es la forma silenciosa de este error. Por eso el requisito exige que las lecturas digan la unidad, y la revisión es uno por uno.
- **[Un proveedor con muchos externos produce muchas filas]** → Es la consecuencia directa de la decisión. Se mitiga con el agrupado y el filtro por proveedor; si con datos reales sigue siendo incómodo, el paso siguiente es un resumen plegable por proveedor, no volver atrás la unidad.
- **[La imputación opcional se vuelve permanentemente incompleta]** → Si nadie completa la orden de compra, el módulo tiene filas eternamente "faltantes" y el control no se cumple. Lo que lo hace visible es justamente marcarlas; lo que haría falta después es una lectura de cuántas están completas, que este change no incluye.
- **[BREAKING sin backend real]** → El contrato cambia de forma, no sólo de campos. Como el backend todavía no sirve este recurso, el costo hoy es cero y el acuerdo queda escrito antes de que exista. Si el backend ya lo hubiera implementado, esto sería una migración.

## Migration Plan

1. El contrato: la prefactura por persona con su imputación, y el rename de *factura* a *prefactura*.
2. El handler y sus semillas, incluidas dos personas del mismo proveedor en células distintas.
3. El listado: filas por persona, con proveedor y célula como datos, y el período en el encabezado.
4. El detalle con la imputación completa y lo faltante marcado.
5. El registro con los campos nuevos y el valor total en pesos.
6. La card de novedades y el `Purpose` de la capability.

Rollback: los pasos 3 a 6 son de interfaz. El 1 y el 2 son el contrato y revertirlos es otro cambio de contrato.

## Open Questions

- Si "CoE" y "célula" son dos catálogos distintos o dos nombres de lo mismo. El requisito dice "célula o CoE" y admite cualquiera de los dos; si resultan ser listas separadas, se resuelve al poblar el dato sin cambiar lo que acá se decide.
