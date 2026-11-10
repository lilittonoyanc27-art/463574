import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border-2 border-slate-300 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-200 shadow-xs">
          <AlertTriangle className="w-7 h-7 stroke-[2.4]" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            ¿Reiniciar todo el progreso?
          </h3>
          <p className="text-sm text-rose-700 font-armenian font-black">
            Վերագործարկե՞լ ողջ առաջընթացը։
          </p>
          <p className="text-sm text-slate-700 leading-relaxed font-medium pt-1">
            Se restablecerán todos los diálogos completados, puntuaciones guardadas y respuestas pendientes. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl border-2 border-slate-300 text-slate-800 font-bold text-sm sm:text-base hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sí, reiniciar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
