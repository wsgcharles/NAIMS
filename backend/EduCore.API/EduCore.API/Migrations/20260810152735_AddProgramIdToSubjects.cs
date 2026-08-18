using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProgramIdToSubjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProgramId",
                table: "Subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_ProgramId",
                table: "Subjects",
                column: "ProgramId");

            migrationBuilder.AddForeignKey(
                name: "FK_Subjects_Programs_ProgramId",
                table: "Subjects",
                column: "ProgramId",
                principalTable: "Programs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subjects_Programs_ProgramId",
                table: "Subjects");

            migrationBuilder.DropIndex(
                name: "IX_Subjects_ProgramId",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "ProgramId",
                table: "Subjects");
        }
    }
}
