import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Copy, Check, Users, AlertCircle } from 'lucide-react';
import { EnSalaStat } from '../types';

interface EnSalaSectionProps {
  enSalaStats: EnSalaStat[];
  totalEnSala: number;
  onSelectMedico?: (medico: string) => void;
}

export const EnSalaSection: React.FC<EnSalaSectionProps> = ({
  enSalaStats,
  totalEnSala,
  onSelectMedico
}) => {
  const [expandedMedico, setExpandedMedico] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleExpand = (mediconombre: string) => {
    setExpandedMedico(expandedMedico === mediconombre ? null : mediconombre);
  };

  const copyDottedFormat = () => {
    const lines = enSalaStats.map(
      (item) => `${item.mediconombre.toUpperCase()}  -EN SALA ----------------------- ${item.cantidad}`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="seccion-en-sala" className="bg-white rounded-xl border-2 border-amber-300 p-5 shadow-sm mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200">
        <div className="flex items-start gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
            <Clock className="w-6 h-6 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Profesionales con Consultas EN SALA
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-xs">
                {totalEnSala} TOTAL EN SALA
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Variables: <code className="text-amber-900 font-mono font-bold">estado_consulta = EN SALA</code>, agrupado por <code className="text-indigo-800 font-mono font-bold">mediconombre</code> y <code className="text-slate-900 font-mono font-bold">cantidad</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyDottedFormat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
            title="Copiar formato de texto tipo informe"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Formato'}</span>
          </button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {enSalaStats.length} médicos
          </span>
        </div>
      </div>

      {/* Cuadro Formato Informe Directo (ejemplo usuario: rodolfo hernandez  -EN SALA -----------------------34) */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs border border-slate-800 shadow-inner">
        <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 mb-2 border-b border-slate-800">
          <span className="font-sans font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Líneas de Monitoreo en Tiempo Real (Formato Solicitado)
          </span>
          <span className="text-[10px] text-slate-500">variable: mediconombre - estado_consulta (EN SALA) - cantidad</span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {enSalaStats.map((item) => (
            <div
              key={item.mediconombre}
              className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-white font-bold">{item.mediconombre}</span>
                <span className="text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded text-[11px]">
                  - EN SALA
                </span>
                <span className="text-slate-600 hidden sm:inline">-----------------------</span>
              </div>
              <span className="text-lg font-black text-amber-400 shrink-0 ml-2">
                {item.cantidad}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Doctors with patients in Sala */}
      {enSalaStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {enSalaStats.map((item) => {
            const isExpanded = expandedMedico === item.mediconombre;
            const isTopDoctor = item.cantidad >= 20;
            return (
              <div
                key={item.mediconombre}
                className={`rounded-xl border p-4 transition-all shadow-xs ${
                  isTopDoctor
                    ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                {/* Doctor card header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {item.mediconombre}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900">
                        EN SALA
                      </span>
                      {isTopDoctor && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Alta Demanda
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white font-black text-base shadow-xs">
                      <span>{item.cantidad}</span>
                      <span className="text-[10px] font-normal uppercase tracking-wider">
                        espera
                      </span>
                    </span>
                  </div>
                </div>

                {/* Patient preview or pill */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-600 mb-2 font-medium flex items-center justify-between">
                    <span>Pacientes en fila de espera:</span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.mediconombre)}
                      className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Ocultar' : `Ver ${item.cantidad} pacientes`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Summary list */}
                  <div className="space-y-1.5">
                    {item.consultas.slice(0, isExpanded ? item.consultas.length : 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between font-medium text-slate-800">
                          <span className="truncate max-w-[170px]">
                            {c.paciente || `Paciente ID: ${c.id}`}
                          </span>
                          {c.hora && (
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                              {c.hora}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="text-blue-700 font-semibold truncate max-w-[150px]">
                            {c.pym}
                          </span>
                          <span className="text-slate-600 font-mono text-[10px] truncate max-w-[110px]">
                            {c.convenionombre}
                          </span>
                        </div>
                      </div>
                    ))}

                    {!isExpanded && item.consultas.length > 3 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.mediconombre)}
                        className="w-full text-center py-1.5 text-[11px] text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer"
                      >
                        +{item.consultas.length - 3} pacientes más en espera...
                      </button>
                    )}
                  </div>
                </div>

                {onSelectMedico && (
                  <button
                    type="button"
                    onClick={() => onSelectMedico(item.mediconombre)}
                    className="w-full mt-3 py-1.5 px-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold transition-colors text-center cursor-pointer"
                  >
                    Filtrar consultas de {item.mediconombre.split(' ')[0]} {item.mediconombre.split(' ')[1] || ''}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center bg-amber-50/40 rounded-xl border border-dashed border-amber-200 mt-4">
          <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No hay consultas registradas en estado EN SALA</p>
          <p className="text-xs text-slate-500 mt-1">Todos los pacientes han sido atendidos o no se reportan esperas en este momento.</p>
        </div>
      )}
    </div>
  );
};
