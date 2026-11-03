import React, { useState } from 'react';
import { Calculator, ShieldAlert, BookOpen, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { GAME_MATH_PROFILES, GameMathProfile } from '../data/researchData';

interface GameScientificHeaderProps {
  gameId: string;
  onOpenResearchPage: () => void;
}

export default function GameScientificHeader({
  gameId,
  onOpenResearchPage,
}: GameScientificHeaderProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const profile: GameMathProfile = GAME_MATH_PROFILES[gameId] || {
    gameId,
    gameTitle: 'Permainan Kasino',
    winProbabilityText: 'P(Menang) < 45%',
    winProbabilityPct: 40,
    houseEdgePct: 5.0,
    expectedValueText: 'EV < 0',
    mechanism: 'Algoritma acak dengan margin keuntungan bandar.',
    psychologicalTrap: 'Pemain mengira probabilitas berpihak padanya.',
    journalCitation: 'Ghany (2014) & Arsanata et al. (2024)',
  };

  return (
    <div className="w-full bg-[#141414] border border-amber-500/30 rounded-2xl p-3 mb-4 text-xs shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
            <Calculator size={15} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                Probabilitas & House Edge: {profile.gameTitle}
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold">
                Berdasarkan 7 Riset Jurnal
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
              <span>Peluang Menang: <strong className="text-emerald-400">{profile.winProbabilityPct}%</strong></span>
              <span>Keuntungan Bandar: <strong className="text-rose-400">+{profile.houseEdgePct}%</strong></span>
              <span>Nilai Harapan: <strong className="text-amber-300">{profile.expectedValueText}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-neutral-300 hover:text-white text-[11px] font-semibold border border-[#333] transition-colors cursor-pointer"
          >
            <Info size={13} className="text-amber-400" />
            <span>{isExpanded ? 'Tutup Analisis' : 'Bedah Rumus Riset'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button
            onClick={onOpenResearchPage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white text-[11px] font-bold shadow transition-all cursor-pointer"
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">Halaman Riset Jurnal</span>
          </button>
        </div>
      </div>

      {/* Expanded Scientific Breakdown */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#262626] space-y-2 text-[11px] text-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#0e0e0e] p-2.5 rounded-xl border border-[#222]">
              <strong className="text-amber-300 block mb-1">Mekanisme Matematis:</strong>
              <p className="text-neutral-400 leading-normal">{profile.mechanism}</p>
            </div>
            <div className="bg-[#0e0e0e] p-2.5 rounded-xl border border-[#222]">
              <strong className="text-rose-400 block mb-1">Perangkap Psikologis Teridentifikasi:</strong>
              <p className="text-neutral-400 leading-normal">{profile.psychologicalTrap}</p>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 flex items-center justify-between pt-1">
            <span>Rujukan Penelitian: <strong className="text-amber-400">{profile.journalCitation}</strong></span>
            <span className="text-rose-400 font-semibold">🛑 Ingat: Bandar selalu memiliki keunggulan statistik jangka panjang.</span>
          </div>
        </div>
      )}
    </div>
  );
}
