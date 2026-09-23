import React, { useState } from 'react';
import {
  X,
  Download,
  FileCode,
  FileSpreadsheet,
  ShieldCheck,
  Building2,
  Phone,
  FileSignature,
  Copy,
  Check as CheckIcon,
  Info,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { Urgencias203Summary } from '../types';
import { exportUrgenciasToExcel } from '../utils/urgenciasParser';
import { triggerPrintUrgenciasReport, downloadHtmlUrgenciasReport } from '../utils/urgenciasReportExporter';
import { SignatureFulgencio } from './SignatureFulgencio';

interface UrgenciasReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: Urgencias203Summary;
}

export const UrgenciasReportModal: React.FC<UrgenciasReportModalProps> = ({
  isOpen,
  onClose,
  summary
}) => {
  const [copiedSedeText, setCopiedSedeText] = useState(false);
  const [copiedPreEgresoText, setCopiedPreEgresoText] = useState(false);
  const [copiedValoracionText, setCopiedValoracionText] = useState(false);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const sedeLinesText = summary.sedeEstadoStats
    .map((item) => `${item.sede} , ${item.estado} -------------------- ${item.cantidad}`)
    .join('\n');

  const preEgresoLinesText = summary.preEgresoFuncionarios
    .map((item) => `${item.funcionarioingreso} ------------------ ${item.cantidad}`)
    .join('\n');

  const valoracionLinesText = summary.aprobadoValoracionMedica
    .map((item) => `${item.funcionariovaloracionmedica} --------------------- ${item.cantidad}`)
    .join('\n');

  const handleCopySede = () => {
    navigator.clipboard.writeText(sedeLinesText);
    setCopiedSedeText(true);
    setTimeout(() => setCopiedSedeText(false), 2000);
  };

  const handleCopyPreEgreso = () => {
    navigator.clipboard.writeText(preEgresoLinesText);
    setCopiedPreEgresoText(true);
    setTimeout(() => setCopiedPreEgresoText(false), 2000);
  };

  const handleCopyValoracion = () => {
    navigator.clipboard.writeText(valoracionLinesText);
    setCopiedValoracionText(true);
    setTimeout(() => setCopiedValoracionText(false), 2000);
  };

  const handleDownloadHtml = () => {
    const cachedImg = localStorage.getItem('signature_fulgencio_img');
    downloadHtmlUrgenciasReport(summary, cachedImg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-4 overflow-hidden print:border-none print:shadow-none print:my-0 print:max-w-none print:rounded-none">
        
        {/* Header Controls (Hidden in print) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-600 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-slate-900 leading-tight">
                  Hospital Santa Teresa de Jesús de Ávila
                </span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-950 px-2 py-0.5 rounded-full border border-orange-200">
                  Informe Urgencias - Reporte 203
                </span>
              </div>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Firmado: Ing. Fulgencio Quintero Brito | Firma Manual: Marcellis Oñate
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={triggerPrintUrgenciasReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
            >
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>Descargar HTML</span>
            </button>

            <button
              type="button"
              onClick={() => exportUrgenciasToExcel(summary)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div id="documento-urgencias-imprimible" className="p-6 sm:p-10 space-y-7 text-slate-800 bg-white">
          
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 text-white flex items-center justify-center font-black text-2xl shadow-sm border border-orange-500 shrink-0">
                  <Building2 className="w-7 h-7 text-orange-100" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight uppercase">
                    HOSPITAL SANTA TERESA DE JESÚS DE ÁVILA
                  </h1>
                  <div className="text-xs font-bold text-orange-700 mt-0.5">
                    DEPARTAMENTO DE SISTEMAS E INFORMACIÓN ASISTENCIAL
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    INFORME DE URGENCIAS - CONSOLIDADO REPORTE 203
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Responsable de Sistemas:</span>
                    <span>Ing. Fulgencio Quintero Brito</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-700 font-bold">Cel: </span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5 shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-none border-slate-200">
                <p>
                  <span className="font-semibold text-slate-800">Fecha de emisión:</span> {currentDate}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Total Casos Reporte 203:</span>{' '}
                  <strong className="text-slate-900">{summary.totalRegistros}</strong>
                </p>
                <p>
                  <span className="font-semibold text-orange-800">Auditoría Pre Egreso:</span>{' '}
                  <strong className="text-orange-950">{summary.totalPreEgreso} casos</strong>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="font-semibold text-emerald-800">Aprobado Egreso:</span>{' '}
                  <strong className="text-emerald-950">{summary.totalAprobadoEgreso} casos</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Quick KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
              <div className="text-[11px] font-bold text-blue-800 uppercase">Total Registros 203</div>
              <div className="text-2xl font-black text-blue-950 mt-0.5">{summary.totalRegistros}</div>
              <div className="text-[11px] text-blue-700">Atenciones en urgencias</div>
            </div>

            <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/60">
              <div className="text-[11px] font-bold text-orange-800 uppercase">Auditoría Pre Egreso</div>
              <div className="text-2xl font-black text-orange-950 mt-0.5">{summary.totalPreEgreso}</div>
              <div className="text-[11px] text-orange-700">Auditados por funcionario</div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">Aprobado Egreso</div>
              <div className="text-2xl font-black text-emerald-950 mt-0.5">{summary.totalAprobadoEgreso}</div>
              <div className="text-[11px] text-emerald-700">Salidas clínicas aprobadas</div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-700 uppercase">Sedes Monitoreadas</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{summary.sedes.length}</div>
              <div className="text-[11px] text-slate-500">{summary.sedes.join(', ')}</div>
            </div>
          </div>

          {/* Sección 1: Sede , urgenciasestado -------------------- 20 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span>1. Conteo por Sede y Estado de Urgencia</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                    sede , urgenciasestado -------------------- 20
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Relación exacta de pacientes por sede y estado asistencial en urgencias
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySede}
                className="print:hidden inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md border border-slate-300 transition-colors cursor-pointer"
              >
                {copiedSedeText ? <CheckIcon className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSedeText ? '¡Copiado!' : 'Copiar Formato'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1.5 overflow-x-auto">
              <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-800 flex justify-between items-center font-sans">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-semibold text-slate-300">SEDE , URGENCIAS ESTADO (urgenciasestado)</span>
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
              {summary.sedeEstadoStats.map((item, idx) => {
                const isPre = item.estado.includes('PRE EGRESO') || item.estado.includes('AUDITORIA PRE');
                const isAprobado = item.estado.includes('APROBADO EGRESO') || item.estado.includes('APROBADO');
                return (
                  <div
                    key={`${item.sede}-${item.estado}-${idx}`}
                    className={`flex items-center justify-between gap-2 py-0.5 px-1.5 rounded transition-colors ${
                      isPre
                        ? 'bg-orange-950/80 text-orange-300 font-bold border border-orange-900/60'
                        : isAprobado
                        ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-900/60'
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
                        ? 'bg-orange-600 text-white'
                        : isAprobado
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-blue-300'
                    }`}>
                      {item.cantidad}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sección 2: Auditoria Pre Egreso por funcionarioingreso */}
          <div className="space-y-3 pt-2 page-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-orange-200 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-orange-950 uppercase tracking-wide flex items-center gap-2">
                  <span>2. Auditoría PRE EGRESO por Funcionario de Ingreso</span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-orange-100 text-orange-900 rounded border border-orange-300">
                    funcionarioingreso ------------------ 2
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Cuando <code className="font-mono text-orange-900 font-bold">urgenciasestado = AUDITORIA PRE EGRESO</code>, se detalla el funcionario que realizó el ingreso
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyPreEgreso}
                className="print:hidden inline-flex items-center gap-1.5 text-xs font-bold text-orange-900 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-md border border-orange-300 transition-colors cursor-pointer"
              >
                {copiedPreEgresoText ? <CheckIcon className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPreEgresoText ? '¡Copiado!' : 'Copiar Formato'}</span>
              </button>
            </div>

            <div className="bg-amber-950 text-amber-200 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1.5 overflow-x-auto border border-amber-900">
              <div className="text-amber-400/80 text-[11px] pb-1 border-b border-amber-900 flex justify-between font-sans font-bold">
                <span>FUNCIONARIO DE INGRESO (funcionarioingreso)</span>
                <span>CASOS EN AUDITORIA PRE EGRESO</span>
              </div>
              {summary.preEgresoFuncionarios.map((item) => (
                <div
                  key={item.funcionarioingreso}
                  className="flex items-center justify-between gap-2 hover:bg-amber-900/40 transition-colors py-0.5 px-1 rounded"
                >
                  <span className="text-amber-100 font-bold whitespace-nowrap">
                    {item.funcionarioingreso}
                  </span>
                  <span className="text-amber-800 font-normal grow tracking-widest overflow-hidden select-none">
                    ----------------------------------------------------------------------------------------------------
                  </span>
                  <span className="font-black whitespace-nowrap px-2.5 py-0.5 bg-amber-400 text-amber-950 rounded font-mono text-sm">
                    {item.cantidad}
                  </span>
                </div>
              ))}
              {summary.preEgresoFuncionarios.length === 0 && (
                <div className="text-slate-400 py-2 text-center">No se encontraron casos en Auditoría Pre Egreso.</div>
              )}
            </div>
          </div>

          {/* Sección 3: Pre Aprobado / Aprobado Egreso por Médico de Valoración */}
          <div className="space-y-3 pt-2 page-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wide flex items-center gap-2">
                  <span>3. Pre Aprobados / Aprobados por Médico de Valoración</span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded border border-emerald-300">
                    funcionariovaloracionmedica --------------------- 5
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Pacientes en estado <code className="font-mono text-emerald-900 font-bold">APROBADO EGRESO</code> clasificados por el médico tratante o de valoración (<code className="font-mono text-emerald-900 font-bold">funcionariovaloracionmedica</code>)
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyValoracion}
                className="print:hidden inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-md border border-emerald-300 transition-colors cursor-pointer"
              >
                {copiedValoracionText ? <CheckIcon className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedValoracionText ? '¡Copiado!' : 'Copiar Formato (--------------------- 5)'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-emerald-200 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1.5 overflow-x-auto border border-emerald-900">
              <div className="text-emerald-400/80 text-[11px] pb-1 border-b border-emerald-900 flex justify-between font-sans font-bold">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  MÉDICO / FUNCIONARIO DE VALORACIÓN (funcionariovaloracionmedica)
                </span>
                <span>CASOS APROBADO EGRESO</span>
              </div>
              {summary.aprobadoValoracionMedica.map((item) => (
                <div
                  key={item.funcionariovaloracionmedica}
                  className="flex items-center justify-between gap-2 hover:bg-emerald-950/70 transition-colors py-0.5 px-1 rounded"
                >
                  <span className="text-emerald-100 font-bold whitespace-nowrap">
                    {item.funcionariovaloracionmedica}
                  </span>
                  <span className="text-emerald-800 font-normal grow tracking-widest overflow-hidden select-none">
                    ----------------------------------------------------------------------------------------------------
                  </span>
                  <span className="font-black whitespace-nowrap px-2.5 py-0.5 bg-emerald-500 text-slate-950 rounded font-mono text-sm">
                    {item.cantidad}
                  </span>
                </div>
              ))}
              {summary.aprobadoValoracionMedica.length === 0 && (
                <div className="text-slate-400 py-2 text-center">No se encontraron casos en Aprobado Egreso con médico asignado.</div>
              )}
            </div>
          </div>

          {/* Sección 4: Matriz Estados de Urgencia vs Sede */}
          <div className="space-y-3 pt-2 page-break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                4. Matriz Consolidada de Estados de Urgencia por Sede
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {summary.estados.length} estados clasificados
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Estado de Urgencia (urgenciaestado)</th>
                    <th className="py-2.5 px-3 text-right bg-slate-200 text-slate-950 font-black border-x border-slate-300">
                      Total General
                    </th>
                    {summary.sedes.map((s) => (
                      <th key={s} className="py-2.5 px-3 text-right font-semibold text-slate-700 min-w-[120px]">
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
                          isPre
                            ? 'bg-orange-50/70 font-bold text-orange-950'
                            : isAprobado
                            ? 'bg-emerald-50/70 font-bold text-emerald-950'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium flex items-center gap-2">
                          <span>{item.estado}</span>
                          {isPre && (
                            <span className="text-[10px] bg-orange-200 text-orange-950 font-black px-1.5 py-0.5 rounded">
                              Auditoría Prioritaria
                            </span>
                          )}
                          {isAprobado && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-1.5 py-0.5 rounded">
                              Aprobado Egreso
                            </span>
                          )}
                        </td>
                        <td className={`py-2 px-3 text-right font-black border-x font-mono text-sm ${
                          isPre
                            ? 'text-orange-950 bg-orange-100/60 border-orange-200'
                            : isAprobado
                            ? 'text-emerald-950 bg-emerald-100/60 border-emerald-200'
                            : 'text-slate-900 bg-slate-100/50 border-slate-200'
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

          {/* Sección 4: Firmas Oficiales */}
          <div className="pt-6 border-t-2 border-slate-900 space-y-5 page-break-inside-avoid">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Certificación de Urgencias: </span>
              El presente informe de urgencias (Reporte 203) ha sido consolidado por el Departamento de Sistemas del <strong>Hospital Santa Teresa de Jesús de Ávila</strong>, discriminando los casos según sede y estado, con auditoría especial sobre ingresos en fase de Pre Egreso.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Firma 1: Fulgencio Quintero Brito */}
              <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-b from-orange-50/30 to-white p-5 text-center shadow-xs flex flex-col justify-between relative">
                <div className="absolute top-3 right-3 print:hidden">
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200">
                    Firma Digitalizada
                  </span>
                </div>

                <div className="text-left mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded">
                    Elaboró y Certificó Sistemas
                  </span>
                </div>

                <div className="py-2 flex items-center justify-center min-h-[110px]">
                  <SignatureFulgencio allowUpload={true} />
                </div>

                <div className="border-t-2 border-slate-800 pt-3 mt-1">
                  <div className="font-black text-sm text-slate-950 uppercase tracking-tight">
                    ING. FULGENCIO QUINTERO BRITO
                  </div>
                  <div className="text-xs font-bold text-orange-700 mt-0.5">
                    Ingeniero de Sistemas
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-700 flex items-center justify-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Cel: </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">
                    Hospital Santa Teresa de Jesús de Ávila
                  </div>
                  <div className="mt-2.5 inline-block text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                    ✓ Firma Digital Verificada
                  </div>
                </div>
              </div>

              {/* Firma 2: Marcellis Oñate (Firma Manual) */}
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

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Informe de Urgencias Reporte 203 listo para <strong>PDF Oficial</strong>, <strong>HTML</strong> o <strong>Excel</strong>.
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
              onClick={triggerPrintUrgenciasReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
