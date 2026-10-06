using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStockMinimumInventoryQuantity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MinimumInventoryQuantity",
                table: "ProductStocks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 2);

            migrationBuilder.AddCheckConstraint(
                name: "CK_ProductStocks_MinimumInventoryQuantity_NonNegative",
                table: "ProductStocks",
                sql: "MinimumInventoryQuantity >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_ProductStocks_MinimumInventoryQuantity_NonNegative",
                table: "ProductStocks");

            migrationBuilder.DropColumn(
                name: "MinimumInventoryQuantity",
                table: "ProductStocks");
        }
    }
}
