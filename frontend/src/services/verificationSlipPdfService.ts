import type { VerificationSlipItem } from './admissionService';

export const verificationSlipPdfService = {
  printVerificationSlip: (slip: VerificationSlipItem) => {
    const formattedDate = new Date(slip.verificationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print or download the Registrar Verification Slip.');
      return;
    }

    const docsHtml = slip.verifiedDocuments && slip.verifiedDocuments.length > 0
      ? slip.verifiedDocuments.map(d => `<li style="margin-bottom: 6px; color: #047857; font-weight: bold;">✓ ${d}</li>`).join('')
      : `<li style="color: #047857; font-weight: bold;">✓ All Required Admission Documents Verified</li>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Registrar Verification Slip - ${slip.applicationNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e1b4b; padding: 20px; margin: 0; background: #fff; }
          .container { border: 4px double #581c87; padding: 30px; border-radius: 16px; background: #faf5ff; position: relative; }
          .header { text-align: center; border-bottom: 2px solid #7e22ce; padding-bottom: 15px; margin-bottom: 25px; }
          .institution-name { font-size: 24px; font-weight: 900; color: #4c1d95; text-transform: uppercase; letter-spacing: 1.5px; }
          .system-name { font-size: 11px; font-weight: 800; color: #7e22ce; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px; }
          .document-title { font-size: 18px; font-weight: 900; color: #b45309; text-transform: uppercase; margin-top: 15px; background: #fef3c7; display: inline-block; padding: 6px 20px; border-radius: 20px; border: 1px solid #f59e0b; }
          
          .slip-badge { position: absolute; top: 30px; right: 30px; text-align: right; }
          .slip-number { font-family: monospace; font-size: 13px; font-weight: 900; color: #6b21a8; background: #e9d5ff; padding: 4px 10px; border-radius: 6px; }

          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 10px 14px; border-bottom: 1px dashed #d8b4fe; font-size: 13px; }
          .info-label { font-weight: 800; color: #581c87; width: 35%; text-transform: uppercase; font-size: 11px; }
          .info-val { font-weight: 700; color: #0f172a; }

          .checklist-box { background: #ffffff; border: 1.5px solid #a855f7; padding: 18px; border-radius: 12px; margin: 20px 0; }
          .checklist-title { font-size: 12px; font-weight: 900; color: #6b21a8; text-transform: uppercase; margin-bottom: 10px; }
          .checklist-list { list-style: none; padding-left: 0; margin: 0; font-size: 13px; }

          .clearance-banner { background: #dcfce7; border: 2px solid #16a34a; color: #14532d; padding: 14px; border-radius: 12px; text-align: center; font-weight: 800; font-size: 13px; margin: 25px 0; }

          .footer-sign { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; pt-2; }
          .qr-placeholder { border: 2px solid #7e22ce; padding: 10px; border-radius: 10px; background: #fff; text-align: center; width: 110px; font-size: 9px; font-family: monospace; font-weight: bold; color: #6b21a8; }
          .seal-placeholder { width: 90px; height: 90px; border: 3px dashed #d97706; border-radius: 50%; display: flex; items-center; justify-content: center; text-align: center; font-size: 9px; font-weight: 900; color: #b45309; text-transform: uppercase; background: #fffbeb; line-height: 1.2; margin: 0 auto; }
          .signature-box { text-align: center; width: 220px; }
          .signature-line { border-bottom: 2px solid #4c1d95; margin-bottom: 6px; }
          .sign-name { font-weight: 900; font-size: 13px; color: #3b0764; }
          .sign-title { font-size: 11px; color: #6b21a8; font-weight: 700; text-transform: uppercase; }

          @media print {
            body { padding: 0; background: #fff; }
            .container { border: 2px solid #581c87; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="slip-badge">
            <div class="slip-number">${slip.verificationSlipNumber}</div>
            <div style="font-size: 10px; color: #6b21a8; font-weight: bold; margin-top: 4px;">Issued: ${formattedDate}</div>
          </div>

          <div class="header">
            <div class="institution-name">Noah's Academy Incorporated</div>
            <div class="system-name">Noah's Academy Student Information System (NAISIS)</div>
            <div><span class="document-title">Official Registrar Verification Slip</span></div>
          </div>

          <table class="info-table">
            <tr>
              <td class="info-label">Application Reference #</td>
              <td class="info-val" style="font-family: monospace; font-size: 15px; color: #6b21a8;">${slip.applicationNumber}</td>
            </tr>
            <tr>
              <td class="info-label">Applicant Full Name</td>
              <td class="info-val">${slip.applicantName}</td>
            </tr>
            <tr>
              <td class="info-label">Grade / Program Level</td>
              <td class="info-val">${slip.gradeLevel}</td>
            </tr>
            <tr>
              <td class="info-label">Academic School Year</td>
              <td class="info-val">${slip.schoolYear}</td>
            </tr>
            <tr>
              <td class="info-label">Verification Date</td>
              <td class="info-val">${formattedDate}</td>
            </tr>
          </table>

          <div class="checklist-box">
            <div class="checklist-title">Verified Original Physical Documents</div>
            <ul class="checklist-list">
              ${docsHtml}
            </ul>
          </div>

          <div class="clearance-banner">
            ✓ ORIGINAL DOCUMENT VERIFICATION COMPLETE — ELIGIBLE FOR ACCOUNTING ASSESSMENT
          </div>

          <div class="footer-sign">
            <div class="qr-placeholder">
              <div style="font-size: 18px; margin-bottom: 4px;">📱 Check QR</div>
              ${slip.verificationSlipNumber}
            </div>

            <div class="seal-placeholder">
              NOAH'S ACADEMY<br/>OFFICIAL<br/>SEAL
            </div>

            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="sign-name">${slip.verifiedByRegistrarName || 'Office of the Registrar'}</div>
              <div class="sign-title">Authorized Registrar Officer</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },
};
