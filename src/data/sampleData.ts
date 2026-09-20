import { NormalizedConsultation } from '../types';

// Convenios disponibles para análisis (Al menos 10 convenios reales)
export const DEFAULT_10_CONVENIOS = [
  'NUEVA EPS SUBSIDIADO',
  'NUEVA EPS CONTRIBUTIVO',
  'SANITAS EPS',
  'SALUD TOTAL EPS',
  'SURA EPS',
  'COOSALUD EPS',
  'ASMET SALUD EPS',
  'FAMISANAR EPS',
  'MUTUAL SER EPS',
  'COMPENSAR EPS'
];

export const ALL_CONVENIOS = [
  'NUEVA EPS SUBSIDIADO',
  'NUEVA EPS CONTRIBUTIVO',
  'SANITAS EPS',
  'SALUD TOTAL EPS',
  'SURA EPS',
  'COOSALUD EPS',
  'ASMET SALUD EPS',
  'FAMISANAR EPS',
  'MUTUAL SER EPS',
  'COMPENSAR EPS',
  'EMSSANAR EPS',
  'SAVIA SALUD EPS'
];

// Función constructora para generar registros consistentes con los requerimientos:
// 1. Dr. Rodolfo Hernández: 200 FINALIZADAS ("rodolfo hernandez -----200")
// 2. Dr. Rodolfo Hernández: EXACTAMENTE 34 EN SALA ("rodolfo hernandez  -EN SALA -----------------------34")
// 3. Cota Morbilidad: EXACTAMENTE 900 FINALIZADAS ("cota morbilidad -------------900")
// 4. Múltiples convenios (>= 10 convenios), incluyendo NUEVA EPS SUBSIDIADO y programas con count=6 ("pym ----------6")
const generateRealisticSampleData = (): NormalizedConsultation[] => {
  const records: NormalizedConsultation[] = [];
  let idCounter = 1;

  const nextId = () => `CONS-${String(idCounter++).padStart(5, '0')}`;

  const conveniosList = ALL_CONVENIOS;

  // 1. Dr. Rodolfo Hernández: EXACTAMENTE 200 CONSULTAS FINALIZADAS
  for (let i = 1; i <= 200; i++) {
    let pym = 'Cota Morbilidad';
    if (i > 150 && i <= 180) pym = 'Riesgo Cardiovascular';
    else if (i > 180) pym = 'Adulto Mayor';

    const conv = conveniosList[(i - 1) % conveniosList.length];
    records.push({
      id: nextId(),
      pym,
      mediconombre: 'Dr. Rodolfo Hernández',
      estado_consulta: 'FINALIZADA',
      convenionombre: conv,
      paciente: `Paciente ${i} - R. Hernández`,
      documento: `${10000000 + i * 37}`,
      fecha: '2026-09-19',
      hora: `${String(7 + Math.floor(i / 30)).padStart(2, '0')}:${String((i * 12) % 60).padStart(2, '0')}`,
      consultorio: 'Cons. 301'
    });
  }

  // 2. Dr. Rodolfo Hernández: EXACTAMENTE 34 CONSULTAS EN SALA
  // Requerimiento explícito: "rodolfo hernandez  -EN SALA -----------------------34"
  const enSalaRodolfoProgramas = [
    'Cota Morbilidad',
    'Riesgo Cardiovascular',
    'Adulto Mayor',
    'Salud Integral'
  ];
  for (let s = 1; s <= 34; s++) {
    const pymSala = enSalaRodolfoProgramas[s % enSalaRodolfoProgramas.length];
    const convSala = conveniosList[(s + 2) % conveniosList.length];
    records.push({
      id: nextId(),
      pym: pymSala,
      mediconombre: 'Dr. Rodolfo Hernández',
      estado_consulta: 'EN SALA',
      convenionombre: convSala,
      paciente: `Paciente Sala ${s} (R. Hernández)`,
      documento: `${91000000 + s * 143}`,
      fecha: '2026-09-19',
      hora: `09:${String((s * 2) % 60).padStart(2, '0')}`,
      consultorio: 'Cons. 301'
    });
  }

  // 3. Otros Médicos con consultas FINALIZADAS para completar exactamente 900 de "Cota Morbilidad"
  // Dr. Rodolfo Hernández ya tiene 150 de Cota Morbilidad.
  // Faltan 750:
  // - Dr. Carlos Andrés Rodríguez: 250 Cota Morbilidad
  // - Dra. María Paula Gómez: 200 Cota Morbilidad
  // - Dra. Laura Patricia Morales: 150 Cota Morbilidad
  // - Dr. Andrés Felipe Castrillón: 150 Cota Morbilidad
  // Total Cota Morbilidad = 150 + 250 + 200 + 150 + 150 = 900 EXACTAS.

  const addDoctorFinalizadas = (
    medico: string,
    consultorio: string,
    programDist: { pym: string; count: number; specificConv?: string }[]
  ) => {
    let pIdx = 1;
    programDist.forEach(({ pym, count, specificConv }) => {
      for (let c = 0; c < count; c++) {
        const conv = specificConv || conveniosList[(c + pIdx) % conveniosList.length];
        records.push({
          id: nextId(),
          pym,
          mediconombre: medico,
          estado_consulta: 'FINALIZADA',
          convenionombre: conv,
          paciente: `Paciente ${pIdx++} (${medico.split(' ')[1] || 'Med'})`,
          documento: `${20000000 + idCounter * 17}`,
          fecha: '2026-09-19',
          hora: `${String(7 + Math.floor(c / 25)).padStart(2, '0')}:${String((c * 15) % 60).padStart(2, '0')}`,
          consultorio
        });
      }
    });
  };

  // Dr. Carlos Andrés Rodríguez: 250 Cota Morbilidad + 60 Riesgo + 40 Adulto Mayor = 350 Finalizadas
  addDoctorFinalizadas('Dr. Carlos Andrés Rodríguez', 'Cons. 101', [
    { pym: 'Cota Morbilidad', count: 250 },
    { pym: 'Riesgo Cardiovascular', count: 60 },
    { pym: 'Adulto Mayor', count: 40 }
  ]);

  // Dra. María Paula Gómez: 200 Cota Morbilidad + 70 Control Prenatal + 50 Planificación Familiar
  // Incluimos 6 en NUEVA EPS SUBSIDIADO para Planificación Familiar (coincidiendo con el ejemplo "pym ----------6")
  addDoctorFinalizadas('Dra. María Paula Gómez', 'Cons. 204', [
    { pym: 'Cota Morbilidad', count: 200 },
    { pym: 'Control Prenatal', count: 70 },
    { pym: 'Planificación Familiar', count: 6, specificConv: 'NUEVA EPS SUBSIDIADO' },
    { pym: 'Planificación Familiar', count: 44 }
  ]);

  // Dra. Laura Patricia Morales: 150 Cota Morbilidad + 60 Crecimiento y Desarrollo + 40 Salud Infantil = 250 Finalizadas
  addDoctorFinalizadas('Dra. Laura Patricia Morales', 'Cons. 105', [
    { pym: 'Cota Morbilidad', count: 150 },
    { pym: 'Crecimiento y Desarrollo', count: 60 },
    { pym: 'Salud Infantil', count: 40 }
  ]);

  // Dr. Andrés Felipe Castrillón: 150 Cota Morbilidad + 50 Riesgo + 30 Adulto Mayor = 230 Finalizadas
  addDoctorFinalizadas('Dr. Andrés Felipe Castrillón', 'Cons. 108', [
    { pym: 'Cota Morbilidad', count: 150 },
    { pym: 'Riesgo Cardiovascular', count: 50 },
    { pym: 'Adulto Mayor', count: 30 }
  ]);

  // Dra. Claudia Marcela Benítez: 40 Salud Oral (6 en NUEVA EPS SUBSIDIADO)
  addDoctorFinalizadas('Dra. Claudia Marcela Benítez', 'Odonto 2', [
    { pym: 'Salud Oral', count: 6, specificConv: 'NUEVA EPS SUBSIDIADO' },
    { pym: 'Salud Oral', count: 34 }
  ]);

  // Dra. Viviana Rojas: 30 Salud Visual
  addDoctorFinalizadas('Dra. Viviana Rojas', 'Cons. 302', [
    { pym: 'Salud Visual', count: 30 }
  ]);

  // 4. OTROS PROFESIONALES CON CONSULTAS EN SALA
  const addEnSala = (
    medico: string,
    consultorio: string,
    list: { pym: string; conv: string; pac: string; doc: string; hora: string }[]
  ) => {
    list.forEach((s) => {
      records.push({
        id: nextId(),
        pym: s.pym,
        mediconombre: medico,
        estado_consulta: 'EN SALA',
        convenionombre: s.conv,
        paciente: s.pac,
        documento: s.doc,
        fecha: '2026-09-19',
        hora: s.hora,
        consultorio
      });
    });
  };

  // Dr. Carlos Andrés Rodríguez: 14 pacientes en sala
  addEnSala('Dr. Carlos Andrés Rodríguez', 'Cons. 101', [
    { pym: 'Riesgo Cardiovascular', conv: 'NUEVA EPS SUBSIDIADO', pac: 'Héctor Fabio Ramírez', doc: '94.210.098', hora: '10:00' },
    { pym: 'Adulto Mayor', conv: 'SANITAS EPS', pac: 'Guillermina Ruiz', doc: '28.341.220', hora: '10:15' },
    { pym: 'Cota Morbilidad', conv: 'SALUD TOTAL EPS', pac: 'Mauricio Ocampo', doc: '71.490.112', hora: '10:30' },
    { pym: 'Cota Morbilidad', conv: 'NUEVA EPS CONTRIBUTIVO', pac: 'Patricia Restrepo', doc: '43.298.110', hora: '10:45' },
    { pym: 'Riesgo Cardiovascular', conv: 'SURA EPS', pac: 'Gonzalo Arango', doc: '15.390.112', hora: '11:00' },
    { pym: 'Cota Morbilidad', conv: 'COOSALUD EPS', pac: 'Clara Inés Montoya', doc: '32.190.812', hora: '11:15' },
    { pym: 'Adulto Mayor', conv: 'ASMET SALUD EPS', pac: 'Belisario Betancur', doc: '10.980.231', hora: '11:20' },
    { pym: 'Cota Morbilidad', conv: 'FAMISANAR EPS', pac: 'Luz Dary Marín', doc: '51.980.441', hora: '11:25' },
    { pym: 'Riesgo Cardiovascular', conv: 'MUTUAL SER EPS', pac: 'Jaime Pardo', doc: '19.450.890', hora: '11:30' },
    { pym: 'Cota Morbilidad', conv: 'COMPENSAR EPS', pac: 'Nohora Puyana', doc: '41.890.321', hora: '11:35' },
    { pym: 'Adulto Mayor', conv: 'NUEVA EPS SUBSIDIADO', pac: 'Orlando Fals', doc: '7.890.123', hora: '11:40' },
    { pym: 'Cota Morbilidad', conv: 'SANITAS EPS', pac: 'Débora Arango', doc: '21.432.109', hora: '11:45' },
    { pym: 'Riesgo Cardiovascular', conv: 'SALUD TOTAL EPS', pac: 'Leo Matiz', doc: '12.345.678', hora: '11:50' },
    { pym: 'Cota Morbilidad', conv: 'SURA EPS', pac: 'Emma Reyes', doc: '31.245.980', hora: '11:55' }
  ]);

  // Dra. Laura Patricia Morales: 10 pacientes en sala
  addEnSala('Dra. Laura Patricia Morales', 'Cons. 105', [
    { pym: 'Crecimiento y Desarrollo', conv: 'NUEVA EPS SUBSIDIADO', pac: 'Joaquín Villegas', doc: '1.146.002.119', hora: '10:10' },
    { pym: 'Salud Infantil', conv: 'SANITAS EPS', pac: 'Salomé Herrera', doc: '1.146.998.431', hora: '10:25' },
    { pym: 'Cota Morbilidad', conv: 'SALUD TOTAL EPS', pac: 'Nicolás Ospina', doc: '1.147.221.890', hora: '10:40' },
    { pym: 'Crecimiento y Desarrollo', conv: 'COOSALUD EPS', pac: 'Mariana Pajón', doc: '1.148.001.234', hora: '10:55' },
    { pym: 'Salud Infantil', conv: 'ASMET SALUD EPS', pac: 'Egan Bernal', doc: '1.149.882.110', hora: '11:05' },
    { pym: 'Cota Morbilidad', conv: 'FAMISANAR EPS', pac: 'Rigoberto Urán', doc: '1.150.334.890', hora: '11:15' },
    { pym: 'Crecimiento y Desarrollo', conv: 'MUTUAL SER EPS', pac: 'Caterine Ibargüen', doc: '1.151.002.991', hora: '11:25' },
    { pym: 'Salud Infantil', conv: 'COMPENSAR EPS', pac: 'Nairo Quintana', doc: '1.152.441.229', hora: '11:35' },
    { pym: 'Cota Morbilidad', conv: 'NUEVA EPS CONTRIBUTIVO', pac: 'Lucho Herrera', doc: '1.153.990.112', hora: '11:45' },
    { pym: 'Crecimiento y Desarrollo', conv: 'SURA EPS', pac: 'Fabio Parra', doc: '1.154.221.009', hora: '11:55' }
  ]);

  // Dra. María Paula Gómez: 8 pacientes en sala
  addEnSala('Dra. María Paula Gómez', 'Cons. 204', [
    { pym: 'Planificación Familiar', conv: 'SANITAS EPS', pac: 'Sara Lucía Quintana', doc: '1.033.441.980', hora: '10:30' },
    { pym: 'Control Prenatal', conv: 'NUEVA EPS SUBSIDIADO', pac: 'Viviana Marcela León', doc: '1.028.990.231', hora: '10:50' },
    { pym: 'Planificación Familiar', conv: 'SALUD TOTAL EPS', pac: 'Catalina Gómez', doc: '1.029.112.334', hora: '11:05' },
    { pym: 'Control Prenatal', conv: 'COOSALUD EPS', pac: 'Laura Acuña', doc: '1.030.445.667', hora: '11:15' },
    { pym: 'Planificación Familiar', conv: 'SURA EPS', pac: 'Andrea Serna', doc: '1.031.778.990', hora: '11:25' },
    { pym: 'Control Prenatal', conv: 'FAMISANAR EPS', pac: 'Claudia Bahamón', doc: '1.032.001.223', hora: '11:35' },
    { pym: 'Planificación Familiar', conv: 'ASMET SALUD EPS', pac: 'Jessica Cediel', doc: '1.033.334.556', hora: '11:45' },
    { pym: 'Control Prenatal', conv: 'COMPENSAR EPS', pac: 'Carolina Cruz', doc: '1.034.667.889', hora: '11:55' }
  ]);

  // Dr. Andrés Felipe Castrillón: 6 pacientes en sala
  addEnSala('Dr. Andrés Felipe Castrillón', 'Cons. 108', [
    { pym: 'Riesgo Cardiovascular', conv: 'SALUD TOTAL EPS', pac: 'Álvaro de Jesús Cano', doc: '70.231.900', hora: '10:15' },
    { pym: 'Cota Morbilidad', conv: 'NUEVA EPS SUBSIDIADO', pac: 'Luz Marina Duque', doc: '32.409.811', hora: '10:40' },
    { pym: 'Adulto Mayor', conv: 'SANITAS EPS', pac: 'Hernando Santos', doc: '14.230.981', hora: '11:00' },
    { pym: 'Riesgo Cardiovascular', conv: 'SURA EPS', pac: 'Alfonso López', doc: '16.780.234', hora: '11:20' },
    { pym: 'Cota Morbilidad', conv: 'COOSALUD EPS', pac: 'Virgilio Barco', doc: '18.990.112', hora: '11:40' },
    { pym: 'Adulto Mayor', conv: 'MUTUAL SER EPS', pac: 'Julio César Turbay', doc: '13.450.980', hora: '11:55' }
  ]);

  // Dra. Viviana Rojas: 4 pacientes en sala
  addEnSala('Dra. Viviana Rojas', 'Cons. 302', [
    { pym: 'Salud Visual', conv: 'SANITAS EPS', pac: 'Martín Alonso Tobón', doc: '1.042.890.321', hora: '10:30' },
    { pym: 'Salud Visual', conv: 'NUEVA EPS SUBSIDIADO', pac: 'Gloria Valencia', doc: '24.567.890', hora: '10:50' },
    { pym: 'Salud Visual', conv: 'COMPENSAR EPS', pac: 'Pacheco Castro', doc: '17.890.123', hora: '11:15' },
    { pym: 'Salud Visual', conv: 'SALUD TOTAL EPS', pac: 'Otto Greiffestein', doc: '19.012.345', hora: '11:40' }
  ]);

  return records;
};

export const INITIAL_SAMPLE_DATA: NormalizedConsultation[] = generateRealisticSampleData();
