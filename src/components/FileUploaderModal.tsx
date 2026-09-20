import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ColumnMapping, RawRecord, NormalizedConsultation } from '../types';
import { parseFileToRecords, mapRawToNormalized, downloadTemplate } from '../utils/dataParser';

interface FileUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (consultations: NormalizedConsultation[], fileName: string) => void;
}

export const FileUploaderModal: React.FC<FileUploaderModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRecords, setRawRecords] = useState<RawRecord[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    pym: '',
    mediconombre: '',
    estado_consulta: '',
    convenionombre: '',
    paciente: '',
    documento: '',
    fecha: '',
    hora: ''
  });
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    setLoading(true);
    setFile(selectedFile);

    try {
      const result = await parseFileToRecords(selectedFile);
      setHeaders(result.headers);
      setRawRecords(result.rawRecords);
      setMapping(result.mapping);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo.');
      setFile(null);
      setRawRecords([]);
      setHeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!mapping.pym || !mapping.mediconombre || !mapping.estado_consulta) {
      setError('Debes asociar las 3 variables principales: pym, mediconombre y estado_consulta.');
      return;
    }

    const normalized = mapRawToNormalized(rawRecords, mapping);
    onDataLoaded(normalized, file?.name || 'reporte_subido.xlsx');
    onClose();
  };

  const previewNormalized = rawRecords.length > 0 ? mapRawToNormalized(rawRecords.slice(0, 4), mapping) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 my-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white">
              <UploadCloud className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Subir Reporte de Consultas
              </h2>
              <p className="text-xs text-slate-500">
                Formatos compatibles: Excel (.xlsx, .xls) y CSV (.csv)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Download Template helper */}
          <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
            <div className="flex items-center gap-2 text-blue-900">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
              <span>¿No estás seguro de la estructura? Descarga el modelo sugerido.</span>
            </div>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Plantilla</span>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>

            {file ? (
              <div>
                <p className="text-sm font-bold text-slate-800">{file.name}</p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Archivo cargado correctamente: {rawRecords.length} registros detectados
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Haz clic o arrastra otro archivo para cambiarlo</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Arrastra tu archivo aquí o haz clic para seleccionarlo
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Reconoce automáticamente las columnas <code className="font-mono text-slate-700 bg-slate-200/80 px-1 py-0.5 rounded">pym</code>, <code className="font-mono text-slate-700 bg-slate-200/80 px-1 py-0.5 rounded">mediconombre</code> y <code className="font-mono text-slate-700 bg-slate-200/80 px-1 py-0.5 rounded">estado_consulta</code>.
                </p>
              </div>
            )}
          </div>

          {/* Loading status */}
          {loading && (
            <div className="text-center py-4 text-xs text-blue-600 font-medium animate-pulse">
              Leyendo y analizando archivo...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Column Association (if file loaded) */}
          {rawRecords.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Verificación y Mapeo de Variables
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Ajusta si tus encabezados tienen otros nombres
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* PyM Column */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Variable <code className="text-blue-700 font-mono">pym</code> *
                    </label>
                    <select
                      value={mapping.pym}
                      onChange={(e) => setMapping({ ...mapping, pym: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Médico Column */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Variable <code className="text-indigo-700 font-mono">mediconombre</code> *
                    </label>
                    <select
                      value={mapping.mediconombre}
                      onChange={(e) => setMapping({ ...mapping, mediconombre: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado Column */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Variable <code className="text-emerald-700 font-mono">estado_consulta</code> *
                    </label>
                    <select
                      value={mapping.estado_consulta}
                      onChange={(e) => setMapping({ ...mapping, estado_consulta: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Convenio Column */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Variable <code className="text-purple-700 font-mono">convenionombre</code>
                    </label>
                    <select
                      value={mapping.convenionombre || ''}
                      onChange={(e) => setMapping({ ...mapping, convenionombre: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="">-- Opcional / Auto --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1.5">
                  Vista Previa Normalizada (Primeros registros):
                </span>
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Programa (pym)</th>
                        <th className="py-2 px-2.5">Médico (mediconombre)</th>
                        <th className="py-2 px-2.5">Convenio (convenionombre)</th>
                        <th className="py-2 px-2.5">Estado Normalizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewNormalized.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2.5 font-medium text-slate-900">{r.pym}</td>
                          <td className="py-1.5 px-2.5 text-slate-700">{r.mediconombre}</td>
                          <td className="py-1.5 px-2.5 text-purple-700 font-medium">{r.convenionombre || 'Sin Convenio'}</td>
                          <td className="py-1.5 px-2.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.estado_consulta === 'FINALIZADA'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.estado_consulta === 'EN SALA'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {r.estado_consulta}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={rawRecords.length === 0 || !mapping.pym || !mapping.mediconombre || !mapping.estado_consulta}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <span>Cargar al Tablero</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
