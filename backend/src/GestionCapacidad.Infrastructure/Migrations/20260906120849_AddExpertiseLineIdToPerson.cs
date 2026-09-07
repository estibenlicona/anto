using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestionCapacidad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertiseLineIdToPerson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ExpertiseLineId",
                table: "People",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_People_ExpertiseLineId",
                table: "People",
                column: "ExpertiseLineId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_People_ExpertiseLineId",
                table: "People");

            migrationBuilder.DropColumn(
                name: "ExpertiseLineId",
                table: "People");
        }
    }
}
