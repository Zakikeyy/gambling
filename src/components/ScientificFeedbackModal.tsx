import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Scale, BookOpen, X } from 'lucide-react';
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
          className={`relative z-10 w-full max-w-md rounded-3xl p-5 text-white shadow-2xl border ${
            isWin
              ? 'bg-gradient-to-b from-[#221c10] via-[#16130b] to-[#0f0e08] border-amber-500/50'
              : 'bg-gradient-to-b from-[#251113] via-[#180a0c] to-[#100607] border-rose-500/50'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${
                  isWin
                    ? 'bg-amber-500 text-black shadow-amber-950/60'
                    : 'bg-rose-600 text-white shadow-rose-950/60'
                }`}
              >
                {isWin ? '⚠️' : '🛑'}
              </span>
              <div>
                <h3
                  className={`text-sm font-black tracking-wide ${
                    isWin ? 'text-amber-300' : 'text-rose-400'
                  }`}
                >
                  {isWin
                    ? 'KEMENANGAN SEMU (FALSE WIN)'
                    : 'REALITA SISTEM: BANDAR SELALU MENANG'}
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {isWin
                    ? `Hasil: +${event.amount.toLocaleString()} Koin`
                    : `Hasil: -${Math.abs(event.amount).toLocaleString()} Koin`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Clean Message Box without heavy journal quotes */}
          <div className="space-y-3 mb-4 text-xs">
            <div
              className={`p-3.5 rounded-2xl border ${
                isWin
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              <div className="font-bold mb-1 text-sm">{picked.title}</div>
              <p className="text-neutral-300 leading-relaxed">
                {picked.explanation}
              </p>
            </div>

            <div className="bg-[#121212] p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 leading-normal flex items-start gap-2">
              <Scale size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <span>
                {isWin
                  ? 'Kemenangan ini adalah umpan psikologis. Semakin sering bermain, hukum matematika memastikan bankroll akan terkuras habis.'
                  : 'Kekalahan ini adalah keniscayaan matematis dari Nilai Harapan Negatif (EV < 0). #StopJudi'}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onClose();
                onOpenResearchPage();
              }}
              className="text-[11px] underline text-amber-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <BookOpen size={12} />
              <span>Pelajari 8 Jurnal Riset</span>
            </button>
            <button
              onClick={onClose}
              className="py-1.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Lanjutkan
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
