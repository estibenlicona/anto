# Backend: PostgreSQL, migraciones y la cadena de conexión como secreto

## Why

El backend lleva siete módulos construidos —Personas, Células, Asignaciones, Catálogos, Admin, Iniciativas y Ausencias— y **nunca ha tocado una base de datos real**. Todo corre sobre el proveedor en memoria, donde el esquema se crea con `EnsureCreated` y ninguna de las configuraciones de EF se ha enfrentado a un motor relacional: los tipos de columna, las colecciones poseídas con clave sombra, las columnas JSON y las fechas sin hora sólo han sido validadas contra un diccionario en RAM y contra Sqlite en tres tests. **No existe ninguna migración**, así que tampoco hay forma de hacer evolucionar el esquema.

Seguir agregando módulos sin esto es acumular deuda a ciegas: cada configuración nueva es una apuesta sobre cómo se materializará el día que haya una base. Este cambio pone una base local de verdad, genera la primera migración sobre el modelo completo y deja la cadena de conexión donde debe estar —en un secreto— antes de que el backend crezca más.

## What Changes

- **PostgreSQL entra como cuarto proveedor de persistencia** (`Npgsql.EntityFrameworkCore.PostgreSQL`), junto a SqlServer, MongoDb e InMemory, que se quedan como están. Pasa a ser el proveedor por defecto en Development, en lugar de InMemory.
- **Primera migración de EF sobre el modelo completo**: personas con sus stacks, células, asignaciones, iniciativas con la evaluación como columna JSON, tareas BAU, compañías, ausencias, y los cuatro agregados de parámetros del modelo con sus colecciones poseídas. Es la primera vez que el esquema se escribe explícitamente.
- **Las migraciones se generan sólo para PostgreSQL**, que es el motor que efectivamente se va a usar. Una migración de EF es específica del proveedor, así que SqlServer seguiría necesitando las suyas; hoy no tiene ninguna forma de crear su esquema y este cambio no se la agrega — queda declarado pero sin ejercitar, exactamente como está.
- **`IDesignTimeDbContextFactory`** para que `dotnet ef` construya el contexto sin levantar la aplicación ni exigir el secreto, leyendo la cadena de la configuración cuando está y cayendo en una de diseño cuando no.
- **Las migraciones se aplican solas únicamente en Development.** En producción las aplica el pipeline, con `dotnet ef database update` o un bundle de migración; la aplicación nunca migra sola contra producción, porque un arranque no es el momento de descubrir que una migración bloquea una tabla.
- **`EnsureCreated` queda sólo para InMemory**, que no tiene migraciones. El sembrador de desarrollo aprende a correr también sobre PostgreSQL, después de migrar, para que la base local traiga los mismos datos que hoy trae la de memoria.
- **La cadena de conexión no vive en el repositorio, y de dónde sale lo decide el entorno.** En la máquina del desarrollador sale de los **User Secrets** de .NET, que se guardan en el perfil del usuario y no en el árbol de trabajo. En certificación y en producción, que se comportan igual, sale de **Azure App Configuration con referencia a Key Vault**. `appsettings.json` conserva la clave vacía, como las otras cadenas.
- **La aplicación se autentica contra App Configuration con identidad federada de carga de trabajo**, resuelta por `DefaultAzureCredential` a partir de las variables y el archivo de token que la plataforma inyecta. No hay ninguna credencial de larga vida: ni en el pipeline, ni en la imagen, ni en la configuración.
- **`AddOptionalAzureAppConfiguration` deja de decidir por bandera y decide por entorno**: en Development no se conecta a Azure en absoluto, y fuera de Development se conecta siempre. Es un cambio de comportamiento sobre código que ya existe, con su test.
- **Se retira el modo de conexión por cadena de App Configuration.** Esa cadena lleva `Id` y `Secret` embebidos: es una llave estática de larga vida guardada en configuración, justo lo que este cambio viene a eliminar. Queda un solo camino de autenticación, el federado.
- **La contraseña no se escribe en ningún archivo versionado**, tampoco en estas notas de planeación ni en los ejemplos: entra por un comando que el desarrollador corre una vez contra su propio almacén de secretos.
- `postgresConnectionString` se agrega a la lista de propiedades que Serilog enmascara, junto a las dos cadenas que ya están.
- Fuera de alcance: desplegar nada, crear los recursos de Azure, migrar datos (no hay), retirar SqlServer o MongoDb, y el módulo de backend que venga después.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

(ninguna — es infraestructura de persistencia y configuración; ninguna spec describe con qué motor se guarda ni de dónde sale la cadena. El cambio declara `skip_specs`.)

## Impact

- `backend/src/GestionCapacidad.Infrastructure`: proveedor nuevo en el enum y su estrategia, opción de configuración, fábrica de tiempo de diseño, carpeta `Migrations/` con la migración inicial, y el sembrador extendido a PostgreSQL.
- `backend/src/GestionCapacidad.WebApi`: `UserSecretsId` en el proyecto, `appsettings.Development.json` apuntando a PostgreSQL, aplicación de migraciones al arrancar en Development, la propiedad nueva en el enmascarado de Serilog, y `AzureAppConfigurationExtensions` con la rama por entorno y sin el modo de llave estática (su `AzureAppConfigurationOptions` pierde `ConnectionString`).
- `backend/Directory.Packages.props`: `Npgsql.EntityFrameworkCore.PostgreSQL`.
- `backend/tests`: que el modelo no tenga cambios pendientes contra la migración, que la fábrica de tiempo de diseño construya el contexto sin configuración, y `AzureAppConfigurationExtensionsTests` reescrito a la rama por entorno —hoy cubre los tres modos, de los cuales uno desaparece.
- `backend/ARCHITECTURE.md`: la sección de persistencia menciona hoy sólo SqlServer y MongoDb; hay que sumar PostgreSQL e InMemory y explicar de dónde sale la cadena en cada entorno.
- **Riesgo real y esperado**: siete módulos de configuraciones EF que nunca vieron un motor relacional. La migración inicial es donde van a aparecer los desajustes —tipos de columna, claves sombra de las colecciones poseídas, las columnas JSON, `DateOnly`— y resolverlos es parte del trabajo, no una desviación de él.
- Sin datos que migrar: la base local nace vacía y se siembra.
