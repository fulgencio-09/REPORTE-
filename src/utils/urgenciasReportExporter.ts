import { Urgencias203Summary } from '../types';

export const triggerPrintUrgenciasReport = () => {
  const previousTitle = document.title;
  document.title = 'INFORME_URGENCIAS_REPORTE_203_HOSPITAL_SANTA_TERESA_ING_FULGENCIO_QUINTERO';
  window.print();
  setTimeout(() => {
    document.title = previousTitle;
  }, 1000);
};

export const downloadHtmlUrgenciasReport = (summary: Urgencias203Summary, customSignatureImg?: string | null) => {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const svgSignature = `
    <svg viewBox="0 0 380 200" style="width: 240px; height: 100px; display: block; margin: 0 auto;" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 38 108 L 345 106" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round" />
      <path d="M 45 125 C 38 128 42 136 52 134 C 62 132 68 120 74 105 C 84 82 105 46 122 36 C 132 30 138 36 134 52 C 126 84 104 150 94 186 C 90 198 94 195 98 184 C 112 146 122 108 136 84 C 146 66 162 62 168 78 C 172 94 158 114 142 116 C 126 118 120 102 130 88 C 142 72 168 76 186 92 C 198 102 212 112 222 98" stroke="#0f172a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 218 100 C 232 80 250 40 268 22 C 278 12 288 16 284 36 C 272 82 242 144 224 178 C 218 188 224 184 230 172 C 244 144 254 108 260 90" stroke="#0f172a" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 172 90 C 182 78 200 82 208 96 C 214 106 208 116 196 118 C 182 120 174 106 182 92" stroke="#0f172a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  const signatureFulgencioHtml = customSignatureImg
    ? `<img src="${customSignatureImg}" style="height: 90px; width: auto; max-width: 260px; object-fit: contain; margin: 0 auto; display: block;" alt="Firma Ing. Fulgencio Quintero Brito" />`
    : svgSignature;

  // Sede Estado Rows
  const sedeEstadoLines = summary.sedeEstadoStats
    .map((item) => {
      const isPreEgreso = item.estado.includes('PRE EGRESO') || item.estado.includes('AUDITORIA PRE');
      const isAprobado = item.estado.includes('APROBADO EGRESO') || item.estado.includes('APROBADO');
      
      let rowStyle = 'border-bottom: 1px dotted #334155; padding: 4px 6px;';
      let textColor = '#f1f5f9';
      let dotColor = '#64748b';
      let badgeBg = '#334155';
      let badgeColor = '#60a5fa';

      if (isPreEgreso) {
        rowStyle += ' background: rgba(234, 88, 12, 0.22); border-left: 3px solid #ea580c;';
        textColor = '#fed7aa';
        dotColor = '#9a3412';
        badgeBg = '#ea580c';
        badgeColor = '#ffffff';
      } else if (isAprobado) {
        rowStyle += ' background: rgba(16, 185, 129, 0.22); border-left: 3px solid #10b981;';
        textColor = '#a7f3d0';
        dotColor = '#065f46';
        badgeBg = '#10b981';
        badgeColor = '#ffffff';
      }

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; font-family: monospace; font-size: 12px; ${rowStyle}">
          <span style="color: ${textColor}; font-weight: bold;">${item.sede} , ${item.estado}</span>
          <span style="color: ${dotColor}; letter-spacing: 2px; flex-grow: 1; text-align: center; user-select: none;">--------------------</span>
          <span style="background-color: ${badgeBg}; color: ${badgeColor}; padding: 2px 8px; border-radius: 4px; font-weight: 900;">${item.cantidad}</span>
        </div>
      `;
    })
    .join('');

  // Pre Egreso Funcionarios
  const preEgresoFuncLines = summary.preEgresoFuncionarios
    .map((item) => {
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; border-bottom: 1px dotted #9a3412; font-family: monospace; font-size: 12px;">
          <span style="color: #ffedd5; font-weight: bold;">${item.funcionarioingreso}</span>
          <span style="color: #ea580c; letter-spacing: 2px; flex-grow: 1; text-align: center; user-select: none;">------------------</span>
          <span style="background-color: #ffedd5; color: #9a3412; padding: 2px 8px; border-radius: 4px; font-weight: 900;">${item.cantidad}</span>
        </div>
      `;
    })
    .join('');

  // Pre Aprobados / Aprobados por Médico de Valoración (funcionariovaloracionmedica --------------------- 5)
  const aprobadoValoracionLines = summary.aprobadoValoracionMedica
    .map((item) => {
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px; border-bottom: 1px dotted #065f46; font-family: monospace; font-size: 12px;">
          <span style="color: #d1fae5; font-weight: bold;">${item.funcionariovaloracionmedica}</span>
          <span style="color: #059669; letter-spacing: 2px; flex-grow: 1; text-align: center; user-select: none;">---------------------</span>
          <span style="background-color: #10b981; color: #022c22; padding: 2px 8px; border-radius: 4px; font-weight: 900;">${item.cantidad}</span>
        </div>
      `;
    })
    .join('');

  // Matriz Sede vs Estado
  const sedeColsHeaders = summary.sedes.map((s) => `<th style="padding: 6px 10px; text-align: right; border-bottom: 1px solid #cbd5e1;">${s}</th>`).join('');
  const matrizRows = summary.estadoStats.map((item, idx) => {
    const cols = summary.sedes.map((s) => `<td style="padding: 6px 10px; text-align: right; font-family: monospace; border-bottom: 1px solid #e2e8f0;">${item.porSede[s] || 0}</td>`).join('');
    const isPre = item.estado.includes('PRE EGRESO') || item.estado.includes('AUDITORIA PRE');
    const isAprobado = item.estado.includes('APROBADO EGRESO') || item.estado.includes('APROBADO');

    let rowStyle = '';
    let badgeHtml = '';
    let totalBg = '#f1f5f9';
    let totalColor = '#0f172a';

    if (isPre) {
      rowStyle = 'background-color: #fff7ed; font-weight: bold;';
      badgeHtml = '<span style="font-size: 10px; background: #ffedd5; color: #9a3412; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">Auditado</span>';
      totalBg = '#ffedd5';
      totalColor = '#9a3412';
    } else if (isAprobado) {
      rowStyle = 'background-color: #ecfdf5; font-weight: bold;';
      badgeHtml = '<span style="font-size: 10px; background: #d1fae5; color: #065f46; padding: 1px 6px; border-radius: 4px; margin-left: 6px;">Aprobado</span>';
      totalBg = '#d1fae5';
      totalColor = '#065f46';
    }

    return `
      <tr style="${rowStyle}">
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #64748b;">${idx + 1}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">
          ${item.estado}
          ${badgeHtml}
        </td>
        <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 900; background: ${totalBg}; color: ${totalColor}; border-bottom: 1px solid #e2e8f0;">${item.total}</td>
        ${cols}
      </tr>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>INFORME_URGENCIAS_REPORTE_203_HOSPITAL_SANTA_TERESA_ING_FULGENCIO_QUINTERO</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .hospital-title {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 4px 0;
    }
    .hospital-subtitle {
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
      margin: 0 0 6px 0;
    }
    .meta-box {
      text-align: right;
      font-size: 12px;
      color: #475569;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .kpi-card {
      padding: 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .kpi-val {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
    }
    .kpi-lbl {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .section-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-top: 32px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .signature-card {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      background: #fafafa;
    }
    .manual-signature-box {
      height: 100px;
      border: 2px dashed #94a3b8;
      border-radius: 8px;
      margin: 10px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 12px;
      font-style: italic;
      background: #ffffff;
    }
    .print-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #2563eb;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      border: none;
      box-shadow: 0 4px 12px rgba(37,99,235,0.4);
      cursor: pointer;
      z-index: 1000;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { box-shadow: none; padding: 10mm; border-radius: 0; max-width: 100%; }
      .print-btn { display: none !important; }
      @page { size: letter; margin: 10mm; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Imprimir / Guardar en PDF</button>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="hospital-title">HOSPITAL SANTA TERESA DE JESÚS DE ÁVILA</h1>
        <div class="hospital-subtitle">DEPARTAMENTO DE SISTEMAS E INFORMACIÓN ASISTENCIAL</div>
        <div style="font-size: 12px; font-weight: bold; color: #0f172a;">INFORME DE URGENCIAS - REPORTE 203</div>
        <div style="font-size: 11px; color: #64748b;">Responsable: Ing. Fulgencio Quintero Brito - Cel: </div>
      </div>
      <div class="meta-box">
        <div><strong>Fecha:</strong> ${currentDate}</div>
        <div><strong>Total Casos:</strong> ${summary.totalRegistros}</div>
        <div><strong>Pre Egreso:</strong> ${summary.totalPreEgreso} | <strong>Aprobado Egreso:</strong> ${summary.totalAprobadoEgreso}</div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-lbl">Total Registros Reporte 203</div>
        <div class="kpi-val" style="color: #2563eb;">${summary.totalRegistros}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">En Auditoría Pre Egreso</div>
        <div class="kpi-val" style="color: #ea580c;">${summary.totalPreEgreso}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Aprobado Egreso</div>
        <div class="kpi-val" style="color: #10b981;">${summary.totalAprobadoEgreso}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Sedes Monitoreadas</div>
        <div class="kpi-val" style="color: #0f172a;">${summary.sedes.length}</div>
      </div>
    </div>

    <!-- Seccion 1: Sede y urgenciasestado -->
    <div class="section-title">
      <span>1. Conteo por Sede y Estado de Urgencia (sede , urgenciasestado -------------------- 20)</span>
      <span style="font-size: 11px; color: #2563eb;">${summary.sedeEstadoStats.length} Combinaciones</span>
    </div>
    <div style="background: #0f172a; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <div style="font-size: 10px; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span>SEDE , URGENCIAS ESTADO</span>
          <span style="background: rgba(234, 88, 12, 0.3); color: #fed7aa; padding: 1px 6px; border-radius: 3px; font-size: 9px;">Pre Egreso</span>
          <span style="background: rgba(16, 185, 129, 0.3); color: #a7f3d0; padding: 1px 6px; border-radius: 3px; font-size: 9px;">Aprobado Egreso</span>
        </div>
        <span>CANTIDAD</span>
      </div>
      ${sedeEstadoLines}
    </div>

    <!-- Seccion 2: Auditoria Pre Egreso por funcionarioingreso -->
    <div class="section-title">
      <span>2. Auditoría PRE EGRESO por Funcionario de Ingreso (funcionarioingreso ------------------ 2)</span>
      <span style="font-size: 11px; color: #ea580c; font-weight: bold;">Total Pre Egreso: ${summary.totalPreEgreso}</span>
    </div>
    <div style="background: #431407; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #9a3412;">
      <div style="font-size: 10px; color: #fdba74; border-bottom: 1px solid #7c2d12; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; font-weight: bold;">
        <span>FUNCIONARIO DE INGRESO (EN AUDITORIA PRE EGRESO)</span>
        <span>CASOS PRE EGRESO</span>
      </div>
      ${preEgresoFuncLines}
      ${summary.preEgresoFuncionarios.length === 0 ? '<div style="color: #fdba74; text-align: center; padding: 8px;">No hay casos en Auditoría Pre Egreso en este corte.</div>' : ''}
    </div>

    <!-- Seccion 3: Pre Aprobados / Aprobados por Médico de Valoración -->
    <div class="section-title">
      <span>3. Pre Aprobados / Aprobados por Médico de Valoración (funcionariovaloracionmedica --------------------- 5)</span>
      <span style="font-size: 11px; color: #10b981; font-weight: bold;">Total Aprobado Egreso: ${summary.totalAprobadoEgreso}</span>
    </div>
    <div style="background: #022c22; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #065f46;">
      <div style="font-size: 10px; color: #6ee7b7; border-bottom: 1px solid #064e3b; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; font-weight: bold;">
        <span>MÉDICO / FUNCIONARIO DE VALORACIÓN (funcionariovaloracionmedica)</span>
        <span>CASOS APROBADO EGRESO</span>
      </div>
      ${aprobadoValoracionLines}
      ${summary.aprobadoValoracionMedica.length === 0 ? '<div style="color: #a7f3d0; text-align: center; padding: 8px;">No hay casos en Aprobado Egreso con médico de valoración en este corte.</div>' : ''}
    </div>

    <!-- Seccion 4: Matriz Estados de Urgencia vs Sede -->
    <div class="section-title">
      <span>4. Matriz Consolidada de Estados de Urgencia por Sede</span>
    </div>
    <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow-x: auto; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px 10px; border-bottom: 1px solid #cbd5e1;">#</th>
            <th style="padding: 8px 10px; border-bottom: 1px solid #cbd5e1;">Estado de Urgencia</th>
            <th style="padding: 8px 10px; border-bottom: 1px solid #cbd5e1; text-align: right; background: #dbeafe; color: #1e40af;">Total</th>
            ${sedeColsHeaders}
          </tr>
        </thead>
        <tbody>
          ${matrizRows}
        </tbody>
      </table>
    </div>

    <!-- Signatures -->
    <div class="signatures-grid">
      <!-- Firma Ing. Fulgencio Quintero Brito -->
      <div class="signature-card">
        <div style="min-height: 100px; display: flex; align-items: center; justify-content: center;">
          ${signatureFulgencioHtml}
        </div>
        <div style="border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 6px;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a;">ING. FULGENCIO QUINTERO BRITO</div>
          <div style="font-size: 11px; font-weight: 700; color: #2563eb;">Ingeniero de Sistemas</div>
          <div style="font-size: 11px; font-weight: 600; color: #334155;">Cel: </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Hospital Santa Teresa de Jesús de Ávila</div>
          <div style="margin-top: 4px; display: inline-block; font-size: 9px; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
            Firma Digital Certificada
          </div>
        </div>
      </div>

      <!-- Firma Marcellis Oñate (Firma Manual) -->
      <div class="signature-card">
        <div class="manual-signature-box">
          Espacio para Firma Manual y Rúbrica
        </div>
        <div style="border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 6px;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a;">MARCELLIS OÑATE</div>
          <div style="font-size: 11px; font-weight: 700; color: #475569;">Coordinación Administrativa</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Hospital Santa Teresa de Jesús de Ávila</div>
          <div style="margin-top: 4px; display: inline-block; font-size: 9px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
            Firma Manual al Imprimir / Radicar
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `INFORME_URGENCIAS_REPORTE_203_HOSPITAL_SANTA_TERESA_ING_FULGENCIO_QUINTERO_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
