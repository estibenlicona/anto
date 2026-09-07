using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class AbsenceConfiguration : IEntityTypeConfiguration<Absence>
{
    public void Configure(EntityTypeBuilder<Absence> builder)
    {
        builder.ToTable("Absences");
        builder.ToCollection("Absences");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.PersonId).IsRequired();

        // Value Converter: AbsenceType ↔ string (catálogo cerrado)
        builder.Property(a => a.Type)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => AbsenceType.From(raw));

        // Value Converter: AbsenceStatus ↔ string (catálogo cerrado)
        builder.Property(a => a.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => AbsenceStatus.From(raw));

        // Fechas sin hora: una ausencia es de días, no de instantes.
        builder.Property(a => a.StartDate).IsRequired();
        builder.Property(a => a.EndDate).IsRequired();

        builder.Property(a => a.StartsHalfDay).IsRequired();
        builder.Property(a => a.EndsHalfDay).IsRequired();

        builder.Property(a => a.RejectReason)
            .IsRequired(false)
            .HasMaxLength(500);

        builder.Property(a => a.CreatedAtUtc).IsRequired();
        builder.Property(a => a.UpdatedAtUtc).IsRequired(false);

        // Por acá se pregunta el solape al registrar.
        builder.HasIndex(a => a.PersonId);
    }
}
