using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class BauTaskConfiguration : IEntityTypeConfiguration<BauTask>
{
    public void Configure(EntityTypeBuilder<BauTask> builder)
    {
        builder.ToTable("BauTasks");
        builder.ToCollection("BauTasks");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.SquadId).IsRequired();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.CreatedAtUtc).IsRequired();
        builder.Property(t => t.UpdatedAtUtc).IsRequired(false);

        builder.HasIndex(t => t.SquadId);
        builder.HasIndex(t => new { t.SquadId, t.Name }).IsUnique();
    }
}
