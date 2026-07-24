using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class CompleteLookupAndAccountingPrep : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SchoolFees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FeeName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AcademicYearId = table.Column<int>(type: "integer", nullable: false),
                    GradeLevelId = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolFees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolFees_AcademicYears_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "AcademicYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SchoolFees_GradeLevels_GradeLevelId",
                        column: x => x.GradeLevelId,
                        principalTable: "GradeLevels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StudentBills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentId = table.Column<int>(type: "integer", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentBills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentBills_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentBillId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ProcessedByEmployeeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Employees_ProcessedByEmployeeId",
                        column: x => x.ProcessedByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_StudentBills_StudentBillId",
                        column: x => x.StudentBillId,
                        principalTable: "StudentBills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OfficialReceipts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PaymentId = table.Column<int>(type: "integer", nullable: false),
                    ReceiptNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssuedByEmployeeId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficialReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_Employees_IssuedByEmployeeId",
                        column: x => x.IssuedByEmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OfficialReceipts_Payments_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "GradeLevels",
                columns: new[] { "Id", "DisplayOrder", "EducationLevel", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, 1, "Elementary", true, "Grade 1" },
                    { 2, 2, "Elementary", true, "Grade 2" },
                    { 3, 3, "Elementary", true, "Grade 3" },
                    { 4, 4, "Elementary", true, "Grade 4" },
                    { 5, 5, "Elementary", true, "Grade 5" },
                    { 6, 6, "Elementary", true, "Grade 6" },
                    { 7, 7, "JuniorHighSchool", true, "Grade 7" },
                    { 8, 8, "JuniorHighSchool", true, "Grade 8" },
                    { 9, 9, "JuniorHighSchool", true, "Grade 9" },
                    { 10, 10, "JuniorHighSchool", true, "Grade 10" },
                    { 11, 11, "SeniorHighSchool", true, "Grade 11" },
                    { 12, 12, "SeniorHighSchool", true, "Grade 12" }
                });

            migrationBuilder.InsertData(
                table: "Programs",
                columns: new[] { "Id", "Code", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "STEM", true, "Science, Technology, Engineering, and Mathematics" },
                    { 2, "ABM", true, "Accountancy, Business, and Management" },
                    { 3, "HUMSS", true, "Humanities and Social Sciences" },
                    { 4, "GAS", true, "General Academic Strand" },
                    { 5, "ICT", true, "Information and Communications Technology" },
                    { 6, "HE", true, "Home Economics" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_IssuedByEmployeeId",
                table: "OfficialReceipts",
                column: "IssuedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_PaymentId",
                table: "OfficialReceipts",
                column: "PaymentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfficialReceipts_ReceiptNumber",
                table: "OfficialReceipts",
                column: "ReceiptNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ProcessedByEmployeeId",
                table: "Payments",
                column: "ProcessedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_StudentBillId",
                table: "Payments",
                column: "StudentBillId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolFees_AcademicYearId",
                table: "SchoolFees",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolFees_GradeLevelId",
                table: "SchoolFees",
                column: "GradeLevelId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentBills_EnrollmentId",
                table: "StudentBills",
                column: "EnrollmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfficialReceipts");

            migrationBuilder.DropTable(
                name: "SchoolFees");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "StudentBills");

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "GradeLevels",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Programs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Programs",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Programs",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Programs",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Programs",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Programs",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
