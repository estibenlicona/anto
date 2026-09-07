using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class ExpertiseLineConfiguration : IEntityTypeConfiguration<ExpertiseLine>
{
    public void Configure(EntityTypeBuilder<ExpertiseLine> builder)
    {
        builder.ToTable("ExpertiseLines");
        builder.ToCollection("ExpertiseLines");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Code).IsRequired().HasMaxLength(10);
        builder.Property(l => l.Description).IsRequired(false).HasMaxLength(200);
        builder.Property(l => l.LeadId).IsRequired(false);

        // Value Converter: ExpertiseLineStatus ↔ string (catálogo cerrado)
        builder.Property(l => l.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => ExpertiseLineStatus.From(raw));

        builder.HasIndex(l => l.Code).IsUnique();
        builder.HasIndex(l => l.Name);
    }
}
