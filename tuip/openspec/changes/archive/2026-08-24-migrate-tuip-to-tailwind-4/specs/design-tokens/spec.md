## MODIFIED Requirements

### Requirement: El preset de Tailwind expone exclusivamente el vocabulario de tuip
El preset de Tailwind SHALL reemplazar la paleta de color nativa de Tailwind en vez de extenderla, de modo que sólo los tokens semánticos de tuip —y los primitivos de CSS que el catálogo necesita, `transparent` y `current`— compilen a una utilidad de color. Un nombre de color de la paleta por defecto de Tailwind que no sea también un rol de tuip NO SHALL compilar a ninguna regla, en ningún proyecto que use el preset.

El cierre de la paleta SHALL verificarse de forma automática y no depender de que nadie escriba una clase nativa: una configuración que deje de cerrarla no falla al compilar —simplemente vuelve a aceptar toda la paleta—, así que sin una comprobación propia la regresión pasa inadvertida.

#### Scenario: Un color nativo de Tailwind no compila
- **WHEN** un componente escribe una clase con un color de la paleta nativa de Tailwind que no es un rol de tuip, como `bg-blue-500` o `text-purple-600`
- **THEN** esa clase no genera ninguna regla CSS

#### Scenario: Los primitivos de CSS siguen disponibles
- **WHEN** un componente escribe `transparent` o `current` como valor de color en cualquier propiedad
- **THEN** la clase compila normalmente, porque ninguno de los dos es un color de marca que compita con el vocabulario de tuip

#### Scenario: El vocabulario de tuip sigue completo
- **WHEN** un componente usa cualquier token semántico ya definido por tuip, en cualquier propiedad de color
- **THEN** la clase compila igual que antes de este cambio, sin que el cierre de la paleta nativa afecte al vocabulario propio

#### Scenario: La paleta se reabre sin que nadie lo note
- **WHEN** un cambio de configuración deja de cerrar la paleta nativa
- **THEN** la verificación automática falla y dice qué color nativo volvió a compilar, en vez de dejar que el sistema acepte en silencio un vocabulario que documenta como cerrado

## ADDED Requirements

### Requirement: Las utilidades publicadas no se componen con las del consumidor
El paquete distribuye su hoja de estilos con las utilidades ya generadas, y el proyecto que lo consume genera además las suyas. Una misma clase puede quedar definida en las dos hojas. Cuando eso ocurre, las dos definiciones SHALL ser equivalentes: SHALL declarar las mismas propiedades CSS, de modo que aplicarlas dos veces produzca el mismo resultado que aplicarlas una.

El sistema SHALL verificar esta condición de forma automática y SHALL fallar cuando una misma clase resuelva a propiedades distintas en las dos hojas. Sin esa verificación el síntoma aparece lejos de la causa: un elemento corrido en una pantalla cualquiera, sin ningún error que lo señale.

#### Scenario: La misma clase en las dos hojas
- **WHEN** una clase de utilidad está definida tanto en la hoja publicada como en la que genera el proyecto consumidor
- **THEN** ambas declaran las mismas propiedades CSS, y el elemento que la lleva se dibuja igual que si estuviera definida una sola vez

#### Scenario: Dos implementaciones de la misma clase
- **WHEN** una clase queda definida en las dos hojas con propiedades distintas, como una que desplaza con `transform` y otra que desplaza con `translate`
- **THEN** la verificación automática falla y nombra la clase y las propiedades en conflicto

#### Scenario: Un desplazamiento no se aplica dos veces
- **WHEN** un componente del catálogo se centra desplazándose la mitad de su tamaño y el proyecto consumidor define esa misma utilidad
- **THEN** el componente queda centrado, y no desplazado el doble
