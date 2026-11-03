import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Flame,
  Brain,
  Scale,
  BookOpen,
  X,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import {
  SCIENTIFIC_WIN_EXPLANATIONS,
  SCIENTIFIC_LOSS_EXPLANATIONS,
} from '../data/researchData';

export interface ScientificFeedbackEvent {
  type: 'win' | 'loss';
  amount: number;
  gameTitle?: string;
}

interface ScientificFeedbackModalProps {
  event: ScientificFeedbackEvent | null;
  onClose: () => void;
  onOpenResearchPage: () => void;
}

export default function ScientificFeedbackModal({
  event,
  onClose,
  onOpenResearchPage,
}: ScientificFeedbackModalProps) {
  if (!event) return null;

  const isWin = event.type === 'win';
  const explanationList = isWin
    ? SCIENTIFIC_WIN_EXPLANATIONS
    : SCIENTIFIC_LOSS_EXPLANATIONS;

  // Pick an entry deterministically based on amount to maintain consistency per event
  const picked = explanationList[Math.abs(event.amount) % explanationList.length];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`relative z-10 w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white shadow-2xl border ${
            isWin
              ? 'bg-gradient-to-b from-[#221c10] via-[#16130b] to-[#0f0e08] border-amber-500/50'
              : 'bg-gradient-to-b from-[#251113] via-[#180a0c] to-[#100607] border-rose-500/50'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${
                  isWin
                    ? 'bg-amber-500 text-black shadow-amber-950/60'
                    : 'bg-rose-600 text-white shadow-rose-950/60'
                }`}
              >
                {isWin ? '⚠️' : '🛑'}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3
                    className={`text-sm sm:text-base font-black tracking-wide ${
                      isWin ? 'text-amber-300' : 'text-rose-400'
                    }`}
                  >
                    {isWin
                      ? 'KEMENANGAN SEMU (FALSE WIN)'
                      : 'REALITA SISTEM: BANDAR ALWAYS WINS'}
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {isWin
                    ? `Hasil Putaran: +${event.amount.toLocaleString()} Koin`
                    : `Hasil Putaran: -${Math.abs(event.amount).toLocaleString()} Koin`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Core Scientific Alert Box */}
          <div className="space-y-3 mb-4">
            <div
              className={`p-3.5 rounded-2xl border ${
                isWin
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                <Brain size={14} />
                <span>{picked.title}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {picked.explanation}
              </p>
            </div>

            {/* Academic Quote Box */}
            <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                <BookOpen size={11} className="text-amber-400" />
                <span>Kutipan Langsung dari Jurnal Penelitian:</span>
              </span>
              <p className="text-xs text-neutral-200 italic leading-snug">
                {picked.quote}
              </p>
              <div className="text-[11px] font-bold text-amber-400 text-right">
                — {picked.source}
              </div>
            </div>

            {/* Educational Reminder */}
            <div className="bg-[#121212] p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 leading-normal flex items-start gap-2">
              <Scale size={15} className="text-rose-400 shrink-0 mt-0.5" />
              <span>
                {isWin
                  ? 'Kemenangan ini adalah umpan psikologis. Statistik membuktikan bahwa pemain yang menang di awal memiliki kecenderungan lebih tinggi untuk kecanduan dan akhirnya bangkrut total.'
                  : 'Kekalahan bukanlah nasib buruk, melainkan konsekuensi logis dari Nilai Harapan Negatif (EV < 0) yang ditanamkan dalam kode permainan oleh pengembang/bandar.'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onClose();
                onOpenResearchPage();
              }}
              className="w-full sm:w-auto flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-yellow-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <BookOpen size={14} />
              <span>Pelajari 8 Jurnal Riset Selengkapnya</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs cursor-pointer transition-colors"
            >
              Saya Mengerti (Lanjut)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
