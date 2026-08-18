using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class UnifiedEnrollmentAndDocumentSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "StudentId",
                table: "Enrollments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "SectionId",
                table: "Enrollments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "AcademicYearId",
                table: "Enrollments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EnrollmentApplicationId",
                table: "Enrollments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GradeLevelId",
                table: "Enrollments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantRemarks",
                table: "EnrollmentApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalNotes",
                table: "EnrollmentApplications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StudentId",
                table: "EnrollmentApplications",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EnrollmentEndDate",
                table: "AcademicYears",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EnrollmentStartDate",
                table: "AcademicYears",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsEnrollmentOpen",
                table: "AcademicYears",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "AdmissionDocumentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    ApplicableEducationLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdmissionDocumentTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationStatusHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentApplicationId = table.Column<int>(type: "integer", nullable: false),
                    FromStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ToStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ChangedByUserId = table.Column<int>(type: "integer", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_EnrollmentApplications_Enrollmen~",
                        column: x => x.EnrollmentApplicationId,
                        principalTable: "EnrollmentApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_Users_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EnrollmentApplicationDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentApplicationId = table.Column<int>(type: "integer", nullable: false),
                    AdmissionDocumentTypeId = table.Column<int>(type: "integer", nullable: true),
                    DocumentName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedByEmployeeId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnrollmentApplicationDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnrollmentApplicationDocuments_AdmissionDocumentTypes_Admis~",
                        column: x => x.AdmissionDocumentTypeId,
                        principalTable: "AdmissionDocumentTypes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EnrollmentApplicationDocuments_Employees_VerifiedByEmployee~",
                        column: x => x.VerifiedByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EnrollmentApplicationDocuments_EnrollmentApplications_Enrol~",
                        column: x => x.EnrollmentApplicationId,
                        principalTable: "EnrollmentApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "AdmissionDocumentTypes",
                columns: new[] { "Id", "ApplicableEducationLevel", "DisplayOrder", "IsActive", "IsRequired", "Name" },
                values: new object[,]
                {
                    { 1, "All", 1, true, true, "PSA Authenticated Birth Certificate" },
                    { 2, "All", 2, true, true, "Official Report Card (Form 138 / SF9)" },
                    { 3, "All", 3, true, true, "Transcript of Records (Form 137 / SF10)" },
                    { 4, "All", 4, true, true, "Certificate of Good Moral Character" },
                    { 5, "All", 5, true, true, "Recent 2×2 ID Pictures (4 Copies, White BG)" },
                    { 6, "SeniorHighSchool", 6, true, true, "JHS Certificate of Completion" },
                    { 7, "SeniorHighSchool", 7, true, false, "ESC / QVR Voucher Certificate (if applicable)" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_AcademicYearId",
                table: "Enrollments",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_EnrollmentApplicationId",
                table: "Enrollments",
                column: "EnrollmentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_GradeLevelId",
                table: "Enrollments",
                column: "GradeLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplications_StudentId",
                table: "EnrollmentApplications",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_ChangedByUserId",
                table: "ApplicationStatusHistories",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_EnrollmentApplicationId",
                table: "ApplicationStatusHistories",
                column: "EnrollmentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplicationDocuments_AdmissionDocumentTypeId",
                table: "EnrollmentApplicationDocuments",
                column: "AdmissionDocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplicationDocuments_EnrollmentApplicationId",
                table: "EnrollmentApplicationDocuments",
                column: "EnrollmentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_EnrollmentApplicationDocuments_VerifiedByEmployeeId",
                table: "EnrollmentApplicationDocuments",
                column: "VerifiedByEmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_EnrollmentApplications_Students_StudentId",
                table: "EnrollmentApplications",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_AcademicYears_AcademicYearId",
                table: "Enrollments",
                column: "AcademicYearId",
                principalTable: "AcademicYears",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_EnrollmentApplications_EnrollmentApplicationId",
                table: "Enrollments",
                column: "EnrollmentApplicationId",
                principalTable: "EnrollmentApplications",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Enrollments_GradeLevels_GradeLevelId",
                table: "Enrollments",
                column: "GradeLevelId",
                principalTable: "GradeLevels",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EnrollmentApplications_Students_StudentId",
                table: "EnrollmentApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_AcademicYears_AcademicYearId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_EnrollmentApplications_EnrollmentApplicationId",
                table: "Enrollments");

            migrationBuilder.DropForeignKey(
                name: "FK_Enrollments_GradeLevels_GradeLevelId",
                table: "Enrollments");

            migrationBuilder.DropTable(
                name: "ApplicationStatusHistories");

            migrationBuilder.DropTable(
                name: "EnrollmentApplicationDocuments");

            migrationBuilder.DropTable(
                name: "AdmissionDocumentTypes");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_AcademicYearId",
                table: "Enrollments");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_EnrollmentApplicationId",
                table: "Enrollments");

            migrationBuilder.DropIndex(
                name: "IX_Enrollments_GradeLevelId",
                table: "Enrollments");

            migrationBuilder.DropIndex(
                name: "IX_EnrollmentApplications_StudentId",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "AcademicYearId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "EnrollmentApplicationId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "GradeLevelId",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "ApplicantRemarks",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "InternalNotes",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "StudentId",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "EnrollmentEndDate",
                table: "AcademicYears");

            migrationBuilder.DropColumn(
                name: "EnrollmentStartDate",
                table: "AcademicYears");

            migrationBuilder.DropColumn(
                name: "IsEnrollmentOpen",
                table: "AcademicYears");

            migrationBuilder.AlterColumn<int>(
                name: "StudentId",
                table: "Enrollments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "SectionId",
                table: "Enrollments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
