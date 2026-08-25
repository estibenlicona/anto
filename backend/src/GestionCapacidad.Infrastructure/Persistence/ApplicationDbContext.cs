using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Squad> Squads => Set<Squad>();
    public DbSet<Person> People => Set<Person>();
    public DbSet<BauTask> BauTasks => Set<BauTask>();
    public DbSet<Initiative> Initiatives => Set<Initiative>();
    public DbSet<Allocation> Allocations => Set<Allocation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
