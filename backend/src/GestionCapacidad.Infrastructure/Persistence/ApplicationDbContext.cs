using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Squad> Squads => Set<Squad>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<BauTask> BauTasks => Set<BauTask>();
    public DbSet<Initiative> Initiatives => Set<Initiative>();
    public DbSet<Allocation> Allocations => Set<Allocation>();
    public DbSet<Absence> Absences => Set<Absence>();
    public DbSet<Prefacture> Prefactures => Set<Prefacture>();

    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Assessment> Assessments => Set<Assessment>();

    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<SprintSnapshot> SprintSnapshots => Set<SprintSnapshot>();

    public DbSet<PlanAction> PlanActions => Set<PlanAction>();

    public DbSet<ExpertiseLine> ExpertiseLines => Set<ExpertiseLine>();

    // Parámetros del modelo: agregados de fila única (a lo sumo una fila cada uno).
    public DbSet<SprintConfiguration> SprintConfigurations => Set<SprintConfiguration>();
    public DbSet<TallaBandSet> TallaBandSets => Set<TallaBandSet>();
    public DbSet<CapabilityMix> CapabilityMixes => Set<CapabilityMix>();
    public DbSet<QuestionPool> QuestionPools => Set<QuestionPool>();
    public DbSet<SkillCatalogVersion> SkillCatalogVersions => Set<SkillCatalogVersion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
