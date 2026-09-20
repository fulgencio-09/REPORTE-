import * as XLSX from 'xlsx';
import {
  UrgenciaRecord,
  Urgencias203Summary,
  SedeEstadoStat,
  EstadoUrgenciaStat,
  PreEgresoFuncionarioStat,
  FuncionarioValoracionStat
} from '../types';

export const normalizeUrgenciaString = (str: any): string => {
  if (str === undefined || str === null) return '';
  return String(str)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
};

export const findUrgenciaColumnKey = (row: Record<string, any>, possibleNames: string[]): string | null => {
  const keys = Object.keys(row);
  for (const name of possibleNames) {
    const cleanTarget = normalizeUrgenciaString(name).replace(/[^A-Z0-9]/g, '');
    for (const key of keys) {
      const cleanKey = normalizeUrgenciaString(key).replace(/[^A-Z0-9]/g, '');
      if (cleanKey === cleanTarget || cleanKey.includes(cleanTarget)) {
        return key;
      }
    }
  }
  return null;
};

export const parseUrgenciasRawData = (rows: Record<string, any>[]): Urgencias203Summary => {
  if (!rows || rows.length === 0) {
    return {
      totalRegistros: 0,
      totalPreEgreso: 0,
      totalAprobadoEgreso: 0,
      sedes: [],
      estados: [],
      sedeEstadoStats: [],
      estadoStats: [],
      preEgresoFuncionarios: [],
      preEgresoRecords: [],
      aprobadoValoracionMedica: [],
      aprobadoEgresoRecords: []
    };
  }

  const sample = rows[0];

  // Identificar columnas
  const sedeCol = findUrgenciaColumnKey(sample, ['sede', 'sedes', 'nombresede', 'sucursal', 'centroatencion']) || 'sede';
  const estadoCol = findUrgenciaColumnKey(sample, ['urgenciaestado', 'urgenciasestado', 'urgencia_estado', 'estado', 'estadourgencia']) || 'urgenciaestado';
  const funcionarioCol = findUrgenciaColumnKey(sample, ['funcionarioingreso', 'funcionario_ingreso', 'funcionario', 'usuarioingreso', 'admitio']) || 'funcionarioingreso';
  const funcionarioValoracionCol = findUrgenciaColumnKey(sample, [
    'funcionariovaloracionmedica',
    'funcionario_valoracion_medica',
    'funcionariovaloracion',
    'medicovaloracion',
    'medicotrata',
    'medico_trata',
    'profesionalvaloracion',
    'medico'
  ]);
  const pacienteCol = findUrgenciaColumnKey(sample, ['paciente', 'nombrepaciente', 'nombre', 'usuario']);
  const idCol = findUrgenciaColumnKey(sample, ['identificacion', 'documento', 'cedula', 'historiaclinica', 'consecutivo']);
  const fechaCol = findUrgenciaColumnKey(sample, ['fechaingreso', 'fecha_ingreso', 'fecha', 'fechahora']);
  const triageCol = findUrgenciaColumnKey(sample, ['triage', 'clasificacion', 'nivel']);
  const camaCol = findUrgenciaColumnKey(sample, ['cama', 'habitacion', 'ubicacion']);
  const diagCol = findUrgenciaColumnKey(sample, ['diagnostico', 'diagnosticoingreso', 'motivo']);

  const records: UrgenciaRecord[] = rows.map((r, i) => {
    const rawSede = r[sedeCol] || 'SEDE PRINCIPAL';
    const rawEstado = r[estadoCol] || 'SIN ESTADO';
    const rawFuncionario = r[funcionarioCol] || 'FUNCIONARIO NO ASIGNADO';
    const rawFuncionarioValoracion = funcionarioValoracionCol && r[funcionarioValoracionCol]
      ? String(r[funcionarioValoracionCol]).trim()
      : undefined;

    return {
      id: `URG-${i + 1}`,
      sede: String(rawSede).trim().toUpperCase(),
      urgenciaestado: String(rawEstado).trim().toUpperCase(),
      funcionarioingreso: String(rawFuncionario).trim().toUpperCase(),
      funcionariovaloracionmedica: rawFuncionarioValoracion ? rawFuncionarioValoracion.toUpperCase() : undefined,
      paciente: pacienteCol ? String(r[pacienteCol] || '').trim() : undefined,
      identificacion: idCol ? String(r[idCol] || '').trim() : undefined,
      fechaingreso: fechaCol ? String(r[fechaCol] || '').trim() : undefined,
      triage: triageCol ? String(r[triageCol] || '').trim() : undefined,
      cama: camaCol ? String(r[camaCol] || '').trim() : undefined,
      diagnostico: diagCol ? String(r[diagCol] || '').trim() : undefined,
      rawData: r
    };
  });

  return summarizeUrgenciasRecords(records);
};

export const summarizeUrgenciasRecords = (records: UrgenciaRecord[]): Urgencias203Summary => {
  const sedesSet = new Set<string>();
  const estadosSet = new Set<string>();

  // Map: `${sede}:::${estado}` -> count
  const sedeEstadoMap = new Map<string, number>();

  // Map: estado -> count
  const estadoCountMap = new Map<string, { total: number; porSede: { [s: string]: number } }>();

  // Filtro específico para AUDITORIA PRE EGRESO y APROBADO EGRESO
  const preEgresoRecords: UrgenciaRecord[] = [];
  const preEgresoFuncionarioMap = new Map<string, { cantidad: number; porSede: { [s: string]: number }; registros: UrgenciaRecord[] }>();

  // Filtro específico para APROBADO EGRESO / PRE APROBADO por funcionariovaloracionmedica
  const aprobadoEgresoRecords: UrgenciaRecord[] = [];
  const aprobadoValoracionMap = new Map<string, { cantidad: number; porSede: { [s: string]: number }; registros: UrgenciaRecord[] }>();

  records.forEach((rec) => {
    const s = rec.sede || 'SEDE PRINCIPAL';
    const e = rec.urgenciaestado || 'SIN ESTADO';
    const f = rec.funcionarioingreso || 'NO ASIGNADO';
    const valMed = rec.funcionariovaloracionmedica || rec.medicotrata || 'MEDICO NO ESPECIFICADO';

    sedesSet.add(s);
    estadosSet.add(e);

    // Conteo Sede + Estado
    const key = `${s}:::${e}`;
    sedeEstadoMap.set(key, (sedeEstadoMap.get(key) || 0) + 1);

    // Conteo general por Estado y por Sede
    if (!estadoCountMap.has(e)) {
      estadoCountMap.set(e, { total: 0, porSede: {} });
    }
    const estObj = estadoCountMap.get(e)!;
    estObj.total += 1;
    estObj.porSede[s] = (estObj.porSede[s] || 0) + 1;

    const normEstado = normalizeUrgenciaString(e);

    // Regla: "si esta en auditoria PRE EGRESO ME COLOCAR EL NOMBRE DE funcionarioingreso"
    if (normEstado.includes('PRE EGRESO') || normEstado.includes('AUDITORIA PRE') || normEstado === 'AUDITORIA PRE EGRESO') {
      preEgresoRecords.push(rec);

      if (!preEgresoFuncionarioMap.has(f)) {
        preEgresoFuncionarioMap.set(f, { cantidad: 0, porSede: {}, registros: [] });
      }
      const funcObj = preEgresoFuncionarioMap.get(f)!;
      funcObj.cantidad += 1;
      funcObj.porSede[s] = (funcObj.porSede[s] || 0) + 1;
      funcObj.registros.push(rec);
    }

    // Regla: "enlistame los pre aprobado con los funcionariovaloracionmedica"
    // Captura APROBADO EGRESO, PRE APROBADO o APROBADO
    if (normEstado.includes('APROBADO EGRESO') || normEstado.includes('PRE APROBADO') || normEstado === 'APROBADO') {
      aprobadoEgresoRecords.push(rec);

      if (!aprobadoValoracionMap.has(valMed)) {
        aprobadoValoracionMap.set(valMed, { cantidad: 0, porSede: {}, registros: [] });
      }
      const valObj = aprobadoValoracionMap.get(valMed)!;
      valObj.cantidad += 1;
      valObj.porSede[s] = (valObj.porSede[s] || 0) + 1;
      valObj.registros.push(rec);
    }
  });

  const sedes = Array.from(sedesSet).sort();
  const estados = Array.from(estadosSet).sort();

  // Generar lista de SedeEstadoStat ordenada
  const sedeEstadoStats: SedeEstadoStat[] = [];
  sedes.forEach((s) => {
    estados.forEach((e) => {
      const count = sedeEstadoMap.get(`${s}:::${e}`) || 0;
      if (count > 0) {
        sedeEstadoStats.push({
          sede: s,
          estado: e,
          cantidad: count
        });
      }
    });
  });
  // Ordenar por cantidad descendente
  sedeEstadoStats.sort((a, b) => b.cantidad - a.cantidad);

  // Generar lista de EstadoUrgenciaStat
  const estadoStats: EstadoUrgenciaStat[] = Array.from(estadoCountMap.entries())
    .map(([estado, data]) => ({
      estado,
      total: data.total,
      porSede: data.porSede
    }))
    .sort((a, b) => b.total - a.total);

  // Generar lista de PreEgresoFuncionarioStat ordenada por cantidad
  const preEgresoFuncionarios: PreEgresoFuncionarioStat[] = Array.from(preEgresoFuncionarioMap.entries())
    .map(([funcionarioingreso, data]) => ({
      funcionarioingreso,
      cantidad: data.cantidad,
      porSede: data.porSede,
      registros: data.registros
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Generar lista de FuncionarioValoracionStat ordenada por cantidad
  const aprobadoValoracionMedica: FuncionarioValoracionStat[] = Array.from(aprobadoValoracionMap.entries())
    .map(([funcionariovaloracionmedica, data]) => ({
      funcionariovaloracionmedica,
      cantidad: data.cantidad,
      porSede: data.porSede,
      registros: data.registros
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  return {
    totalRegistros: records.length,
    totalPreEgreso: preEgresoRecords.length,
    totalAprobadoEgreso: aprobadoEgresoRecords.length,
    sedes,
    estados,
    sedeEstadoStats,
    estadoStats,
    preEgresoFuncionarios,
    preEgresoRecords,
    aprobadoValoracionMedica,
    aprobadoEgresoRecords
  };
};

export const exportUrgenciasToExcel = (summary: Urgencias203Summary) => {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen General y Sede vs Estado
  const sedeEstadoRows = summary.sedeEstadoStats.map((item, idx) => ({
    '#': idx + 1,
    'Sede': item.sede,
    'Estado de Urgencia (urgenciaestado)': item.estado,
    'Cantidad Pacientes': item.cantidad
  }));
  const wsSedeEstado = XLSX.utils.json_to_sheet(sedeEstadoRows);
  XLSX.utils.book_append_sheet(wb, wsSedeEstado, 'Sede_vs_Estado');

  // Hoja 2: Aprobados / Pre Aprobados por Médico de Valoración
  const valoracionRows = summary.aprobadoValoracionMedica.map((item, idx) => {
    const rowObj: any = {
      '#': idx + 1,
      'Médico / Funcionario Valoración Médica (funcionariovaloracionmedica)': item.funcionariovaloracionmedica,
      'Total Aprobados Egreso': item.cantidad
    };
    summary.sedes.forEach((s) => {
      rowObj[`Sede ${s}`] = item.porSede[s] || 0;
    });
    return rowObj;
  });
  const wsValoracion = XLSX.utils.json_to_sheet(valoracionRows);
  XLSX.utils.book_append_sheet(wb, wsValoracion, 'Aprobados_Valoracion_Medica');

  // Hoja 3: Auditoria Pre Egreso por Funcionario Ingreso
  const preEgresoRows = summary.preEgresoFuncionarios.map((item, idx) => {
    const rowObj: any = {
      '#': idx + 1,
      'Funcionario de Ingreso (funcionarioingreso)': item.funcionarioingreso,
      'Total en Auditoría Pre Egreso': item.cantidad
    };
    summary.sedes.forEach((s) => {
      rowObj[`Sede ${s}`] = item.porSede[s] || 0;
    });
    return rowObj;
  });
  const wsPreEgreso = XLSX.utils.json_to_sheet(preEgresoRows);
  XLSX.utils.book_append_sheet(wb, wsPreEgreso, 'Auditoria_Pre_Egreso');

  // Hoja 4: Pacientes en Auditoría Pre Egreso
  const detalleRows = summary.preEgresoRecords.map((r, idx) => ({
    '#': idx + 1,
    'ID': r.id,
    'Sede': r.sede,
    'Estado': r.urgenciaestado,
    'Funcionario Ingreso': r.funcionarioingreso,
    'Médico Valoración': r.funcionariovaloracionmedica || '',
    'Paciente': r.paciente || '',
    'Identificación': r.identificacion || '',
    'Fecha Ingreso': r.fechaingreso || '',
    'Triage': r.triage || '',
    'Diagnóstico': r.diagnostico || '',
    'Cama/Ubicación': r.cama || ''
  }));
  const wsDetalle = XLSX.utils.json_to_sheet(detalleRows);
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle_Pre_Egreso');

  // Hoja 5: Pacientes Aprobado Egreso
  const detalleAprobadosRows = summary.aprobadoEgresoRecords.map((r, idx) => ({
    '#': idx + 1,
    'ID': r.id,
    'Sede': r.sede,
    'Estado': r.urgenciaestado,
    'Médico Valoración (funcionariovaloracionmedica)': r.funcionariovaloracionmedica || '',
    'Funcionario Ingreso': r.funcionarioingreso,
    'Paciente': r.paciente || '',
    'Identificación': r.identificacion || '',
    'Fecha Ingreso': r.fechaingreso || '',
    'Triage': r.triage || '',
    'Diagnóstico': r.diagnostico || ''
  }));
  const wsDetalleAprobados = XLSX.utils.json_to_sheet(detalleAprobadosRows);
  XLSX.utils.book_append_sheet(wb, wsDetalleAprobados, 'Detalle_Aprobado_Egreso');

  // Guardar archivo
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Reporte_203_Urgencias_Hospital_Santa_Teresa_${dateStr}.xlsx`);
};
