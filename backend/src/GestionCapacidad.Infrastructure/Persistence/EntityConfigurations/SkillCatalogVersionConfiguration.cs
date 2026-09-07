using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class SkillCatalogVersionConfiguration : IEntityTypeConfiguration<SkillCatalogVersion>
{
    public void Configure(EntityTypeBuilder<SkillCatalogVersion> builder)
    {
        builder.ToTable("SkillCatalogVersions");
        builder.ToCollection("SkillCatalogVersions");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Value).IsRequired();
        builder.Property(v => v.CreatedAtUtc).IsRequired();
        builder.Property(v => v.UpdatedAtUtc).IsRequired(false);
    }
}
