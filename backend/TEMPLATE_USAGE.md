# Uso de la Plantilla

## Instalar la Plantilla

```powershell
dotnet new install ./template
```

## Crear un Nuevo Microservicio

```powershell
dotnet new corporate-webapi -n MyService
cd MyService
dotnet restore
dotnet build
dotnet test
```

## Selección del Proveedor de Persistencia

La persistencia utiliza el Patrón de Estrategia. Elige el proveedor activo de EF Core con `Persistence:Provider`.

SQL Server:

```powershell
$env:Persistence__Provider="SqlServer"
$env:Persistence__SqlServerConnectionString="Server=(localdb)\MSSQLLocalDB;Database=MyService;Trusted_Connection=True;TrustServerCertificate=True"
```

JSON equivalente:

```json
{
  "Persistence": {
    "Provider": "SqlServer",
    "SqlServerConnectionString": "Server=(localdb)\\MSSQLLocalDB;Database=api_capacidadti_celulastiWebApi;Trusted_Connection=True;TrustServerCertificate=True",
    "MongoDbConnectionString": "",
    "MongoDbDatabaseName": "api_capacidadti_celulastiDb"
  }
}
```

MongoDB:

```powershell
$env:Persistence__Provider="MongoDb"
$env:Persistence__MongoDbConnectionString="mongodb://localhost:27017"
$env:Persistence__MongoDbDatabaseName="MyServiceDb"
```

JSON equivalente:

```json
{
  "Persistence": {
    "Provider": "MongoDb",
    "SqlServerConnectionString": "",
    "MongoDbConnectionString": "mongodb://localhost:27017",
    "MongoDbDatabaseName": "api_capacidadti_celulastiDb"
  }
}
```

SQL Server se implementa con SQL Server de EF Core. MongoDB se implementa con el proveedor de MongoDB de EF Core y utiliza `ApplicationDbContext`, no una abstracción de repositorio de MongoDB separada.

Cuando se selecciona MongoDB, la plantilla registra un único `IMongoClient` de singleton. La estrategia de MongoDB de EF Core y la verificación de salud de disponibilidad reutilizan ese singleton. No crees un `MongoClient` por solicitud o por `DbContext` manualmente.

Los índices configurados en el modelo se crean mediante `Database.EnsureCreated()`, y los equipos deben validar el comportamiento del proveedor para su propio modelo antes de asumir paridad de características relacional.

## Configuración Local

Utiliza `appsettings.Development.json`, secretos de usuario o variables de entorno para configuración local. No confirmes secretos de producción.

Variables de entorno comunes:

```text
Persistence__Provider
Persistence__SqlServerConnectionString
Persistence__MongoDbConnectionString
Persistence__MongoDbDatabaseName
AzureAppConfiguration__Enabled
AzureAppConfiguration__Endpoint
AzureAppConfiguration__ConnectionString
Observability__OtlpEndpoint
Observability__ExportTraces
Observability__ExportMetrics
Observability__ExportLogs
Observability__ExportToConsole
HttpClients__CompanyRegistry__BaseAddress
HttpClients__CompanyRegistry__TimeoutSeconds
HttpClients__CompanyRegistry__Resilience__Preset
HttpClients__CompanyRegistry__Resilience__Timeout__Seconds
HttpClients__CompanyRegistry__Auth__Type
HttpClients__CompanyRegistry__Auth__Scopes__0
HttpClients__CompanyRegistry__Auth__ClientId
```

## Autenticación

Esta plantilla intencionalmente no implementa autenticación o autorización dentro del servicio. Se espera que la autenticación se maneje fuera de la aplicación mediante una Puerta de Enlace de API, APIM, ingreso, capa de identidad de plataforma, malla de servicio, proxy inverso, proxy de identidad o middleware ascendente.

El servicio no procesa encabezados de autenticación. Swagger no configura autenticación a nivel de aplicación ni expone un flujo de autorización.

## Clientes HTTP Salientes

El servicio generado incluye la biblioteca RestClient copiada bajo `src/api_capacidadti_celulasti.Core/RestClient`. Úsala desde Infraestructura para implementar abstracciones propias de la Aplicación para API externas. Los controladores deben llamar casos de uso y no deben inyectar `HttpClient`, `IRestClient` o clientes de infraestructura directamente.

La plantilla incluye un ejemplo de Registro de Empresas:

```text
GET /api/v1/company-registry/{identificationNumber}
```

Configura el cliente saliente con `HttpClients:CompanyRegistry`:

```powershell
$env:HttpClients__CompanyRegistry__BaseAddress="https://example.com/company-registry/"
$env:HttpClients__CompanyRegistry__TimeoutSeconds="30"
$env:HttpClients__CompanyRegistry__Resilience__Preset="TimeoutOnly"
$env:HttpClients__CompanyRegistry__Resilience__Timeout__Seconds="10"
```

JSON equivalente:

```json
{
  "HttpClients": {
    "CompanyRegistry": {
      "BaseAddress": "https://example.com/company-registry/",
      "TimeoutSeconds": 30,
      "DefaultRequestHeaders": {},
      "Resilience": {
        "Preset": "TimeoutOnly",
        "Timeout": {
          "Seconds": 10
        }
      },
      "Auth": {
        "Type": "None",
        "Scopes": [],
        "ClientId": ""
      }
    }
  }
}
```

El ajuste de resiliencia saliente predeterminado es `TimeoutOnly`; el reintento no está habilitado de forma predeterminada. Habilita el reintento solo después de confirmar que la operación descendente es segura o está protegida por idempotencia.

OAuth saliente, cuando se configura para una API externa, no es autenticación de servicio de entrada. Almacena ID de cliente de OAuth, secretos de cliente, claves de suscripción y credenciales descendentes en variables de entorno, secretos de usuario, Configuración de Aplicación de Azure o referencias de Key Vault a través de Configuración de Aplicación de Azure.

### Autenticación de Identidad Administrada Saliente

El soporte de Identidad Administrada en RestClient es solo para llamadas salientes de este servicio a API externas. No autentica llamadores de entrada, no habilita `[Authorize]`, no agrega autenticación Bearer de Swagger ni agrega `Authorization` a encabezados CORS predeterminados.

Se requieren alcances. Deja `ClientId` vacío para la identidad administrada asignada por el sistema, o configura un ID de cliente de identidad administrada asignada por el usuario. Identidad Administrada no requiere `ClientSecret`, `TokenUrl` o `GrantType`, y los tokens de acceso no deben ser registrados.

```powershell
$env:HttpClients__CompanyRegistry__Auth__Type="ManagedIdentity"
$env:HttpClients__CompanyRegistry__Auth__Scopes__0="api://company-registry/.default"
$env:HttpClients__CompanyRegistry__Auth__ClientId="<user-assigned-managed-identity-client-id>"
```

JSON equivalente:

```json
{
  "HttpClients": {
    "CompanyRegistry": {
      "BaseAddress": "https://example.com/company-registry/",
      "TimeoutSeconds": 30,
      "Auth": {
        "Type": "ManagedIdentity",
        "Scopes": [ "api://company-registry/.default" ],
        "ClientId": ""
      }
    }
  }
}
```

## Configuración de Aplicación de Azure

La Configuración de Aplicación de Azure es opcional y está deshabilitada de forma predeterminada.

`AzureAppConfiguration__Endpoint` y `AzureAppConfiguration__ConnectionString` se leen solo desde variables de entorno, no desde `appsettings.json`.

Identidad administrada:

```powershell
$env:AzureAppConfiguration__Enabled="true"
$env:AzureAppConfiguration__Endpoint="https://<store-name>.azconfig.io"
$env:AzureAppConfiguration__UseManagedIdentity="true"
```

Alternativa de cadena de conexión:

```powershell
$env:AzureAppConfiguration__Enabled="true"
$env:AzureAppConfiguration__UseManagedIdentity="false"
$env:AzureAppConfiguration__ConnectionString="<app-configuration-connection-string>"
```

Utiliza `AzureAppConfiguration__Label` al cargar una etiqueta específica. Las referencias de Azure Key Vault pueden ser resueltas por Configuración de Aplicación de Azure cuando se configura en Azure.

## Observabilidad

`Observability:OtlpEndpoint` es el único punto final para trazas, métricas y registros:

```json
{
  "Observability": {
    "ServiceName": "api_capacidadti_celulasti.WebApi",
    "ServiceVersion": "1.0.0",
    "OtlpEndpoint": "http://localhost:4317",
    "ExportToConsole": false,
    "ExportTraces": true,
    "ExportMetrics": true,
    "ExportLogs": true,
    "SensitiveDataMasking": {
      "Enabled": true,
      "Mask": "***MASKED***",
      "PropertyNames": [ "password", "token", "authorization", "clientSecret", "apiKey", "connectionString", "creditCardNumber", "bankAccount", "iban" ]
    }
  }
}
```

PowerShell:

```powershell
$env:Observability__OtlpEndpoint="http://localhost:4317"
$env:Observability__ExportTraces="true"
$env:Observability__ExportMetrics="true"
$env:Observability__ExportLogs="true"
```

Serilog es la única canalización de registro. Escribe registros estructurados enriquecidos a la consola local cuando `Observability__ExportToConsole=true`, y exporta registros a OTLP a través de `Serilog.Sinks.OpenTelemetry` cuando `Observability__ExportLogs=true` y `Observability__OtlpEndpoint` está configurado. El registro del SDK de OpenTelemetry se limita a trazas y métricas; no se utiliza el proveedor de registro de OpenTelemetry.

El enmascaramiento de datos sensibles está habilitado de forma predeterminada y se ejecuta antes de sumideros de consola u OTLP. Utiliza enriquecedores y operadores de enmascaramiento de Serilog establecidos para patrones sensibles soportados, incluyendo valores de tarjeta de crédito e IBAN. Enmascara nombres de propiedades sensibles comunes como `password`, `token`, `authorization`, `clientSecret`, `apiKey`, campos de cadena de conexión, campos de tarjeta, campos de cuenta bancaria e `iban`, además de fragmentos comunes de token portador, secretos de cadena de consulta y secretos de cadena de conexión. Los patrones arbitrarios de número de cuenta bancaria están cubiertos a través del enmascaramiento de nombre de propiedad a menos que un operador estable soporte el patrón. No registres intencionalmente secretos; el enmascaramiento es una salvaguarda a nivel de plantilla, no un reemplazo para código seguro.

Los registros emitidos dentro de una `Activity` activa incluyen `TraceId` y `SpanId`, lo que permite que los registros de consola y OTLP se correlacionen con trazas distribuidas.

Las pruebas se unifican bajo `api_capacidadti_celulasti.WebApi.Tests`. Las pruebas de RestClient se encuentran bajo `tests/api_capacidadti_celulasti.WebApi.Tests/Core/RestClient`.

## Verificaciones de Salud

La plantilla expone:

```text
GET /health/live
GET /health/ready
GET /health
```

`/health/live` es vivacidad y solo verifica que el proceso esté vivo. No verifica SQL Server, MongoDB o dependencias externas.

`/health/ready` es disponibilidad y valida el proveedor de persistencia seleccionado. SQL Server utiliza verificaciones de conectividad de EF Core. MongoDB hace ping a la base de datos seleccionada a través del `IMongoClient` de singleton.

`/health` se asigna a disponibilidad para compatibilidad hacia atrás.

## Configuración de CORS

La producción debe listar explícitamente los orígenes permitidos:

```text
Cors__AllowedOrigins__0=https://app.contoso.com
Cors__AllowedMethods__0=GET
Cors__AllowedHeaders__0=Content-Type
Cors__AllowedHeaders__1=Idempotency-Key
```

La plantilla no utiliza `AllowAnyOrigin` de forma predeterminada. Los encabezados permitidos predeterminados son `Content-Type` e `Idempotency-Key`.

`Authorization` intencionalmente no se permite de forma predeterminada porque la autenticación es externa al servicio. Si una organización necesita pasar `Authorization` para un caso de uso descendente específico, agrégalo explícitamente a `Cors:AllowedHeaders`.

## Uso de Idempotency-Key

Las solicitudes `POST` y `PUT` requieren:

```http
Idempotency-Key: <unique-operation-key>
```

La implementación incluida almacena claves en `IMemoryCache` durante 10 minutos y no almacena respuestas completas en caché. Reemplázalo con almacenamiento distribuido antes de ejecutar múltiples instancias de producción.
