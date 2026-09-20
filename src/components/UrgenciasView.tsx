import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Download,
  Stethoscope,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Urgencias203Summary, UrgenciaRecord } from '../types';
import * as XLSX from 'xlsx';
import { parseUrgenciasRawData, exportUrgenciasToExcel } from '../utils/urgenciasParser';
import { SAMPLE_URGENCIAS_203 } from '../data/urgenciasSampleData';
import { summarizeUrgenciasRecords } from '../utils/urgenciasParser';
import { SecurityCodeModal } from './SecurityCodeModal';

interface UrgenciasViewProps {
  summary: Urgencias203Summary;
  onUpdateSummary: (newSummary: Urgencias203Summary, fileName?: string) => void;
  onOpenReportModal: () => void;
  fileName?: string | null;
  onRequestUpload?: () => void;
  isStoredLocally?: boolean;
}

export const UrgenciasView: React.FC<UrgenciasViewProps> = ({
  summary,
  onUpdateSummary,
  onOpenReportModal,
  fileName,
  onRequestUpload,
  isStoredLocally = false
}) => {
  const [copiedSedeText, setCopiedSedeText] = useState(false);
  const [copiedPreEgresoText, setCopiedPreEgresoText] = useState(false);
  const [copiedValoracionText, setCopiedValoracionText] = useState(false);
  const [selectedSedeFilter, setSelectedSedeFilter] = useState<string>('TODAS');
  const [searchFuncionario, setSearchFuncionario] = useState<string>('');
  const [searchValoracion, setSearchValoracion] = useState<string>('');
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          alert('El archivo no contiene filas de datos.');
          setIsProcessing(false);
          return;
        }

        const newSummary = parseUrgenciasRawData(rawJson);
        onUpdateSummary(newSummary, file.name);
      } catch (err) {
        console.error('Error al procesar archivo de urgencias', err);
        alert('Error al leer el archivo Excel/CSV. Verifique el formato.');
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleResetSample = () => {
    const sampleSummary = summarizeUrgenciasRecords(SAMPLE_URGENCIAS_203);
    onUpdateSummary(sampleSummary, 'Muestra Oficial Reporte 203 (Hospital Santa Teresa)');
  };

  // Filtrar sedeEstadoStats según sede seleccionada
  const filteredSedeEstadoStats = summary.sedeEstadoStats.filter((item) => {
    if (selectedSedeFilter === 'TODAS') return true;
    return item.sede === selectedSedeFilter;
  });

  // Filtrar funcionarios pre egreso según búsqueda
  const filteredPreEgresoFuncionarios = summary.preEgresoFuncionarios.filter((item) => {
    if (!searchFuncionario.trim()) return true;
    return item.funcionarioingreso.toLowerCase().includes(searchFuncionario.toLowerCase().trim());
  });

  // Texto con formato con líneas punteadas
  const sedeFormatText = filteredSedeEstadoStats
    .map((item) => `${item.sede} , ${item.estado} -------------------- ${item.cantidad}`)
    .join('\n');

  const preEgresoFormatText = summary.preEgresoFuncionarios
    .map((item) => `${item.funcionarioingreso} ------------------ ${item.cantidad}`)
    .join('\n');

  // Formato punteado solicitado: "diolmer andres mena romero --------------------- 5"
  const valoracionFormatText = summary.aprobadoValoracionMedica
    .map((item) => `${item.funcionariovaloracionmedica} --------------------- ${item.cantidad}`)
    .join('\n');

  const filteredAprobadoValoracion = summary.aprobadoValoracionMedica.filter((item) => {
    if (!searchValoracion.trim()) return true;
    return item.funcionariovaloracionmedica.toLowerCase().includes(searchValoracion.toLowerCase().trim());
  });

  const handleCopySedeFormat = () => {
    navigator.clipboard.writeText(sedeFormatText);
    setCopiedSedeText(true);
    setTimeout(() => setCopiedSedeText(false), 2000);
  };

  const handleCopyPreEgresoFormat = () => {
    navigator.clipboard.writeText(preEgresoFormatText);
    setCopiedPreEgresoText(true);
    setTimeout(() => setCopiedPreEgresoText(false), 2000);
  };

  const handleCopyValoracionFormat = () => {
    navigator.clipboard.writeText(valoracionFormatText);
    setCopiedValoracionText(true);
    setTimeout(() => setCopiedValoracionText(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Modo Informe de Urgencias - Plantilla 1: Reporte 203 */}
      <div className="bg-gradient-to-r from-orange-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-orange-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full">
              Plantilla 1 de 2
            </span>
            <span className="text-xs font-semibold text-orange-200">
              Reporte 203 de Urgencias
            </span>
            <span className="text-orange-400">·</span>
            <span className="text-xs text-orange-300">
              Hospital Santa Teresa de Jesús de Ávila
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Monitoreo Asistencial y Auditoría de Urgencias
          </h2>
          <p className="text-xs text-orange-200/90 mt-1 max-w-2xl">
            Procesamiento de columnas <strong className="text-white font-mono">sede</strong>,{' '}
            <strong className="text-white font-mono">urgenciaestado</strong> y auditoría especial de{' '}
            <strong className="text-amber-300 font-mono">AUDITORIA PRE EGRESO</strong> por{' '}
            <strong className="text-amber-300 font-mono">funcionarioingreso</strong>.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => {
              if (onRequestUpload) {
                onRequestUpload();
              } else {
                setIsSecurityModalOpen(true);
              }
            }}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            title="Cargar archivo Excel o CSV del Reporte 203 (Requiere código 8492)"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isProcessing ? 'Procesando...' : 'Subir Reporte 203'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-orange-50 text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            title="Abrir o descargar informe firmado por Ing. Fulgencio Quintero Brito y Marcellis Oñate"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Descargar Informe Firmado</span>
          </button>

          <button
            type="button"
            onClick={() => exportUrgenciasToExcel(summary)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResetSample}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Restablecer datos de muestra del Reporte 203"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Status Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100" />
          <span>
            Archivo actual:{' '}
            <strong className="text-slate-900 font-semibold">
              {fileName || 'Muestra oficial Reporte 203 (Dibulla / Mingueo)'}
            </strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Total atenciones: <strong className="text-slate-900">{summary.totalRegistros}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isStoredLocally && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1 shadow-2xs">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Guardado localmente (se reemplaza al subir otro)
            </span>
          )}
          <span className="bg-orange-100 text-orange-950 px-2.5 py-1 rounded-md font-bold">
            Auditoría Pre Egreso: {summary.totalPreEgreso} casos activos
          </span>
          <span className="bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-md font-bold">
            Aprobado Egreso: {summary.totalAprobadoEgreso} casos
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Total Atenciones Registradas
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {summary.totalRegistros}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            En {summary.sedes.length} sedes asistenciales
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 shadow-2xs">
          <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wide flex items-center justify-between">
            <span>En Auditoría Pre Egreso</span>
            <span className="text-[10px] bg-orange-200 text-orange-950 px-2 py-0.5 rounded font-black">
              Regla Clave
            </span>
          </div>
          <div className="text-3xl font-black text-orange-950 mt-1">
            {summary.totalPreEgreso}
          </div>
          <div className="text-xs text-orange-800 mt-1">
            Ingresados por {summary.preEgresoFuncionarios.length} funcionarios distintos
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center justify-between">
            <span>Aprobado Egreso</span>
            <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-black">
              Coloreado
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-950 mt-1">
            {summary.totalAprobadoEgreso}
          </div>
          <div className="text-xs text-emerald-800 mt-1">
            Pacientes autorizados para salida clínica
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Sedes Asistenciales
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 flex flex-wrap gap-1.5">
            {summary.sedes.map((s) => (
              <span key={s} className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 2 DESTACADA: AUDITORIA PRE EGRESO POR FUNCIONARIO      */}
      {/* "si esta en auditoria PRE EGRESO ME COLOCAR EL NOMBRE DE      */}
      {/*  funcionarioingreso                                           */}
      {/*  funcionarioingreso ------------------ 2"                     */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-b from-amber-50/60 to-white rounded-2xl border-2 border-orange-300 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white">
                REGLA SOLICITADA
              </span>
              <h3 className="text-base sm:text-lg font-black text-orange-950">
                AUDITORÍA PRE EGRESO POR FUNCIONARIO DE INGRESO
              </h3>
            </div>
            <p className="text-xs text-orange-800 mt-0.5">
              Si la urgencia está en estado <code className="font-mono bg-orange-100 px-1 py-0.5 rounded font-bold">AUDITORIA PRE EGRESO</code>, se desglosa el <code className="font-mono bg-orange-100 px-1 py-0.5 rounded font-bold">funcionarioingreso</code> con su cantidad de casos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyPreEgresoFormat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Copiar lista en formato funcionarioingreso ------------------ cantidad"
            >
              {copiedPreEgresoText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPreEgresoText ? '¡Copiado!' : 'Copiar Formato'}</span>
            </button>
          </div>
        </div>

        {/* Dotted lines format display */}
        <div className="bg-stone-950 text-amber-200 p-4 rounded-xl font-mono text-xs shadow-inner space-y-2 border border-amber-900 overflow-x-auto">
          <div className="text-amber-400/80 text-[11px] pb-1 border-b border-amber-900/80 flex justify-between font-sans font-bold">
            <span>FUNCIONARIO DE INGRESO (funcionarioingreso)</span>
            <span>CASOS PRE EGRESO</span>
          </div>

          {summary.preEgresoFuncionarios.map((item) => (
            <div
              key={item.funcionarioingreso}
              className="flex items-center justify-between gap-3 hover:bg-amber-950/60 p-1 rounded transition-colors"
            >
              <span className="text-amber-100 font-bold whitespace-nowrap">
                {item.funcionarioingreso}
              </span>
              <span className="text-amber-800 font-normal grow tracking-widest overflow-hidden select-none">
                ----------------------------------------------------------------------------------------------------
              </span>
              <span className="font-black whitespace-nowrap px-3 py-0.5 bg-amber-400 text-slate-950 rounded font-mono text-sm shadow-xs">
                {item.cantidad}
              </span>
            </div>
          ))}

          {summary.preEgresoFuncionarios.length === 0 && (
            <div className="text-slate-400 text-center py-3">
              No hay registros en AUDITORIA PRE EGRESO en la base de datos actual.
            </div>
          )}
        </div>

        {/* Cards breakdown by funcionario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {summary.preEgresoFuncionarios.map((f) => (
            <div
              key={f.funcionarioingreso}
              className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">
                  Funcionario de Ingreso
                </div>
                <div className="font-extrabold text-xs text-slate-900 mt-1 leading-snug">
                  {f.funcionarioingreso}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Casos Auditados:</span>
                <span className="text-base font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {f.cantidad}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 3 DESTACADA: PRE APROBADO / APROBADO EGRESO POR        */}
      {/* FUNCIONARIO VALORACIÓN MÉDICA                                  */}
      {/* "enlistame los pre aprobado con los funcionariovaloracionmedica*/}
      {/*  diolmer andres mena romero --------------------- 5"           */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-b from-emerald-50/70 to-white rounded-2xl border-2 border-emerald-300 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" />
                REGLA SOLICITADA
              </span>
              <h3 className="text-base sm:text-lg font-black text-emerald-950">
                PRE APROBADOS / APROBADOS POR MÉDICO DE VALORACIÓN
              </h3>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              Enlistado de casos en <code className="font-mono bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-bold">APROBADO EGRESO</code> clasificados por el médico de valoración médica (<code className="font-mono bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-bold">funcionariovaloracionmedica</code>).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-700" />
              <input
                type="text"
                placeholder="Buscar médico..."
                value={searchValoracion}
                onChange={(e) => setSearchValoracion(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs font-medium text-slate-800 placeholder-emerald-600/60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyValoracionFormat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Copiar en formato: funcionariovaloracionmedica --------------------- cantidad"
            >
              {copiedValoracionText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedValoracionText ? '¡Copiado!' : 'Copiar Formato (--------------------- 5)'}</span>
            </button>
          </div>
        </div>

        {/* Dotted lines format display */}
        <div className="bg-slate-950 text-emerald-300 p-4 rounded-xl font-mono text-xs shadow-inner space-y-2 border border-emerald-900 overflow-x-auto">
          <div className="text-emerald-400/80 text-[11px] pb-1 border-b border-emerald-900/80 flex justify-between font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              MÉDICO / FUNCIONARIO VALORACIÓN MÉDICA (funcionariovaloracionmedica)
            </span>
            <span>CASOS PRE APROBADO / APROBADO EGRESO</span>
          </div>

          {filteredAprobadoValoracion.map((item) => (
            <div
              key={item.funcionariovaloracionmedica}
              className="flex items-center justify-between gap-3 hover:bg-emerald-950/70 p-1.5 rounded transition-colors"
            >
              <span className="text-emerald-100 font-bold whitespace-nowrap">
                {item.funcionariovaloracionmedica}
              </span>
              <span className="text-emerald-800 font-normal grow tracking-widest overflow-hidden select-none">
                ----------------------------------------------------------------------------------------------------
              </span>
              <span className="font-black whitespace-nowrap px-3 py-0.5 bg-emerald-500 text-slate-950 rounded font-mono text-sm shadow-xs">
                {item.cantidad}
              </span>
            </div>
          ))}

          {filteredAprobadoValoracion.length === 0 && (
            <div className="text-slate-400 text-center py-3">
              No se encontraron registros de médicos con pacientes en Aprobado Egreso.
            </div>
          )}
        </div>

        {/* Breakdown cards by Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredAprobadoValoracion.map((doc) => {
            const isExpanded = expandedDoctor === doc.funcionariovaloracionmedica;
            return (
              <div
                key={doc.funcionariovaloracionmedica}
                className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" />
                      Médico de Valoración
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                      {doc.cantidad} casos
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900 mt-1 leading-snug">
                    {doc.funcionariovaloracionmedica}
                  </div>

                  {/* Sedes distribution */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(doc.porSede).map(([sedeName, count]) => (
                      <span key={sedeName} className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded">
                        {sedeName}: <strong>{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setExpandedDoctor(isExpanded ? null : doc.funcionariovaloracionmedica)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Ocultar pacientes' : 'Ver pacientes'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Total: {doc.cantidad}
                  </span>
                </div>

                {/* Expanded Patient List */}
                {isExpanded && (
                  <div className="mt-3 pt-2 border-t border-emerald-100 space-y-1.5 max-h-48 overflow-y-auto">
                    {doc.registros.map((r) => (
                      <div key={r.id} className="text-[11px] bg-emerald-50/60 p-1.5 rounded border border-emerald-100">
                        <div className="font-bold text-slate-900">{r.paciente || 'Paciente sin nombre'}</div>
                        <div className="text-slate-500 flex justify-between text-[10px] mt-0.5">
                          <span>Doc: {r.identificacion || 'S/N'}</span>
                          <span className="font-semibold text-emerald-800">{r.sede}</span>
                        </div>
                        {r.diagnostico && (
                          <div className="text-[10px] text-slate-600 truncate mt-0.5">
                            Dx: {r.diagnostico}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 1: SEDE , URGENCIAS ESTADO -------------------- 20    */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                sede , urgenciasestado -------------------- 20
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Conteo por Sede y Estado de Urgencia
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cruce de variables <code className="font-mono text-slate-700 font-bold">sede</code> y{' '}
              <code className="font-mono text-slate-700 font-bold">urgenciasestado</code> (o urgenciaestado).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Sede */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Sede:</span>
              <select
                value={selectedSedeFilter}
                onChange={(e) => setSelectedSedeFilter(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              >
                <option value="TODAS">Todas las sedes</option>
                {summary.sedes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCopySedeFormat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              {copiedSedeText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSedeText ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Dotted lines format for Sede + Estado */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1.5 overflow-x-auto">
          <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-800 flex justify-between items-center font-sans">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-slate-300">SEDE , URGENCIAS ESTADO</span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-orange-950/80 text-orange-300 px-2 py-0.5 rounded border border-orange-800/70">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span>Pre Egreso</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Aprobado Egreso</span>
              </span>
            </div>
            <span className="font-semibold text-slate-300">CANTIDAD</span>
          </div>

          {filteredSedeEstadoStats.map((item, idx) => {
            const isPre = item.estado.includes('PRE EGRESO') || item.estado.includes('AUDITORIA PRE');
            const isAprobado = item.estado.includes('APROBADO EGRESO') || item.estado.includes('APROBADO');
            return (
              <div
                key={`${item.sede}-${item.estado}-${idx}`}
                className={`flex items-center justify-between gap-3 p-1 rounded transition-colors ${
                  isPre
                    ? 'bg-orange-950/80 text-orange-200 font-bold border border-orange-900/60'
                    : isAprobado
                    ? 'bg-emerald-950/80 text-emerald-200 font-bold border border-emerald-900/60'
                    : 'hover:bg-slate-800'
                }`}
              >
                <span className={`whitespace-nowrap font-bold ${
                  isPre ? 'text-orange-200' : isAprobado ? 'text-emerald-200' : 'text-slate-200'
                }`}>
                  {item.sede} , {item.estado}
                </span>
                <span className={`font-normal grow tracking-widest overflow-hidden select-none ${
                  isPre ? 'text-orange-900/80' : isAprobado ? 'text-emerald-900/80' : 'text-slate-700'
                }`}>
                  ----------------------------------------------------------------------------------------------------
                </span>
                <span className={`font-black whitespace-nowrap px-2.5 py-0.5 rounded font-mono shadow-2xs ${
                  isPre
                    ? 'bg-orange-500 text-white'
                    : isAprobado
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-blue-400'
                }`}>
                  {item.cantidad}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN 3: MATRIZ CONSOLIDADA ESTADOS VS SEDES                 */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Matriz Consolidada de Estados de Urgencias por Sede
            </h3>
            <p className="text-xs text-slate-500">
              Distribución integral de pacientes clasificados según su condición actual
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {summary.estados.length} estados
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">Estado de Urgencia</th>
                <th className="py-2.5 px-3 text-right bg-slate-100 text-slate-900 font-black border-x border-slate-200">
                  Total
                </th>
                {summary.sedes.map((s) => (
                  <th key={s} className="py-2.5 px-3 text-right font-semibold text-slate-700 min-w-[100px]">
                    Sede {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summary.estadoStats.map((item, idx) => {
                const isPre = item.estado.includes('PRE EGRESO') || item.estado.includes('AUDITORIA PRE');
                const isAprobado = item.estado.includes('APROBADO EGRESO') || item.estado.includes('APROBADO');
                return (
                  <tr
                    key={item.estado}
                    className={`hover:bg-slate-50 transition-colors ${
                      isPre ? 'bg-orange-50/60 font-semibold' : isAprobado ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium flex items-center gap-2">
                      <span>{item.estado}</span>
                      {isPre && (
                        <span className="text-[10px] bg-orange-200 text-orange-900 font-black px-1.5 py-0.5 rounded">
                          Auditoría Pre Egreso
                        </span>
                      )}
                      {isAprobado && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-1.5 py-0.5 rounded">
                          Aprobado Egreso
                        </span>
                      )}
                    </td>
                    <td className={`py-2 px-3 text-right font-black border-x font-mono text-sm ${
                      isPre
                        ? 'text-orange-950 bg-orange-100/70 border-orange-200'
                        : isAprobado
                        ? 'text-emerald-950 bg-emerald-100/70 border-emerald-200'
                        : 'text-slate-900 bg-slate-50 border-slate-200'
                    }`}>
                      {item.total}
                    </td>
                    {summary.sedes.map((s) => (
                      <td key={s} className="py-2 px-3 text-right font-mono text-slate-700">
                        {item.porSede[s] || 0}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Autorización de Seguridad (Código 8492) */}
      <SecurityCodeModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onSuccess={() => fileInputRef.current?.click()}
        targetTitle="Subir Reporte 203 de Urgencias"
        actionType="urgencias"
      />
    </div>
  );
};
