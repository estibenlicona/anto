# component-library-publishing Specification

## Purpose

Gobierna cómo `@tuya-ui/components` se versiona, publica y comunica sus cambios a los proyectos consumidores, de modo que exista una única fuente de verdad actualizable en vez de copias divergentes del código de los componentes.

## Requirements

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

### Requirement: Registro de cambios por versión
Cada versión publicada de `@tuya-ui/components` SHALL tener una entrada de changelog legible que liste, por componente afectado, qué cambió, de modo que un consumidor pueda decidir si actualizar sin tener que inspeccionar el código fuente del paquete.

#### Scenario: Consultar qué cambió en una versión
- **WHEN** un consumidor revisa el changelog antes de actualizar `@tuya-ui/components`
- **THEN** encuentra, por cada versión entre la que tiene instalada y la más reciente, qué componentes cambiaron y qué cambió en cada uno

### Requirement: Guía de migración en cambios que rompen la API
Toda versión que incrementa `MAJOR` SHALL venir acompañada de una guía de migración que indique, para cada cambio incompatible, cómo debe ajustarse el código del consumidor.

#### Scenario: Actualizar a través de un cambio mayor
- **WHEN** un consumidor actualiza `@tuya-ui/components` a una versión que incrementa `MAJOR`
- **THEN** encuentra, junto al changelog de esa versión, los pasos concretos para ajustar el código que usa las props o los componentes que cambiaron

### Requirement: Rango de compatibilidad con React declarado
`@tuya-ui/components` SHALL declarar las versiones de React con las que es compatible como `peerDependency`, de modo que el gestor de paquetes del consumidor pueda advertir una incompatibilidad antes de instalar.

#### Scenario: Instalación en un proyecto con una versión de React no soportada
- **WHEN** un consumidor instala `@tuya-ui/components` en un proyecto cuya versión de React queda fuera del rango declarado
- **THEN** el gestor de paquetes advierte la incompatibilidad de peer dependency antes de completar la instalación

### Requirement: Aviso de deprecación antes de remover un componente
Antes de remover un componente del catálogo, al menos una versión `MINOR` previa a la remoción SHALL marcarlo como deprecado en su documentación y en su tipo público, indicando el reemplazo sugerido si existe.

#### Scenario: Componente marcado como deprecado antes de removerse
- **WHEN** un componente va a removerse del catálogo en la próxima versión `MAJOR`
- **THEN** una versión `MINOR` anterior ya lo expone marcado como deprecado, con el reemplazo sugerido si existe
