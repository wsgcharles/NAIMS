using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentSubmissionAppointmentAndVerificationSlip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasRegistrarVerificationSlip",
                table: "EnrollmentApplications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationSlipGeneratedAt",
                table: "EnrollmentApplications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationSlipNumber",
                table: "EnrollmentApplications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationSlipQrCode",
                table: "EnrollmentApplications",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DocumentSubmissionAppointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EnrollmentApplicationId = table.Column<int>(type: "integer", nullable: false),
                    AppointmentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AppointmentTime = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ScheduledByUserId = table.Column<int>(type: "integer", nullable: true),
                    AssignedRegistrarId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Remarks = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentSubmissionAppointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentSubmissionAppointments_Employees_AssignedRegistrarId",
                        column: x => x.AssignedRegistrarId,
                        principalTable: "Employees",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DocumentSubmissionAppointments_EnrollmentApplications_Enrol~",
                        column: x => x.EnrollmentApplicationId,
                        principalTable: "EnrollmentApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DocumentSubmissionAppointments_Users_ScheduledByUserId",
                        column: x => x.ScheduledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSubmissionAppointments_AssignedRegistrarId",
                table: "DocumentSubmissionAppointments",
                column: "AssignedRegistrarId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSubmissionAppointments_EnrollmentApplicationId",
                table: "DocumentSubmissionAppointments",
                column: "EnrollmentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentSubmissionAppointments_ScheduledByUserId",
                table: "DocumentSubmissionAppointments",
                column: "ScheduledByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentSubmissionAppointments");

            migrationBuilder.DropColumn(
                name: "HasRegistrarVerificationSlip",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "VerificationSlipGeneratedAt",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "VerificationSlipNumber",
                table: "EnrollmentApplications");

            migrationBuilder.DropColumn(
                name: "VerificationSlipQrCode",
                table: "EnrollmentApplications");
        }
    }
}
