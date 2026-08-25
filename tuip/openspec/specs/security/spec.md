## Purpose

Sostiene las garantías del proyecto en sus dos fronteras de confianza: lo que incorpora de terceros y lo que publica hacia terceros. No cubre el comportamiento de seguridad de un componente ni de una herramienta en particular — eso vive en la capability que posee ese código — sino la verificación que corre sobre el repositorio entero y la integridad de lo que sale de él.

## Requirements

### Requirement: Verificación automatizada de dependencias vulnerables
El proyecto SHALL verificar, sin intervención manual, que sus dependencias no tengan vulnerabilidades conocidas, y esa verificación SHALL correr como parte de la comprobación estándar del proyecto, no como un procedimiento aparte que alguien deba recordar invocar. El umbral de severidad que detiene la verificación SHALL ser más estricto para las dependencias que llegan a la máquina de otra persona que para las que solo participan del desarrollo.

#### Scenario: No hay que invocarla aparte
- **WHEN** alguien corre la comprobación estándar del proyecto
- **THEN** la auditoría de dependencias corre junto con ella, sin necesidad de un comando adicional ni de recordar un paso extra

#### Scenario: Un cambio introduce una dependencia vulnerable
- **WHEN** se propone un cambio que agrega una dependencia con una vulnerabilidad conocida por encima del umbral que le corresponde
- **THEN** la verificación falla e informa cuál es la dependencia y por qué ruta entró

#### Scenario: Distinto umbral según a dónde llega la dependencia
- **WHEN** la vulnerabilidad está en una dependencia que solo se usa para construir o desarrollar el proyecto, y no alcanza el umbral definido para ese destino
- **THEN** la verificación la reporta sin detener el cambio, mientras que la misma severidad en una dependencia que llega a la máquina de otra persona sí lo detiene

#### Scenario: Vulnerabilidad publicada sobre código que no cambió
- **WHEN** se divulga una vulnerabilidad que afecta a una dependencia ya presente, sin que nadie proponga un cambio
- **THEN** la verificación igualmente la detecta, porque corre también de forma periódica y no solo ante un cambio propuesto

#### Scenario: El resultado es accionable
- **WHEN** la verificación encuentra una vulnerabilidad
- **THEN** informa la severidad, el paquete afectado y la versión que la corrige, de modo que quien la lea pueda decidir sin volver a investigarlo desde cero

### Requirement: Excepciones explícitas y con vencimiento
Cuando una vulnerabilidad conocida no pueda resolverse de inmediato, el proyecto SHALL admitir registrarla como excepción explícita, y esa excepción SHALL consignar el paquete, el motivo, quién la asume y una fecha de revisión. Una excepción SHALL no ser indefinida: pasada su fecha de revisión SHALL volver a detener la verificación. Bajar el umbral general SHALL no usarse como sustituto de registrar una excepción, porque un umbral bajo esconde también todo lo que nadie evaluó.

#### Scenario: Vulnerabilidad conocida que no se puede resolver todavía
- **WHEN** una vulnerabilidad no tiene arreglo disponible sin un cambio mayor, y se registra como excepción con su motivo, su responsable y su fecha de revisión
- **THEN** la verificación pasa, e informa qué excepciones están vigentes y hasta cuándo

#### Scenario: Excepción vencida
- **WHEN** se corre la verificación después de la fecha de revisión de una excepción vigente
- **THEN** la verificación falla, porque la excepción dejó de ser válida y la decisión debe volver a tomarse

#### Scenario: Excepción incompleta
- **WHEN** se registra una excepción sin motivo, sin responsable o sin fecha de revisión
- **THEN** la verificación falla en vez de aceptarla, porque una excepción sin esos datos no puede revisarse después

#### Scenario: Una vulnerabilidad no contemplada
- **WHEN** aparece una vulnerabilidad por encima del umbral que no corresponde a ninguna excepción registrada
- **THEN** la verificación falla, sin que las excepciones existentes la cubran por acumulación

### Requirement: Integridad de lo que se publica
La publicación de un paquete SHALL no omitir las comprobaciones que impiden publicar desde un estado del repositorio que no se corresponde con lo publicado, y SHALL exigir que la verificación estándar del proyecto haya pasado antes de publicar.

#### Scenario: Publicar desde un árbol de trabajo con cambios sin registrar
- **WHEN** alguien intenta publicar el paquete con cambios locales sin registrar en el control de versiones
- **THEN** la publicación se detiene, porque lo que se subiría no sería reproducible desde el repositorio

#### Scenario: Publicar sin que la verificación haya pasado
- **WHEN** alguien intenta publicar el paquete y la verificación estándar del proyecto no pasa
- **THEN** la publicación se detiene antes de subir nada
