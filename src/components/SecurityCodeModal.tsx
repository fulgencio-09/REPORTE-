import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, Check } from 'lucide-react';

interface SecurityCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetTitle?: string;
  actionType?: 'urgencias' | 'consultas';
}

const REQUIRED_CODE = '8492';

export const SecurityCodeModal: React.FC<SecurityCodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetTitle = 'Subir Archivo Asistencial',
  actionType = 'urgencias'
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setIsSuccess(false);
      // Autofocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = code.trim();
    if (trimmed === REQUIRED_CODE) {
      setError(null);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 250);
    } else {
      setError('Código incorrecto. Ingrese el código de acceso autorizado (8492).');
      setCode('');
      inputRef.current?.focus();
    }
  };

  const handleDigitClick = (digit: string) => {
    if (code.length < 6) {
      const newCode = code + digit;
      setCode(newCode);
      setError(null);
      if (newCode === REQUIRED_CODE) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 250);
      }
    }
  };

  const handleBackspace = () => {
    setCode((prev) => prev.slice(0, -1));
    setError(null);
  };

  const isUrgencias = actionType === 'urgencias';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isUrgencias ? 'bg-orange-50/80 border-orange-100' : 'bg-blue-50/80 border-blue-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs ${
              isUrgencias ? 'bg-orange-600' : 'bg-blue-600'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  SEGURIDAD INSTITUCIONAL
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                Código de Autorización Requerido
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Acción: <span className={isUrgencias ? 'text-orange-700 font-bold' : 'text-blue-700 font-bold'}>{targetTitle}</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Para subir o reemplazar los datos del hospital debe suministrar el código de seguridad <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1.5 py-0.5 rounded">8492</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="security-pin-input" className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                DIGITE EL CÓDIGO (8492)
              </label>
              <div className="relative">
                <input
                  id="security-pin-input"
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  placeholder="••••"
                  className={`w-full text-center text-2xl font-mono font-black tracking-[0.4em] py-3 px-4 rounded-xl border-2 bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white transition-all ${
                    error
                      ? 'border-red-400 ring-2 ring-red-100 bg-red-50/50'
                      : isSuccess
                      ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/50 text-emerald-800'
                      : 'border-slate-300 focus:border-slate-800'
                  }`}
                  autoComplete="off"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                <Check className="w-4 h-4 shrink-0 font-black text-emerald-600" />
                <span>Código verificado correctamente. Abriendo carga de archivo...</span>
              </div>
            )}

            {/* Quick numeric keypad for touch screens / mouse */}
            <div className="grid grid-cols-3 gap-2 pt-1 select-none">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitClick(digit)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCode('')}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl text-sm font-bold text-slate-800 transition-colors cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                ⌫
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={`w-1/2 py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isUrgencias ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Autorizar (8492)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
