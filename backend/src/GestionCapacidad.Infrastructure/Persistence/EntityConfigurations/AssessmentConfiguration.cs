using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class AssessmentConfiguration : IEntityTypeConfiguration<Assessment>
{
    public void Configure(EntityTypeBuilder<Assessment> builder)
    {
        builder.ToTable("Assessments");
        builder.ToCollection("Assessments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.PersonId).IsRequired();
        builder.Property(a => a.Cycle).IsRequired().HasMaxLength(10);

        // Value Converter: AssessmentStatus ↔ string (catálogo cerrado)
        builder.Property(a => a.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => AssessmentStatus.From(raw));

        builder.Property(a => a.ClosedAtUtc).IsRequired(false);
        builder.Property(a => a.CatalogVersionAtClose).IsRequired(false);

        builder.Property(a => a.CreatedAtUtc).IsRequired();
        builder.Property(a => a.UpdatedAtUtc).IsRequired(false);

        // Por acá se resuelve la en curso / la última cerrada de un ciclo.
        builder.HasIndex(a => new { a.PersonId, a.Cycle });

        builder.OwnsMany(a => a.Skills, skill =>
        {
            skill.ToTable("AssessmentSkillAnswers");
            skill.WithOwner().HasForeignKey("AssessmentId");
            skill.Property<int>("Id").ValueGeneratedOnAdd();
            skill.HasKey("Id");

            skill.Property(s => s.SkillId).IsRequired();
            skill.Property(s => s.Level).IsRequired(false);
            skill.Property(s => s.Note).IsRequired().HasMaxLength(1000);

            skill.Property(s => s.Met)
                .IsRequired()
                .HasMaxLength(4000)
                .HasConversion(
                    value => JsonSerializer.Serialize(value, ModelParameterJson.Options),
                    raw => JsonSerializer.Deserialize<List<List<string>>>(raw, ModelParameterJson.Options) ?? new List<List<string>>())
                .Metadata.SetValueComparer(NestedListComparer());

            skill.Property(s => s.FrozenSkillName).IsRequired(false).HasMaxLength(200);
            skill.Property(s => s.FrozenGroup).IsRequired(false).HasMaxLength(20);
            skill.Property(s => s.FrozenExpectedLevel).IsRequired(false);

            skill.Property(s => s.FrozenLevels)
                .IsRequired(false)
                .HasMaxLength(4000)
                .HasConversion(
                    value => value == null ? null : JsonSerializer.Serialize(value, ModelParameterJson.Options),
                    raw => raw == null ? null : JsonSerializer.Deserialize<List<List<string>>>(raw, ModelParameterJson.Options))
                .Metadata.SetValueComparer(NestedListComparer());
        });

        builder.Navigation(a => a.Skills).UsePropertyAccessMode(PropertyAccessMode.Field);
    }

    /// <summary>
    /// Compara listas de listas por valor: el converter genérico de un solo
    /// nivel no alcanza acá, porque <c>Met</c> y <c>FrozenLevels</c> son
    /// listas de listas de texto.
    /// </summary>
    private static ValueComparer<IReadOnlyList<IReadOnlyList<string>>> NestedListComparer() => new(
        (left, right) => ReferenceEquals(left, right) ||
                          (left != null && right != null && left.Count == right.Count &&
                           left.Zip(right, (a, b) => a.SequenceEqual(b)).All(equal => equal)),
        value => value == null ? 0 : value.Aggregate(0, (hash, inner) => HashCode.Combine(
            hash, inner.Aggregate(0, (h, item) => HashCode.Combine(h, item.GetHashCode())))),
        value => value == null ? null! : value.Select(inner => (IReadOnlyList<string>)inner.ToList()).ToList());
}
