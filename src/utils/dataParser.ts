import * as XLSX from 'xlsx';
import {
  NormalizedConsultation,
  RawRecord,
  ColumnMapping,
  DashboardSummary,
  PymStat,
  MedicoStat,
  EnSalaStat,
  ConvenioStat,
  ProgramaConvenioStat,
  ConvenioCuadroStat,
  ConvenioCuadroItem
} from '../types';
import { DEFAULT_PREDETERMINADOS_CONVENIOS } from '../data/sampleData';

export const normalizeString = (str: any): string => {
  if (str === null || str === undefined) return '';
  return String(str).trim();
};

export const normalizeEstado = (estado: string): string => {
  const clean = normalizeString(estado).toUpperCase();
  if (clean.includes('FINALIZ')) return 'FINALIZADA';
  if (clean.includes('SALA') || clean.includes('ESPERA')) return 'EN SALA';
  if (clean.includes('CANCEL')) return 'CANCELADA';
  if (clean.includes('INASIST') || clean.includes('NO ASIST')) return 'INASISTENCIA';
  if (clean.includes('ATENDI') || clean.includes('CUMPLID')) return 'FINALIZADA';
  return clean || 'SIN ESTADO';
};

export const detectColumns = (headers: string[]): ColumnMapping => {
  const mapping: ColumnMapping = {
    pym: '',
    mediconombre: '',
    estado_consulta: '',
    convenionombre: '',
    paciente: '',
    documento: '',
    fecha: '',
    hora: ''
  };

  for (const header of headers) {
    const h = header.toLowerCase().replace(/[\s_-]+/g, '');

    // Detect PyM
    if (!mapping.pym) {
      if (
        h === 'pym' ||
        h.includes('pym') ||
        h.includes('programa') ||
        h.includes('promocion') ||
        h.includes('mantenimiento') ||
        h.includes('servicio') ||
        h.includes('procedimiento')
      ) {
        mapping.pym = header;
      }
    }

    // Detect Médico / Profesional
    if (!mapping.mediconombre) {
      if (
        h === 'mediconombre' ||
        h.includes('mediconombre') ||
        h.includes('medico') ||
        h.includes('profesional') ||
        h.includes('doctor') ||
        h.includes('especialista')
      ) {
        mapping.mediconombre = header;
      }
    }

    // Detect Estado
    if (!mapping.estado_consulta) {
      if (
        h === 'estadoconsulta' ||
        h.includes('estadoconsulta') ||
        h === 'estado' ||
        h.includes('estado') ||
        h.includes('status') ||
        h.includes('situacion')
      ) {
        mapping.estado_consulta = header;
      }
    }

    // Detect Convenio / Aseguradora
    if (!mapping.convenionombre) {
      if (
        h === 'convenionombre' ||
        h.includes('convenionombre') ||
        h.includes('convenio') ||
        h.includes('eps') ||
        h.includes('aseguradora') ||
        h.includes('entidad') ||
        h.includes('contrato') ||
        h.includes('empresa') ||
        h.includes('regimen')
      ) {
        mapping.convenionombre = header;
      }
    }

    // Detect Paciente
    if (!mapping.paciente) {
      if (
        h.includes('paciente') ||
        h.includes('usuario') ||
        h.includes('afiliado') ||
        h.includes('nombrepaciente')
      ) {
        mapping.paciente = header;
      }
    }

    // Detect Documento
    if (!mapping.documento) {
      if (
        h.includes('documento') ||
        h.includes('identificacion') ||
        h.includes('cedula') ||
        h.includes('dni')
      ) {
        mapping.documento = header;
      }
    }

    // Detect Fecha
    if (!mapping.fecha) {
      if (h.includes('fecha') || h.includes('date')) {
        mapping.fecha = header;
      }
    }

    // Detect Hora
    if (!mapping.hora) {
      if (h.includes('hora') || h.includes('time')) {
        mapping.hora = header;
      }
    }
  }

  // Fallbacks if not detected by keywords
  if (!mapping.pym && headers.length > 0) mapping.pym = headers[0];
  if (!mapping.mediconombre && headers.length > 1) mapping.mediconombre = headers[1];
  if (!mapping.estado_consulta && headers.length > 2) mapping.estado_consulta = headers[2];

  return mapping;
};

export const parseFileToRecords = async (file: File): Promise<{
  headers: string[];
  rawRecords: RawRecord[];
  mapping: ColumnMapping;
  normalizedData: NormalizedConsultation[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: RawRecord[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('El archivo está vacío o no contiene registros válidos.');
        }

        const headers = Object.keys(rawJson[0]);
        const mapping = detectColumns(headers);
        const normalizedData = mapRawToNormalized(rawJson, mapping);

        resolve({
          headers,
          rawRecords: rawJson,
          mapping,
          normalizedData
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Error al procesar el archivo.'));
      }
    };

    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsArrayBuffer(file);
  });
};

export const mapRawToNormalized = (
  rawRecords: RawRecord[],
  mapping: ColumnMapping
): NormalizedConsultation[] => {
  return rawRecords.map((item, index) => {
    const rawPym = mapping.pym ? item[mapping.pym] : '';
    const rawMedico = mapping.mediconombre ? item[mapping.mediconombre] : '';
    const rawEstado = mapping.estado_consulta ? item[mapping.estado_consulta] : '';
    const rawConvenio = mapping.convenionombre
      ? item[mapping.convenionombre]
      : (item.convenionombre || item.convenio || item.eps || item.aseguradora || '');
    const rawPaciente = mapping.paciente ? item[mapping.paciente] : '';
    const rawDoc = mapping.documento ? item[mapping.documento] : '';
    const rawFecha = mapping.fecha ? item[mapping.fecha] : '';
    const rawHora = mapping.hora ? item[mapping.hora] : '';

    return {
      id: item.id ? String(item.id) : `REG-${String(index + 1).padStart(4, '0')}`,
      pym: normalizeString(rawPym) || 'Sin Especificar',
      mediconombre: normalizeString(rawMedico) || 'Médico No Asignado',
      estado_consulta: normalizeEstado(rawEstado),
      convenionombre: normalizeString(rawConvenio) || 'Sin Convenio',
      paciente: normalizeString(rawPaciente) || undefined,
      documento: normalizeString(rawDoc) || undefined,
      fecha: normalizeString(rawFecha) || undefined,
      hora: normalizeString(rawHora) || undefined,
      consultorio: item.consultorio ? normalizeString(item.consultorio) : undefined
    };
  });
};

export const computeDashboardSummary = (
  consultations: NormalizedConsultation[],
  preferredConvenios?: string[]
): DashboardSummary => {
  const totalRegistros = consultations.length;

  // Filtrado estricto por requerimiento:
  // 1. "solo tener en cuenta las consulta en estado FINALIZADA - variable (estado_consulta)" para PyM y Médico
  const finalizadas = consultations.filter((c) => c.estado_consulta === 'FINALIZADA');
  // 2. "consulta en estado EN SALA , mediconombre, cantidad"
  const enSala = consultations.filter((c) => c.estado_consulta === 'EN SALA');
  const totalOtras = totalRegistros - finalizadas.length - enSala.length;

  // Agrupación PyM (SOLO FINALIZADAS)
  const pymMap = new Map<string, number>();
  for (const c of finalizadas) {
    const key = c.pym || 'Sin PyM';
    pymMap.set(key, (pymMap.get(key) || 0) + 1);
  }

  const pymStats: PymStat[] = Array.from(pymMap.entries())
    .map(([pym, count]) => ({
      pym,
      totalFinalizadas: count,
      porcentaje: finalizadas.length > 0 ? (count / finalizadas.length) * 100 : 0
    }))
    .sort((a, b) => b.totalFinalizadas - a.totalFinalizadas);

  // Agrupación por Médico (FINALIZADAS) + datos adicionales de sala
  const medicoFinalizadasMap = new Map<string, { count: number; pyms: Set<string> }>();
  for (const c of finalizadas) {
    const medico = c.mediconombre || 'Sin Médico';
    if (!medicoFinalizadasMap.has(medico)) {
      medicoFinalizadasMap.set(medico, { count: 0, pyms: new Set() });
    }
    const entry = medicoFinalizadasMap.get(medico)!;
    entry.count += 1;
    if (c.pym) entry.pyms.add(c.pym);
  }

  // Agrupación EN SALA por Médico (Requerimiento explícito: "consulta en estado EN SALA , mediconombre, cantidad")
  const enSalaMap = new Map<string, NormalizedConsultation[]>();
  for (const c of enSala) {
    const medico = c.mediconombre || 'Médico No Asignado';
    if (!enSalaMap.has(medico)) {
      enSalaMap.set(medico, []);
    }
    enSalaMap.get(medico)!.push(c);
  }

  const enSalaStats: EnSalaStat[] = Array.from(enSalaMap.entries())
    .map(([mediconombre, list]) => ({
      mediconombre,
      cantidad: list.length,
      consultas: list
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Stats consolidados por Médico
  const allMedicos = new Set([
    ...Array.from(medicoFinalizadasMap.keys()),
    ...Array.from(enSalaMap.keys())
  ]);

  const medicoStats: MedicoStat[] = Array.from(allMedicos)
    .map((medico) => {
      const fin = medicoFinalizadasMap.get(medico);
      const sala = enSalaMap.get(medico);
      const totalFin = fin ? fin.count : 0;
      return {
        mediconombre: medico,
        totalFinalizadas: totalFin,
        porcentaje: finalizadas.length > 0 ? (totalFin / finalizadas.length) * 100 : 0,
        enSala: sala ? sala.length : 0,
        programasAtendidos: fin ? fin.pyms.size : 0
      };
    })
    .sort((a, b) => b.totalFinalizadas - a.totalFinalizadas);

  // Agrupación y gestión de variable: CONVENIONOMBRE
  const convMap = new Map<string, { total: number; fin: number; sala: number }>();
  consultations.forEach((c) => {
    const conv = c.convenionombre || 'Sin Convenio';
    if (!convMap.has(conv)) {
      convMap.set(conv, { total: 0, fin: 0, sala: 0 });
    }
    const st = convMap.get(conv)!;
    st.total += 1;
    if (c.estado_consulta === 'FINALIZADA') st.fin += 1;
    if (c.estado_consulta === 'EN SALA') st.sala += 1;
  });

  const convenioStats: ConvenioStat[] = Array.from(convMap.entries())
    .map(([convenionombre, st]) => ({
      convenionombre,
      totalConsultas: st.total,
      totalFinalizadas: st.fin,
      totalEnSala: st.sala,
      porcentaje: totalRegistros > 0 ? (st.total / totalRegistros) * 100 : 0
    }))
    .sort((a, b) => b.totalFinalizadas - a.totalFinalizadas);

  const todosConvenios = convenioStats.map((c) => c.convenionombre);

  // Selección de convenios flexibles con convenios predeterminados oficiales:
  // 1. PROTEGER EPS SUBSIDIADO ASISTENCIAL MORBILIDAD Y PYM
  // 2. DUSAKAWI SUBSIDIADO PMS-44090-2026-12 PMT PYM
  // 3. DUSAKAWI SUBSIDIADO ASISTENCIAL ASB-44090-2026-20 CONSULTA MORBILIDAD
  // 4. NUEVA EPS SUBSIDIADO ASISTENCIAL MORBILIDAD
  // 5. NUEVA EPS SUBSIDIADO PYM
  let selectedConvenios: string[] = [];
  if (preferredConvenios && preferredConvenios.length > 0) {
    selectedConvenios = preferredConvenios;
  } else {
    // Buscar los convenios predeterminados oficiales en el dataset cargado (coincidencia con espacios normalizados)
    const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toUpperCase();
    const defaultsNormalized = DEFAULT_PREDETERMINADOS_CONVENIOS.map(norm);

    const matchingDefaults = todosConvenios.filter((conv) =>
      defaultsNormalized.includes(norm(conv))
    );

    if (matchingDefaults.length > 0) {
      selectedConvenios = matchingDefaults;
    } else {
      // Si el archivo no contiene los convenios predeterminados, tomar los primeros 10 principales
      selectedConvenios = todosConvenios.slice(0, 10);
    }
  }

  // Si no hay convenios en dataset
  if (selectedConvenios.length === 0 && todosConvenios.length > 0) {
    selectedConvenios = todosConvenios.slice(0, 10);
  }

  // Requerimiento explícito: "realizame un cuadro por cada convenio variables convenio NUEVA EPS SUBSIDIADO PYM TENER EN CUENTA SOLO LAS FINALIZADAS pym ----------6"
  // Cuadros individuales por cada convenio:
  const convenioCuadros: ConvenioCuadroStat[] = selectedConvenios.map((conv) => {
    // Filtro estricto: TENER EN CUENTA SOLO LAS FINALIZADAS
    const consultasConvFinalizadas = finalizadas.filter(
      (c) => (c.convenionombre || 'Sin Convenio') === conv
    );
    const consultasConvEnSala = enSala.filter(
      (c) => (c.convenionombre || 'Sin Convenio') === conv
    );

    const pymCountMap = new Map<string, number>();
    consultasConvFinalizadas.forEach((c) => {
      const pym = c.pym || 'Sin PyM';
      pymCountMap.set(pym, (pymCountMap.get(pym) || 0) + 1);
    });

    const totalFin = consultasConvFinalizadas.length;

    const programas: ConvenioCuadroItem[] = Array.from(pymCountMap.entries())
      .map(([pym, count]) => ({
        pym,
        finalizadas: count,
        porcentaje: totalFin > 0 ? (count / totalFin) * 100 : 0
      }))
      .sort((a, b) => b.finalizadas - a.finalizadas);

    return {
      convenionombre: conv,
      totalFinalizadas: totalFin,
      totalEnSala: consultasConvEnSala.length,
      programas
    };
  });

  // Agrupación por Programa PyM en los convenios seleccionados (Matriz)
  // Ejemplo del usuario: "consulta por programas ejemplo cota morbilidad -------------900"
  const pymConveniosMap = new Map<string, { totalGeneral: number; porConvenio: { [conv: string]: number } }>();

  // Contamos consultas finalizadas por programa y por convenio
  finalizadas.forEach((c) => {
    const pym = c.pym || 'Sin PyM';
    const conv = c.convenionombre || 'Sin Convenio';
    if (!pymConveniosMap.has(pym)) {
      pymConveniosMap.set(pym, { totalGeneral: 0, porConvenio: {} });
    }
    const entry = pymConveniosMap.get(pym)!;
    entry.totalGeneral += 1;
    if (selectedConvenios.includes(conv)) {
      entry.porConvenio[conv] = (entry.porConvenio[conv] || 0) + 1;
    }
  });

  const programaConvenioStats: ProgramaConvenioStat[] = Array.from(pymConveniosMap.entries())
    .map(([pym, data]) => {
      const totalPorConvenios = selectedConvenios.reduce(
        (acc, conv) => acc + (data.porConvenio[conv] || 0),
        0
      );
      return {
        pym,
        totalPorConvenios,
        totalGeneral: data.totalGeneral,
        porConvenio: data.porConvenio
      };
    })
    .sort((a, b) => b.totalPorConvenios - a.totalPorConvenios);

  return {
    totalRegistros,
    totalFinalizadas: finalizadas.length,
    totalEnSala: enSala.length,
    totalOtras,
    totalPymUnicos: pymStats.length,
    totalMedicosUnicos: medicoStats.length,
    totalConveniosUnicos: todosConvenios.length,
    todosConvenios,
    selectedConvenios,
    pymStats,
    medicoStats,
    enSalaStats,
    convenioStats,
    programaConvenioStats,
    convenioCuadros
  };
};

export const downloadTemplate = () => {
  const sampleRows = [
    {
      pym: 'Cota Morbilidad',
      mediconombre: 'Dr. Rodolfo Hernández',
      estado_consulta: 'FINALIZADA',
      convenionombre: 'Nueva EPS',
      paciente: 'Carlos Alberto Barajas',
      documento: '91283741',
      fecha: '2026-09-19',
      hora: '07:30'
    },
    {
      pym: 'Cota Morbilidad',
      mediconombre: 'Dr. Carlos Andrés Rodríguez',
      estado_consulta: 'FINALIZADA',
      convenionombre: 'Sanitas EPS',
      paciente: 'Martha Elena Sánchez',
      documento: '52341890',
      fecha: '2026-09-19',
      hora: '08:00'
    },
    {
      pym: 'Riesgo Cardiovascular',
      mediconombre: 'Dr. Carlos Andrés Rodríguez',
      estado_consulta: 'EN SALA',
      convenionombre: 'Salud Total EPS',
      paciente: 'Héctor Fabio Ramírez',
      documento: '94210098',
      fecha: '2026-09-19',
      hora: '08:30'
    },
    {
      pym: 'Control Prenatal',
      mediconombre: 'Dra. María Paula Gómez',
      estado_consulta: 'FINALIZADA',
      convenionombre: 'Nueva EPS',
      paciente: 'Daniela Andrea Castro',
      documento: '1018432901',
      fecha: '2026-09-19',
      hora: '09:00'
    },
    {
      pym: 'Crecimiento y Desarrollo',
      mediconombre: 'Dra. Laura Patricia Morales',
      estado_consulta: 'EN SALA',
      convenionombre: 'Sanitas EPS',
      paciente: 'Mateo Alejandro Ríos',
      documento: '1140890231',
      fecha: '2026-09-19',
      hora: '09:30'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Consultas');
  XLSX.writeFile(wb, 'plantilla_consultas_medicas.xlsx');
};

export const exportSummaryToExcel = (summary: DashboardSummary) => {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Cuadros por Convenio (Variable convenionombre & pym, SOLO FINALIZADAS)
  // Requerimiento: "cuadro por cada convenio variables convenio NUEVA EPS SUBSIDIADO PYM TENER EN CUENTA SOLO LAS FINALIZADAS"
  const cuadrosRows: any[] = [];
  summary.convenioCuadros.forEach((cuadro) => {
    cuadrosRows.push({
      'Convenio': `CONVENIO: ${cuadro.convenionombre}`,
      'Programa PyM': `TOTAL FINALIZADAS: ${cuadro.totalFinalizadas}`,
      'Consultas Finalizadas': cuadro.totalFinalizadas,
      'Porcentaje (%)': 100
    });
    cuadro.programas.forEach((prog) => {
      cuadrosRows.push({
        'Convenio': cuadro.convenionombre,
        'Programa PyM': prog.pym,
        'Consultas Finalizadas': prog.finalizadas,
        'Porcentaje (%)': Number(prog.porcentaje.toFixed(2))
      });
    });
    // Fila en blanco separadora
    cuadrosRows.push({
      'Convenio': '',
      'Programa PyM': '',
      'Consultas Finalizadas': '',
      'Porcentaje (%)': ''
    });
  });
  const wsCuadros = XLSX.utils.json_to_sheet(cuadrosRows);
  XLSX.utils.book_append_sheet(wb, wsCuadros, 'Cuadros_Por_Convenio');

  // Hoja 2: Matriz Comparativa de Programas vs Convenios Seleccionados
  const progConvData = summary.programaConvenioStats.map((item, idx) => {
    const rowObj: any = {
      '#': idx + 1,
      'Programa PyM (variable: pym)': item.pym,
      'Total Convenios Seleccionados': item.totalPorConvenios
    };
    summary.selectedConvenios.forEach((conv) => {
      rowObj[conv] = item.porConvenio[conv] || 0;
    });
    rowObj['Total General Finalizadas'] = item.totalGeneral;
    return rowObj;
  });
  const wsProgConv = XLSX.utils.json_to_sheet(progConvData);
  XLSX.utils.book_append_sheet(wb, wsProgConv, 'Matriz_Programas_Convenios');

  // Hoja 3: Médicos Finalizadas (ejemplo: Rodolfo Hernández ---- 200)
  const medData = summary.medicoStats.map((item, idx) => ({
    '#': idx + 1,
    'Profesional (variable: mediconombre)': item.mediconombre,
    'Consultas FINALIZADAS': item.totalFinalizadas,
    'Porcentaje sobre Finalizadas (%)': Number(item.porcentaje.toFixed(2)),
    'Pacientes EN SALA actuales': item.enSala,
    'Programas PyM Distintos': item.programasAtendidos
  }));
  const wsMed = XLSX.utils.json_to_sheet(medData);
  XLSX.utils.book_append_sheet(wb, wsMed, 'Medicos_Finalizadas');

  // Hoja 4: En Sala por Médico (ejemplo: Rodolfo Hernández - EN SALA ---- 34)
  const salaData = summary.enSalaStats.map((item, idx) => ({
    '#': idx + 1,
    'Profesional (mediconombre)': item.mediconombre,
    'Cantidad de Consultas EN SALA': item.cantidad
  }));
  const wsSala = XLSX.utils.json_to_sheet(salaData);
  XLSX.utils.book_append_sheet(wb, wsSala, 'En_Sala_Por_Medico');

  // Hoja 5: Convenios Resumen
  const convData = summary.convenioStats.map((item, idx) => ({
    '#': idx + 1,
    'Convenio (variable: convenionombre)': item.convenionombre,
    'Total Consultas': item.totalConsultas,
    'Finalizadas': item.totalFinalizadas,
    'En Sala': item.totalEnSala,
    'Porcentaje (%)': Number(item.porcentaje.toFixed(2)),
    'Seleccionado en Reporte': summary.selectedConvenios.includes(item.convenionombre) ? 'SÍ' : 'NO'
  }));
  const wsConv = XLSX.utils.json_to_sheet(convData);
  XLSX.utils.book_append_sheet(wb, wsConv, 'Convenios_Resumen');

  XLSX.writeFile(wb, `informe_consultas_medicas_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
