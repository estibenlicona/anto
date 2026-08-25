using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> builder)
    {
        builder.ToTable("People");
        builder.ToCollection("People");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.DocumentId)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.EntraObjectId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.UserPrincipalName)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(p => p.Position)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Role)
            .IsRequired()
            .HasMaxLength(100);

        // Value Converter: Seniority ↔ int (escala Tuya 1-4)
        builder.Property(p => p.Seniority)
            .IsRequired()
            .HasConversion(
                vo  => vo.Value,
                raw => Seniority.From(raw));

        // Value Converter: Modality ↔ string
        builder.Property(p => p.Modality)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion(
                vo  => vo.Value,
                raw => Modality.From(raw));

        // Value Converter: Fte ↔ float
        builder.Property(p => p.AvailableFte)
            .IsRequired()
            .HasConversion(
                vo  => vo.Value,
                raw => Fte.From(raw));

        builder.Property(p => p.MonthlyCost)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.StartDate)
            .IsRequired();

        builder.Property(p => p.ChapterId)
            .IsRequired(false);

        builder.Property(p => p.ProviderId)
            .IsRequired(false);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        builder.Property(p => p.UpdatedAtUtc)
            .IsRequired(false);

        builder.HasIndex(p => p.DocumentId).IsUnique();
        builder.HasIndex(p => p.UserPrincipalName).IsUnique();
        builder.HasIndex(p => p.ChapterId);
    }
}
