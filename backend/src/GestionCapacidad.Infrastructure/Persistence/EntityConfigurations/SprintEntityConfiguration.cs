using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

/// <summary>Configuración EF de <see cref="Sprint"/> — nombrada así, no <c>SprintConfiguration</c>, para no colisionar con la entidad de parámetros del Admin del mismo nombre.</summary>
public sealed class SprintEntityConfiguration : IEntityTypeConfiguration<Sprint>
{
    public void Configure(EntityTypeBuilder<Sprint> builder)
    {
        builder.ToTable("Sprints");
        builder.ToCollection("Sprints");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.StartDate).IsRequired();
        builder.Property(s => s.EndDate).IsRequired();
        builder.Property(s => s.Holidays).IsRequired();

        builder.HasIndex(s => s.Name).IsUnique();
    }
}
