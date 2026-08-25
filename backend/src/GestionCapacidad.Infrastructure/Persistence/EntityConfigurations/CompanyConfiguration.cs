using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies");
        builder.ToCollection("Companies");

        builder.HasKey(company => company.Id);

        builder.Property(company => company.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(company => company.IdentificationNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(company => company.Email)
            .IsRequired()
            .HasMaxLength(250);

        builder.Property(company => company.IsActive)
            .IsRequired();

        builder.Property(company => company.CreatedAtUtc)
            .IsRequired();

        builder.Property(company => company.UpdatedAtUtc)
            .IsRequired(false);

        builder.HasIndex(company => company.IdentificationNumber)
            .IsUnique();

        builder.HasIndex(company => company.Email);
    }
}
