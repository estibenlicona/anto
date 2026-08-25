## Purpose

Provee una capa de mocking de API a nivel de red para los tests del frontend, para que los flujos que dependen de llamadas HTTP puedan probarse de punta a punta (UI → hook → servicio → red → respuesta) sin necesitar un backend real levantado.

## ADDED Requirements

### Requirement: Servidor de mocks de red disponible en toda la suite de tests
El sistema SHALL interceptar, durante la ejecución de la suite de tests de Vitest, las peticiones HTTP salientes del frontend a nivel de red (no de módulo), sin requerir configuración adicional por archivo de test.

#### Scenario: Un test hace una petición HTTP sin configurar nada
- **WHEN** un test ejercita un flujo que internamente llama a `httpClient` (por ejemplo, a través de `authService`)
- **THEN** la petición es interceptada por el servidor de mocks y no llega a ningún backend real

### Requirement: Handlers de mock para los endpoints de autenticación
El sistema SHALL exponer handlers de mock para los endpoints que usa `authService` (login, logout, obtener usuario actual), cubriendo tanto la respuesta de éxito como errores HTTP (401 y 500).

#### Scenario: Login exitoso mediante el mock
- **WHEN** un test ejercita el flujo de login con credenciales válidas
- **THEN** el handler de mock responde con un cuerpo de éxito equivalente al que devuelve hoy el backend real, y el flujo de UI/hook lo procesa igual que una respuesta real

#### Scenario: Login con credenciales inválidas mediante el mock
- **WHEN** un test ejercita el flujo de login configurado para fallar
- **THEN** el handler de mock responde con un error HTTP (401), y el flujo de UI/hook lo procesa igual que un error real de servidor

### Requirement: Los tests pueden sobreescribir la respuesta de un handler puntualmente
El sistema SHALL permitir que un test individual reemplace, solo para su propia ejecución, la respuesta de cualquier handler de mock (por ejemplo, para simular un error 500 específico), sin afectar a otros tests de la suite.

#### Scenario: Un test necesita simular un error de servidor
- **WHEN** un test sobreescribe el handler de un endpoint para que responda con un error 500
- **THEN** solo ese test recibe esa respuesta; el resto de la suite sigue usando el handler por defecto
