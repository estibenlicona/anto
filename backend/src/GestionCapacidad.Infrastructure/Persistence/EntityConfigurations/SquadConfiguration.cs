using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class SquadConfiguration : IEntityTypeConfiguration<Squad>
{
    public void Configure(EntityTypeBuilder<Squad> builder)
    {
        builder.ToTable("Squads");
        builder.ToCollection("Squads");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        // Value Converter: Criticality (VO) ↔ string (BD)
        builder.Property(s => s.Criticality)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion(
                vo  => vo.Value,
                raw => Criticality.From(raw));

        builder.Property(s => s.Tribe)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Description)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(s => s.DevOpsBoardId)
            .IsRequired(false);

        builder.Property(s => s.CreatedAtUtc)
            .IsRequired();

        builder.Property(s => s.UpdatedAtUtc)
            .IsRequired(false);

        builder.HasIndex(s => s.Name)
            .IsUnique();
    }
}
