# Diseño — PostgreSQL, migraciones y la cadena como secreto

## Context

Ver proposal.md. El estado del que se parte: `PersistenceProvider` tiene tres valores (SqlServer, MongoDb, InMemory) y una estrategia por cada uno, resueltas por `PersistenceStrategyFactory` desde `Persistence:Provider`; `PersistenceOptions` guarda una cadena por motor; `appsettings.Development.json` usa InMemory y `DevelopmentDataSeeder` crea el esquema con `EnsureCreated` sólo cuando el proveedor es InMemory. No hay carpeta `Migrations/` ni herramientas `dotnet-ef` instaladas, y el proyecto WebApi no tiene `UserSecretsId`.

La configuración se apila en este orden, y cada fuente pisa a la anterior: `appsettings.json`, `appsettings.{Entorno}.json`, User Secrets (sólo en Development), variables de entorno, y por último Azure App Configuration, que `AddOptionalAzureAppConfiguration` agrega al final cuando está encendido y omite por completo cuando no. Ese comportamiento ya existe y es la razón por la que elegir App Configuration para producción no obliga a nada en local.

## Goals / Non-Goals

**Goals**
- Una base PostgreSQL local que se crea por migración, no por `EnsureCreated`, y se siembra con los mismos datos de hoy.
- Una migración inicial que refleje el modelo completo de los siete módulos y de la que se pueda partir para evolucionarlo.
- La cadena de conexión fuera del repositorio en los dos entornos, sin que el local dependa de ningún servicio.

**Non-Goals**
- Desplegar, crear recursos de Azure, migrar datos, retirar SqlServer o MongoDb, y dar a SqlServer sus propias migraciones.

## Decisions

1. **PostgreSQL se suma, no reemplaza.** Valor nuevo en `PersistenceProvider`, `PostgresPersistenceStrategy` con `UseNpgsql`, y `PostgresConnectionString` en `PersistenceOptions` — el mismo molde que las otras tres. *Alternativa*: reemplazar SqlServer y Mongo. Se descarta por decisión explícita: es un cambio grande y elimina opciones que la plantilla corporativa quizá exija conservar. El costo asumido es que MongoDb queda como una rama que las migraciones no cubren.

2. **Las migraciones son sólo de PostgreSQL, y eso se dice en voz alta.** Una migración de EF se compila contra un proveedor: los tipos, los generadores de identidad y el SQL son suyos. Generar además las de SqlServer significaría un segundo ensamblado de migraciones y mantener dos historias en paralelo para un motor que nadie usa y cuya cadena está vacía. SqlServer queda como está: declarado, sin forma de crear su esquema. Está anotado en la guía para que nadie lo descubra el día que lo necesite.

3. **`EnsureCreated` y las migraciones no conviven, así que se reparten por proveedor.** `EnsureCreated` crea el esquema saltándose la historia de migraciones y deja la base en un estado que `database update` no reconoce. Queda para InMemory, que no tiene migraciones ni las necesita. PostgreSQL usa `Migrate()`. La rama del sembrador que hoy pregunta "¿es InMemory?" pasa a preguntar "¿es un motor de desarrollo con esquema listo?" y corre después de crear el esquema por el camino que corresponda.

4. **Migrar automáticamente sólo en Development.** En producción migra el pipeline. Una aplicación que migra al arrancar convierte un despliegue en una carrera entre instancias, y descubre los bloqueos de tabla en el peor momento. En Development es lo contrario: quien clona el repositorio quiere que `dotnet run` deje la base lista. La guarda es el entorno, no una bandera de configuración, para que no exista la forma de encenderlo en producción por descuido.

5. **`IDesignTimeDbContextFactory` para que `dotnet ef` no dependa de la aplicación.** Las herramientas necesitan construir el contexto para generar y comparar migraciones, y hacerlo levantando la aplicación obliga a tener el secreto y las dependencias resueltas sólo para leer el modelo. La fábrica lee la configuración si está —para que `database update` funcione con el secreto puesto— y si no, usa una cadena de diseño que nunca se conecta, porque generar una migración no toca la base. *Alternativa*: sin fábrica, `dotnet ef` usa el `CreateHostBuilder` de la aplicación; funciona hasta que alguien intenta generar una migración sin secreto configurado.

6. **La cadena local vive en los User Secrets, no en `appsettings.Development.json`.** Ese archivo está versionado; los User Secrets viven en el perfil del usuario, fuera del árbol de trabajo, y .NET los carga solo en Development. `appsettings.Development.json` declara el proveedor —`Postgres`— y deja la cadena vacía, igual que `appsettings.json` con las otras. Requiere `UserSecretsId` en el proyecto WebApi, que hoy no lo tiene.

7. **La contraseña no entra al repositorio por ningún camino.** Ni en `appsettings`, ni en los artefactos de planeación, ni en los ejemplos de la guía, ni en un test. El comando que la guarda usa un marcador, y la contraseña real la escribe quien lo corre. Un secreto que aparece una vez en el historial de git ya está comprometido, aunque después se borre el archivo.

8. **De dónde sale el secreto lo decide el entorno, no una bandera.** `AddOptionalAzureAppConfiguration` pasa a preguntar `Environment.IsDevelopment()`: en Development retorna sin tocar Azure y la cadena la resuelven los User Secrets; fuera de Development se conecta siempre a App Configuration. Certificación y producción caen en la misma rama y se comportan igual. *Alternativa*: seguir decidiendo por `AzureAppConfiguration:Enabled`. Se descarta porque una bandera permite dos combinaciones que nadie quiere —producción sin App Configuration, o una máquina de desarrollo intentando alcanzarla— y porque el entorno ya es el dato que gobierna la diferencia.

   La consecuencia, asumida: **cualquier ejecución que no sea Development exige App Configuration alcanzable**. No hay escape ni valor por defecto. Si algún día hace falta un entorno intermedio sin Azure, será una decisión explícita y no un efecto lateral de una bandera olvidada.

9. **La autenticación contra App Configuration es identidad federada de carga de trabajo.** `DefaultAzureCredential` la resuelve solo: encuentra las variables que la plataforma inyecta y el archivo de token proyectado, y pide el token con ellos. No hace falta código propio ni un credential específico, y el paquete `Azure.Identity` del repositorio está muy por encima de la versión donde eso entró. La clave `Persistence:PostgresConnectionString` se publica en App Configuration como **referencia a un secreto de Key Vault**, así que la cadena tampoco está en App Configuration: está en Key Vault, y rotarla no exige redesplegar. Como App Configuration se agrega de última a la configuración, gana sobre las variables de entorno y sobre los archivos.

10. **Se retira el modo de conexión por cadena de App Configuration.** Esa cadena (`Endpoint=…;Id=…;Secret=…`) es una llave de acceso compartida: una credencial estática de larga vida guardada en configuración, que es exactamente lo que este cambio viene a eliminar. Con la rama por entorno queda además inalcanzable. Retirarla deja un solo camino de autenticación y cierra la puerta a que alguien la reactive para salir del paso. `Enabled`, `Endpoint`, `UseManagedIdentity` y `Label` se conservan por decisión explícita, aunque los dos primeros ya no gobiernen la rama.

11. **La migración inicial se genera y luego se lee, no se confía a ciegas.** Es la primera vez que estas configuraciones se enfrentan a un motor relacional, y hay cuatro puntos donde se espera fricción: los tipos declarados con `HasColumnType("decimal(…)")`, que en PostgreSQL son `numeric`; las claves sombra `int` con `ValueGeneratedOnAdd` de las colecciones poseídas, que deben quedar como identidad; las dos columnas JSON —la evaluación de una iniciativa y los cortes y cantidades de los parámetros— que se guardan como texto por converter; y las fechas de una ausencia, que son `DateOnly` y deben mapear a `date` y no a `timestamp`. Revisar el SQL generado es parte de la tarea.

12. **La prueba de que el modelo y la migración coinciden es automática.** Un test que falle cuando el modelo tenga cambios sin migrar evita el error clásico: alguien agrega una propiedad, todo compila, los tests pasan, y la base de producción se queda sin la columna. Es más barato que revisarlo a mano en cada revisión.

13. **Los tests siguen sobre Sqlite y en memoria.** No se convierten a PostgreSQL: exigirían un motor corriendo para ejecutar la suite, y lo que verifican —que un agregado sobrevive al viaje de ida y vuelta— no depende del dialecto. Lo que sí se agrega es lo que sólo puede verificarse contra el modelo real: que no haya cambios pendientes y que la fábrica de diseño funcione.

## Risks / Trade-offs

- [Siete módulos de configuraciones EF que nunca vieron un motor relacional] → es el riesgo principal y la razón del cambio; la migración inicial es donde aparece, y resolverlo está dentro del alcance, no fuera.
- [PostgreSQL pliega a minúsculas los identificadores sin comillas] → EF los emite entrecomillados, así que los nombres en PascalCase sobreviven; se verifica leyendo el SQL en vez de asumirlo.
- [SqlServer queda sin forma de crear su esquema] → ya estaba así; el cambio no lo empeora, sólo lo hace explícito en la guía.
- [Migrar al arrancar en Development] → si dos procesos arrancan a la vez sobre la misma base local pueden competir; es una molestia local conocida y no justifica un mecanismo de bloqueo.
- [App Configuration gana sobre las variables de entorno] → es el orden que el código ya tiene; se documenta para que nadie pierda una tarde depurando por qué su variable no surte efecto.
- [Depender de las herramientas `dotnet-ef`, que no están instaladas] → se instalan como herramienta local del repositorio, con su manifiesto versionado, para que la versión sea la misma en todas las máquinas y en el pipeline.

## Migration Plan

Sin datos que migrar: la base local nace vacía. Orden: paquete y herramientas → proveedor y opción → fábrica de tiempo de diseño → migración inicial y lectura de su SQL → arranque que migra en Development y sembrador sobre PostgreSQL → secreto local y `UserSecretsId` → enmascarado y configuración de producción → tests → verificación contra una base real → documentación.

Rollback: volver `Persistence:Provider` a `InMemory` en `appsettings.Development.json` deja todo como estaba; el proveedor nuevo y la carpeta de migraciones quedan sin ejercitar pero no estorban.

## Open Questions

(ninguna)
