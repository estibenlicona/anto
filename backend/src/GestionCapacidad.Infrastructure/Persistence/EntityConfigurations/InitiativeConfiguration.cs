using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
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

        builder.Property(i => i.Name).IsRequired().HasMaxLength(200);

        builder.Property(i => i.SquadId).IsRequired();

        builder.Property(i => i.ProductOwner).IsRequired().HasMaxLength(100);

        builder.Property(i => i.TargetMonths).IsRequired();

        builder.Property(i => i.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion(vo => vo.Value, raw => InitiativeStatus.From(raw));

        // La evaluación se guarda como un documento JSON en una columna: es un
        // snapshot que se lee y escribe entero, nunca por partes, y nadie
        // consulta por dentro de él. El filtro por talla se aplica en memoria
        // sobre el conjunto; si algún día pesa, la talla se promueve a columna.
        builder.Property(i => i.Evaluation)
            .HasColumnName("Evaluation")
            .HasConversion(
                evaluation => Serialize(evaluation),
                json => Deserialize(json),
                new ValueComparer<InitiativeEvaluation?>(
                    (left, right) => Serialize(left) == Serialize(right),
                    value => value == null ? 0 : Serialize(value).GetHashCode(StringComparison.Ordinal),
                    value => Deserialize(Serialize(value))));

        builder.Property(i => i.CreatedAtUtc).IsRequired();
        builder.Property(i => i.UpdatedAtUtc).IsRequired(false);

        builder.HasIndex(i => i.SquadId);
        builder.HasIndex(i => new { i.SquadId, i.Status });
    }

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.General)
    {
        Converters = { new TriageVerdictJsonConverter() },
    };

    private static string Serialize(InitiativeEvaluation? evaluation) =>
        evaluation is null ? string.Empty : JsonSerializer.Serialize(evaluation, JsonOptions);

    private static InitiativeEvaluation? Deserialize(string json) =>
        string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<InitiativeEvaluation>(json, JsonOptions);

    /// <summary>
    /// El veredicto es un value object cerrado sin constructor público, así
    /// que viaja por su slug — el mismo que el contrato transporta.
    /// </summary>
    private sealed class TriageVerdictJsonConverter : JsonConverter<TriageVerdict>
    {
        public override TriageVerdict Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
            TriageVerdict.From(reader.GetString() ?? string.Empty);

        public override void Write(Utf8JsonWriter writer, TriageVerdict value, JsonSerializerOptions options) =>
            writer.WriteStringValue(value.Value);
    }
}
