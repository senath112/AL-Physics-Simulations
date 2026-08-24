/**
 * Generates an academic print/PDF laboratory report using the browser's native print engine.
 */
export function downloadReportAsPDF(
  simTitle: string,
  parameters: Record<string, string>,
  logs: Record<string, any>[],
  notes: string
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups to print the laboratory report.');
    return;
  }

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const paramsHtml = Object.entries(parameters)
    .map(
      ([key, val]) => `
      <div class="param-badge">
        <span class="param-key">${key}</span>
        <span class="param-val">${val}</span>
      </div>`
    )
    .join('');

  let tableHeader = '';
  let tableBody = '';

  if (logs.length > 0) {
    const keys = Object.keys(logs[0]);
    tableHeader = keys
      .map(k => `<th>${k.toUpperCase().replace('_', ' ')}</th>`)
      .join('');

    tableBody = logs
      .map(
        row => `
      <tr>
        ${keys.map(k => `<td>${typeof row[k] === 'number' ? row[k].toFixed(3) : row[k]}</td>`).join('')}
      </tr>`
      )
      .join('');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Lab Report - ${simTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            background: #ffffff;
          }

          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .header h1 {
            font-size: 24px;
            margin: 0 0 5px 0;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .header .meta {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin: 25px 0 15px 0;
            letter-spacing: 0.5px;
          }

          .params-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
          }

          .param-badge {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }

          .param-key {
            color: #64748b;
            font-weight: 500;
          }

          .param-val {
            color: #0f172a;
            font-weight: 750;
            font-family: monospace;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 25px;
          }

          th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 10px;
            border: 1px solid #cbd5e1;
          }

          td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            color: #334155;
            font-family: monospace;
          }

          tr:nth-child(even) {
            background: #f8fafc;
          }

          .notes-box {
            background: #fff;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            font-size: 13px;
            color: #334155;
            white-space: pre-wrap;
            min-height: 120px;
          }

          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
          }

          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        
        <div class="header">
          <h1>Physics Laboratory Investigation Report</h1>
          <div class="meta">
            <span>PLATFORM: A/L Physics Simulations</span> | 
            <span>SIMULATION: ${simTitle}</span> | 
            <span>DATE: ${dateStr}</span>
          </div>
        </div>

        <div class="section-title">Initial Configuration & Constants</div>
        <div class="params-container">
          ${paramsHtml}
        </div>

        ${logs.length > 0 ? `
          <div class="section-title">Logged Experimental Data Points</div>
          <table>
            <thead>
              <tr>${tableHeader}</tr>
            </thead>
            <tbody>
              ${tableBody}
            </tbody>
          </table>
        ` : ''}

        <div class="section-title">Student Field Notes & Observations</div>
        <div class="notes-box">${notes || 'No notes compiled for this investigation.'}</div>

        <div class="footer">
          Developed by Senath Sethmika • Published at senathsethmika.lk/physics
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>

      </body>
    </html>
  `);
  printWindow.document.close();
}
