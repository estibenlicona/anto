using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.EntityFrameworkCore.Extensions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Infrastructure.Persistence.EntityConfigurations;

public sealed class PrefactureConfiguration : IEntityTypeConfiguration<Prefacture>
{
    public void Configure(EntityTypeBuilder<Prefacture> builder)
    {
        builder.ToTable("Prefactures");
        builder.ToCollection("Prefactures");

        builder.HasKey(p => p.Id);

        // ── Snapshot congelado al generar ────────────────────────────────────
        builder.Property(p => p.PersonId).IsRequired();
        builder.Property(p => p.PersonName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Position).IsRequired().HasMaxLength(100);
        builder.Property(p => p.SquadName).IsRequired(false).HasMaxLength(200);
        builder.Property(p => p.ProviderId).IsRequired();
        builder.Property(p => p.MonthlyCost).IsRequired();
        builder.Property(p => p.Period).IsRequired().HasMaxLength(7);

        // Value Converter: BillingStatus ↔ string (catálogo cerrado)
        builder.Property(p => p.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(vo => vo.Value, raw => BillingStatus.From(raw));

        builder.Property(p => p.Prefactured).IsRequired(false);
        builder.Property(p => p.ApprovalNote).IsRequired(false).HasMaxLength(1000);
        builder.Property(p => p.ApprovedAtUtc).IsRequired(false);

        builder.Property(p => p.CreatedAtUtc).IsRequired();
        builder.Property(p => p.UpdatedAtUtc).IsRequired(false);

        // Una prefactura por persona y período.
        builder.HasIndex(p => new { p.PersonId, p.Period }).IsUnique();

        // ── Ajuste (opcional) ────────────────────────────────────────────────
        builder.OwnsOne(p => p.Adjustment, adjustment =>
        {
            adjustment.Property(a => a.Amount).HasColumnName("AdjustmentAmount").IsRequired();
            adjustment.Property(a => a.Reason)
                .HasColumnName("AdjustmentReason")
                .HasMaxLength(20)
                .HasConversion(vo => vo.Value, raw => AdjustmentReason.From(raw))
                .IsRequired();
            adjustment.Property(a => a.Note).HasColumnName("AdjustmentNote").HasMaxLength(500).IsRequired();
        });

        // ── Documento del proveedor (opcional, con imputación anidada) ───────
        builder.OwnsOne(p => p.Document, document =>
        {
            document.Property(d => d.Number).HasColumnName("DocumentNumber").HasMaxLength(50).IsRequired();
            document.Property(d => d.ReceivedAt).HasColumnName("DocumentReceivedAt").IsRequired();
            document.Property(d => d.Amount).HasColumnName("DocumentAmount").IsRequired();
            document.Property(d => d.Currency)
                .HasColumnName("DocumentCurrency")
                .HasMaxLength(10)
                .HasConversion(vo => vo.Value, raw => Currency.From(raw))
                .IsRequired();

            document.OwnsOne(d => d.Imputation, imputation =>
            {
                imputation.Property(i => i.CostObject).HasColumnName("ImputationCostObject").HasMaxLength(200);
                imputation.Property(i => i.Concept).HasColumnName("ImputationConcept").HasMaxLength(200);
                imputation.Property(i => i.AccountName).HasColumnName("ImputationAccountName").HasMaxLength(200);
                imputation.Property(i => i.AccountNumber).HasColumnName("ImputationAccountNumber").HasMaxLength(50);
                imputation.Property(i => i.CostCenter).HasColumnName("ImputationCostCenter").HasMaxLength(50);
                imputation.Property(i => i.PurchaseOrder).HasColumnName("ImputationPurchaseOrder").HasMaxLength(50);
                imputation.Property(i => i.PaymentAccount).HasColumnName("ImputationPaymentAccount").HasMaxLength(200);
            });
        });

        // ── Objeción (opcional) ──────────────────────────────────────────────
        builder.OwnsOne(p => p.Objection, objection =>
        {
            objection.Property(o => o.Reason).HasColumnName("ObjectionReason").HasMaxLength(1000).IsRequired();
            objection.Property(o => o.ObjectedAtUtc).HasColumnName("ObjectionObjectedAtUtc").IsRequired();
        });

        // ── Descuento congelado al aprobar (opcional) ────────────────────────
        builder.OwnsOne(p => p.FrozenDiscount, discount =>
        {
            discount.Property(d => d.BusinessDays).HasColumnName("FrozenDiscountBusinessDays").IsRequired();
            discount.Property(d => d.Amount).HasColumnName("FrozenDiscountAmount").IsRequired();
        });
    }
}
