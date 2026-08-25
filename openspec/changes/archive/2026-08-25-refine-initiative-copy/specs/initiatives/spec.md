## MODIFIED Requirements

### Requirement: Listar iniciativas
El sistema SHALL mostrar, bajo la ruta de Iniciativas del Chapter Lead, un encabezado con el título "Iniciativas", su descripción y el botón **Nueva iniciativa** como única acción principal de la pantalla; tres indicadores sobre el total de iniciativas (no sobre el filtro): cuántas están sin evaluar (sin talla), cuántas están activas con su distribución por talla, y el FTE demandado (suma del FTE esperado de las activas); y un listado paginado con nombre, célula y Product Owner, estado, talla, FTE esperado y plazo objetivo por fila.

El nombre SHALL ser un enlace neutro a la evaluación de esa iniciativa. El estado SHALL mostrarse con el componente de estado del sistema de diseño (En evaluación · Activa · Cerrada), y los tres SHALL distinguirse entre sí por color. Compartir color entre dos estados los vuelve indistinguibles en el listado, y los que más importa separar son justamente los extremos del ciclo: una iniciativa que todavía espera evaluación y una que ya terminó. La talla SHALL mostrarse con el componente de estado en el color de esa talla; una iniciativa sin talla SHALL mostrar en su lugar un enlace neutro **Evaluar** (no un botón) que lleva a la evaluación. El FTE esperado de una iniciativa sin talla SHALL mostrarse como un guion. Cada fila SHALL exponer un menú de acciones (Editar · Activar · Cerrar) con el mismo disparador en todas las filas; el listado NO SHALL repetir botones por fila.

El listado SHALL permitir buscar por nombre y filtrar por estado, célula y talla con el componente de filtro múltiple del sistema de diseño; los filtros se combinan y vuelven a la primera página.

#### Scenario: Encabezado e indicadores
- **WHEN** el Chapter Lead abre Iniciativas
- **THEN** ve el título, la descripción, el botón "Nueva iniciativa" y las tres cards calculadas sobre todas las iniciativas del mock

#### Scenario: Fila con talla
- **WHEN** una iniciativa tiene evaluación guardada
- **THEN** su fila muestra la talla con el color de esa talla y su FTE esperado con dos decimales

#### Scenario: Los tres estados se distinguen entre sí
- **WHEN** el listado muestra iniciativas en los tres estados
- **THEN** cada estado se reconoce por su color sin leer la etiqueta, y ningún par comparte tratamiento

#### Scenario: Fila sin talla
- **WHEN** una iniciativa no tiene evaluación guardada
- **THEN** su fila muestra el enlace neutro "Evaluar" en la columna de talla, un guion en FTE, y no muestra ningún botón

#### Scenario: Filtrar por talla
- **WHEN** el Chapter Lead elige una o más tallas en el filtro
- **THEN** el listado muestra sólo las iniciativas con esas tallas, desde la primera página, y el total de la paginación refleja el subconjunto

#### Scenario: Sin iniciativas
- **WHEN** no hay iniciativas registradas
- **THEN** el listado muestra el estado vacío con la acción de crear la primera
