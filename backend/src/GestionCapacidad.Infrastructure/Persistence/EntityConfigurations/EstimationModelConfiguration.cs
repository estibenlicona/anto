using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

/// <summary>
/// El modelo de estimación con todo su contenido colgando de la versión.
///
/// Las colecciones son <c>OwnsMany</c> y no entidades sueltas con clave foránea
/// porque ninguna tiene sentido fuera de su versión: nadie consulta una regla de
/// talla sin saber de qué versión es, y una versión a medio guardar no debe
/// poder existir. Las listas y diccionarios que se leen y escriben siempre
/// enteros —pesos, tramos por talla, salidas de un driver— van como JSON en una
/// columna: funcionan igual en Postgres, Mongo e InMemory, y nadie consulta por
/// dentro de ellos.
/// </summary>
public sealed class EstimationModelConfiguration : IEntityTypeConfiguration<EstimationModel>
{
    public void Configure(EntityTypeBuilder<EstimationModel> builder)
    {
        builder.ToTable("EstimationModels");
        builder.ToCollection("EstimationModels");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name).IsRequired().HasMaxLength(120);

        builder.Property(m => m.Phase)
            .IsRequired()
            .HasMaxLength(30)
            .HasConversion(vo => vo.Value, raw => EstimationPhase.From(raw));

        builder.Property(m => m.CreatedAtUtc).IsRequired();
        builder.Property(m => m.UpdatedAtUtc).IsRequired(false);

        builder.OwnsMany(m => m.Versions, ConfigureVersion);
        builder.Navigation(m => m.Versions).UsePropertyAccessMode(PropertyAccessMode.Field);
    }

    private static void ConfigureVersion(OwnedNavigationBuilder<EstimationModel, ModelVersion> version)
    {
        version.ToTable("ModelVersions");
        version.WithOwner().HasForeignKey("EstimationModelId");
        version.HasKey(v => v.Id);

        version.Property(v => v.Number).IsRequired();

        version.Property(v => v.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => ModelVersionStatus.From(raw));

        version.Property(v => v.EffectiveFrom).IsRequired(false);
        version.Property(v => v.EffectiveTo).IsRequired(false);
        version.Property(v => v.ChangeNote).IsRequired(false).HasMaxLength(500);
        version.Property(v => v.CreatedAtUtc).IsRequired();
        version.Property(v => v.UpdatedAtUtc).IsRequired(false);

        version.Property(v => v.TallaBoundaries)
            .IsRequired()
            .HasMaxLength(200)
            .HasConversion(EstimationJson.ListConverter<decimal>(), EstimationJson.ListComparer<decimal>());

        version.OwnsMany(v => v.Dimensions, dimension =>
        {
            dimension.ToTable("ModelDimensions");
            dimension.WithOwner().HasForeignKey("ModelVersionId");
            dimension.Property<int>("Id").ValueGeneratedOnAdd();
            dimension.HasKey("Id");

            dimension.Property(d => d.Code).IsRequired().HasMaxLength(20);
            dimension.Property(d => d.Name).IsRequired().HasMaxLength(100);
            dimension.Property(d => d.Order).IsRequired();
            dimension.Property(d => d.Active).IsRequired();
        });

        version.OwnsMany(v => v.Drivers, driver =>
        {
            driver.ToTable("ModelDrivers");
            driver.WithOwner().HasForeignKey("ModelVersionId");
            driver.Property<int>("Id").ValueGeneratedOnAdd();
            driver.HasKey("Id");

            driver.Property(d => d.Code).IsRequired().HasMaxLength(20);
            driver.Property(d => d.Description).IsRequired().HasMaxLength(200);

            driver.Property(d => d.Outputs)
                .IsRequired()
                .HasMaxLength(200)
                .HasConversion(
                    EstimationJson.ListConverter<EstimationOutput>(),
                    EstimationJson.ListComparer<EstimationOutput>());
        });

        version.OwnsMany(v => v.Questions, ConfigureQuestion);

        version.OwnsMany(v => v.TriageQuestions, triage =>
        {
            triage.ToTable("ModelTriageQuestions");
            triage.WithOwner().HasForeignKey("ModelVersionId");
            triage.Property<int>("Id").ValueGeneratedOnAdd();
            triage.HasKey("Id");

            triage.Property(t => t.Position).IsRequired();
            triage.Property(t => t.Code).IsRequired().HasMaxLength(50);
            triage.Property(t => t.Texto).IsRequired().HasMaxLength(500);
            triage.Property(t => t.Critical).IsRequired();
        });

        version.OwnsMany(v => v.TallaRules, rule =>
        {
            rule.ToTable("ModelTallaRules");
            rule.WithOwner().HasForeignKey("ModelVersionId");
            rule.Property<int>("Id").ValueGeneratedOnAdd();
            rule.HasKey("Id");

            rule.Property(r => r.Position).IsRequired();
            rule.Property(r => r.Talla).IsRequired().HasMaxLength(10);
            rule.Property(r => r.PmMin).IsRequired().HasColumnType("decimal(6,2)");
            rule.Property(r => r.PmExpected).IsRequired().HasColumnType("decimal(6,2)");
            rule.Property(r => r.PmMax).IsRequired().HasColumnType("decimal(6,2)");
            rule.Property(r => r.Lectura).IsRequired().HasMaxLength(200);
            rule.Property(r => r.Action).IsRequired().HasMaxLength(100);
        });

        version.OwnsMany(v => v.RiskBands, band =>
        {
            band.ToTable("ModelRiskBands");
            band.WithOwner().HasForeignKey("ModelVersionId");
            band.Property<int>("Id").ValueGeneratedOnAdd();
            band.HasKey("Id");

            band.Property(b => b.Position).IsRequired();
            band.Property(b => b.Level).IsRequired().HasMaxLength(30);
            band.Property(b => b.MaxPct).IsRequired().HasColumnType("decimal(5,2)");
        });

        version.OwnsMany(v => v.Mix, row =>
        {
            row.ToTable("ModelMixRows");
            row.WithOwner().HasForeignKey("ModelVersionId");
            row.Property<int>("Id").ValueGeneratedOnAdd();
            row.HasKey("Id");

            row.Property(r => r.Position).IsRequired();
            row.Property(r => r.Key).IsRequired().HasMaxLength(50);
            row.Property(r => r.Capacidad).IsRequired().HasMaxLength(100);

            // Los porcentajes se indexan por talla y las tallas las decide el
            // usuario: una columna por talla obligaría a migrar el esquema cada
            // vez que se renombre una.
            row.Property(r => r.PorTalla)
                .IsRequired()
                .HasMaxLength(1000)
                .HasConversion(
                    EstimationJson.DictionaryConverter<string, decimal>(),
                    EstimationJson.DictionaryComparer<string, decimal>());
        });

        version.OwnsMany(v => v.MixModifiers, ConfigureModifier);

        version.OwnsMany(v => v.History, entry =>
        {
            entry.ToTable("ModelChangeEntries");
            entry.WithOwner().HasForeignKey("ModelVersionId");
            entry.Property<int>("Id").ValueGeneratedOnAdd();
            entry.HasKey("Id");

            entry.Property(e => e.OccurredAtUtc).IsRequired();
            entry.Property(e => e.Author).IsRequired().HasMaxLength(120);
            entry.Property(e => e.Section).IsRequired().HasMaxLength(50);
            entry.Property(e => e.Summary).IsRequired().HasMaxLength(500);
        });

        UseFieldAccess(version);
    }

    private static void ConfigureQuestion(OwnedNavigationBuilder<ModelVersion, ModelQuestion> question)
    {
        question.ToTable("ModelQuestions");
        question.WithOwner().HasForeignKey("ModelVersionId");
        question.Property<int>("Id").ValueGeneratedOnAdd();
        question.HasKey("Id");

        question.Property(q => q.Position).IsRequired();
        question.Property(q => q.Code).IsRequired().HasMaxLength(50);
        question.Property(q => q.DimensionCode).IsRequired().HasMaxLength(20);
        question.Property(q => q.Texto).IsRequired().HasMaxLength(500);
        question.Property(q => q.Type).IsRequired().HasConversion<string>().HasMaxLength(20);
        question.Property(q => q.Unit).IsRequired(false).HasMaxLength(30);
        question.Property(q => q.DriverCode).IsRequired().HasMaxLength(20);
        question.Property(q => q.Active).IsRequired();

        // La fila de la matriz pregunta × salida. Va como diccionario y no como
        // cuatro columnas porque una salida **ausente** es "no aporta", y una
        // columna nula obligaría a distinguir tres estados (nulo, cero, valor)
        // en cada lectura.
        question.Property(q => q.Weights)
            .IsRequired()
            .HasMaxLength(400)
            .HasConversion(
                EstimationJson.DictionaryConverter<EstimationOutput, decimal>(),
                EstimationJson.DictionaryComparer<EstimationOutput, decimal>());

        question.OwnsMany(q => q.Options, option =>
        {
            option.ToTable("ModelQuestionOptions");
            option.WithOwner().HasForeignKey("ModelQuestionId");
            option.Property<int>("Id").ValueGeneratedOnAdd();
            option.HasKey("Id");

            option.Property(o => o.Position).IsRequired();
            option.Property(o => o.Label).IsRequired().HasMaxLength(100);
            option.Property(o => o.Score).IsRequired().HasColumnType("decimal(5,4)");
            option.Property(o => o.From).IsRequired(false).HasColumnType("decimal(12,2)");
            option.Property(o => o.To).IsRequired(false).HasColumnType("decimal(12,2)");
        });

        question.Navigation(q => q.Options).UsePropertyAccessMode(PropertyAccessMode.Field);
    }

    private static void ConfigureModifier(OwnedNavigationBuilder<ModelVersion, MixModifier> modifier)
    {
        modifier.ToTable("ModelMixModifiers");
        modifier.WithOwner().HasForeignKey("ModelVersionId");
        modifier.Property<int>("Id").ValueGeneratedOnAdd();
        modifier.HasKey("Id");

        modifier.Property(m => m.Position).IsRequired();
        modifier.Property(m => m.Code).IsRequired().HasMaxLength(50);
        modifier.Property(m => m.DriverCode).IsRequired().HasMaxLength(20);
        modifier.Property(m => m.ConditionOperator).IsRequired().HasConversion<string>().HasMaxLength(10);
        modifier.Property(m => m.Threshold).IsRequired().HasColumnType("decimal(5,4)");

        modifier.Property(m => m.Tallas)
            .IsRequired()
            .HasMaxLength(200)
            .HasConversion(EstimationJson.ListConverter<string>(), EstimationJson.ListComparer<string>());

        modifier.OwnsMany(m => m.Adjustments, adjustment =>
        {
            adjustment.ToTable("ModelMixAdjustments");
            adjustment.WithOwner().HasForeignKey("MixModifierId");
            adjustment.Property<int>("Id").ValueGeneratedOnAdd();
            adjustment.HasKey("Id");

            adjustment.Property(a => a.Position).IsRequired();
            adjustment.Property(a => a.CapabilityKey).IsRequired().HasMaxLength(50);
            adjustment.Property(a => a.Points).IsRequired().HasColumnType("decimal(6,2)");
        });

        modifier.Navigation(m => m.Adjustments).UsePropertyAccessMode(PropertyAccessMode.Field);
    }

    private static void UseFieldAccess(OwnedNavigationBuilder<EstimationModel, ModelVersion> version)
    {
        version.Navigation(v => v.Dimensions).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.Drivers).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.Questions).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.TriageQuestions).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.TallaRules).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.RiskBands).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.Mix).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.MixModifiers).UsePropertyAccessMode(PropertyAccessMode.Field);
        version.Navigation(v => v.History).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

/// <summary>
/// Serialización compartida de las columnas JSON del modelo de estimación. Los
/// comparadores por contenido son lo que hace que EF note un cambio dentro de
/// la colección: sin ellos compara por referencia y un peso editado no llegaría
/// a la base.
/// </summary>
internal static class EstimationJson
{
    internal static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.General);

    internal static ValueConverter<IReadOnlyList<T>, string> ListConverter<T>() => new(
        value => JsonSerializer.Serialize(value, Options),
        raw => JsonSerializer.Deserialize<List<T>>(raw, Options) ?? new List<T>());

    internal static ValueComparer<IReadOnlyList<T>> ListComparer<T>() => new(
        (left, right) => left != null && right != null && left.SequenceEqual(right),
        value => value.Aggregate(0, (hash, item) => HashCode.Combine(hash, item!.GetHashCode())),
        value => value.ToList());

    internal static ValueConverter<IReadOnlyDictionary<TKey, TValue>, string> DictionaryConverter<TKey, TValue>()
        where TKey : notnull => new(
        value => JsonSerializer.Serialize(value, Options),
        raw => JsonSerializer.Deserialize<Dictionary<TKey, TValue>>(raw, Options) ?? new Dictionary<TKey, TValue>());

    internal static ValueComparer<IReadOnlyDictionary<TKey, TValue>> DictionaryComparer<TKey, TValue>()
        where TKey : notnull => new(
        // Sin `out`: un árbol de expresión no admite declararlo, y comparar los
        // pares ordenados dice lo mismo.
        (left, right) => left != null && right != null &&
                         left.Count == right.Count &&
                         left.OrderBy(pair => pair.Key).SequenceEqual(right.OrderBy(pair => pair.Key)),
        value => value.OrderBy(pair => pair.Key)
            .Aggregate(0, (hash, pair) => HashCode.Combine(hash, pair.Key.GetHashCode(), pair.Value!.GetHashCode())),
        value => value.ToDictionary(pair => pair.Key, pair => pair.Value));
}
