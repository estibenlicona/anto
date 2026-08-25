## ADDED Requirements

### Requirement: El preset de Tailwind expone exclusivamente el vocabulario de tuip
El preset de Tailwind SHALL reemplazar la paleta de color nativa de Tailwind en vez de extenderla, de modo que sólo los tokens semánticos de tuip —y los primitivos de CSS que el catálogo necesita, `transparent` y `current`— compilen a una utilidad de color. Un nombre de color de la paleta por defecto de Tailwind que no sea también un rol de tuip NO SHALL compilar a ninguna regla, en ningún proyecto que use el preset.

#### Scenario: Un color nativo de Tailwind no compila
- **WHEN** un componente escribe una clase con un color de la paleta nativa de Tailwind que no es un rol de tuip, como `bg-blue-500` o `text-purple-600`
- **THEN** esa clase no genera ninguna regla CSS

#### Scenario: Los primitivos de CSS siguen disponibles
- **WHEN** un componente escribe `transparent` o `current` como valor de color en cualquier propiedad
- **THEN** la clase compila normalmente, porque ninguno de los dos es un color de marca que compita con el vocabulario de tuip

#### Scenario: El vocabulario de tuip sigue completo
- **WHEN** un componente usa cualquier token semántico ya definido por tuip, en cualquier propiedad de color
- **THEN** la clase compila igual que antes de este cambio, sin que el cierre de la paleta nativa afecte al vocabulario propio
