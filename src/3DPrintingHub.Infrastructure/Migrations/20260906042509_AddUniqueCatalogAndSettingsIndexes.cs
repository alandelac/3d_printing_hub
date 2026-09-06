using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _3DPrintingHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueCatalogAndSettingsIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Settings_parameter",
                table: "Settings",
                column: "parameter",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ModelPrintCategories_Name",
                table: "ModelPrintCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaterialTypes_Name",
                table: "MaterialTypes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Marketplaces_Name",
                table: "Marketplaces",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FilamentColors_Name",
                table: "FilamentColors",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brands_Name",
                table: "Brands",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Settings_parameter",
                table: "Settings");

            migrationBuilder.DropIndex(
                name: "IX_ModelPrintCategories_Name",
                table: "ModelPrintCategories");

            migrationBuilder.DropIndex(
                name: "IX_MaterialTypes_Name",
                table: "MaterialTypes");

            migrationBuilder.DropIndex(
                name: "IX_Marketplaces_Name",
                table: "Marketplaces");

            migrationBuilder.DropIndex(
                name: "IX_FilamentColors_Name",
                table: "FilamentColors");

            migrationBuilder.DropIndex(
                name: "IX_Brands_Name",
                table: "Brands");
        }
    }
}
