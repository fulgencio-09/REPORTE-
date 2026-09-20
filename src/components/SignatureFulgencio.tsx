import React, { useState } from 'react';
import { Upload, RotateCcw, Check, FileSignature } from 'lucide-react';

interface SignatureFulgencioProps {
  className?: string;
  allowUpload?: boolean;
}

export const SignatureFulgencio: React.FC<SignatureFulgencioProps> = ({
  className = '',
  allowUpload = true
}) => {
  const [customImage, setCustomImage] = useState<string | null>(() => {
    return localStorage.getItem('signature_fulgencio_img');
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomImage(dataUrl);
        try {
          localStorage.setItem('signature_fulgencio_img', dataUrl);
        } catch (err) {
          console.warn('Could not cache signature in localStorage', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImage(null);
    localStorage.removeItem('signature_fulgencio_img');
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {customImage ? (
        <div className="relative group">
          <img
            src={customImage}
            alt="Firma Ing. Fulgencio Quintero Brito"
            className="h-24 sm:h-28 w-auto object-contain mx-auto mix-blend-multiply"
          />
          {allowUpload && (
            <div className="absolute -top-2 -right-2 hidden group-hover:flex items-center gap-1 print:hidden bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-md border border-slate-200 text-[10px]">
              <label
                htmlFor="upload-firma-file"
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer px-1"
                title="Cambiar imagen de firma"
              >
                Cambiar
              </label>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-500 hover:text-red-600 cursor-pointer px-1"
                title="Restablecer a firma digitalizada"
              >
                Restablecer
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group">
          {/* SVG Vector Signature that faithfully replicates Mifirma.jpg */}
          <svg
            viewBox="0 0 380 200"
            className="w-56 sm:w-64 h-24 sm:h-28 mx-auto overflow-visible select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ink filter for realistic pen stroke */}
            <defs>
              <filter id="penInk" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="0.3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Main horizontal stroke crossing through signature */}
            <path
              d="M 38 108 L 345 106"
              stroke="#0f172a"
              strokeWidth="2.8"
              strokeLinecap="round"
              filter="url(#penInk)"
            />

            {/* Left hook and ascending loop */}
            <path
              d="M 45 125 C 38 128 42 136 52 134 C 62 132 68 120 74 105 C 84 82 105 46 122 36 C 132 30 138 36 134 52 C 126 84 104 150 94 186 C 90 198 94 195 98 184 C 112 146 122 108 136 84 C 146 66 162 62 168 78 C 172 94 158 114 142 116 C 126 118 120 102 130 88 C 142 72 168 76 186 92 C 198 102 212 112 222 98"
              stroke="#0f172a"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#penInk)"
            />

            {/* Right tall ascending loop and steep tail */}
            <path
              d="M 218 100 C 232 80 250 40 268 22 C 278 12 288 16 284 36 C 272 82 242 144 224 178 C 218 188 224 184 230 172 C 244 144 254 108 260 90"
              stroke="#0f172a"
              strokeWidth="2.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#penInk)"
            />

            {/* Central accent loop knot */}
            <path
              d="M 172 90 C 182 78 200 82 208 96 C 214 106 208 116 196 118 C 182 120 174 106 182 92"
              stroke="#0f172a"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#penInk)"
            />

            {/* Subtle start flourish */}
            <path
              d="M 40 120 C 35 124 38 132 46 130"
              stroke="#0f172a"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#penInk)"
            />
          </svg>

          {allowUpload && (
            <div className="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity print:hidden bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs border border-slate-200 text-[10px]">
              <label
                htmlFor="upload-firma-file"
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer inline-flex items-center gap-1"
                title="Cargar archivo Mifirma.jpg u otra foto"
              >
                <Upload className="w-3 h-3" />
                <span>Subir Mifirma.jpg</span>
              </label>
            </div>
          )}
        </div>
      )}

      {allowUpload && (
        <input
          id="upload-firma-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};
