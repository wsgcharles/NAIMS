using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCurriculumMetadataToSubjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurriculumVersion",
                table: "Subjects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "MATATAG-K10");

            migrationBuilder.AddColumn<string>(
                name: "DomainCategory",
                table: "Subjects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Semester",
                table: "Subjects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubjectType",
                table: "Subjects",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Core");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurriculumVersion",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "DomainCategory",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "Semester",
                table: "Subjects");

            migrationBuilder.DropColumn(
                name: "SubjectType",
                table: "Subjects");
        }
    }
}
