using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class AllocationConfiguration : IEntityTypeConfiguration<Allocation>
{
    public void Configure(EntityTypeBuilder<Allocation> builder)
    {
        builder.ToTable("Allocations");
        builder.ToCollection("Allocations");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.PersonId).IsRequired();
        builder.Property(a => a.SquadId).IsRequired();
        builder.Property(a => a.InitiativeId).IsRequired(false);

        builder.Property(a => a.DedicationPercentage)
            .IsRequired()
            .HasConversion(vo => vo.Value, raw => Percentage.From(raw));

        builder.Property(a => a.BauPercentage)
            .IsRequired()
            .HasConversion(vo => vo.Value, raw => Percentage.From(raw));

        builder.Property(a => a.TransformationPercentage)
            .IsRequired()
            .HasConversion(vo => vo.Value, raw => Percentage.From(raw));

        builder.Property(a => a.CreatedAtUtc).IsRequired();
        builder.Property(a => a.UpdatedAtUtc).IsRequired(false);

        builder.HasIndex(a => a.SquadId);
        builder.HasIndex(a => a.PersonId);
        builder.HasIndex(a => new { a.PersonId, a.SquadId }).IsUnique();
    }
}
