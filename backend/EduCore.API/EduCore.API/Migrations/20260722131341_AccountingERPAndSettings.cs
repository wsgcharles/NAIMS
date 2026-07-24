using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EduCore.API.Migrations
{
    /// <inheritdoc />
    public partial class AccountingERPAndSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BillNumber",
                table: "StudentBills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "StudentBills",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "StudentBills",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DiscountRemarks",
                table: "StudentBills",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "StudentBills",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "StudentBills",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "StudentBills",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "SubTotal",
                table: "StudentBills",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "StudentBills",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "SchoolFees",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FeeType",
                table: "SchoolFees",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SchoolFees",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMandatory",
                table: "SchoolFees",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SchoolFees",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Payments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Payments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Payments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Payments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PaymentNumber",
                table: "Payments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ProcessedByUserId",
                table: "Payments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "Payments",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Payments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReceiptNumber",
                table: "OfficialReceipts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "OfficialReceipts",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "OfficialReceipts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsCancelled",
                table: "OfficialReceipts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PayerName",
                table: "OfficialReceipts",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmountPaid",
                table: "OfficialReceipts",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "OfficialReceipts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SchoolSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchoolName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    SchoolLogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CurrentAcademicYearId = table.Column<int>(type: "integer", nullable: true),
                    OfficialReceiptPrefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StudentNumberPrefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    BillNumberPrefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentNumberPrefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchoolSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SchoolSettings_AcademicYears_CurrentAcademicYearId",
                        column: x => x.CurrentAcademicYearId,
                        principalTable: "AcademicYears",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "StudentBillItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentBillId = table.Column<int>(type: "integer", nullable: false),
                    SchoolFeeId = table.Column<int>(type: "integer", nullable: true),
                    FeeName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Notes = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentBillItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentBillItems_SchoolFees_SchoolFeeId",
                        column: x => x.SchoolFeeId,
                        principalTable: "SchoolFees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StudentBillItems_StudentBills_StudentBillId",
                        column: x => x.StudentBillId,
                        principalTable: "StudentBills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "SchoolSettings",
                columns: new[] { "Id", "Address", "BillNumberPrefix", "ContactEmail", "ContactPhone", "CreatedAt", "Currency", "CurrentAcademicYearId", "OfficialReceiptPrefix", "PaymentNumberPrefix", "SchoolLogoUrl", "SchoolName", "StudentNumberPrefix", "UpdatedAt" },
                values: new object[] { 1, "Main Campus, EduCore Plaza", "BILL-", "info@noahsacademy.edu.ph", "+63 (02) 8888-0000", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PHP", null, "OR-", "PAY-", null, "Noah's Academy Integrated Management System", "STU-", null });

            migrationBuilder.CreateIndex(
                name: "IX_StudentBills_BillNumber",
                table: "StudentBills",
                column: "BillNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentBills_CreatedByUserId",
                table: "StudentBills",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments",
                column: "PaymentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ProcessedByUserId",
                table: "Payments",
                column: "ProcessedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SchoolSettings_CurrentAcademicYearId",
                table: "SchoolSettings",
                column: "CurrentAcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentBillItems_SchoolFeeId",
                table: "StudentBillItems",
                column: "SchoolFeeId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentBillItems_StudentBillId",
                table: "StudentBillItems",
                column: "StudentBillId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Users_ProcessedByUserId",
                table: "Payments",
                column: "ProcessedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentBills_Users_CreatedByUserId",
                table: "StudentBills",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Users_ProcessedByUserId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentBills_Users_CreatedByUserId",
                table: "StudentBills");

            migrationBuilder.DropTable(
                name: "SchoolSettings");

            migrationBuilder.DropTable(
                name: "StudentBillItems");

            migrationBuilder.DropIndex(
                name: "IX_StudentBills_BillNumber",
                table: "StudentBills");

            migrationBuilder.DropIndex(
                name: "IX_StudentBills_CreatedByUserId",
                table: "StudentBills");

            migrationBuilder.DropIndex(
                name: "IX_Payments_PaymentNumber",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_ProcessedByUserId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BillNumber",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "DiscountRemarks",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "SubTotal",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "StudentBills");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "SchoolFees");

            migrationBuilder.DropColumn(
                name: "FeeType",
                table: "SchoolFees");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "SchoolFees");

            migrationBuilder.DropColumn(
                name: "IsMandatory",
                table: "SchoolFees");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "SchoolFees");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentNumber",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ProcessedByUserId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "OfficialReceipts");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "OfficialReceipts");

            migrationBuilder.DropColumn(
                name: "IsCancelled",
                table: "OfficialReceipts");

            migrationBuilder.DropColumn(
                name: "PayerName",
                table: "OfficialReceipts");

            migrationBuilder.DropColumn(
                name: "TotalAmountPaid",
                table: "OfficialReceipts");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "OfficialReceipts");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Payments",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ReceiptNumber",
                table: "OfficialReceipts",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
