import { DashboardSummary } from '../types';

export const triggerPrintReport = () => {
  const previousTitle = document.title;
  document.title = 'INFORME_CONSULTAS_HOSPITAL_SANTA_TERESA_DE_JESUS_DE_AVILA_ING_FULGENCIO_QUINTERO';
  window.print();
  setTimeout(() => {
    document.title = previousTitle;
  }, 1000);
};

export const downloadHtmlReport = (summary: DashboardSummary, customSignatureImg?: string | null) => {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const selectedConvs = summary.selectedConvenios || [];

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

  // Medicos finalizadas rows
  const medicosFinalizadasRows = summary.medicoStats
    .map(
      (m, idx) => `
      <tr>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${m.mediconombre}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #047857;">${m.totalFinalizadas}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #64748b;">${m.porcentaje.toFixed(1)}%</td>
      </tr>
    `
    )
    .join('');

  // Medicos en sala lines
  const enSalaLinesHtml = summary.enSalaStats
    .map(
      (s) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dotted #78350f;">
        <span style="font-weight: bold; color: #fef3c7;">${s.mediconombre.toUpperCase()}  -EN SALA</span>
        <span style="color: #92400e; letter-spacing: 3px; flex-grow: 1; text-align: center; user-select: none;">--------------------</span>
        <span style="background-color: #fef08a; color: #713f12; padding: 2px 8px; border-radius: 4px; font-weight: 900; font-family: monospace;">${s.cantidad}</span>
      </div>
    `
    )
    .join('');

  // Cuadros por convenio
  const cuadrosHtml = summary.convenioCuadros
    .map((cuadro) => {
      const isNuevaEps = cuadro.convenionombre.toUpperCase().includes('NUEVA EPS');
      const progLines = cuadro.programas
        .map(
          (p) => `
          <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 11px; padding: 2px 0;">
            <span style="color: #e2e8f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;">${p.pym}</span>
            <span style="color: #64748b;">----------</span>
            <span style="color: #34d399; font-weight: bold;">${p.finalizadas}</span>
          </div>
        `
        )
        .join('');

      return `
        <div style="border: 1px solid ${isNuevaEps ? '#a855f7' : '#cbd5e1'}; border-radius: 8px; overflow: hidden; background: #ffffff; page-break-inside: avoid; margin-bottom: 16px;">
          <div style="padding: 10px 14px; background: ${isNuevaEps ? '#581c87' : '#f8fafc'}; color: ${isNuevaEps ? '#ffffff' : '#0f172a'}; border-bottom: 1px solid #e2e8f0;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; opacity: 0.85;">CONVENIO (VARIABLE: convenionombre)</div>
            <div style="font-size: 13px; font-weight: 800; margin-top: 2px;">${cuadro.convenionombre}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 4px;">
              <span>SOLO FINALIZADAS:</span>
              <strong style="font-family: monospace; font-size: 13px;">${cuadro.totalFinalizadas}</strong>
            </div>
          </div>
          <div style="background: #0f172a; padding: 10px; color: #f8fafc;">
            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px; text-transform: uppercase;">
              <span>VARIABLE: PYM</span>
              <span>FINALIZADAS</span>
            </div>
            ${progLines}
          </div>
        </div>
      `;
    })
    .join('');

  // Matriz headers
  const matrizHeaders = selectedConvs
    .map((c) => `<th style="padding: 8px 10px; text-align: right; border-bottom: 2px solid #cbd5e1; font-size: 11px;">${c}</th>`)
    .join('');

  // Matriz rows
  const matrizRows = summary.programaConvenioStats
    .map((p, idx) => {
      const convCols = selectedConvs
        .map(
          (c) =>
            `<td style="padding: 6px 10px; text-align: right; font-family: monospace; border-bottom: 1px solid #e2e8f0;">${p.porConvenio[c] || 0}</td>`
        )
        .join('');

      return `
        <tr>
          <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-family: monospace;">${idx + 1}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${p.pym}</td>
          <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 900; background: #f3e8ff; color: #581c87;">${p.totalPorConvenios}</td>
          ${convCols}
          <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #64748b;">${p.totalGeneral}</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>INFORME_CONSULTAS_HOSPITAL_SANTA_TERESA_DE_JESUS_DE_AVILA_ING_FULGENCIO_QUINTERO</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      background-color: #f8fafc;
      color: #1e293b;
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
      letter-spacing: -0.5px;
    }
    .hospital-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
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
      font-size: 15px;
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
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      padding: 8px 10px;
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
        <div class="hospital-subtitle">DEPARTAMENTO DE SISTEMAS E INFORMACIÓN ASISTENCIAL - CONSULTA EXTERNA Y PyM</div>
        <div style="font-size: 11px; color: #64748b;">INFORME OFICIAL DE AUDITORÍA MÉDICA, CONSULTAS EN SALA Y CUADROS POR CONVENIO</div>
      </div>
      <div class="meta-box">
        <div><strong>Fecha:</strong> ${currentDate}</div>
        <div><strong>Corte Auditado:</strong> ${summary.totalRegistros} registros</div>
        <div><strong>Convenios en Informe:</strong> ${selectedConvs.length}</div>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-lbl">Finalizadas</div>
        <div class="kpi-val" style="color: #047857;">${summary.totalFinalizadas}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">En Sala de Espera</div>
        <div class="kpi-val" style="color: #b45309;">${summary.totalEnSala}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Programas PyM</div>
        <div class="kpi-val">${summary.totalPymUnicos}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Convenios</div>
        <div class="kpi-val" style="color: #6b21a8;">${selectedConvs.length}</div>
      </div>
    </div>

    <!-- Seccion 1: Finalizadas por Profesional -->
    <div class="section-title">
      <span>1. Consultas Finalizadas por Profesional (estado_consulta = FINALIZADA)</span>
      <span style="font-size: 12px; color: #047857;">Total: ${summary.totalFinalizadas}</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Profesional (mediconombre)</th>
            <th style="text-align: right;">Finalizadas</th>
            <th style="text-align: right;">%</th>
          </tr>
        </thead>
        <tbody>
          ${medicosFinalizadasRows}
        </tbody>
      </table>
    </div>

    <!-- Seccion 2: Profesionales En Sala -->
    <div class="section-title">
      <span>2. Profesionales con Pacientes En Sala (estado_consulta = EN SALA)</span>
      <span style="font-size: 12px; color: #b45309;">Total: ${summary.totalEnSala} en espera activa</span>
    </div>
    <div style="background: #451a03; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-family: monospace; font-size: 12px;">
      ${enSalaLinesHtml}
    </div>

    <!-- Seccion 3: Cuadros por cada Convenio -->
    <div class="section-title">
      <span>3. Cuadro por Cada Convenio (TENER EN CUENTA SOLO LAS FINALIZADAS)</span>
      <span style="font-size: 12px; color: #6b21a8;">${summary.convenioCuadros.length} Cuadros Generados</span>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
      ${cuadrosHtml}
    </div>

    <!-- Seccion 4: Matriz de Programas vs Convenios -->
    <div class="section-title">
      <span>4. Matriz Comparativa: Programas (PyM) vs Convenios (Solo Finalizadas)</span>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Programa PyM</th>
            <th style="text-align: right; background: #f3e8ff; color: #581c87;">Total</th>
            ${matrizHeaders}
            <th style="text-align: right;">Total General</th>
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

    <!-- Footer Note -->
    <div style="margin-top: 32px; padding: 12px; background: #f1f5f9; border-radius: 6px; font-size: 10px; color: #475569; text-align: center;">
      Este documento es reporte oficial emitido por el Departamento de Sistemas del Hospital Santa Teresa de Jesús de Ávila. Generado con corte asistencial auditado.
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `INFORME_CONSULTAS_HOSPITAL_SANTA_TERESA_ING_FULGENCIO_QUINTERO_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
