using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class SprintSnapshotConfiguration : IEntityTypeConfiguration<SprintSnapshot>
{
    public void Configure(EntityTypeBuilder<SprintSnapshot> builder)
    {
        builder.ToTable("SprintSnapshots");
        builder.ToCollection("SprintSnapshots");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.PersonId).IsRequired();
        builder.Property(s => s.SprintId).IsRequired();

        // Value Converter: SnapshotStatus ↔ string (catálogo cerrado)
        builder.Property(s => s.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => SnapshotStatus.From(raw));

        builder.Property(s => s.SealedAtUtc).IsRequired(false);
        builder.Property(s => s.CommittedAtStartPoints).IsRequired();
        builder.Property(s => s.AddedDuringSprintPoints).IsRequired();
        builder.Property(s => s.CompletedPoints).IsRequired(false);
        builder.Property(s => s.CarryOverPoints).IsRequired(false);
        builder.Property(s => s.Wip).IsRequired(false);
        builder.Property(s => s.OtherUnavailableDays).IsRequired();

        builder.HasIndex(s => new { s.PersonId, s.SprintId }).IsUnique();

        builder.OwnsMany(s => s.Initiatives, initiative =>
        {
            initiative.ToTable("SprintSnapshotInitiatives");
            initiative.WithOwner().HasForeignKey("SprintSnapshotId");
            initiative.Property<int>("Id").ValueGeneratedOnAdd();
            initiative.HasKey("Id");

            initiative.Property(i => i.EpicId).IsRequired().HasMaxLength(100);
            initiative.Property(i => i.EpicTitle).IsRequired().HasMaxLength(500);
            initiative.Property(i => i.InitiativeId).IsRequired(false).HasMaxLength(100);
            initiative.Property(i => i.InitiativeName).IsRequired(false).HasMaxLength(500);
            initiative.Property(i => i.Points).IsRequired();
        });

        builder.Navigation(s => s.Initiatives).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.OwnsMany(s => s.WorkItems, workItem =>
        {
            workItem.ToTable("SprintSnapshotWorkItems");
            workItem.WithOwner().HasForeignKey("SprintSnapshotId");
            workItem.Property<int>("Id").ValueGeneratedOnAdd();
            workItem.HasKey("Id");

            workItem.Property(w => w.WorkItemId).IsRequired().HasMaxLength(100);
            workItem.Property(w => w.Number).IsRequired();
            workItem.Property(w => w.Title).IsRequired().HasMaxLength(500);

            // Value Converter: WorkItemTag ↔ string, nulable (catálogo cerrado)
            workItem.Property(w => w.Tag)
                .IsRequired(false)
                .HasMaxLength(20)
                .HasConversion(vo => vo == null ? null : vo.Value, raw => raw == null ? null : WorkItemTag.From(raw));

            workItem.Property(w => w.EpicId).IsRequired(false).HasMaxLength(100);
            workItem.Property(w => w.EpicTitle).IsRequired(false).HasMaxLength(500);
            workItem.Property(w => w.InitiativeId).IsRequired(false).HasMaxLength(100);
            workItem.Property(w => w.InitiativeName).IsRequired(false).HasMaxLength(500);
            workItem.Property(w => w.Points).IsRequired();
            workItem.Property(w => w.State).IsRequired().HasMaxLength(100);
            workItem.Property(w => w.AddedAfterSprintStart).IsRequired();
            workItem.Property(w => w.Board).IsRequired().HasMaxLength(100);
            workItem.Property(w => w.Url).IsRequired().HasMaxLength(1000);
        });

        builder.Navigation(s => s.WorkItems).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.OwnsMany(s => s.Activity, activity =>
        {
            activity.ToTable("SprintSnapshotActivity");
            activity.WithOwner().HasForeignKey("SprintSnapshotId");
            activity.Property<int>("Id").ValueGeneratedOnAdd();
            activity.HasKey("Id");

            activity.Property(a => a.Date).IsRequired();
            activity.Property(a => a.Commits).IsRequired();
            activity.Property(a => a.Releases).IsRequired();
            activity.Property(a => a.Features).IsRequired();
        });

        builder.Navigation(s => s.Activity).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
