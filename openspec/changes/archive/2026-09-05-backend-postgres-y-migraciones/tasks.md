# Tareas — PostgreSQL, migraciones y la cadena como secreto

## 1. Paquete y herramientas

- [x] 1.1 Agregar `Npgsql.EntityFrameworkCore.PostgreSQL` a `Directory.Packages.props` con la versión que corresponda a EF 10, y referenciarlo desde `GestionCapacidad.Infrastructure`. Verificar: `dotnet build` en verde.
- [x] 1.2 Instalar las herramientas de EF como herramienta local del repositorio (`dotnet new tool-manifest` y `dotnet tool install dotnet-ef` en `backend/`), con el manifiesto versionado para que la versión sea la misma en cada máquina y en el pipeline. Verificar: `dotnet ef --version` responde desde `backend/`.

## 2. Proveedor

- [x] 2.1 Agregar `Postgres` a `PersistenceProvider` y `PostgresConnectionString` a `PersistenceOptions`. Verificar: build.
- [x] 2.2 Crear `PostgresPersistenceStrategy` (`UseNpgsql`, con el mismo error explícito de las otras estrategias cuando la cadena viene vacía) y registrarla en `Infrastructure/DependencyInjection`. Actualizar el mensaje de `PersistenceStrategyFactory`, que hoy enumera sólo tres proveedores. Verificar con un test: la fábrica resuelve `Postgres`, y un proveedor desconocido sigue fallando con el mensaje que lista los cuatro.
- [x] 2.3 Agregar `postgresConnectionString` a la lista de propiedades enmascaradas de Serilog en `appsettings.json`, junto a las dos cadenas que ya están. Verificar con `SensitiveDataMaskingTests`, que ya cubre este mecanismo.

## 3. Migraciones

- [x] 3.1 Crear `DesignTimeDbContextFactory` en Infrastructure: lee `Persistence:PostgresConnectionString` de la configuración cuando está y, si no, usa una cadena de diseño que nunca se conecta —generar una migración no toca la base—. Verificar con un test: la fábrica construye el contexto sin ninguna configuración presente.
- [x] 3.2 Generar la migración inicial sobre el modelo completo (`dotnet ef migrations add InitialSchema -p Infrastructure -s WebApi`). Verificar: la carpeta `Migrations/` aparece con la migración y el snapshot del modelo, y `dotnet build` sigue en verde.
- [x] 3.3 **Leer el SQL generado** (`dotnet ef migrations script`) y revisar los cuatro puntos de fricción esperados: los `decimal(…)` como `numeric`, las claves sombra de las colecciones poseídas (stacks de una persona, bandas de talla, filas del mix, preguntas del pool, y las bandas dentro de su conjunto) como identidad, las dos columnas JSON como texto, y las fechas de una ausencia como `date` y no `timestamp`. Corregir en las configuraciones EF lo que no corresponda y regenerar. Verificar: el script refleja los cinco puntos y queda anotado qué se ajustó.
- [x] 3.4 Test que falle cuando el modelo tenga cambios sin migrar, para que agregar una propiedad sin migración no llegue a producción como una columna faltante. Verificar: pasa ahora y falla si se agrega una propiedad de prueba al modelo.

## 4. Arranque y semillas

- [x] 4.1 En `Program.cs`, aplicar migraciones al arrancar **sólo en Development** (`Migrate()`), antes de sembrar. La guarda es el entorno y no una bandera de configuración, para que no exista forma de encenderlo en producción por descuido. Verificar: con el entorno en Production la aplicación arranca sin migrar.
- [x] 4.2 `DevelopmentDataSeeder`: la guarda que hoy exige InMemory pasa a aceptar también Postgres, y `EnsureCreated` queda sólo para InMemory —con migraciones, `EnsureCreated` deja la base en un estado que `database update` no reconoce—. Verificar: contra una base PostgreSQL vacía, arrancar siembra las 18 personas, 5 células, 9 asignaciones, 7 iniciativas y 5 ausencias; arrancar otra vez no las duplica.

## 5. El secreto

- [x] 5.1 Agregar `UserSecretsId` al proyecto WebApi, que hoy no lo tiene. Verificar: `dotnet user-secrets list -p src/GestionCapacidad.WebApi` responde en vez de fallar.
- [x] 5.2 Guardar la cadena local en los User Secrets con `dotnet user-secrets set "Persistence:PostgresConnectionString" "<cadena>"`. **La contraseña la escribe quien corre el comando; no se escribe en ningún archivo del repositorio**, tampoco en estas tareas ni en la documentación. Verificar: `dotnet user-secrets list` la muestra, y `git status` no reporta ningún archivo nuevo.
- [x] 5.3 `appsettings.Development.json`: `Persistence:Provider` pasa a `Postgres` y `PostgresConnectionString` queda como cadena vacía, igual que las otras. Verificar: `git diff` no contiene ninguna credencial, y arrancar sin el secreto falla con el mensaje explícito de la estrategia en vez de con una excepción de conexión.
- [x] 5.4 `appsettings.json`: agregar `PostgresConnectionString` vacío a la sección de persistencia, para que la clave exista y se vea de dónde sale. Verificar: build y arranque.

## 6. Producción

- [x] 6.1 `AzureAppConfigurationExtensions.AddOptionalAzureAppConfiguration`: la rama pasa de `AzureAppConfiguration:Enabled` a `builder.Environment.IsDevelopment()` — en Development retorna sin tocar Azure; fuera de Development se conecta siempre con `DefaultAzureCredential` contra el endpoint configurado. Retirar `ConnectionString` de `AzureAppConfigurationOptions` y el modo de conexión por cadena (`AzureAppConfigurationConnectionMode.ConnectionString`), que quedaba inalcanzable y era una llave estática. `Enabled`, `Endpoint`, `UseManagedIdentity` y `Label` se conservan. Verificar: `AzureAppConfigurationExtensionsTests` reescrito a la rama por entorno (Development no llama a `AddAzureAppConfiguration`; fuera de Development sin endpoint configurado lanza con un mensaje explícito) — el modo por cadena deja de tener test porque deja de existir.
- [x] 6.2 Documentar en `backend/ARCHITECTURE.md` de dónde sale la cadena en cada entorno: User Secrets en la máquina del desarrollador; Azure App Configuration con referencia a Key Vault en certificación y producción, que se comportan igual entre sí; identidad federada de carga de trabajo resuelta por `DefaultAzureCredential`, sin credencial de larga vida en ningún punto. Incluir la clave que hay que publicar (`Persistence:PostgresConnectionString`) y la variable de entorno del endpoint que debe estar puesta fuera de Development. Verificar: alguien que no participó puede seguirlo sin preguntar.
- [x] 6.3 Documentar en el mismo lugar que las migraciones las aplica el pipeline y no la aplicación, con el comando o el bundle, y por qué. Verificar: queda dicho que en producción nadie migra al arrancar.

## 7. Verificación

- [x] 7.1 `dotnet build` + `dotnet test` en verde (solo las 9 fallas pre-existentes de `RestClientBehaviorTests`).
- [x] 7.2 Contra la base PostgreSQL local: `dotnet ef database update` crea el esquema desde cero; arrancar la aplicación siembra los datos; `GET /people`, `GET /squads`, `GET /initiatives`, `GET /admin/talla-bands` y `GET /absences?month=<actual>` responden lo mismo que respondían en memoria. Verificar comparando contra las cifras conocidas: 18 personas, 5 células, 7 iniciativas con la talla de las evaluadas, y 5 ausencias con sus impactos.
- [x] 7.3 Probar que el esquema evoluciona, que es lo que este cambio viene a demostrar: generar una segunda migración a partir de un cambio pequeño y reversible en el modelo, aplicarla, comprobar que la columna aparece, y revertirla (`database update <migración anterior>`) dejando la base como estaba. Verificar: las dos direcciones funcionan y el modelo queda sin cambios pendientes.
- [x] 7.4 `backend/ARCHITECTURE.md`: la sección de persistencia menciona hoy sólo SqlServer y MongoDb; sumar PostgreSQL e InMemory, decir cuál es el de Development, y anotar que las migraciones existen sólo para PostgreSQL y que SqlServer sigue sin forma de crear su esquema. Verificar: el documento describe los cuatro proveedores.
