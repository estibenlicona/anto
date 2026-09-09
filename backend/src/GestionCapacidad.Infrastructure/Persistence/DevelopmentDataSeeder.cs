using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace GestionCapacidad.Infrastructure.Persistence;

/// <summary>
/// Semillas de desarrollo: con la base vacía, siembra personas, células,
/// iniciativas y demás espejo de las del mock del frontend, para que la API
/// responda datos familiares desde el primer <c>dotnet run</c>. Corre sobre
/// InMemory (esquema por <c>EnsureCreated</c>, sin migraciones) y sobre
/// Postgres (esquema ya migrado por <c>Program.cs</c> antes de sembrar). Las
/// semillas viven acá y no en <c>HasData</c>: <c>HasData</c> ata los datos al
/// modelo y ensuciaría migraciones reales.
/// </summary>
public static class DevelopmentDataSeeder
{
    /// <summary>
    /// El seniority inicial se deriva del nivel —1–2 Junior, 3 Intermedio,
    /// 4 Senior— con la misma regla de las semillas del mock; después se
    /// edita libremente porque son dos campos independientes.
    /// </summary>
    private static Seniority SeniorityForLevel(int level) => level switch
    {
        >= 4 => Seniority.Senior,
        3 => Seniority.Intermediate,
        _ => Seniority.Junior,
    };

    // Nombre, cargo, nivel (escala Tuya), modalidad, FTE disponible.
    private static readonly (string Name, string Position, int Level, string Modality, float Fte)[] People =
    [
        ("María González", "Backend Dev", 3, "Hybrid", 1.0f),
        ("Laura Ruiz", "QA Engineer", 2, "Remote", 1.0f),
        ("Carlos López", "Arquitecto", 4, "OnSite", 0.5f),
        ("Andrés Martínez", "Frontend Dev", 2, "OnSite", 1.0f),
        ("Paula Ramírez", "Data Engineer", 4, "Hybrid", 1.0f),
        ("Diego Salazar", "Backend Dev", 1, "Remote", 1.0f),
        ("Valentina Ospina", "UX Designer", 3, "Hybrid", 1.0f),
        ("Sebastián Cárdenas", "DevOps Engineer", 3, "Remote", 1.0f),
        ("Camila Restrepo", "Product Owner", 4, "OnSite", 1.0f),
        ("Julián Peña", "QA Engineer", 2, "Hybrid", 1.0f),
        ("Isabella Moreno", "Frontend Dev", 3, "Remote", 0.5f),
        ("Mateo Vargas", "Data Analyst", 1, "Hybrid", 1.0f),
        ("Sofía Herrera", "Scrum Master", 3, "OnSite", 1.0f),
        ("Tomás Giraldo", "Arquitecto", 4, "Hybrid", 1.0f),
        ("Daniela Castaño", "Backend Dev", 2, "Remote", 1.0f),
        ("Emilio Naranjo", "Security Engineer", 3, "Hybrid", 1.0f),
        ("Lucía Arango", "UX Researcher", 2, "Remote", 1.0f),
        ("Nicolás Betancur", "Mobile Dev", 3, "OnSite", 1.0f),
    ];

    /// <summary>
    /// El rol de cada persona sembrada, por nombre — espejo de ROLE_BY_NAME
    /// del mock. No sale del cargo: es justamente lo que este dato dejó de
    /// ser. Hay dos Líderes Técnicos a propósito (con uno solo el selector
    /// "funciona" sin probar nada); quien no lidera nada es Colaborador.
    /// </summary>
    private static readonly Dictionary<string, PersonRole> RoleByName = new()
    {
        ["Carlos López"] = PersonRole.TechnicalLead,
        ["Tomás Giraldo"] = PersonRole.TechnicalLead,
        ["María González"] = PersonRole.ExpertiseLead,
        ["Laura Ruiz"] = PersonRole.ExpertiseLead,
        ["Paula Ramírez"] = PersonRole.ExpertiseLead,
        ["Sebastián Cárdenas"] = PersonRole.ExpertiseLead,
        ["Camila Restrepo"] = PersonRole.ProductOwner,
    };

    /// <summary>
    /// Quién acompaña técnicamente a quién, por nombre — espejo de
    /// TECHNICAL_LEAD_BY_NAME del mock. Varias personas quedan sin líder a
    /// propósito, incluidos los propios líderes: el campo es opcional.
    /// </summary>
    private static readonly Dictionary<string, string> TechnicalLeadByName = new()
    {
        ["María González"] = "Carlos López",
        ["Diego Salazar"] = "Carlos López",
        ["Daniela Castaño"] = "Carlos López",
        ["Julián Peña"] = "Carlos López",
        ["Andrés Martínez"] = "Tomás Giraldo",
        ["Isabella Moreno"] = "Tomás Giraldo",
        ["Nicolás Betancur"] = "Tomás Giraldo",
        ["Mateo Vargas"] = "Tomás Giraldo",
    };

    /// <summary>
    /// Stacks por nombre — espejo de STACK_SEEDS del mock; el primero de cada
    /// lista es el principal. AS400 y MuleSoft los tiene una sola persona a
    /// propósito: son los de "riesgo" en la cobertura. Sofía y Lucía quedan
    /// sin stacks: la pantalla tiene que saber decirlo.
    /// </summary>
    private static readonly Dictionary<string, (string Stack, int Level)[]> StacksByName = new()
    {
        ["María González"] = [(".NET", 3), ("Azure", 2), ("Kafka", 3), ("AS400", 2)],
        ["Laura Ruiz"] = [("React", 2), ("Angular", 2), ("Azure", 1)],
        ["Carlos López"] = [("Azure", 4), (".NET", 4), ("Bus de Integración", 3), ("Kafka", 3), ("SQL Server", 3)],
        ["Andrés Martínez"] = [("React", 2), ("React Native", 2), (".NET", 1), ("Azure", 2)],
        ["Paula Ramírez"] = [("Python", 4), ("SQL Server", 4), ("Power BI", 3), ("Azure", 3)],
        ["Diego Salazar"] = [(".NET", 1), ("SQL Server", 1)],
        ["Valentina Ospina"] = [("React", 3), ("React Native", 2)],
        ["Sebastián Cárdenas"] = [("Azure", 3), ("Kafka", 2), ("Python", 2)],
        ["Camila Restrepo"] = [("Power BI", 2)],
        ["Julián Peña"] = [("Java", 2), (".NET", 2), ("SQL Server", 2)],
        ["Isabella Moreno"] = [("React", 3), ("Angular", 2), ("React Native", 3)],
        ["Mateo Vargas"] = [("Python", 1), ("Power BI", 1), ("SQL Server", 1)],
        ["Tomás Giraldo"] = [("MuleSoft", 4), ("Azure", 4), (".NET", 3), ("Bus de Integración", 4)],
        ["Daniela Castaño"] = [(".NET", 2), ("Azure", 2), ("SQL Server", 2)],
        ["Emilio Naranjo"] = [("Azure", 3), ("Python", 2)],
        ["Nicolás Betancur"] = [("React Native", 3), ("React", 2), ("Java", 2)],
    };

    /// <summary>Los equipos del mock: catálogo referenciado por las células.</summary>
    private static readonly (string Name, string? Description)[] Teams =
    [
        ("Ecosistema Digital", null),
        ("Riesgo y Fraude", null),
        ("Pagos", null),
        ("Datos y Analítica", null),
    ];

    /// <summary>
    /// Las células del mock: nombre, equipo y criticidad. Pagos
    /// Instantáneos queda sin gente a propósito: la pantalla tiene que
    /// saber mostrar una célula vacía.
    /// </summary>
    private static readonly (string Name, string Team, string Criticality)[] Squads =
    [
        ("Backend Platform", "Ecosistema Digital", "High"),
        ("Canales Digitales", "Ecosistema Digital", "Critical"),
        ("Fraude Tarjetas", "Riesgo y Fraude", "Critical"),
        ("Pagos Instantáneos", "Pagos", "Low"),
        ("Plataforma de Datos", "Datos y Analítica", "Medium"),
    ];

    /// <summary>Proveedores de ejemplo: nombre, NIT y correo de contacto.</summary>
    private static readonly (string Name, string IdentificationNumber, string Email)[] Providers =
    [
        ("GFT", "900111222", "contacto@gft.com"),
        ("TATA Consultancy Services", "900222333", "contacto@tata.com"),
        ("QVision", "900333444", "contacto@qvision.com"),
    ];

    /// <summary>
    /// Externos de ejemplo (nombre → proveedor), espejo de <c>EXTERNAL_PROVIDERS</c>
    /// del mock: Prefacturación necesita al menos tres proveedores con gente.
    /// </summary>
    private static readonly Dictionary<string, string> ProviderByPersonName = new()
    {
        ["Paula Ramírez"] = "GFT",
        ["Andrés Martínez"] = "TATA Consultancy Services",
        ["Camila Restrepo"] = "QVision",
    };

    /// <summary>
    /// El tamizaje con el que se evalúan las semillas. Es el mismo catálogo
    /// que sirve el proveedor del modelo; acá sólo importa cuáles son críticas,
    /// que es lo único que el motor mira.
    /// </summary>
    private static readonly IReadOnlyList<TriageQuestionDto> SeedTriage =
    [
        new("T1", "¿Integra o modifica sistemas internos o terceros externos?", false),
        new("T2", "¿Procesa datos personales, financieros o sensibles, o está expuesta a internet?", true),
        new("T3", "¿Puede generar fraude, pérdida económica, impacto reputacional o sanción?", true),
        new("T4", "¿Introduce tecnología nueva o cambia arquitectura transversal o compartida?", false),
        new("T5", "¿Impacta una capacidad crítica (pagos, crédito, cartera, recaudo, originación)?", false),
        new("T6", "¿El requerimiento aún es ambiguo o requiere discovery funcional o técnico?", false),
    ];

    // Los tres perfiles de respuestas del mock, en el orden del pool.
    private static readonly int[] SmallAnswers =
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 2, 0, 1, 1, 1, 1];

    private static readonly int[] MediumAnswers =
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 1];

    private static readonly int[] LargeAnswers =
        [3, 3, 2, 2, 3, 2, 2, 3, 3, 3, 2, 2, 4, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 2, 4, 2, 2, 3, 2, 2];

    /// <summary>
    /// Las iniciativas del mock. Payment Engine v2 queda evaluada pero sin
    /// activar a propósito: Backend Platform ya tiene su activa, y una célula
    /// sostiene una sola — es el caso que deja ver "Activar" rechazado con su
    /// motivo. Las dos últimas quedan sin evaluar, para la vista de pendientes.
    /// </summary>
    private static readonly (string Name, string Squad, string ProductOwner, int TargetMonths,
        string Status, bool[]? Triage, int[]? Answers, DateTime CreatedAtUtc)[] Initiatives =
    [
        ("Kafka Migration", "Backend Platform", "Paola Henao", 6, "Active",
            [true, false, false, true, false, false], MediumAnswers, new DateTime(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc)),
        ("Payment Engine v2", "Backend Platform", "Ana Restrepo", 9, "Evaluating",
            [true, true, true, true, true, false], LargeAnswers, new DateTime(2026, 4, 13, 0, 0, 0, DateTimeKind.Utc)),
        ("Onboarding App", "Canales Digitales", "Diego Cardona", 4, "Active",
            [false, false, false, false, false, false], SmallAnswers, new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc)),
        ("Fraud Scoring v3", "Fraude Tarjetas", "Ana Restrepo", 6, "Active",
            [true, true, true, false, true, false], MediumAnswers, new DateTime(2026, 5, 20, 0, 0, 0, DateTimeKind.Utc)),
        ("Lakehouse", "Plataforma de Datos", "Paola Henao", 12, "Closed",
            [true, false, false, true, false, true], MediumAnswers, new DateTime(2025, 11, 3, 0, 0, 0, DateTimeKind.Utc)),
        ("Pago con QR en App", "Canales Digitales", "Diego Cardona", 6, "Evaluating",
            null, null, new DateTime(2026, 8, 18, 0, 0, 0, DateTimeKind.Utc)),
        ("Motor antifraude de tarjetas", "Fraude Tarjetas", "Ana Restrepo", 12, "Evaluating",
            null, null, new DateTime(2026, 8, 20, 0, 0, 0, DateTimeKind.Utc)),
        ("Data Mesh Gobernado", "Plataforma de Datos", "Diego Cardona", 3, "Active",
            [true, true, false, true, false, true], LargeAnswers, new DateTime(2026, 8, 25, 0, 0, 0, DateTimeKind.Utc)),
    ];

    /// <summary>
    /// Las asignaciones sembradas, por nombre de persona y de célula:
    /// dedicación y BAU (transformación = dedicación − BAU). Una persona,
    /// una sola asignación, así que la dedicación es también su utilización.
    ///
    /// Es la misma lista que <c>allocations.seeds.ts</c> en el front: las dos
    /// tienen que decir lo mismo o la app cambia de datos según corra contra
    /// el mock o contra esta base.
    ///
    /// Cada célula lleva perfiles del mix que pide la talla de su iniciativa
    /// activa y le falta alguno; la brecha está sembrada a propósito. Cinco
    /// personas quedan sin célula —las cinco utilizaciones en 0—, y Pagos
    /// Instantáneos sin nadie, para el estado "sin demanda".
    /// </summary>
    private static readonly (string Person, string Squad, int Dedication, int Bau)[] Allocations =
    [
        ("María González", "Backend Platform", 80, 50),
        ("Carlos López", "Backend Platform", 100, 60),
        ("Andrés Martínez", "Backend Platform", 50, 20),
        ("Isabella Moreno", "Backend Platform", 50, 30),
        ("Laura Ruiz", "Canales Digitales", 100, 30),
        ("Diego Salazar", "Canales Digitales", 100, 70),
        ("Nicolás Betancur", "Canales Digitales", 100, 40),
        ("Valentina Ospina", "Fraude Tarjetas", 60, 20),
        ("Daniela Castaño", "Fraude Tarjetas", 100, 40),
        ("Emilio Naranjo", "Fraude Tarjetas", 70, 30),
        ("Tomás Giraldo", "Fraude Tarjetas", 60, 10),
        ("Sebastián Cárdenas", "Plataforma de Datos", 100, 50),
        ("Paula Ramírez", "Plataforma de Datos", 60, 60),
    ];

    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using IServiceScope scope = services.CreateScope();
        PersistenceOptions options = scope.ServiceProvider
            .GetRequiredService<IOptions<PersistenceOptions>>().Value;

        if (!Enum.TryParse(options.Provider, ignoreCase: true, out PersistenceProvider provider) ||
            provider is not (PersistenceProvider.InMemory or PersistenceProvider.Postgres))
        {
            return;
        }

        ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // InMemory no tiene migraciones: su esquema se crea saltándose esa
        // historia. Postgres ya llegó migrado (Program.cs lo hace antes de
        // sembrar); EnsureCreated ahí dejaría la base en un estado que
        // `database update` no reconoce.
        if (provider == PersistenceProvider.InMemory)
        {
            await dbContext.Database.EnsureCreatedAsync(cancellationToken);
        }

        if (await dbContext.People.AnyAsync(cancellationToken))
        {
            return;
        }

        var seeded = new List<Person>(People.Length);
        int index = 0;
        foreach ((string name, string position, int level, string modality, float fte) in People)
        {
            index++;
            string slug = RemoveDiacritics(name).ToLowerInvariant().Replace(' ', '.');
            var person = new Person(
                name: name,
                documentId: $"10368840{index:00}",
                entraObjectId: string.Empty,
                userPrincipalName: $"{slug}@tuya.com",
                position: position,
                role: RoleByName.GetValueOrDefault(name, PersonRole.Contributor),
                level: Level.From(level),
                seniority: SeniorityForLevel(level),
                modality: Modality.From(modality),
                availableFte: Fte.From(fte),
                monthlyCost: 6_000_000m + (index * 350_000m),
                startDate: new DateOnly(2021 + (index % 4), (index % 9) + 1, 15));

            if (StacksByName.TryGetValue(name, out (string Stack, int Level)[]? stacks))
            {
                person.ReplaceStacks(stacks
                    .Select((s, i) => new PersonStack(s.Stack, Level.From(s.Level), isPrimary: i == 0))
                    .ToList());
            }

            seeded.Add(person);
        }

        // El líder técnico se resuelve a id después de que todos tienen el suyo.
        Dictionary<string, Guid> idByName = seeded.ToDictionary(p => p.Name, p => p.Id);
        foreach (Person person in seeded)
        {
            if (TechnicalLeadByName.TryGetValue(person.Name, out string? leadName))
            {
                person.AssignTechnicalLead(idByName[leadName]);
            }
        }

        dbContext.People.AddRange(seeded);

        // Equipos, sembrados antes que las células para poder resolver su Id.
        var teamByName = new Dictionary<string, Team>();
        foreach ((string name, string? description) in Teams)
        {
            var team = new Team(name, description);
            teamByName[name] = team;
            dbContext.Teams.Add(team);
        }

        // Células y asignaciones del mock, resueltas por nombre. Con esto la
        // utilización de las personas deja de ser 0 desde el primer arranque.
        var squadByName = new Dictionary<string, Squad>();
        foreach ((string name, string team, string criticality) in Squads)
        {
            var squad = new Squad(name, Criticality.From(criticality), teamByName[team].Id, description: null);
            squadByName[name] = squad;
            dbContext.Squads.Add(squad);
        }

        foreach ((string personName, string squadName, int dedication, int bau) in Allocations)
        {
            dbContext.Allocations.Add(new Allocation(
                idByName[personName],
                squadByName[squadName].Id,
                initiativeId: null,
                Percentage.From(dedication),
                Percentage.From(bau),
                Percentage.From(dedication - bau)));
        }

        // Proveedores y las personas externas que trabajan para ellos:
        // Prefacturación necesita al menos una persona por proveedor.
        var companyByName = new Dictionary<string, Company>();
        foreach ((string name, string identificationNumber, string email) in Providers)
        {
            var company = new Company(name, identificationNumber, email);
            companyByName[name] = company;
            dbContext.Companies.Add(company);
        }

        foreach (Person person in seeded)
        {
            if (ProviderByPersonName.TryGetValue(person.Name, out string? providerName))
            {
                person.AssignToProvider(companyByName[providerName].Id);
            }
        }

        SeedInitiatives(dbContext, squadByName);
        SeedAbsences(dbContext, idByName);
        SeedPrefactures(dbContext, seeded, companyByName);
        Dictionary<string, Skill> skillsByName = SeedSkills(dbContext);
        SeedAssessments(dbContext, idByName, skillsByName);
        SeedDedication(dbContext, seeded);
        SeedCareerPlan(dbContext, idByName, skillsByName);
        SeedExpertiseLines(dbContext, seeded);
        SeedChapters(seeded);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Tres líneas: una completa (lead y varias personas), una incompleta
    /// (sin lead) y una archivada sin personas — la pertenencia usa
    /// <see cref="Person.ExpertiseLineId"/>, distinto del chapter (alcance de autorización).
    /// </summary>
    private static void SeedExpertiseLines(ApplicationDbContext dbContext, List<Person> seeded)
    {
        Dictionary<string, Person> personByName = seeded.ToDictionary(p => p.Name);

        var backend = new ExpertiseLine("Backend", "BE", "Desarrollo de servicios y APIs.");
        foreach (string name in new[] { "Carlos López", "María González", "Diego Salazar", "Daniela Castaño" })
        {
            personByName[name].AssignToExpertiseLine(backend.Id);
        }

        backend.SetLead(personByName["Carlos López"].Id);
        dbContext.ExpertiseLines.Add(backend);

        var frontend = new ExpertiseLine("Frontend", "FE", "Interfaces y experiencia de usuario.");
        foreach (string name in new[] { "Andrés Martínez", "Isabella Moreno" })
        {
            personByName[name].AssignToExpertiseLine(frontend.Id);
        }

        dbContext.ExpertiseLines.Add(frontend);

        var qaLegacy = new ExpertiseLine("QA Legacy", "QAL", null);
        qaLegacy.Archive();
        dbContext.ExpertiseLines.Add(qaLegacy);
    }

    /// <summary>
    /// Asigna algunas personas ya sembradas a los dos primeros chapters del
    /// catálogo fijo (<see cref="GestionCapacidad.Infrastructure.Catalogs.ChapterDirectoryCatalog"/>,
    /// mismos ids); el tercero queda sin nadie, a propósito.
    /// </summary>
    private static void SeedChapters(List<Person> seeded)
    {
        Dictionary<string, Person> personByName = seeded.ToDictionary(p => p.Name);
        var coreYDatos = Guid.Parse("c4a91111-1111-1111-1111-111111111111");
        var canalesDigitales = Guid.Parse("c4a92222-2222-2222-2222-222222222222");

        foreach (string name in new[] { "María González", "Carlos López" })
        {
            personByName[name].AssignToChapter(coreYDatos);
        }

        foreach (string name in new[] { "Andrés Martínez", "Isabella Moreno" })
        {
            personByName[name].AssignToChapter(canalesDigitales);
        }
    }

    /// <summary>
    /// Dos acciones sobre las brechas reales que <see cref="SeedAssessments"/>
    /// ya dejó: una en curso y vencida (para el pendiente de gestión) y una
    /// cumplida sobre una brecha que así vuelve a quedar sin plan — cumplir
    /// una acción no cierra la brecha, sólo reevaluar lo hace.
    /// </summary>
    private static void SeedCareerPlan(
        ApplicationDbContext dbContext, Dictionary<string, Guid> idByName, Dictionary<string, Skill> skillsByName)
    {
        Guid sqlId = skillsByName["SQL"].Id;

        // María: SQL en 2, exige 3 → brecha de 1. Acción en curso, vencida.
        var mariaAction = new PlanAction(idByName["María González"], sqlId, fromLevel: 2, targetLevel: 3, dueMonth: "2026-06", title: "Curso avanzado de modelado relacional");
        dbContext.PlanActions.Add(mariaAction);

        // Laura: SQL en 1, exige 2 → brecha de 1. Acción cumplida: la brecha queda otra vez sin plan.
        var lauraAction = new PlanAction(idByName["Laura Ruiz"], sqlId, fromLevel: 1, targetLevel: 2, dueMonth: "2026-05", title: "Acompañamiento en consultas SQL");
        lauraAction.SetStatus(PlanActionStatus.Done);
        dbContext.PlanActions.Add(lauraAction);
    }

    /// <summary>
    /// Siete sprints <c>S12</c>…<c>S18</c> (dos semanas cada uno, <c>S18</c>
    /// conteniendo la fecha de hoy) con snapshots que cubren cada señal de
    /// balance y cada motivo de "no evaluable" — ver design.md decisión 3:
    /// las semillas sellan directamente, como <c>Initiative.SaveEvaluation</c>.
    /// </summary>
    private static void SeedDedication(ApplicationDbContext dbContext, List<Person> seeded)
    {
        Dictionary<string, Person> personByName = seeded.ToDictionary(p => p.Name);

        void LinkIdentity(string name)
        {
            string slug = RemoveDiacritics(name).ToLowerInvariant().Replace(' ', '.');
            personByName[name].LinkDevOpsIdentity(slug);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        DateOnly s18Start = today.AddDays(-3);

        var sprintByName = new Dictionary<string, Sprint>(StringComparer.Ordinal);
        for (int i = 0; i < 7; i++)
        {
            string name = $"S{12 + i}";
            DateOnly start = s18Start.AddDays((i - 6) * 14);
            var sprint = new Sprint(name, start, start.AddDays(13), holidays: 0);
            sprintByName[name] = sprint;
            dbContext.Sprints.Add(sprint);
        }

        SprintSnapshot Sealed(string personName, string sprintName, decimal committed, decimal completed, decimal carryOver, int wip)
        {
            var snapshot = new SprintSnapshot(personByName[personName].Id, sprintByName[sprintName].Id);
            snapshot.SetExecution(committed, 0m, completed, carryOver, wip, otherUnavailableDays: 0m);
            snapshot.Seal(DateTime.UtcNow);
            dbContext.SprintSnapshots.Add(snapshot);
            return snapshot;
        }

        SprintSnapshot Provisional(string personName, string sprintName, decimal committedAtStart, decimal addedDuringSprint, int wip)
        {
            var snapshot = new SprintSnapshot(personByName[personName].Id, sprintByName[sprintName].Id);
            snapshot.SetExecution(committedAtStart, addedDuringSprint, completedPoints: null, carryOverPoints: null, wip, otherUnavailableDays: 0m);
            dbContext.SprintSnapshots.Add(snapshot);
            return snapshot;
        }

        string[] historicalSprints = ["S12", "S13", "S14", "S15", "S16", "S17"];

        // Backend Platform (María, Carlos, Andrés, Isabella): el sprint
        // corriente sube parejo con su célula → señal accionable con el
        // contexto "se comporta como la célula" (decisión 6).
        foreach (string name in new[] { "María González", "Carlos López", "Andrés Martínez", "Isabella Moreno" })
        {
            LinkIdentity(name);
            foreach (string sprint in historicalSprints)
            {
                Sealed(name, sprint, 20m, 20m, 0m, 2);
            }

            Provisional(name, "S18", 26m, 0m, 2);
        }

        // Posible sobreasignación aislada, sin célula, con multitarea de refuerzo.
        LinkIdentity("Nicolás Betancur");
        foreach (string sprint in historicalSprints)
        {
            Sealed("Nicolás Betancur", sprint, 20m, 20m, 0m, 2);
        }

        Provisional("Nicolás Betancur", "S18", 35m, 0m, 5).ReplaceInitiatives(
        [
            new ConcurrentInitiativeSnapshot("E-201", "Rediseño checkout", "I-9", "Payment Engine v2", 15m),
            new ConcurrentInitiativeSnapshot("E-202", "Migración cache", null, null, 12m),
            new ConcurrentInitiativeSnapshot("E-203", "Soporte incidentes", null, null, 8m),
        ]);

        // Posible subasignación aislada.
        LinkIdentity("Mateo Vargas");
        foreach (string sprint in historicalSprints)
        {
            Sealed("Mateo Vargas", sprint, 20m, 19m, 0m, 1);
        }

        Provisional("Mateo Vargas", "S18", 10m, 0m, 1);

        // Carga habitual: el sprint corriente repite el histórico.
        LinkIdentity("Daniela Castaño");
        foreach (string sprint in historicalSprints)
        {
            Sealed("Daniela Castaño", sprint, 20m, 20m, 0m, 2);
        }

        Provisional("Daniela Castaño", "S18", 20m, 0m, 2);

        // Histórico insuficiente: un solo sprint sellado en la ventana.
        LinkIdentity("Emilio Naranjo");
        Sealed("Emilio Naranjo", "S17", 20m, 18m, 2m, 2);
        Provisional("Emilio Naranjo", "S18", 20m, 0m, 2);

        // Sprint elegido sin snapshot (Missing), con histórico previo íntegro.
        LinkIdentity("Sofía Herrera");
        foreach (string sprint in historicalSprints)
        {
            Sealed("Sofía Herrera", sprint, 18m, 18m, 0m, 2);
        }

        // Sin identidad DevOps: Lucía Arango se queda sin vincular, a propósito.
    }

    /// <summary>
    /// Cinco ausencias del mes en curso: tres tipos, tres estados, una que
    /// cruza el fin de mes y un permiso de media jornada.
    ///
    /// Las fechas se calculan contra el mes actual y no se escriben fijas: la
    /// pantalla abre en el mes de hoy, así que semillas con fechas fijas la
    /// dejarían vacía en cuanto pasara el mes. Se siembran sobre gente que ya
    /// tiene asignación, para que los impactos por célula no salgan en cero.
    /// </summary>
    private static void SeedAbsences(ApplicationDbContext dbContext, Dictionary<string, Guid> idByName)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Vacaciones aprobadas: el segundo lunes del mes, tres días.
        Add("María González", AbsenceType.Vacation, NthWeekday(today, 2, DayOfWeek.Monday), 2, AbsenceStatus.Approved);

        // Incapacidad aprobada que cruza el fin de mes: desde el último día
        // hábil, que está a lo sumo a dos días del cierre, así que +4 días
        // calendario cae siempre en el mes siguiente.
        Add("Carlos López", AbsenceType.SickLeave, LastBusinessDayOfMonth(today), 4, AbsenceStatus.Approved);

        // Permiso de media jornada solicitado: sin un dato así, el decimal de
        // la columna de días no se ve nunca en desarrollo.
        DateOnly halfDay = NthWeekday(today, 3, DayOfWeek.Wednesday);
        Add("Andrés Martínez", AbsenceType.Leave, halfDay, 0, AbsenceStatus.Requested, halfDayLeave: true);

        // Vacaciones solicitadas: la cola de "por aprobar" necesita más de una.
        Add("Laura Ruiz", AbsenceType.Vacation, NthWeekday(today, 4, DayOfWeek.Monday), 1, AbsenceStatus.Requested);

        // Permiso rechazado con su motivo trazado.
        Add("Paula Ramírez", AbsenceType.Leave, NthWeekday(today, 2, DayOfWeek.Wednesday), 1,
            AbsenceStatus.Rejected, reason: "Coincide con el cierre del sprint; movámoslo una semana");

        void Add(
            string personName,
            AbsenceType type,
            DateOnly start,
            int extraDays,
            AbsenceStatus status,
            bool halfDayLeave = false,
            string? reason = null)
        {
            if (!idByName.TryGetValue(personName, out Guid personId))
            {
                return;
            }

            var absence = new Absence(personId, type, start, start.AddDays(extraDays), halfDayLeave, halfDayLeave);

            // Aprobar exige estar solicitada y rechazar exige un motivo, así
            // que el estado se aplica después de crearla.
            if (status == AbsenceStatus.Approved)
            {
                absence.Approve();
            }
            else if (status == AbsenceStatus.Rejected)
            {
                absence.Reject(reason ?? "Sin motivo");
            }

            dbContext.Absences.Add(absence);
        }
    }

    /// <summary>
    /// Prefacturas relativas al período actual y al anterior, espejo de
    /// <c>BILLING_SEEDS</c> del mock: el anterior cerrado (GFT aprobada,
    /// QVision objetada) y el actual en revisión (GFT, con documento pero sin
    /// orden de compra — el caso que distingue un dato faltante de uno vacío).
    /// Con fechas relativas al mes en curso, como las semillas de ausencias.
    /// </summary>
    private static void SeedPrefactures(
        ApplicationDbContext dbContext,
        List<Person> seeded,
        Dictionary<string, Company> companyByName)
    {
        Dictionary<string, Person> personByName = seeded.ToDictionary(p => p.Name);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        string currentPeriod = $"{today.Year:D4}-{today.Month:D2}";
        DateOnly previousMonthDay = new DateOnly(today.Year, today.Month, 1).AddDays(-1);
        string previousPeriod = $"{previousMonthDay.Year:D4}-{previousMonthDay.Month:D2}";

        Prefacture New(string personName, string providerName, string period)
        {
            Person person = personByName[personName];
            string? squadName = Allocations
                .Where(a => a.Person == personName)
                .Select(a => a.Squad)
                .FirstOrDefault();

            return new Prefacture(
                person.Id, person.Name, person.Position, squadName,
                companyByName[providerName].Id, person.MonthlyCost, period);
        }

        // GFT (Paula), período anterior: aprobada con documento completo.
        Prefacture gftPrevious = New("Paula Ramírez", "GFT", previousPeriod);
        gftPrevious.RegisterDocument(new PrefactureDocument(
            "FE-2041",
            new DateOnly(previousMonthDay.Year, previousMonthDay.Month, 5),
            gftPrevious.MonthlyCost,
            Currency.Cop,
            new Imputation(gftPrevious.SquadName, "Servicios profesionales", "Servicios técnicos", "5135-05",
                "CC-1001", "OC-77120", "Bancolombia 4567")));
        gftPrevious.Approve(discount: null, note: null, approvedAtUtc: DateTime.UtcNow);
        dbContext.Prefactures.Add(gftPrevious);

        // QVision (Camila), período anterior: objetada con motivo.
        Prefacture qvisionPrevious = New("Camila Restrepo", "QVision", previousPeriod);
        qvisionPrevious.RegisterDocument(new PrefactureDocument(
            "QV-8871",
            new DateOnly(previousMonthDay.Year, previousMonthDay.Month, 6),
            qvisionPrevious.MonthlyCost,
            Currency.Cop,
            new Imputation(qvisionPrevious.SquadName, "Servicios profesionales", "Servicios técnicos", "5135-05",
                "CC-2040", "OC-77135", "Bancolombia 4567")));
        qvisionPrevious.Object(
            "Facturaron a Camila completa: tuvo días de permiso aprobados que no descontaron.", DateTime.UtcNow);
        dbContext.Prefactures.Add(qvisionPrevious);

        // GFT (Paula), período actual: en revisión, sin orden de compra todavía.
        Prefacture gftCurrent = New("Paula Ramírez", "GFT", currentPeriod);
        gftCurrent.RegisterDocument(new PrefactureDocument(
            "FE-2049",
            new DateOnly(today.Year, today.Month, Math.Min(5, DateTime.DaysInMonth(today.Year, today.Month))),
            gftCurrent.MonthlyCost,
            Currency.Cop,
            new Imputation(gftCurrent.SquadName, "Servicios profesionales", "Servicios técnicos", "5135-05",
                "CC-1001", purchaseOrder: null, "Bancolombia 4567")));
        // Trabajarla la pone en revisión: es el estado del seed del mock.
        gftCurrent.SetPrefactured(gftCurrent.MonthlyCost);
        dbContext.Prefactures.Add(gftCurrent);
    }

    /// <summary>
    /// Catálogo inicial de habilidades técnicas y humanas, con criterios en al
    /// menos un nivel de cada una y expectativas sobre los cargos que este
    /// mismo seeder ya sembró en Personas. La versión nace en 1 — sembrar no
    /// pasa por los use cases que la suben, es el estado con el que arranca
    /// el catálogo.
    /// </summary>
    private static Dictionary<string, Skill> SeedSkills(ApplicationDbContext dbContext)
    {
        var sql = new Skill("SQL", SkillGroup.Technical, "Consultas y modelado relacional.");
        sql.ReplaceCriteria(1, ["Escribe select simples con filtros."]);
        sql.ReplaceCriteria(2, ["Escribe joins entre varias tablas.", "Normaliza un modelo básico."]);
        sql.ReplaceCriteria(3, ["Optimiza consultas lentas con índices.", "Diseña un modelo desde cero."]);
        sql.SetExpectation("Backend Dev", 3);
        sql.SetExpectation("Data Engineer", 4);
        sql.SetExpectation("QA Engineer", 2);

        var cloud = new Skill("Azure", SkillGroup.Technical, "Servicios y arquitectura en la nube de Azure.");
        cloud.ReplaceCriteria(1, ["Despliega un recurso siguiendo una guía."]);
        cloud.ReplaceCriteria(2, ["Configura recursos comunes sin acompañamiento."]);
        // Nivel 3 queda sin criterios a propósito: es el caso de habilidad incompleta.
        cloud.SetExpectation("Arquitecto", 4);
        cloud.SetExpectation("DevOps Engineer", 4);
        cloud.SetExpectation("Backend Dev", 2);

        var communication = new Skill("Comunicación", SkillGroup.Human, "Cómo se expresa y se hace entender frente al equipo y el negocio.");
        communication.ReplaceCriteria(1, ["Explica su trabajo con guía."]);
        communication.ReplaceCriteria(2, ["Explica su trabajo sin intermediario.", "Escucha antes de responder."]);
        communication.ReplaceCriteria(3, ["Adapta el mensaje según la audiencia.", "Da malas noticias con claridad."]);
        communication.SetExpectation("Product Owner", 4);
        communication.SetExpectation("Scrum Master", 4);
        communication.SetExpectation("Backend Dev", 2);

        var negocio = new Skill("Conocimiento del negocio", SkillGroup.Human, "Qué tanto entiende el producto y el negocio al que sirve lo que construye.");
        negocio.ReplaceCriteria(1, ["Identifica los productos del negocio y a quién sirven."]);
        negocio.ReplaceCriteria(2, ["Traduce un requerimiento a su efecto en el cliente."]);
        negocio.SetExpectation("Data Engineer", 3);
        negocio.SetExpectation("QA Engineer", 2);
        negocio.SetExpectation("Arquitecto", 4);

        dbContext.Skills.AddRange(sql, cloud, communication, negocio);
        dbContext.SkillCatalogVersions.Add(new SkillCatalogVersion());

        return new Dictionary<string, Skill>(StringComparer.Ordinal)
        {
            ["SQL"] = sql,
            ["Azure"] = cloud,
            ["Comunicación"] = communication,
            ["Conocimiento del negocio"] = negocio,
        };
    }

    /// <summary>
    /// Un par de evaluaciones cerradas del ciclo anterior, con al menos una
    /// brecha real cada una, y una en curso del ciclo vigente con una
    /// habilidad calificada y otra pendiente.
    /// </summary>
    private static void SeedAssessments(
        ApplicationDbContext dbContext,
        Dictionary<string, Guid> idByName,
        Dictionary<string, Skill> skillsByName)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        static string CycleFor(DateOnly date) => $"{date.Year}-S{(date.Month <= 6 ? 1 : 2)}";
        string currentCycle = CycleFor(today);
        string previousCycle = CycleFor(today.AddMonths(-6));
        DateTime previousClosedAtUtc = DateTime.UtcNow.AddMonths(-6);

        Skill sql = skillsByName["SQL"];
        Skill azure = skillsByName["Azure"];
        Skill negocio = skillsByName["Conocimiento del negocio"];

        // Cerrada: María (Backend Dev) queda con una brecha real en SQL.
        var maria = new Assessment(idByName["María González"], previousCycle);
        maria.SaveSkill(
            sql.Id, 2, [[], ["Escribe joins entre varias tablas."], [], []],
            "Le falta profundidad en modelado de datos.", expectedLevel: 3);
        maria.SaveSkill(
            azure.Id, 2, [["Despliega un recurso siguiendo una guía."], ["Configura recursos comunes sin acompañamiento."], [], []],
            "", expectedLevel: 2);
        maria.Close(FreezeFor([sql, azure], "Backend Dev"), 1, previousClosedAtUtc);
        dbContext.Assessments.Add(maria);

        // Cerrada: Laura (QA Engineer), otra brecha real.
        var laura = new Assessment(idByName["Laura Ruiz"], previousCycle);
        laura.SaveSkill(
            sql.Id, 1, [["Escribe select simples con filtros."], [], [], []],
            "Recién empieza con SQL.", expectedLevel: 2);
        laura.SaveSkill(
            negocio.Id, 2, [[], ["Traduce un requerimiento a su efecto en el cliente."], [], []],
            "", expectedLevel: 2);
        laura.Close(FreezeFor([sql, negocio], "QA Engineer"), 1, previousClosedAtUtc);
        dbContext.Assessments.Add(laura);

        // En curso: Carlos (Arquitecto), una calificada y otra sin calificar.
        var carlos = new Assessment(idByName["Carlos López"], currentCycle);
        carlos.SaveSkill(
            azure.Id, 3, [[], [], [], []], "Le falta el último tramo hacia experto.", expectedLevel: 4);
        dbContext.Assessments.Add(carlos);
    }

    private static Dictionary<Guid, (string SkillName, string Group, IReadOnlyList<IReadOnlyList<string>> Levels, int? ExpectedLevel)> FreezeFor(
        IReadOnlyList<Skill> skills, string position)
    {
        var dict = new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>();
        foreach (Skill skill in skills)
        {
            IReadOnlyList<IReadOnlyList<string>> levels =
                [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)];
            int? expected = skill.Expectations
                .FirstOrDefault(e => e.Position == position)?.Level.Value;
            dict[skill.Id] = (skill.Name, skill.Group.Value, levels, expected);
        }

        return dict;
    }

    /// <summary>El n-ésimo día de semana del mes al que pertenece <paramref name="reference"/>.</summary>
    private static DateOnly NthWeekday(DateOnly reference, int nth, DayOfWeek weekday)
    {
        var first = new DateOnly(reference.Year, reference.Month, 1);
        int offset = ((int)weekday - (int)first.DayOfWeek + 7) % 7;
        return first.AddDays(offset + ((nth - 1) * 7));
    }

    private static DateOnly LastBusinessDayOfMonth(DateOnly reference)
    {
        DateOnly cursor = new DateOnly(reference.Year, reference.Month, 1).AddMonths(1).AddDays(-1);
        while (cursor.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            cursor = cursor.AddDays(-1);
        }

        return cursor;
    }

    /// <summary>
    /// Las 7 iniciativas del mock, evaluadas al sembrar con el motor y el
    /// modelo de referencia — no con números escritos a mano: así el backend y
    /// la pantalla muestran la misma talla sobre las mismas respuestas.
    /// </summary>
    private static void SeedInitiatives(ApplicationDbContext dbContext, Dictionary<string, Squad> squadByName)
    {
        EvaluationModelDto model = ReferenceEvaluationModel();

        foreach ((string name, string squadName, string productOwner, int targetMonths,
                  string status, bool[]? triage, int[]? answers, DateTime createdAtUtc) in Initiatives)
        {
            if (!squadByName.TryGetValue(squadName, out Squad? squad))
            {
                continue;
            }

            var initiative = new Initiative(name, squad.Id, productOwner, targetMonths);

            if (triage is not null && answers is not null)
            {
                initiative.SaveEvaluation(EvaluationEngine.Evaluate(
                    model,
                    new EvaluationInput(triage, AnswersFrom(answers), targetMonths),
                    createdAtUtc));
            }

            // Activar exige evaluación guardada, así que el estado va después;
            // cerrar exige estar activa, así que Lakehouse pasa por Active.
            if (status is "Active" or "Closed")
            {
                initiative.ChangeStatus(InitiativeStatus.Active);
            }

            if (status == "Closed")
            {
                initiative.ChangeStatus(InitiativeStatus.Closed);
            }

            dbContext.Initiatives.Add(initiative);
        }
    }

    /// <summary>
    /// El modelo con el que se evalúan las semillas: los parámetros de
    /// referencia de Admin, que es lo que la API sirve mientras nadie los haya
    /// editado. Se arma acá y no con el proveedor porque el seeder corre antes
    /// de que haya una petición. Sólo se usan las piezas que el motor mira
    /// (pesos, dimensiones, bandas y mix); el tipo, la escala y la acción no
    /// entran en ningún cálculo.
    /// </summary>
    private static EvaluationModelDto ReferenceEvaluationModel()
    {
        QuestionPool pool = ModelParameterDefaults.QuestionPool();
        TallaBandSet bands = ModelParameterDefaults.TallaBands();
        CapabilityMix mix = ModelParameterDefaults.CapabilityMix();

        List<PoolQuestion> questions = [.. pool.Questions.OrderBy(q => q.Position)];
        List<TallaBand> orderedBands = [.. bands.Bands.OrderBy(b => b.Position)];
        List<decimal> edges = [TallaBandSet.RangeMin, .. bands.Boundaries, TallaBandSet.RangeMax];

        return new EvaluationModelDto(
            Dimensions: [.. questions.Select(q => q.Dimension.Value).Distinct(StringComparer.Ordinal)],
            Questions:
            [
                .. questions.Select(q => new EvaluationQuestionDto(
                    q.Code, q.Dimension.Value, q.Texto, q.Peso, "Evaluative", [])),
            ],
            Triage: SeedTriage,
            Bands:
            [
                .. orderedBands.Select((band, index) => new TallaBandModelDto(
                    band.Talla,
                    index == 0 ? edges[0] : edges[index] + 1,
                    edges[index + 1],
                    band.PmMin,
                    band.PmMax,
                    band.Lectura,
                    string.Empty)),
            ],
            Mix:
            [
                .. mix.Rows
                    .OrderBy(r => r.Position)
                    .Select(r => new CapabilityMixModelDto(
                        r.Capacidad,
                        r.PorTalla.ToDictionary(pair => pair.Key, pair => pair.Value))),
            ]);
    }

    /// <summary>Las respuestas del seed llegan en el orden del pool.</summary>
    private static Dictionary<string, int> AnswersFrom(int[] values)
    {
        List<PoolQuestion> questions =
            [.. ModelParameterDefaults.QuestionPool().Questions.OrderBy(q => q.Position)];

        var answers = new Dictionary<string, int>(StringComparer.Ordinal);
        for (int i = 0; i < questions.Count && i < values.Length; i++)
        {
            answers[questions[i].Code] = values[i];
        }

        return answers;
    }

    private static string RemoveDiacritics(string text)
    {
        string normalized = text.Normalize(System.Text.NormalizationForm.FormD);
        var builder = new System.Text.StringBuilder(normalized.Length);
        foreach (char c in normalized)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c)
                != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                builder.Append(c);
            }
        }

        return builder.ToString().Normalize(System.Text.NormalizationForm.FormC).Replace("ñ", "n");
    }
}
