using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class PlanActionConfiguration : IEntityTypeConfiguration<PlanAction>
{
    public void Configure(EntityTypeBuilder<PlanAction> builder)
    {
        builder.ToTable("PlanActions");
        builder.ToCollection("PlanActions");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.PersonId).IsRequired();
        builder.Property(a => a.SkillId).IsRequired();
        builder.Property(a => a.FromLevel).IsRequired();
        builder.Property(a => a.TargetLevel).IsRequired();
        builder.Property(a => a.DueMonth).IsRequired().HasMaxLength(7);
        builder.Property(a => a.Title).IsRequired().HasMaxLength(200);

        // Value Converter: PlanActionStatus ↔ string (catálogo cerrado)
        builder.Property(a => a.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => PlanActionStatus.From(raw));

        builder.HasIndex(a => a.PersonId);
    }
}
