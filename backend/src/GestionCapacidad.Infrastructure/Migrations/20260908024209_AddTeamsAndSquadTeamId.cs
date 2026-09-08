using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionCapacidad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamsAndSquadTeamId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teams_Name",
                table: "Teams",
                column: "Name",
                unique: true);

            // Siembra los 4 equipos existentes antes del backfill de Squads.
            migrationBuilder.Sql(@"
                INSERT INTO ""Teams"" (""Id"", ""Name"", ""Description"", ""CreatedAtUtc"", ""UpdatedAtUtc"")
                VALUES
                    ('a1000000-0000-0000-0000-000000000001', 'Ecosistema Digital', NULL, now(), NULL),
                    ('a1000000-0000-0000-0000-000000000002', 'Riesgo y Fraude', NULL, now(), NULL),
                    ('a1000000-0000-0000-0000-000000000003', 'Pagos', NULL, now(), NULL),
                    ('a1000000-0000-0000-0000-000000000004', 'Datos y Analítica', NULL, now(), NULL);
            ");

            migrationBuilder.AddColumn<Guid>(
                name: "TeamId",
                table: "Squads",
                type: "uuid",
                nullable: true);

            // Backfill por nombre de Tribe, antes de exigir NOT NULL y soltar la columna vieja.
            migrationBuilder.Sql(@"
                UPDATE ""Squads"" AS s
                SET ""TeamId"" = t.""Id""
                FROM ""Teams"" AS t
                WHERE s.""Tribe"" = t.""Name"";
            ");

            migrationBuilder.AlterColumn<Guid>(
                name: "TeamId",
                table: "Squads",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "Tribe",
                table: "Squads");

            migrationBuilder.CreateIndex(
                name: "IX_Squads_TeamId",
                table: "Squads",
                column: "TeamId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tribe",
                table: "Squads",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
                UPDATE ""Squads"" AS s
                SET ""Tribe"" = t.""Name""
                FROM ""Teams"" AS t
                WHERE s.""TeamId"" = t.""Id"";
            ");

            migrationBuilder.DropIndex(
                name: "IX_Squads_TeamId",
                table: "Squads");

            migrationBuilder.DropColumn(
                name: "TeamId",
                table: "Squads");

            migrationBuilder.DropTable(
                name: "Teams");
        }
    }
}
