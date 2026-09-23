import React, { useState } from 'react';
import {
  Building2,
  Filter,
  Check,
  CheckCheck,
  RotateCcw,
  Layers,
  Table as TableIcon,
  Copy,
  Check as CheckIcon,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { DashboardSummary } from '../types';

interface ConveniosSectionProps {
  summary: DashboardSummary;
  selectedConvenios: string[];
  onToggleConvenio: (conv: string) => void;
  onSelectAllConvenios: () => void;
  onSelectTop10Convenios: () => void;
  onSelectPredeterminados?: () => void;
  onClearConvenios: () => void;
  onSelectConvenioFilter?: (conv: string) => void;
}

export const ConveniosSection: React.FC<ConveniosSectionProps> = ({
  summary,
  selectedConvenios,
  onToggleConvenio,
  onSelectAllConvenios,
  onSelectTop10Convenios,
  onSelectPredeterminados,
  onClearConvenios,
  onSelectConvenioFilter
}) => {
  const [viewMode, setViewMode] = useState<'cuadros' | 'matriz'>('cuadros');
  const [copiedConvenio, setCopiedConvenio] = useState<string | null>(null);

  const copyCuadroText = (convenionombre: string, programas: { pym: string; finalizadas: number }[]) => {
    const lines = [
      `CONVENIO: ${convenionombre.toUpperCase()}`,
      `REGLA: SOLO CONSULTAS FINALIZADAS`,
      `------------------------------------------`,
      ...programas.map((p) => `${p.pym.padEnd(28, ' ')} ---------- ${p.finalizadas}`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedConvenio(convenionombre);
    setTimeout(() => setCopiedConvenio(null), 2000);
  };

  return (
    <div id="seccion-convenios" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-8">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-purple-700 text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Cuadros de Consultas por Convenio (Variable: convenionombre)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  TENER EN CUENTA SOLO LAS FINALIZADAS
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Desglose por programa (<code className="text-purple-900 font-mono font-bold">pym</code>) para cada convenio seleccionado. Permite seleccionar 10 o más convenios.
              </p>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cuadros')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cuadros'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cuadros por Convenio</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matriz')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matriz'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Matriz Comparativa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector Multi-Convenio (10 o más convenios) */}
      <div className="mt-4 p-4 bg-purple-50/60 rounded-xl border border-purple-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <span className="text-xs font-bold text-purple-950 flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-700" />
            Convenios seleccionados para generar cuadros: ({selectedConvenios.length} activos)
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {onSelectPredeterminados && (
              <button
                type="button"
                onClick={onSelectPredeterminados}
                className="text-xs font-black text-white bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded-lg shadow-2xs border border-purple-800 transition-colors cursor-pointer flex items-center gap-1"
                title="Seleccionar los 5 convenios predeterminados oficiales"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Predeterminados (5 Oficiales)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSelectTop10Convenios}
              className="text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-lg border border-purple-300 transition-colors cursor-pointer"
            >
              Tomar 10 Principales
            </button>
            <button
              type="button"
              onClick={onSelectAllConvenios}
              className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              Todos ({summary.todosConvenios.length})
            </button>
            <button
              type="button"
              onClick={onClearConvenios}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Convenios chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {summary.todosConvenios.map((conv) => {
            const isSelected = selectedConvenios.includes(conv);
            const convStat = summary.convenioStats.find((c) => c.convenionombre === conv);
            const isNuevaEps = conv.toUpperCase().includes('NUEVA EPS');
            return (
              <button
                key={conv}
                type="button"
                onClick={() => onToggleConvenio(conv)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? isNuevaEps
                      ? 'bg-purple-800 text-white shadow-xs ring-2 ring-purple-400'
                      : 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-purple-200" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
                <span>{conv}</span>
                {convStat && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-purple-900/80 text-purple-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {convStat.totalFinalizadas} fin.
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VISTA 1: CUADRO POR CADA CONVENIO (Requerimiento explícito: "realizame un cuadro por cada convenio variables convenio NUEVA EPS SUBSIDIADO PYM TENER EN CUENTA SOLO LAS FINALIZADAS pym ----------6") */}
      {viewMode === 'cuadros' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mostrando {summary.convenioCuadros.length} Cuadros Individuales de Convenios (Solo Finalizadas)
            </span>
            <span className="text-xs text-slate-500">
              Formato de consola: <code className="font-mono text-purple-900 font-bold">pym ---------- cantidad</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summary.convenioCuadros.map((cuadro) => {
              const isNuevaEpsSubsidiado = cuadro.convenionombre.toUpperCase().includes('NUEVA EPS SUBSIDIADO');
              const isCopied = copiedConvenio === cuadro.convenionombre;

              return (
                <div
                  key={cuadro.convenionombre}
                  className={`rounded-xl border overflow-hidden transition-all shadow-xs flex flex-col justify-between ${
                    isNuevaEpsSubsidiado
                      ? 'border-purple-400 ring-2 ring-purple-400/40 bg-white'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`p-4 border-b ${
                      isNuevaEpsSubsidiado
                        ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                            isNuevaEpsSubsidiado
                              ? 'bg-purple-800 text-purple-200 border border-purple-700'
                              : 'bg-purple-100 text-purple-900 border border-purple-200'
                          }`}
                        >
                          Convenio (variable: convenionombre)
                        </span>
                        <h4 className="font-extrabold text-sm leading-snug truncate">
                          {cuadro.convenionombre}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCuadroText(cuadro.convenionombre, cuadro.programas)}
                        className={`p-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                          isNuevaEpsSubsidiado
                            ? 'bg-purple-800/80 hover:bg-purple-700 text-purple-200'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="Copiar texto del cuadro"
                      >
                        {isCopied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-purple-800/40 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] opacity-80">SOLO FINALIZADAS:</span>
                        <span
                          className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                            isNuevaEpsSubsidiado ? 'bg-white text-purple-950' : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {cuadro.totalFinalizadas}
                        </span>
                      </div>
                      {cuadro.totalEnSala > 0 && (
                        <span className="text-[11px] font-mono text-amber-500 font-bold">
                          {cuadro.totalEnSala} en sala
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Formato de Líneas Punteadas Estilo Auditoría (ejemplo: pym ----------6) */}
                  <div className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs border-b border-slate-800">
                    <div className="text-[10px] text-slate-400 pb-1.5 mb-1.5 border-b border-slate-800 flex justify-between">
                      <span>VARIABLE: PYM</span>
                      <span>FINALIZADAS</span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {cuadro.programas.map((prog) => {
                        const isHighlight6 = prog.finalizadas === 6;
                        return (
                          <div
                            key={prog.pym}
                            className={`flex items-center justify-between py-0.5 px-1.5 rounded ${
                              isHighlight6 ? 'bg-purple-900/60 text-amber-300 font-bold' : 'hover:bg-slate-800/60'
                            }`}
                          >
                            <span className="truncate max-w-[170px] text-slate-200">
                              {prog.pym}
                            </span>
                            <span className="text-slate-500 select-none">----------</span>
                            <span
                              className={`font-black ml-1 ${
                                isHighlight6 ? 'text-amber-300 text-sm' : 'text-emerald-400'
                              }`}
                            >
                              {prog.finalizadas}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tabla con porcentajes */}
                  <div className="p-3 bg-slate-50/70">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-slate-500 font-bold border-b border-slate-200 uppercase">
                          <th className="pb-1.5">Programa PyM</th>
                          <th className="pb-1.5 text-right">Cant.</th>
                          <th className="pb-1.5 text-right">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cuadro.programas.slice(0, 4).map((prog) => (
                          <tr key={prog.pym} className="text-slate-700">
                            <td className="py-1 font-medium truncate max-w-[150px]">
                              {prog.pym}
                            </td>
                            <td className="py-1 text-right font-mono font-bold text-slate-900">
                              {prog.finalizadas}
                            </td>
                            <td className="py-1 text-right font-mono text-[11px] text-slate-500">
                              {prog.porcentaje.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {cuadro.programas.length > 4 && (
                      <span className="text-[11px] text-slate-400 block text-center mt-2">
                        +{cuadro.programas.length - 4} programas adicionales contabilizados
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: MATRIZ MULTI-CONVENIO (Cruza todos los convenios seleccionados con todos los PyM) */}
      {viewMode === 'matriz' && (
        <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              Matriz Comparativa de Programas vs Convenios Seleccionados ({selectedConvenios.length} convenios)
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SOLO CONSULTAS FINALIZADAS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Programa (variable: pym)</th>
                  <th className="py-2.5 px-3 text-right bg-purple-100/70 text-purple-950 font-black border-x border-purple-200">
                    Total Seleccionados
                  </th>
                  {selectedConvenios.map((conv) => (
                    <th key={conv} className="py-2.5 px-3 text-right font-semibold text-slate-800 min-w-[130px]">
                      {conv}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right text-slate-500">
                    Total General
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {summary.programaConvenioStats.map((item, idx) => {
                  const isCota =
                    item.pym.toLowerCase().includes('cota') ||
                    item.pym.toLowerCase().includes('morbilidad');

                  return (
                    <tr
                      key={item.pym}
                      className={`hover:bg-purple-50/30 transition-colors ${
                        isCota ? 'bg-purple-50/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-2">
                        <span>{item.pym}</span>
                        {isCota && (
                          <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                            Ejemplo Cota 900
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-purple-950 bg-purple-50/70 border-x border-purple-100 font-mono text-sm">
                        {item.totalPorConvenios}
                      </td>
                      {selectedConvenios.map((conv) => (
                        <td key={conv} className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                          {item.porConvenio[conv] || 0}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {item.totalGeneral}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
