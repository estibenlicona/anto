using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class SkillConfiguration : IEntityTypeConfiguration<Skill>
{
    public void Configure(EntityTypeBuilder<Skill> builder)
    {
        builder.ToTable("Skills");
        builder.ToCollection("Skills");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);

        // Value Converter: SkillGroup ↔ string (catálogo cerrado)
        builder.Property(s => s.Group)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => SkillGroup.From(raw));

        builder.Property(s => s.Description).IsRequired().HasMaxLength(1000);
        builder.Property(s => s.Active).IsRequired();

        builder.Property(s => s.CreatedAtUtc).IsRequired();
        builder.Property(s => s.UpdatedAtUtc).IsRequired(false);

        builder.HasIndex(s => s.Name);

        builder.OwnsMany(s => s.Levels, level =>
        {
            level.ToTable("SkillLevelCriteria");
            level.WithOwner().HasForeignKey("SkillId");
            level.Property<int>("Id").ValueGeneratedOnAdd();
            level.HasKey("Id");

            level.Property(l => l.Level)
                .IsRequired()
                .HasConversion(vo => vo.Value, raw => Level.From(raw));

            level.Property(l => l.Criteria)
                .IsRequired()
                .HasMaxLength(4000)
                .HasConversion(
                    value => JsonSerializer.Serialize(value, ModelParameterJson.Options),
                    raw => JsonSerializer.Deserialize<List<string>>(raw, ModelParameterJson.Options) ?? new List<string>())
                .Metadata.SetValueComparer(ModelParameterJson.ListComparer<string>());
        });

        builder.Navigation(s => s.Levels).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.OwnsMany(s => s.Expectations, expectation =>
        {
            expectation.ToTable("SkillExpectations");
            expectation.WithOwner().HasForeignKey("SkillId");
            expectation.Property<int>("Id").ValueGeneratedOnAdd();
            expectation.HasKey("Id");

            expectation.Property(e => e.Position).IsRequired().HasMaxLength(100);

            expectation.Property(e => e.Level)
                .IsRequired()
                .HasConversion(vo => vo.Value, raw => Level.From(raw));
        });

        builder.Navigation(s => s.Expectations).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
