## Context

La regla ya existe donde manda: `ChangeInitiativeStatusUseCase` (backend .NET) consulta `IInitiativeRepository.HasActiveInitiativeAsync(squadId, excludeId)` y lanza `BadRequestException` al activar una segunda. Lo que falta es que las dos puntas del frontend hablen el mismo idioma que esa regla.

Hoy no lo hacen:

- `SquadDto.initiatives: SquadInitiativeDto[]` es una **lista** de vigentes (`status: "Evaluating" | "Active"`, `talla: string | null`), y `SquadsList` la pinta como lista: `slice(0, 3)`, `+N`, `"N iniciativas"`, y un caso `Sin evaluar` para las que no tienen talla.
- El mock la deriva de las iniciativas: `initiativesOf(squadId)` filtra `status !== "Closed"`. Derivarlo —en vez de guardarlo en la célula— es lo que hace que evaluar o cerrar una iniciativa se vea en el listado de Células dentro de la misma sesión; eso se conserva.
- `PUT /initiatives/:id/status` del mock sólo valida talla al activar y estado activo al cerrar. No conoce la regla del backend, así que el mock acepta lo que el servidor real rechaza.
- `canActivate` en `InitiativeAdapter` es, hoy, "tiene talla".

El backend real todavía no sirve los campos calculados de la célula (brecha ya documentada en `redesign-squads-module`): el adapter los tolera ausentes con `??`. Por eso cambiar la forma del campo es barato: hoy el único productor es el mock.

## Goals / Non-Goals

**Goals:**

- Que la columna del listado de Células responda una sola pregunta —qué está ejecutando esta célula— con un dato o con "Sin iniciativa".
- Que el tipo del contrato haga imposible el caso "varias": no depender de que el productor mande una sola.
- Que "Activar" quede deshabilitado cuando la célula ya está ocupada, y que el rechazo del servidor llegue en español si alguien llega a confirmar igual.
- Que el mock rechace lo mismo que el backend, para que la app contra mocks no enseñe un comportamiento que el servidor real no permite.

**Non-Goals:**

- Tocar la regla del backend: está implementada y probada.
- Limitar cuántas iniciativas en evaluación tiene una célula.
- Agregar acciones a la columna del listado de Células.

## Decisions

### 1. El contrato pasa de lista a campo nullable

`SquadDto.initiatives: SquadInitiativeDto[]` → `SquadDto.activeInitiative: SquadActiveInitiativeDto | null`, con `{ id, name, talla }`.

- **`status` desaparece del DTO**: sólo podía valer `"Active"`. Un campo con un único valor posible es ruido que invita a filtrar de nuevo aguas abajo.
- **`talla` deja de ser nullable**: sólo se activa con evaluación guardada, así que la activa siempre tiene talla. Esto es lo que borra el caso "Sin evaluar" de la columna. Si el backend real llegara a mandar una activa sin talla, el adapter la trata como si no hubiera activa (`null`) en vez de inventar una etiqueta vacía — el listado no es el lugar para denunciar esa inconsistencia.
- **Alternativa descartada**: dejar el array y hacer que `SquadsList` tome `initiatives.find(i => i.status === "Active")`. Mantiene el filtro en la vista, deja el resto del array viajando sin consumidor, y el día que dos activas se colaran la vista elegiría una en silencio. El tipo es el lugar barato para decir "una o ninguna".

`squadAdapter.toEntity` mantiene la tolerancia a la ausencia: `activeInitiative: dto.activeInitiative ?? null`.

### 2. La columna se reduce al caso de una

`SquadsList` pierde `INITIATIVE_SAMPLE_SIZE`, el `slice`, el `+N`, la rama `"N iniciativas"` y la rama `Sin evaluar`. Queda la forma que hoy ya se usa cuando hay una sola: `Tag` con la talla (color de `tallaColor`, el del módulo de Iniciativas) y debajo el nombre como enlace neutro a `evaluationPath(id)`, truncado con `title`. Sin activa: `Sin iniciativa` con `SECONDARY_TEXT`.

El encabezado de la columna pasa de **Iniciativas** a **Iniciativa**: una columna que muestra una cosa no se rotula en plural, y el rótulo es lo que fija la expectativa antes de leer la celda.

### 3. `initiativesOf` → `activeInitiativeOf` en el mock

Sigue derivando de `getInitiativesSnapshot()`, pero filtra `status === "Active"` y devuelve el primero o `null`. Con la validación del punto 4, "el primero" y "el único" coinciden; usar `find` y no un `filter[0]` hace explícito que se espera uno.

Las semillas hay que revisarlas: `squads.handler.test.ts` afirma hoy que una célula tiene dos iniciativas con una talla y otra sin, y el mock permitió activar sin regla. Si alguna célula quedara sembrada con dos activas, se corrige la semilla (una activa, la otra en evaluación) — el mock no debe partir de un estado que él mismo ya no permite alcanzar.

### 4. El mock rechaza la segunda activación con el mensaje del producto

En `PUT /initiatives/:id/status`, junto a la validación de talla:

```
si status === "Active" y existe otra iniciativa de la misma célula, distinta de ésta, con status "Active"
  → 400 { message: "La célula ya tiene una iniciativa activa. Ciérrala antes de activar otra." }
```

El mock es el que decide el texto que el usuario lee, igual que hace hoy con "Para activar una iniciativa primero hay que evaluarla". El backend real responde en inglés (`"The squad already has an active initiative..."`), pensado para el log, no para la pantalla. **Decisión**: la pantalla NO traduce ni mapea el mensaje del servidor; muestra el que recibe. Mapear por texto es frágil (cualquier reescritura del backend rompe la traducción en silencio). Que el backend responda en español es un problema aparte, y no de este change; queda anotado como riesgo.

`excludeInitiativeId` importa: reactivar la que ya está activa no debe chocar consigo misma, igual que hace el backend.

### 5. `canActivate` incorpora la condición, y el menú sólo deshabilita

`canActivate` pasa a ser `talla != null && !squadHasOtherActive`. La condición necesita saber, por cada iniciativa, si su célula ya tiene otra activa — dato que el listado de Iniciativas ya tiene en la página cargada sólo si la activa está en esa página, lo cual no está garantizado con paginación.

**Decisión**: el cálculo no se hace sobre la página. `GET /initiatives` gana un campo por fila —`squadHasOtherActive: boolean`—, resuelto por el mock contra todas las iniciativas, no contra la página. Es el mismo criterio que ya usa el listado de Células (derivar del conjunto, no de lo que se ve).

- **Alternativa descartada**: derivarlo en el cliente con `initiatives.some(i => i.squadId === x && i.status === "Active")` sobre la página. Con filtros o paginación activos da falsos negativos: habilitaría "Activar" y la acción fallaría contra el servidor. Un menú que promete lo que el servidor rechaza es peor que no deshabilitar nada.

En el menú, "Activar" simplemente queda deshabilitado, sin explicar por qué. **Decisión (revisada durante la implementación)**: el ítem no lleva motivo. Es el mismo tratamiento que ya tiene "Activar" sin talla, y decirlo exigiría una variante de `MenuItem` que tuip no tiene —`MenuItemProps` acepta `icon`, `children`, `destructive`, `disabled` y `onSelect`, nada más—, así que el motivo costaría un cambio en el design system para una explicación que nadie pidió. El rechazo del servidor sigue cubriendo el caso de quien llegue a confirmar igual.

### 6. El error del servidor se muestra donde ya se muestra

`StatusConfirmDialog` ya pinta `serverError` sin cerrarse. No hace falta nada nuevo: con el punto 4, ese error es el mensaje en español. La ruta "el usuario igual llegó a confirmar" (dos pestañas, o una activación concurrente) queda cubierta por el mismo camino.

## Risks / Trade-offs

- **El backend responde en inglés.** Si la app se conecta al backend real, el usuario ve "The squad already has an active initiative...". Es el estado de hoy para todos los errores del servidor, y este change no lo empeora ni lo arregla; queda como deuda anotada (traducir en el servidor, o un catálogo de códigos de error, no un mapeo por texto).
- **`squadHasOtherActive` es un campo derivado más en el DTO de iniciativas.** Suma una consulta al conjunto por página listada. Contra el mock es gratis; contra el backend real será una columna calculada. La alternativa —no dar el dato y dejar que "Activar" falle— traslada el costo al usuario.
- **Perder el recuento de iniciativas en evaluación.** El Chapter Lead ya no ve desde Células que una célula tiene tres iniciativas dimensionándose. Es deliberado: esa lectura pertenece al listado de Iniciativas, que ya filtra por célula y por estado. Si más adelante hace falta en Células, entra como dato propio y no colgado de la columna de la activa.
- **Cambio de forma en el contrato.** Cualquier consumidor de `SquadDto.initiatives` que aparezca después del inventario (hoy: sólo `SquadsList` y sus pruebas) rompe en compilación, no en runtime — que es donde se quiere que rompa.
