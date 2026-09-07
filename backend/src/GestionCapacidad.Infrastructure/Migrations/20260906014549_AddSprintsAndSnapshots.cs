using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GestionCapacidad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSprintsAndSnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DevOpsUserId",
                table: "People",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Sprints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Holidays = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SprintSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonId = table.Column<Guid>(type: "uuid", nullable: false),
                    SprintId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SealedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CommittedAtStartPoints = table.Column<decimal>(type: "numeric", nullable: false),
                    AddedDuringSprintPoints = table.Column<decimal>(type: "numeric", nullable: false),
                    CompletedPoints = table.Column<decimal>(type: "numeric", nullable: true),
                    CarryOverPoints = table.Column<decimal>(type: "numeric", nullable: true),
                    Wip = table.Column<int>(type: "integer", nullable: true),
                    OtherUnavailableDays = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintSnapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SprintSnapshotActivity",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Commits = table.Column<int>(type: "integer", nullable: false),
                    Releases = table.Column<int>(type: "integer", nullable: false),
                    Features = table.Column<int>(type: "integer", nullable: false),
                    SprintSnapshotId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintSnapshotActivity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintSnapshotActivity_SprintSnapshots_SprintSnapshotId",
                        column: x => x.SprintSnapshotId,
                        principalTable: "SprintSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintSnapshotInitiatives",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EpicId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EpicTitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    InitiativeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InitiativeName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Points = table.Column<decimal>(type: "numeric", nullable: false),
                    SprintSnapshotId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintSnapshotInitiatives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintSnapshotInitiatives_SprintSnapshots_SprintSnapshotId",
                        column: x => x.SprintSnapshotId,
                        principalTable: "SprintSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SprintSnapshotWorkItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WorkItemId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Tag = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    EpicId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EpicTitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    InitiativeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    InitiativeName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Points = table.Column<decimal>(type: "numeric", nullable: false),
                    State = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddedAfterSprintStart = table.Column<bool>(type: "boolean", nullable: false),
                    Board = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SprintSnapshotId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SprintSnapshotWorkItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SprintSnapshotWorkItems_SprintSnapshots_SprintSnapshotId",
                        column: x => x.SprintSnapshotId,
                        principalTable: "SprintSnapshots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sprints_Name",
                table: "Sprints",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SprintSnapshotActivity_SprintSnapshotId",
                table: "SprintSnapshotActivity",
                column: "SprintSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintSnapshotInitiatives_SprintSnapshotId",
                table: "SprintSnapshotInitiatives",
                column: "SprintSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_SprintSnapshots_PersonId_SprintId",
                table: "SprintSnapshots",
                columns: new[] { "PersonId", "SprintId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SprintSnapshotWorkItems_SprintSnapshotId",
                table: "SprintSnapshotWorkItems",
                column: "SprintSnapshotId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sprints");

            migrationBuilder.DropTable(
                name: "SprintSnapshotActivity");

            migrationBuilder.DropTable(
                name: "SprintSnapshotInitiatives");

            migrationBuilder.DropTable(
                name: "SprintSnapshotWorkItems");

            migrationBuilder.DropTable(
                name: "SprintSnapshots");

            migrationBuilder.DropColumn(
                name: "DevOpsUserId",
                table: "People");
        }
    }
}
