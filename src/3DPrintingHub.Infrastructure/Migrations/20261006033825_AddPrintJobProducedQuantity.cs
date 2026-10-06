using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPrintJobProducedQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProducedQuantity",
                table: "PrintJobs",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_PrintJobs_ProducedQuantity_Positive",
                table: "PrintJobs",
                sql: "ProducedQuantity > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PrintJobs_UsedWeightGrams_Positive",
                table: "PrintJobs",
                sql: "UsedWeightGrams > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_PrintJobs_ProducedQuantity_Positive",
                table: "PrintJobs");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PrintJobs_UsedWeightGrams_Positive",
                table: "PrintJobs");

            migrationBuilder.DropColumn(
                name: "ProducedQuantity",
                table: "PrintJobs");
        }
    }
}
