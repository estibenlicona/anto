## MODIFIED Requirements

### Requirement: Versionado semántico del paquete
`@tuya-ui/components` SHALL versionarse siguiendo versionado semántico (`MAJOR.MINOR.PATCH`): un cambio que rompe la API pública de un componente SHALL incrementar `MAJOR`, un componente o una prop nueva sin romper lo existente SHALL incrementar `MINOR`, y una corrección que no cambia la API SHALL incrementar `PATCH`.

La regla SHALL aplicarse a **todo artefacto que salga del paquete**, incluido el tarball que se arma para consumo local, y no sólo a lo que se publica en un registro. El empaquetado local es el que la aplicación instala de verdad, y es el único que hoy podía repetir versión.

Una misma versión NO SHALL distribuirse dos veces con contenido distinto. La versión es la **identidad** del paquete, y las herramientas que lo consumen la usan para decidir si algo cambió: un empaquetador que ve la misma versión en la misma ruta concluye que no hay nada que reconstruir y sigue sirviendo lo que tenía en caché. Reutilizarla no produce un error, produce algo peor — un paquete que dice no exportar lo que exporta, con el mensaje apuntando al componente y no a la caché.

#### Scenario: Corrección sin cambio de API
- **WHEN** se publica una corrección de un bug visual que no cambia ninguna prop pública
- **THEN** la versión publicada incrementa solo `PATCH`

#### Scenario: Componente nuevo agregado al catálogo
- **WHEN** se publica una versión que agrega un componente nuevo al catálogo sin modificar los existentes
- **THEN** la versión publicada incrementa `MINOR`, no `MAJOR`

#### Scenario: Cambio que rompe la API pública
- **WHEN** se publica una versión que renombra o quita una prop pública de un componente existente
- **THEN** la versión publicada incrementa `MAJOR`

#### Scenario: Empaquetado local para la aplicación
- **WHEN** se arma el tarball que la aplicación instala desde el sistema de archivos
- **THEN** lleva una versión distinta de la del tarball anterior, de modo que su nombre y la especificación de la dependencia cambien con su contenido

#### Scenario: Reempacar sin cambiar la versión
- **WHEN** se intenta distribuir contenido nuevo bajo una versión que ya se distribuyó
- **THEN** el sistema lo impide, porque un paquete que cambia sin cambiar de identidad hace que quien lo consuma sirva una copia vieja sin enterarse

#### Scenario: Un export nuevo llega a quien lo instala
- **WHEN** una versión agrega un export y la aplicación la reinstala
- **THEN** el export está disponible sin borrar cachés a mano, porque la versión distinta obliga a reoptimizar la dependencia
