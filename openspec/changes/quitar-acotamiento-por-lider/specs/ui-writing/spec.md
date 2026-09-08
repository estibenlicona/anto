## ADDED Requirements

### Requirement: El texto de la interfaz se escribe en español
Todo texto que el usuario lee —rótulos, mensajes, confirmaciones, ayudas, estados vacíos, marcadores de posición, nombres accesibles y botones— SHALL estar escrito en español. Una palabra en inglés SHALL NOT usarse cuando el español tiene la suya: quien usa el producto no tiene por qué saber inglés para entender de qué le habla una cifra.

En particular, la palabra "chapter" SHALL NOT aparecer en ningún texto visible. Es el caso que originó esta regla: la interfaz llamaba "chapter" a la agrupación de personas, y quien la leía no sabía a cuál de todas se refería. El vocabulario del código es otra cosa: identificadores, campos de los contratos de datos, rutas y endpoints (`chapterId`, `chapterFte`, `/chapter/capacity-overview`, `chapter-lead`) SHALL poder conservar el término, porque no son texto de cara al usuario y renombrarlos es un cambio propio, sin valor observable.

Un término en inglés SHALL poder quedarse sólo cuando es el nombre propio de algo que el usuario reconoce por ese nombre —el de un producto o un servicio, como Azure DevOps— o cuando el equivalente en español no existe o no se usa en el dominio. La excepción SHALL ser deliberada y no el resultado de no haber traducido.

El cumplimiento SHALL verificarse de forma automática sobre el código, en la misma verificación que ya cuida el registro neutro, de modo que un texto nuevo con un anglicismo prohibido falle antes de llegar a la pantalla.

#### Scenario: Una cifra no se explica en inglés
- **WHEN** una pantalla presenta un total, un promedio o un porcentaje acompañado de sobre qué conjunto se calcula
- **THEN** ese complemento está en español, y no usa la palabra "chapter" para nombrar el conjunto

#### Scenario: El código conserva su vocabulario
- **WHEN** un contrato de datos, una ruta o un identificador usa el término "chapter"
- **THEN** la verificación no lo señala, porque la regla alcanza al texto que el usuario lee y no al vocabulario interno

#### Scenario: Un anglicismo nuevo no llega a la pantalla
- **WHEN** alguien agrega un texto visible con la palabra "chapter"
- **THEN** la verificación automática falla y lo señala, en vez de descubrirse leyendo la pantalla

#### Scenario: Un nombre propio se queda como es
- **WHEN** un texto nombra un producto o servicio externo que el usuario reconoce por su nombre en inglés, como Azure DevOps
- **THEN** el nombre se conserva tal cual, porque traducirlo lo volvería irreconocible
