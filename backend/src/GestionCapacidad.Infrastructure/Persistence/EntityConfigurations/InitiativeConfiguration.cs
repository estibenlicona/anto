using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class InitiativeConfiguration : IEntityTypeConfiguration<Initiative>
{
    public void Configure(EntityTypeBuilder<Initiative> builder)
    {
        builder.ToTable("Initiatives");
        builder.ToCollection("Initiatives");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.SquadId).IsRequired();

        builder.Property(i => i.Name).IsRequired().HasMaxLength(300);

        builder.Property(i => i.Type)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion(vo => vo.Value, raw => InitiativeType.From(raw));

        builder.Property(i => i.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion(vo => vo.Value, raw => InitiativeStatus.From(raw));

        builder.Property(i => i.DeadlineMonths).IsRequired();
        builder.Property(i => i.BacklogDefined).IsRequired();
        builder.Property(i => i.ArchitectureDefined).IsRequired();
        builder.Property(i => i.EarlyStageCompleted).IsRequired();
        builder.Property(i => i.CreatedAtUtc).IsRequired();
        builder.Property(i => i.UpdatedAtUtc).IsRequired(false);

        builder.HasIndex(i => i.SquadId);
        builder.HasIndex(i => new { i.SquadId, i.Status });
    }
}
