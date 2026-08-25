## MODIFIED Requirements

### Requirement: Instalación global vía npm
El sistema SHALL distribuirse como un paquete npm instalable de forma global (`npm install -g tuip`) o ejecutable puntualmente vía `npx tuip`.

#### Scenario: Instalación global exitosa
- **WHEN** un usuario ejecuta `npm install -g tuip`
- **THEN** el comando `tuip` queda disponible en la terminal del usuario
