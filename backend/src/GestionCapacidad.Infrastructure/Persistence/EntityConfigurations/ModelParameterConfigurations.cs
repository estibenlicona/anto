using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class SprintConfigurationConfiguration : IEntityTypeConfiguration<SprintConfiguration>
{
    public void Configure(EntityTypeBuilder<SprintConfiguration> builder)
    {
        builder.ToTable("SprintConfigurations");
        builder.ToCollection("SprintConfigurations");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Weeks).IsRequired();
        builder.Property(c => c.SprintsPerQuarter).IsRequired();
        builder.Property(c => c.HoursPerSprint).IsRequired().HasColumnType("decimal(6,2)");
        builder.Property(c => c.SprintCloseTime).IsRequired().HasMaxLength(5);
        builder.Property(c => c.HistoryWindowSprints).IsRequired();
        builder.Property(c => c.MinHistorySprints).IsRequired();
        builder.Property(c => c.CreatedAtUtc).IsRequired();
        builder.Property(c => c.UpdatedAtUtc).IsRequired(false);
    }
}

public sealed class TallaBandSetConfiguration : IEntityTypeConfiguration<TallaBandSet>
{
    public void Configure(EntityTypeBuilder<TallaBandSet> builder)
    {
        builder.ToTable("TallaBandSets");
        builder.ToCollection("TallaBandSets");

        builder.HasKey(s => s.Id);

        // Cuatro números que se leen y escriben siempre juntos, nunca por
        // separado: como JSON en una columna funcionan igual en SQL Server,
        // Mongo e InMemory, y nadie consulta por dentro de ellos.
        builder.Property(s => s.Boundaries)
            .IsRequired()
            .HasMaxLength(200)
            .HasConversion(
                value => JsonSerializer.Serialize(value, ModelParameterJson.Options),
                raw => JsonSerializer.Deserialize<List<decimal>>(raw, ModelParameterJson.Options) ?? new List<decimal>(),
                ModelParameterJson.ListComparer<decimal>());

        builder.Property(s => s.CreatedAtUtc).IsRequired();
        builder.Property(s => s.UpdatedAtUtc).IsRequired(false);

        builder.OwnsMany(s => s.Bands, band =>
        {
            band.ToTable("TallaBands");
            band.WithOwner().HasForeignKey("TallaBandSetId");
            band.Property<int>("Id").ValueGeneratedOnAdd();
            band.HasKey("Id");

            band.Property(b => b.Position).IsRequired();
            band.Property(b => b.Talla).IsRequired().HasMaxLength(10);
            band.Property(b => b.PmMin).IsRequired().HasColumnType("decimal(6,2)");
            band.Property(b => b.PmMax).IsRequired().HasColumnType("decimal(6,2)");
            band.Property(b => b.Lectura).IsRequired().HasMaxLength(200);
        });

        builder.Navigation(s => s.Bands).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class CapabilityMixConfiguration : IEntityTypeConfiguration<CapabilityMix>
{
    public void Configure(EntityTypeBuilder<CapabilityMix> builder)
    {
        builder.ToTable("CapabilityMixes");
        builder.ToCollection("CapabilityMixes");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.CreatedAtUtc).IsRequired();
        builder.Property(m => m.UpdatedAtUtc).IsRequired(false);

        builder.OwnsMany(m => m.Rows, row =>
        {
            row.ToTable("CapabilityMixRows");
            row.WithOwner().HasForeignKey("CapabilityMixId");
            row.Property<int>("Id").ValueGeneratedOnAdd();
            row.HasKey("Id");

            row.Property(r => r.Position).IsRequired();
            row.Property(r => r.Key).IsRequired().HasMaxLength(50);
            row.Property(r => r.Capacidad).IsRequired().HasMaxLength(100);

            // Las cantidades se indexan por talla y las tallas las decide el
            // usuario: una columna por talla obligaría a migrar el esquema
            // cada vez que se renombre una banda.
            row.Property(r => r.PorTalla)
                .IsRequired()
                .HasMaxLength(1000)
                .HasConversion(
                    value => JsonSerializer.Serialize(value, ModelParameterJson.Options),
                    raw => JsonSerializer.Deserialize<Dictionary<string, int>>(raw, ModelParameterJson.Options)
                           ?? new Dictionary<string, int>(),
                    ModelParameterJson.DictionaryComparer());
        });

        builder.Navigation(m => m.Rows).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public sealed class QuestionPoolConfiguration : IEntityTypeConfiguration<QuestionPool>
{
    public void Configure(EntityTypeBuilder<QuestionPool> builder)
    {
        builder.ToTable("QuestionPools");
        builder.ToCollection("QuestionPools");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.CreatedAtUtc).IsRequired();
        builder.Property(p => p.UpdatedAtUtc).IsRequired(false);

        builder.OwnsMany(p => p.Questions, question =>
        {
            question.ToTable("PoolQuestions");
            question.WithOwner().HasForeignKey("QuestionPoolId");
            question.Property<int>("Id").ValueGeneratedOnAdd();
            question.HasKey("Id");

            question.Property(q => q.Position).IsRequired();
            question.Property(q => q.Code).IsRequired().HasMaxLength(50);
            question.Property(q => q.Texto).IsRequired().HasMaxLength(500);
            question.Property(q => q.Peso).IsRequired();

            question.Property(q => q.Dimension)
                .IsRequired()
                .HasMaxLength(50)
                .HasConversion(
                    vo => vo.Value,
                    raw => QuestionDimension.From(raw));
        });

        builder.Navigation(p => p.Questions).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

/// <summary>
/// Serialización compartida de las columnas JSON de los parámetros del
/// modelo. Los comparadores por contenido son lo que hace que EF note un
/// cambio dentro de la colección: sin ellos compara por referencia y una
/// cantidad editada no llegaría a la base.
/// </summary>
internal static class ModelParameterJson
{
    internal static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.General);

    internal static ValueComparer<IReadOnlyList<T>> ListComparer<T>() => new(
        (left, right) => left != null && right != null && left.SequenceEqual(right),
        value => value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item!.GetHashCode())),
        value => value.ToList());

    internal static ValueComparer<IReadOnlyDictionary<string, int>> DictionaryComparer() => new(
        // Sin `out`: un árbol de expresión no admite declararlo, y comparar
        // los pares ordenados dice lo mismo.
        (left, right) => left != null && right != null &&
                         left.Count == right.Count &&
                         left.OrderBy(pair => pair.Key, StringComparer.Ordinal)
                             .SequenceEqual(right.OrderBy(pair => pair.Key, StringComparer.Ordinal)),
        value => value.OrderBy(pair => pair.Key, StringComparer.Ordinal)
            .Aggregate(0, (hash, pair) => HashCode.Combine(hash, pair.Key.GetHashCode(), pair.Value)),
        value => value.ToDictionary(pair => pair.Key, pair => pair.Value));
}
