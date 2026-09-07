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

        // Value Converter: PersonRole ↔ string (catálogo cerrado)
        builder.Property(p => p.Role)
            .IsRequired()
            .HasMaxLength(30)
            .HasConversion(
                vo  => vo.Value,
                raw => PersonRole.From(raw));

        builder.Property(p => p.TechnicalLeadId)
            .IsRequired(false);

        // Value Converter: Level ↔ int (escala Tuya 1-4)
        builder.Property(p => p.Level)
            .IsRequired()
            .HasConversion(
                vo  => vo.Value,
                raw => Level.From(raw));

        // Value Converter: Seniority ↔ string (Junior | Intermediate | Senior)
        builder.Property(p => p.Seniority)
            .IsRequired()
            .HasMaxLength(20)
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

        builder.Property(p => p.ExpertiseLineId)
            .IsRequired(false);

        builder.Property(p => p.ProviderId)
            .IsRequired(false);

        builder.Property(p => p.DevOpsUserId)
            .IsRequired(false)
            .HasMaxLength(200);

        builder.Property(p => p.DevOpsIdentityLinkedAtUtc)
            .IsRequired(false);

        builder.Property(p => p.CreatedAtUtc)
            .IsRequired();

        builder.Property(p => p.UpdatedAtUtc)
            .IsRequired(false);

        // Stacks: colección poseída — tabla propia con FK, sin identidad
        // fuera de la persona; se reemplaza en bloque.
        builder.OwnsMany(p => p.Stacks, stack =>
        {
            stack.ToTable("PersonStacks");
            stack.WithOwner().HasForeignKey("PersonId");
            stack.Property<int>("Id").ValueGeneratedOnAdd();
            stack.HasKey("Id");

            stack.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            // Value Converter: Level ↔ int (escala Tuya 1-4)
            stack.Property(x => x.Level)
                .IsRequired()
                .HasConversion(
                    vo  => vo.Value,
                    raw => Level.From(raw));

            stack.Property(x => x.IsPrimary)
                .IsRequired();
        });

        builder.Navigation(p => p.Stacks)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(p => p.DocumentId).IsUnique();
        builder.HasIndex(p => p.UserPrincipalName).IsUnique();
        builder.HasIndex(p => p.ChapterId);
        builder.HasIndex(p => p.ExpertiseLineId);
    }
}
