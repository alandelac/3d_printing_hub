using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStockConcurrencyAndIntegrity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductStocks_ModelPrintId",
                table: "ProductStocks");

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "ProductStocks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_ModelPrintId_FilamentId",
                table: "ProductStocks",
                columns: new[] { "ModelPrintId", "FilamentId" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_ProductStocks_QuantityInStock_NonNegative",
                table: "ProductStocks",
                sql: "QuantityInStock >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductStocks_ModelPrintId_FilamentId",
                table: "ProductStocks");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ProductStocks_QuantityInStock_NonNegative",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "ProductStocks");

            migrationBuilder.CreateIndex(
                name: "IX_ProductStocks_ModelPrintId",
                table: "ProductStocks",
                column: "ModelPrintId");
        }
    }
}
