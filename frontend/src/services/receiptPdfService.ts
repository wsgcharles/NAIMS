export interface ReceiptData {
  applicationNumber: string;
  fullName: string;
  gradeApplyingFor: string;
  email: string;
  createdAt: string;
  status: string;
  estimatedNextStep?: string;
}

export const receiptPdfService = {
  downloadConfirmationReceipt: (data: ReceiptData) => {
    const formattedDate = new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the confirmation receipt.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admission Confirmation Receipt - ${data.applicationNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e1b4b; padding: 40px; margin: 0; }
          .header { text-align: center; border-bottom: 3px double #6b21a8; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #581c87; letter-spacing: 1px; }
          .sub-logo { font-size: 12px; font-weight: 700; color: #7e22ce; text-transform: uppercase; letter-spacing: 2px; }
          .title { font-size: 18px; font-weight: 800; color: #3b0764; margin-top: 15px; text-transform: uppercase; }
          .ref-box { background: #f3e8ff; border: 2px dashed #9333ea; padding: 15px; border-radius: 12px; text-align: center; margin: 25px 0; }
          .ref-code { font-family: monospace; font-size: 26px; font-weight: 900; color: #581c87; letter-spacing: 2px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .info-table td { padding: 12px 15px; border-bottom: 1px solid #e9d5ff; font-size: 13px; }
          .info-label { font-weight: 700; color: #6b21a8; width: 35%; }
          .info-val { color: #1e1b4b; font-weight: 600; }
          .instructions { background: #faf5ff; border: 1px solid #d8b4fe; padding: 20px; border-radius: 12px; margin-top: 30px; }
          .instructions h4 { margin-top: 0; color: #581c87; }
          .qr-placeholder { border: 2px solid #a855f7; padding: 15px; display: inline-block; border-radius: 8px; font-family: monospace; font-size: 11px; background: #fff; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #6b21a8; border-top: 1px solid #e9d5ff; padding-top: 15px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #7e22ce; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div class="logo">NOAH'S ACADEMY INCORPORATED</div>
          <div class="sub-logo">Arca South Campus • Basic Education & Senior High School</div>
          <div class="title">Official Admission Application Receipt</div>
        </div>

        <div class="ref-box">
          <div style="font-size: 11px; font-weight: bold; color: #7e22ce; text-transform: uppercase;">Application Reference Code</div>
          <div class="ref-code">${data.applicationNumber}</div>
        </div>

        <table class="info-table">
          <tr>
            <td class="info-label">Applicant Name:</td>
            <td class="info-val">${data.fullName}</td>
          </tr>
          <tr>
            <td class="info-label">Grade Level Applied For:</td>
            <td class="info-val">${data.gradeApplyingFor}</td>
          </tr>
          <tr>
            <td class="info-label">Email Address:</td>
            <td class="info-val">${data.email}</td>
          </tr>
          <tr>
            <td class="info-label">Submission Date:</td>
            <td class="info-val">${formattedDate}</td>
          </tr>
          <tr>
            <td class="info-label">Initial Status:</td>
            <td class="info-val"><strong style="color: #7e22ce;">${data.status}</strong></td>
          </tr>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px;">
          <div class="instructions" style="flex: 1; margin-right: 20px;">
            <h4>Next Steps & Tracking Instructions</h4>
            <ol style="font-size: 12px; line-height: 1.6; padding-left: 20px; margin: 0;">
              <li>Keep this reference code for your official school records.</li>
              <li>Track application status anytime at: <strong>portal.noahsacademy.edu.ph/admissions/track</strong></li>
              <li>Wait for Registrar document verification notice sent to <strong>${data.email}</strong>.</li>
            </ol>
          </div>

          <div style="text-align: center;">
            <div class="qr-placeholder">
              <div style="font-size: 10px; font-weight: bold;">VERIFIED RECORD</div>
              <div style="font-size: 8px; color: #6b21a8; margin: 5px 0;">[QR CODE VERIFICATION]</div>
              <div style="font-size: 9px; font-family: monospace;">${data.applicationNumber}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          Noah's Academy Incorporated • Admissions & Registrar Office<br/>
          Arca South, Taguig City • admissions@noahsacademy.edu.ph • (02) 8888-NOAH
        </div>

        <script>
          window.onload = function() {
            // Auto trigger print after render
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },
};
