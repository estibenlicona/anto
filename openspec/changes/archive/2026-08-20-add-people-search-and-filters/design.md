## Context

Hoy `GET /people` (backend real y mock) solo acepta `page`/`pageSize`. `tuip` ya tiene `SearchField` (input con ícono de búsqueda) y `FilterButton` (trigger tipo Popover con checklist de `Checkbox`, controlado: recibe `options: {value,label}[]`, `selected: string[]`, `onChange`) — ambos ya siguen el mismo contrato "controlado" que `Select`/`Combobox`: nunca saben de backend, solo notifican cambios. No hace falta ningún componente nuevo en tuip: `SearchField` y `FilterButton` se componen directamente donde se necesiten, sin un contenedor de layout compartido — eso da más flexibilidad para que cada pantalla arme su propia fila de filtros como le convenga. `PeopleContainer` ya carga `seniorities: Seniority[]` y `sfiaLevels: SfiaLevelOption[]` vía `useCatalogs`. El backend real no tiene migraciones aplicadas a una BD real (brecha ya documentada en el change de paginación), pero sus tests de repositorio corren contra SQLite in-memory con `EnsureCreated`, sin necesitar esas migraciones — por eso el trabajo de backend de este change sí es verificable con `dotnet test`. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Toolbar de Personas con `SearchField` + dos `FilterButton` ("Seniority", "Nivel SFIA"), igual a la imagen de referencia, compuestos directamente en `PeopleList.tsx`.
- Búsqueda y filtros combinables entre sí y con la paginación, con el mismo contrato en mock y backend real.
- Reset a página 1 cuando cambia la búsqueda o cualquier filtro.

**Non-Goals:**
- No se reubica "Crear persona" en este change (su destino futuro sobre cards tipo dashboard es un change aparte).
- No se agrega un contador de personas en el toolbar (la imagen lo muestra, pero ya existe "Mostrando X–Y de Z" en el pie de la tabla; duplicarlo no aporta).
- No se filtra por modalidad (la imagen de referencia no lo pide; el filtro se limita a Seniority y Nivel SFIA).
- No se toca el esquema de BD ni se agregan migraciones — los filtros son solo de lectura sobre columnas (`Name`, `Position`, `Seniority`, `SfiaLevel`) que ya existen.
- No se crea ningún componente de layout compartido en tuip para agrupar buscador+filtros — cada pantalla los compone individualmente, a propósito, para no atarse a una forma común que no se necesita todavía.

## Decisions

**Contrato de query params** (igual en mock y backend real): `GET /people?page=&pageSize=&search=&seniority=&seniority=&sfiaLevel=&sfiaLevel=`. `search` es texto libre opcional; `seniority` y `sfiaLevel` son repetibles (0 o más valores), sin corchetes. El binding de minimal API de ASP.NET espera exactamente esa forma para `string[]?`/`int[]?`.

**Corrección durante la verificación**: el supuesto inicial de que axios serializa arrays como claves repetidas por defecto era incorrecto — su serializador por defecto emite `seniority[]=Senior` (notación con corchetes), que ni el mock ni el binding de ASP.NET reconocen, así que el filtro no aplicaba pese a que el estado y la UI se veían correctos. Se corrigió construyendo el `URLSearchParams` a mano en `personService.list` (`params.append("seniority", valor)` por cada valor) en vez de pasar un objeto con arrays a axios, evitando depender de su serializador interno.

**Búsqueda por nombre o cargo**: coincidencia parcial, insensible a mayúsculas, sobre `Name` OR `Position`. En el backend real, `EF.Functions.Like` o `.Contains(...)` con `ToLower()` en ambos lados (SQLite/SQL Server no son consistentes con `Contains` case-insensitive por defecto). En el mock, `.toLowerCase().includes(...)`.

**Debounce del buscador**: 300ms desde la última tecla antes de disparar la petición — no existe un hook de debounce compartido en el frontend hoy; se agrega uno chico (`useDebouncedValue`) en `shared/hooks`. Los filtros (checkboxes) no necesitan debounce, disparan al tocarlos.

**Reset de página**: `usePeople` vuelve a `page=1` cada vez que cambia `search` (tras el debounce), `seniorities` o `sfiaLevels` — mismo patrón que ya usa `onPageSizeChange`.

**Valores del filtro de Nivel SFIA**: `FilterButton.FilterOption.value` es `string`; los niveles SFIA son `number` (1-4). Se convierten a string para el checklist (`String(level.value)`) y se reconvierten a `number[]` antes de mandarlos a `personService.list`.

**Estado "sin resultados" vs. estado vacío real**: `PeopleList` ya tiene un estado vacío que invita a crear la primera persona (cuando `people.length === 0`). Ese mensaje es incorrecto cuando el listado está vacío por un filtro/búsqueda muy acotado. Se distingue con una bandera derivada: hay búsqueda o filtro activo (`search`, `seniorities` o `sfiaLevels` no vacíos) — si es así y `people.length === 0`, se muestra un `EmptyState` distinto ("sin resultados, ajustá la búsqueda o los filtros") en vez del que invita a crear.

**Composición del toolbar en `PeopleList.tsx`**: sin un componente de layout compartido, `SearchField` y los dos `FilterButton` se renderizan directamente en un `<div className="flex items-center gap-3">` propio de `PeopleList`, arriba de la tabla:

```tsx
<div className="flex items-center gap-3">
  <SearchField placeholder="Buscar por nombre o cargo" value={search} onChange={...} />
  <FilterButton label="Seniority" options={seniorityOptions} selected={selectedSeniorities} onChange={setSelectedSeniorities} />
  <FilterButton label="Nivel SFIA" options={sfiaOptions} selected={selectedSfiaLevels} onChange={setSelectedSfiaLevels} />
</div>
```

Toda la lógica de debounce, reset de página y llamada a `personService.list` sigue en `usePeople`/`PeopleContainer` — `SearchField` y `FilterButton` solo notifican cambios, igual que el resto de los controles controlados de tuip. Si más adelante varias pantallas repiten este mismo patrón de layout, ese sería el momento de extraer un componente compartido — no antes.

**Backend — filtrado en `PersonRepository.GetPagedAsync`**: se agregan parámetros opcionales (`string? search, IReadOnlyCollection<string>? seniorities, IReadOnlyCollection<int>? sfiaLevels`) y se aplican como `Where` condicionales antes de `CountAsync`/`Skip`/`Take`, igual que hoy pero con la query construida incrementalmente. `seniority` llega como string y se compara contra `Person.Seniority.Value` (ya es un value object con `Value: string`); `sfiaLevel` compara contra `Person.SfiaLevel.Value` (int). Valores de `seniority` que no matcheen el catálogo simplemente no filtran nada (no se valida contra `Seniority.ValidValues` — un valor no reconocido da 0 resultados, comportamiento aceptable para un filtro).

## Risks / Trade-offs

- [Sin debounce, cada tecla dispara una petición] → 300ms de debounce en el buscador, igual que el patrón común en el resto de la industria; los checkboxes de filtro no lo necesitan porque no se disparan en ráfaga.
- [`seniority`/`sfiaLevel` con valores fuera de catálogo] → Se aceptan sin validar (dan 0 resultados) en vez de devolver 400, porque vienen de un checklist controlado por el propio catálogo — un valor inválido solo puede llegar manipulando la URL directamente, caso no crítico.
- [Verificación end-to-end contra un backend real desplegado] → Sigue bloqueada por la falta de una BD real (misma brecha de la paginación); se verifica con los tests de repositorio/use case sobre SQLite in-memory, que sí corren en este entorno.
