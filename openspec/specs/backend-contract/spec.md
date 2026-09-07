## Purpose

La capacidad `backend-contract` mantiene el contrato OpenAPI del backend (`backend/oas.json`) y su guía de endpoints (`backend/ENDPOINTS.md`) alineados con lo que el frontend consume, para implementar el backend real sin depender del mock.

## Requirements


### Requirement: Contrato OpenAPI completo del backend
El repositorio SHALL mantener en `backend/oas.json` un documento OpenAPI 3 válido que cubra **todos los endpoints que el frontend consume** (los definidos por `frontend/src/features/*/services` y servidos por los mocks), con sus métodos, rutas, parámetros de query (paginación `page`/`pageSize`, búsqueda y filtros como `level`, `seniority`, `stack`), esquemas de request y response nombrados según los DTOs de TypeScript (`PersonDto`, `PagedResult`, `BalanceSignalDto`, …), y las respuestas de error que los mocks ya practican (400 de validación con `message`, 404, 409 con quién tiene el conflicto).

Las rutas SHALL escribirse sin prefijo, con el prefijo real en `servers` (`/api/v1`): la misma forma relativa que usa el `httpClient` del frontend. La autenticación y el scope por chapter NO SHALL modelarse por endpoint en el cuerpo: son transversales (claims del gateway) y se documentan como convención de seguridad del documento.

#### Scenario: Todo endpoint consumido está en el contrato
- **WHEN** se listan las rutas que los servicios del frontend invocan y se comparan con los `paths` de `backend/oas.json`
- **THEN** cada método+ruta consumido existe en el contrato, y el contrato no declara rutas que nadie consume — con la única excepción del simulador de autenticación del entorno de desarrollo, que no es parte del contrato

#### Scenario: Los esquemas hablan el vocabulario del frontend
- **WHEN** se lee el esquema de una respuesta en el contrato
- **THEN** sus propiedades y enums coinciden con el tipo TypeScript que el frontend ya declara (por ejemplo `level`/`levelLabel` con la escala Tuya de 4, `seniority` con `Junior`/`Intermediate`/`Senior`, el sobre `items`/`page`/`pageSize`/`totalCount`/`totalPages`), sin campos inventados ni renombrados

#### Scenario: El contrato es un OpenAPI válido
- **WHEN** se valida `backend/oas.json` con un validador de OpenAPI 3
- **THEN** el documento pasa sin errores

### Requirement: Catálogos alineados a la separación de Nivel y Seniority
El contrato SHALL exponer `GET /catalogs/levels` (escala Tuya de 4: Principiante, Competente, Avanzado, Experto) y `GET /catalogs/seniorities` (`Junior`, `Intermediate`, `Senior` con etiquetas Junior, Intermedio, Senior), y SHALL NOT declarar `sfia-levels` ni un catálogo de seniority de 4 o 5 valores.

#### Scenario: El enum viejo del Domain queda señalado
- **WHEN** se lee la guía de endpoints en la sección de catálogos
- **THEN** la desalineación del backend actual (enum `Seniority` de 5 valores y endpoint `sfia-levels`) figura como Desalineado, con la corrección esperada

### Requirement: Guía de endpoints y lógica de backend
El repositorio SHALL mantener `backend/ENDPOINTS.md` con el inventario completo, organizado por módulo (Personas y catálogos, Células y asignaciones, Iniciativas, Ausencias, Líneas de expertise, Competencias — catálogo, evaluaciones y planes—, Capacidad/dedicación, Prefacturación, Torre de control, Admin, DevOps/identidades), y para cada endpoint: método y ruta, request/response (por nombre de esquema del oas), **las reglas de negocio que debe implementar** (las que hoy encapsulan los mocks y las specs: señales de balance con sus 6 evidencias y umbrales, capacidad en FTE y horas derivada de los días del sprint y las ausencias, brechas y acciones del plan, generación y ajuste de prefacturas, validaciones de formularios, unicidad de asignación por persona, scope por chapter), y su **estado**: Implementado, Desalineado o Pendiente frente a `backend/src`.

#### Scenario: Un endpoint pendiente se puede implementar sin leer el mock
- **WHEN** un desarrollador de backend toma un endpoint marcado Pendiente en la guía
- **THEN** encuentra ahí la ruta, los esquemas, las reglas de negocio y los errores esperados, suficientes para implementarlo y que el frontend funcione apuntando al backend real sin cambios

#### Scenario: El semáforo refleja el backend actual
- **WHEN** un endpoint ya existe en `backend/src` con la misma forma del contrato
- **THEN** figura como Implementado; si existe con otra forma (ruta, esquema o enum distinto), figura como Desalineado con la diferencia anotada
