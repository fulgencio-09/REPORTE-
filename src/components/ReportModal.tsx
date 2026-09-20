import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  ShieldCheck,
  Calendar,
  Building2,
  Check,
  Filter,
  ArrowRight,
  Info,
  Copy,
  Check as CheckIcon,
  Phone,
  UserCheck,
  FileSignature
} from 'lucide-react';
import { DashboardSummary } from '../types';
import { exportSummaryToExcel } from '../utils/dataParser';
import { SignatureFulgencio } from './SignatureFulgencio';
import { triggerPrintReport, downloadHtmlReport } from '../utils/reportExporter';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DashboardSummary;
  onUpdateSelectedConvenios: (convenios: string[]) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  summary,
  onUpdateSelectedConvenios
}) => {
  const [copiedSalaText, setCopiedSalaText] = useState(false);
  const [copiedCuadroName, setCopiedCuadroName] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const selectedConvenios = summary.selectedConvenios || [];

  // Toggle Convenio handler (soporta 10 o más convenios)
  const handleToggleConvenio = (conv: string) => {
    if (selectedConvenios.includes(conv)) {
      if (selectedConvenios.length <= 1) return;
      onUpdateSelectedConvenios(selectedConvenios.filter((c) => c !== conv));
    } else {
      onUpdateSelectedConvenios([...selectedConvenios, conv]);
    }
  };

  const handleSelectTop10 = () => {
    onUpdateSelectedConvenios(summary.todosConvenios.slice(0, 10));
  };

  const handleSelectAll = () => {
    onUpdateSelectedConvenios([...summary.todosConvenios]);
  };

  const handleClear = () => {
    if (summary.todosConvenios.length > 0) {
      onUpdateSelectedConvenios([summary.todosConvenios[0]]);
    }
  };

  // Generar texto para copiar consultas en sala
  const salaLinesText = summary.enSalaStats
    .map((item) => `${item.mediconombre.toUpperCase()}  -EN SALA ----------------------- ${item.cantidad}`)
    .join('\n');

  const handleCopySalaText = () => {
    navigator.clipboard.writeText(salaLinesText);
    setCopiedSalaText(true);
    setTimeout(() => setCopiedSalaText(false), 2000);
  };

  const handleCopyCuadroText = (convenio: string, programas: { pym: string; finalizadas: number }[]) => {
    const text = [
      `CONVENIO ${convenio.toUpperCase()}`,
      `TENER EN CUENTA SOLO LAS FINALIZADAS`,
      `------------------------------------------`,
      ...programas.map((p) => `${p.pym.padEnd(25, ' ')} ---------- ${p.finalizadas}`)
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedCuadroName(convenio);
    setTimeout(() => setCopiedCuadroName(null), 2000);
  };

  const handleDownloadPdf = () => {
    triggerPrintReport();
  };

  const handleDownloadHtml = () => {
    setIsDownloading(true);
    try {
      const cachedImg = localStorage.getItem('signature_fulgencio_img');
      downloadHtmlReport(summary, cachedImg);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  // Buscar programa Cota Morbilidad para destacar el ejemplo
  const cotaMorbilidadStat = summary.programaConvenioStats.find(
    (p) => p.pym.toLowerCase().includes('cota') || p.pym.toLowerCase().includes('morbilidad')
  );

  // Buscar Dr. Rodolfo Hernández para destacar el ejemplo
  const rodolfoFinalizadas = summary.medicoStats.find((m) =>
    m.mediconombre.toLowerCase().includes('rodolfo')
  );
  const rodolfoEnSala = summary.enSalaStats.find((m) =>
    m.mediconombre.toLowerCase().includes('rodolfo')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Report Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-4 overflow-hidden print:border-none print:shadow-none print:my-0 print:max-w-none print:rounded-none">
        
        {/* Top Action & Navigation Bar (Hidden when printing) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-700 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-slate-900 leading-tight">
                  Hospital Santa Teresa de Jesús de Ávila
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                  Informe Oficial Firmado
                </span>
              </div>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Firmado: Ing. Fulgencio Quintero Brito | Firma Manual: Marcellis Oñate
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Descargar PDF Button */}
            <button
              type="button"
              id="btn-descargar-informe-pdf"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-all active:scale-98"
              title="Descargar o imprimir el informe oficial en PDF"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

            {/* Descargar Archivo HTML completo */}
            <button
              type="button"
              id="btn-descargar-informe-html"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
              title="Descargar archivo .html autocontenido para abrir o enviar"
            >
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>Descargar HTML</span>
            </button>

            {/* Descargar Excel */}
            <button
              type="button"
              id="btn-descargar-informe-excel"
              onClick={() => exportSummaryToExcel(summary)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
              title="Exportar tablas y cruces a Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Excel</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Convenio Selector Tool Panel (Hidden when printing) */}
        <div className="px-6 py-3 bg-purple-50/70 border-b border-purple-100 flex flex-col gap-2.5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-700" />
                Convenios incluidos en el informe ({selectedConvenios.length} convenios):
              </span>
              <p className="text-[11px] text-purple-800">
                Puede seleccionar 10 o más convenios para que aparezcan sus cuadros individuales (solo finalizadas) y su matriz comparativa.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectTop10}
                className="text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-md border border-purple-300 transition-colors cursor-pointer"
              >
                10 Principales
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 transition-colors cursor-pointer"
              >
                Todos ({summary.todosConvenios.length})
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-slate-700 px-1.5 py-1 cursor-pointer"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {summary.todosConvenios.map((conv) => {
              const isSelected = selectedConvenios.includes(conv);
              return (
                <button
                  key={conv}
                  type="button"
                  onClick={() => handleToggleConvenio(conv)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-purple-200" />}
                  <span>{conv}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* DOCUMENTO IMPRIMIBLE / DESCARGABLE                             */}
        {/* ============================================================== */}
        <div id="documento-informe-imprimible" className="p-6 sm:p-10 space-y-7 text-slate-800 bg-white">
          
          {/* Official Letterhead Hospital Santa Teresa de Jesús de Ávila */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center font-black text-2xl shadow-sm border border-blue-800 shrink-0">
                  <Building2 className="w-7 h-7 text-blue-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight uppercase">
                      HOSPITAL SANTA TERESA DE JESÚS DE ÁVILA
                    </h1>
                  </div>
                  <div className="text-xs font-bold text-blue-900 mt-0.5">
                    DEPARTAMENTO DE SISTEMAS E INFORMACIÓN ASISTENCIAL
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    INFORME DE CONSULTAS MÉDICAS, EN SALA Y CUADROS POR CONVENIO
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Responsable de Sistemas:</span>
                    <span>Ing. Fulgencio Quintero Brito</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-700 font-bold">Cel: 3006774200</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-none border-slate-200">
                <p>
                  <span className="font-semibold text-slate-800">Fecha de emisión:</span> {currentDate}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Corte auditado:</span> Total {summary.totalRegistros} consultas
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Convenios en informe:</span>{' '}
                  <span className="font-bold text-purple-900">{selectedConvenios.length} convenios</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  Copia oficial para Coordinación Administrativa
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">Consultas Finalizadas</div>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">{summary.totalFinalizadas}</div>
              <div className="text-[11px] text-emerald-700">Total asistencial culminado</div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="text-[11px] font-bold text-amber-800 uppercase">Pacientes En Sala</div>
              <div className="text-2xl font-black text-amber-950 mt-0.5">{summary.totalEnSala}</div>
              <div className="text-[11px] text-amber-700">Espera activa en sala</div>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
              <div className="text-[11px] font-bold text-blue-800 uppercase">Programas (PyM)</div>
              <div className="text-2xl font-black text-blue-950 mt-0.5">{summary.totalPymUnicos}</div>
              <div className="text-[11px] text-blue-700">Con atenciones prestadas</div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60">
              <div className="text-[11px] font-bold text-purple-800 uppercase">Convenios Auditados</div>
              <div className="text-2xl font-black text-purple-950 mt-0.5">{selectedConvenios.length}</div>
              <div className="text-[11px] text-purple-700">Cuadros generados</div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN 1: PROFESIONALES CON CONSULTAS FINALIZADAS            */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span>1. PROFESIONALES CON CONSULTAS FINALIZADAS</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    estado_consulta = FINALIZADA
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Consolidado asistencial por profesional (ejemplo:{' '}
                  <strong className="text-slate-800 font-mono">
                    {rodolfoFinalizadas?.mediconombre || 'rodolfo hernandez'} ----- {rodolfoFinalizadas?.totalFinalizadas || 200}
                  </strong>)
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {summary.totalFinalizadas} finalizadas
              </span>
            </div>

            {/* Dotted Leader Lines */}
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1.5 overflow-x-auto">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800 flex justify-between font-sans">
                <span>FORMATO CONSOLIDADO (PROFESIONAL ──────── TOTAL FINALIZADAS)</span>
                <span>CANTIDAD</span>
              </div>
              {summary.medicoStats.map((item) => {
                const isRodolfo = item.mediconombre.toLowerCase().includes('rodolfo');
                return (
                  <div
                    key={item.mediconombre}
                    className={`flex items-center justify-between gap-2 hover:text-white transition-colors ${
                      isRodolfo ? 'text-amber-300 font-bold' : ''
                    }`}
                  >
                    <span className="text-slate-200 font-bold whitespace-nowrap">
                      {item.mediconombre}
                    </span>
                    <span className="text-slate-700 font-normal grow tracking-widest overflow-hidden select-none">
                      ----------------------------------------------------------------------------------------------------
                    </span>
                    <span className="text-emerald-400 font-extrabold whitespace-nowrap px-2 py-0.5 bg-slate-800 rounded">
                      {item.totalFinalizadas}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN 2: PROFESIONALES CON CONSULTAS EN SALA                */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
                  <span>2. PROFESIONALES CON CONSULTAS EN SALA</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                    estado_consulta = EN SALA
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Pacientes en espera activa asignados a cada profesional
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySalaText}
                  className="print:hidden inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md border border-amber-300 transition-colors cursor-pointer"
                >
                  {copiedSalaText ? <CheckIcon className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSalaText ? '¡Copiado!' : 'Copiar Líneas'}</span>
                </button>
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {summary.totalEnSala} en sala
                </span>
              </div>
            </div>

            {/* Dotted Format for En Sala */}
            <div className="bg-amber-950 text-amber-300 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1.5 overflow-x-auto border border-amber-800">
              <div className="text-amber-400/80 text-[11px] pb-1 border-b border-amber-900 flex justify-between font-sans font-bold">
                <span>LÍNEAS DE CONTROL EN SALA: PROFESIONAL - EN SALA ──────── CANTIDAD</span>
                <span>PACIENTES EN SALA</span>
              </div>
              {summary.enSalaStats.map((item) => {
                const isRodolfo = item.mediconombre.toLowerCase().includes('rodolfo');
                return (
                  <div
                    key={item.mediconombre}
                    className={`flex items-center justify-between gap-2 transition-colors py-0.5 px-1 rounded ${
                      isRodolfo ? 'bg-amber-900/80 ring-1 ring-amber-400/60' : 'hover:bg-amber-900/40'
                    }`}
                  >
                    <span className="text-amber-100 font-bold whitespace-nowrap">
                      {item.mediconombre.toUpperCase()}  -EN SALA
                    </span>
                    <span className="text-amber-800 font-normal grow tracking-widest overflow-hidden select-none">
                      ----------------------------------------------------------------------------------------------------
                    </span>
                    <span
                      className={`font-black whitespace-nowrap px-2.5 py-0.5 rounded font-mono ${
                        isRodolfo ? 'bg-amber-400 text-amber-950 text-sm' : 'bg-amber-900 text-amber-300'
                      }`}
                    >
                      {item.cantidad}
                    </span>
                  </div>
                );
              })}
              {summary.enSalaStats.length === 0 && (
                <div className="text-slate-400 py-2 text-center">No hay profesionales con consultas en sala de espera.</div>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN 3: CUADROS POR CADA CONVENIO (SOLO FINALIZADAS)       */}
          {/* ============================================================== */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-200 pb-2 gap-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-purple-950 uppercase tracking-wide flex items-center gap-2">
                  <span>3. CUADRO POR CADA CONVENIO (VARIABLE: convenionombre)</span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                    TENER EN CUENTA SOLO LAS FINALIZADAS
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Desglose individual por programa (<code className="font-mono text-purple-900 font-bold">pym</code>) para cada convenio seleccionado
                </p>
              </div>
              <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                {summary.convenioCuadros.length} cuadros generados
              </span>
            </div>

            {/* Grid of Individual Cuadros per Convenio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.convenioCuadros.map((cuadro) => {
                const isNuevaEps = cuadro.convenionombre.toUpperCase().includes('NUEVA EPS');
                const isCopied = copiedCuadroName === cuadro.convenionombre;

                return (
                  <div
                    key={cuadro.convenionombre}
                    className={`rounded-xl border overflow-hidden p-4 flex flex-col justify-between page-break-inside-avoid ${
                      isNuevaEps
                        ? 'border-purple-300 bg-purple-50/30 ring-1 ring-purple-400'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      {/* Cuadro Header */}
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                              Convenio
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              SOLO FINALIZADAS
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                            {cuadro.convenionombre}
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCuadroText(cuadro.convenionombre, cuadro.programas)}
                          className="print:hidden p-1 rounded-md text-slate-400 hover:text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                          title="Copiar texto del cuadro"
                        >
                          {isCopied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Format Leader Lines for Cuadro (pym ---------- 6) */}
                      <div className="mt-2.5 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs space-y-1">
                        <div className="text-[10px] text-slate-400 pb-1 border-b border-slate-800 flex justify-between font-sans">
                          <span>VARIABLE PYM</span>
                          <span>FINALIZADAS</span>
                        </div>
                        {cuadro.programas.map((prog) => {
                          const is6 = prog.finalizadas === 6;
                          return (
                            <div
                              key={prog.pym}
                              className={`flex items-center justify-between py-0.5 px-1 rounded ${
                                is6 ? 'bg-purple-900/70 text-amber-300 font-bold' : 'hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate max-w-[200px] text-slate-200">
                                {prog.pym}
                              </span>
                              <span className="text-slate-600 select-none">----------</span>
                              <span className={`font-black ml-1 ${is6 ? 'text-amber-300' : 'text-emerald-400'}`}>
                                {prog.finalizadas}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Finalizadas en Convenio:</span>
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {cuadro.totalFinalizadas}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN 4: MATRIZ DE PROGRAMAS (PYM) VS CONVENIOS AUDITADOS   */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2 page-break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span>4. MATRIZ CONSOLIDADA: PROGRAMAS VS CONVENIOS (SOLO FINALIZADAS)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Cruce de variables <code className="font-mono text-purple-900 font-bold">pym</code> y <code className="font-mono text-purple-900 font-bold">convenionombre</code> (ejemplo:{' '}
                  <strong className="text-slate-800 font-mono">
                    {cotaMorbilidadStat?.pym || 'cota morbilidad'} ------------- {cotaMorbilidadStat?.totalPorConvenios || 900}
                  </strong>)
                </p>
              </div>
              <span className="text-[11px] font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                {selectedConvenios.length} convenios en columnas
              </span>
            </div>

            {/* Matrix Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Programa (variable: pym)</th>
                    <th className="py-2.5 px-3 text-right bg-purple-100 text-purple-950 font-black border-x border-purple-200">
                      Total Seleccionados
                    </th>
                    {selectedConvenios.map((conv) => (
                      <th key={conv} className="py-2.5 px-3 text-right font-semibold text-slate-700 min-w-[120px]">
                        {conv}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right text-slate-500">
                      Total General
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {summary.programaConvenioStats.map((item, idx) => {
                    const isCota =
                      item.pym.toLowerCase().includes('cota') ||
                      item.pym.toLowerCase().includes('morbilidad');

                    return (
                      <tr
                        key={item.pym}
                        className={`hover:bg-slate-50 transition-colors ${
                          isCota ? 'bg-purple-50/50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-slate-900 flex items-center gap-2">
                          <span>{item.pym}</span>
                          {isCota && (
                            <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                              Ejemplo Solicitado
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-extrabold text-purple-950 bg-purple-50/60 border-x border-purple-100 font-mono text-sm">
                          {item.totalPorConvenios}
                        </td>
                        {selectedConvenios.map((conv) => (
                          <td key={conv} className="py-2 px-3 text-right font-mono text-slate-700">
                            {item.porConvenio[conv] || 0}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right font-mono text-slate-400">
                          {item.totalGeneral}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN 5: FIRMAS OFICIALES                                    */}
          {/* 1. Ing. Fulgencio Quintero Brito (Firma Digitalizada Mifirma)  */}
          {/* 2. Marcellis Oñate (Firma Manual para radicación)              */}
          {/* ============================================================== */}
          <div className="pt-6 border-t-2 border-slate-900 space-y-5 page-break-inside-avoid">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Certificación Institucional: </span>
              El presente informe ha sido extraído y procesado mediante los algoritmos del Departamento de Sistemas del <strong>Hospital Santa Teresa de Jesús de Ávila</strong>, certificando que los datos aquí consolidados corresponden a la información de la base asistencial en los periodos auditados.
            </div>

            {/* Formal Signatures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* FIRMA 1: INGENIERO DE SISTEMAS FULGENCIO QUINTERO BRITO */}
              <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/30 to-white p-5 text-center shadow-xs flex flex-col justify-between relative">
                <div className="absolute top-3 right-3 print:hidden">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                    Firma Digitalizada
                  </span>
                </div>

                <div className="text-left mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                    Elaboró y Certificó Sistemas
                  </span>
                </div>

                {/* Signature Component with Vector / Upload support */}
                <div className="py-2 flex items-center justify-center min-h-[110px]">
                  <SignatureFulgencio allowUpload={true} />
                </div>

                <div className="border-t-2 border-slate-800 pt-3 mt-1">
                  <div className="font-black text-sm text-slate-950 uppercase tracking-tight">
                    ING. FULGENCIO QUINTERO BRITO
                  </div>
                  <div className="text-xs font-bold text-blue-700 mt-0.5">
                    Ingeniero de Sistemas
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-700 flex items-center justify-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Cel: 3006774200</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Hospital Santa Teresa de Jesús de Ávila
                  </div>
                  <div className="mt-2.5 inline-block text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                    ✓ Firma Digital Verificada
                  </div>
                </div>
              </div>

              {/* FIRMA 2: MARCELLIS OÑATE - COORDINACIÓN ADMINISTRATIVA (FIRMA MANUAL) */}
              <div className="rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-50/40 to-white p-5 text-center shadow-xs flex flex-col justify-between relative">
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    Firma Manual
                  </span>
                </div>

                <div className="text-left mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Revisó y Aprobó Administrativa
                  </span>
                </div>

                {/* Box for manual handwriting signature */}
                <div className="py-2 min-h-[110px] flex items-center justify-center">
                  <div className="w-full max-w-[280px] h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-2 bg-white/70">
                    <FileSignature className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500 font-medium italic text-center">
                      Espacio para Firma Manual y Rúbrica
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (Marcellis Oñate firma a mano alzada)
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-slate-800 pt-3 mt-1">
                  <div className="font-black text-sm text-slate-950 uppercase tracking-tight">
                    MARCELLIS OÑATE
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    Coordinación Administrativa
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Hospital Santa Teresa de Jesús de Ávila
                  </div>
                  <div className="mt-2.5 inline-block text-[10px] bg-amber-50 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                    Firma Manual al Imprimir / Radicar
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer Controls (Hidden when printing) */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Descargue el informe en <strong>PDF Oficial</strong>, en <strong>HTML Completo</strong> o en <strong>Excel</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-purple-700" />
              <span>Descargar HTML</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
