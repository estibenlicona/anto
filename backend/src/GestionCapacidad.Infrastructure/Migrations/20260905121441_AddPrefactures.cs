using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionCapacidad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPrefactures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Prefactures",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonId = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SquadName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ProviderId = table.Column<Guid>(type: "uuid", nullable: false),
                    MonthlyCost = table.Column<decimal>(type: "numeric", nullable: false),
                    Period = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AdjustmentAmount = table.Column<int>(type: "integer", nullable: true),
                    AdjustmentReason = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AdjustmentNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DocumentNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DocumentReceivedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    DocumentAmount = table.Column<int>(type: "integer", nullable: true),
                    DocumentCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    ImputationCostObject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ImputationConcept = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ImputationAccountName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ImputationAccountNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ImputationCostCenter = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ImputationPurchaseOrder = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ImputationPaymentAccount = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Prefactured = table.Column<int>(type: "integer", nullable: true),
                    ObjectionReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ObjectionObjectedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FrozenDiscountBusinessDays = table.Column<decimal>(type: "numeric", nullable: true),
                    FrozenDiscountAmount = table.Column<int>(type: "integer", nullable: true),
                    ApprovedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prefactures", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Prefactures_PersonId_Period",
                table: "Prefactures",
                columns: new[] { "PersonId", "Period" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Prefactures");
        }
    }
}
