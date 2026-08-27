## MODIFIED Requirements

### Requirement: El medio día es de un permiso, sobre un solo día
El medio día SHALL existir únicamente para las ausencias de tipo Permiso, y SHALL pedirse sobre un único día. Un permiso SHALL poder abarcar también varios días, y en ese caso SHALL contarse por días completos: sus extremos no admiten medio día. Unas vacaciones y una incapacidad SHALL registrarse siempre por días completos. El registro SHALL rechazar un medio día pedido para otro tipo, y SHALL rechazarlo también cuando abarque más de un día.

#### Scenario: Permiso de medio día
- **WHEN** se registra un permiso de un día marcado como medio día
- **THEN** la ausencia queda registrada y cuenta 0.5 días hábiles

#### Scenario: Permiso de día completo
- **WHEN** se registra un permiso de un día sin marcarlo como medio día
- **THEN** la ausencia cuenta 1 día hábil

#### Scenario: Permiso de varios días
- **WHEN** se registra un permiso cuyo inicio y fin son días distintos, sin medio día
- **THEN** la ausencia queda registrada y cuenta los días hábiles del rango, todos completos

#### Scenario: Medio día en vacaciones o incapacidad
- **WHEN** se intenta registrar unas vacaciones o una incapacidad como medio día
- **THEN** el registro se rechaza y la ausencia no se crea

#### Scenario: Medio día sobre más de un día
- **WHEN** se intenta registrar un medio día cuyo inicio y fin no son el mismo día
- **THEN** el registro se rechaza y la ausencia no se crea
