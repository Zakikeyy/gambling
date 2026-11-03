import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
  AlertTriangle,
  Scale,
  Brain,
  TrendingDown,
  Calculator,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Flame,
  Award,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  RESEARCH_JOURNALS,
  GAME_MATH_PROFILES,
  ResearchJournal,
} from '../data/researchData';

interface ResearchArchivePageProps {
  onBack: () => void;
}

export default function ResearchArchivePage({ onBack }: ResearchArchivePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeJournalModal, setActiveJournalModal] = useState<ResearchJournal | null>(null);

  // Law of Large Numbers Simulator State
  const [simGame, setSimGame] = useState<'roulette_us' | 'roulette_eu' | 'craps' | 'slots'>('roulette_us');
  const [simRounds, setSimRounds] = useState<number>(25);
  const [simBetSize, setSimBetSize] = useState<number>(20);
  const [simExecutionMode, setSimExecutionMode] = useState<'rounds' | 'until_ruin'>('rounds');
  const [ruinRound, setRuinRound] = useState<number | null>(null);
  const [theoreticalRoundsToRuin, setTheoreticalRoundsToRuin] = useState<number>(950);
  const [simResults, setSimResults] = useState<{ round: number; balance: number; expected: number }[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [maxBalanceReached, setMaxBalanceReached] = useState<number>(1000);

  // Martingale vs Betting Limit Simulator State
  const [martingaleTableLimitActive, setMartingaleTableLimitActive] = useState<boolean>(true);
  const [martingaleSteps, setMartingaleSteps] = useState<{
    round: number;
    bet: number;
    totalRisked: number;
    outcome: 'lose' | 'win' | 'blocked';
    note: string;
  }[]>([]);
  const [martingaleFinalResult, setMartingaleFinalResult] = useState<string | null>(null);
  const [isMartingaleSimulating, setIsMartingaleSimulating] = useState<boolean>(false);

  const handleRunMartingaleSim = () => {
    setIsMartingaleSimulating(true);
    let currentBet = 10;
    let totalRisked = 0;
    const history: {
      round: number;
      bet: number;
      totalRisked: number;
      outcome: 'lose' | 'win' | 'blocked';
      note: string;
    }[] = [];

    const tableLimit = 500;
    const winProb = 18 / 37; // Rolet Eropa (48.65%)

    for (let r = 1; r <= 10; r++) {
      if (martingaleTableLimitActive && currentBet > tableLimit) {
        history.push({
          round: r,
          bet: currentBet,
          totalRisked: totalRisked,
          outcome: 'blocked',
          note: `🛑 DITOLAK SISTEM: Taruhan ${currentBet} koin melebihi batas meja kasino (${tableLimit} koin)!`,
        });
        setMartingaleFinalResult(
          `💀 BANGKRUT MARTINGALE: Di ronde ke-${r}, Anda butuh pasang ${currentBet} koin, tapi sistem meja menolak karena batas maksimal ${tableLimit} koin. Seluruh ${totalRisked} koin taruhan sebelumnya hangus diserap bandar!`
        );
        break;
      }

      totalRisked += currentBet;
      const isWin = Math.random() < winProb;

      if (isWin) {
        history.push({
          round: r,
          bet: currentBet,
          totalRisked: totalRisked,
          outcome: 'win',
          note: `✅ Menang pada taruhan ${currentBet} koin! Net profit: +10 koin (setelah mempertaruhkan total ${totalRisked} koin).`,
        });
        setMartingaleFinalResult(
          `⚠️ Menang tipis (+10 koin)! Tetapi perhatikan rasio risikonya: Anda harus mempertaruhkan akumulasi ${totalRisked} koin hanya demi keuntungan receh 10 koin. Sekali saja terkena rentetan kalah 6x, modal ludes total.`
        );
        break;
      } else {
        history.push({
          round: r,
          bet: currentBet,
          totalRisked: totalRisked,
          outcome: 'lose',
          note: `Kalah! Akumulasi kerugian sementara: -${totalRisked} koin.`,
        });
        currentBet = currentBet * 2;
      }

      if (r === 10 && !martingaleTableLimitActive) {
        setMartingaleFinalResult(
          `🛑 Rentetan 10x Kalah Berturut-turut! Akumulasi taruhan mencapai ${totalRisked} koin. Pemain bermodal nyata pasti sudah bangkrut (Gambler's Ruin).`
        );
      }
    }

    setTimeout(() => {
      setMartingaleSteps(history);
      setIsMartingaleSimulating(false);
    }, 300);
  };

  const categories = ['Semua', 'Psikologi', 'Sosiologi', 'Matematika', 'Hukum', 'Ekonomi'];

  const filteredJournals = selectedCategory === 'Semua'
    ? RESEARCH_JOURNALS
    : RESEARCH_JOURNALS.filter((j) => j.category === selectedCategory);

  // Run Monte Carlo Law of Large Numbers & Gambler's Ruin simulation based on Yang (2026) paper
  const handleRunSimulation = (overrideMode?: 'rounds' | 'until_ruin') => {
    const mode = overrideMode || simExecutionMode;
    setSimExecutionMode(mode);
    setIsSimulating(true);

    let currentBal = 1000;
    const betSize = simBetSize;
    let peakBal = 1000;
    let bankruptAtRound: number | null = null;

    // Game math parameters
    let winProb = 0.4737; // American Roulette 18/38 (House edge 5.26%)
    let edge = 0.0526;
    if (simGame === 'roulette_eu') {
      winProb = 18 / 37; // 48.65% (House edge 2.70%)
      edge = 0.027;
    } else if (simGame === 'craps') {
      winProb = 244 / 495; // 49.29% (House edge 1.41%)
      edge = 0.0141;
    } else if (simGame === 'slots') {
      winProb = 0.35; // Slots (House edge 11.2%)
      edge = 0.112;
    }

    const theoreticalRuin = Math.round(1000 / (betSize * edge));
    setTheoreticalRoundsToRuin(theoreticalRuin);

    const maxIterations = mode === 'until_ruin' ? 25000 : simRounds;
    const rawSteps: { round: number; balance: number; expected: number }[] = [
      { round: 0, balance: 1000, expected: 1000 }
    ];

    for (let i = 1; i <= maxIterations; i++) {
      if (simGame === 'slots') {
        const rand = Math.random();
        if (rand < 0.005) {
          currentBal += betSize * 25; // rare jackpot
        } else if (rand < 0.05) {
          currentBal += betSize * 5;
        } else if (rand < 0.20) {
          currentBal += Math.round(betSize * 0.8);
        } else {
          currentBal = Math.max(0, currentBal - betSize);
        }
      } else {
        const isPlayerWin = Math.random() < winProb;
        if (isPlayerWin) {
          currentBal += betSize;
        } else {
          currentBal = Math.max(0, currentBal - betSize);
        }
      }

      if (currentBal > peakBal) {
        peakBal = currentBal;
      }

      const theoreticalEV = Math.max(0, Math.round(1000 - i * betSize * edge));
      rawSteps.push({ round: i, balance: currentBal, expected: theoreticalEV });

      if (currentBal <= 0) {
        bankruptAtRound = i;
        break;
      }
    }

    // Downsample raw steps to ~35 data points for a smooth and readable visual chart
    const history: { round: number; balance: number; expected: number }[] = [
      rawSteps[0]
    ];
    const sampleStep = Math.max(1, Math.floor((rawSteps.length - 1) / 35));
    for (let s = sampleStep; s < rawSteps.length - 1; s += sampleStep) {
      history.push(rawSteps[s]);
    }
    if (rawSteps.length > 1) {
      history.push(rawSteps[rawSteps.length - 1]);
    }

    setMaxBalanceReached(peakBal);
    setRuinRound(bankruptAtRound);

    setTimeout(() => {
      setSimResults(history);
      setIsSimulating(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md border-b border-[#242424] px-4 py-3 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white text-xs font-bold transition-all border border-[#333] cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Lobi</span>
            </button>
            <div className="h-5 w-px bg-neutral-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold">
                <BookOpen size={16} />
              </span>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white tracking-wide">
                  PUSAT KAJIAN RISET AKADEMIK #STOPJUDI
                </h1>
                <p className="text-[11px] text-neutral-400 hidden sm:block">
                  Bedah Ilmiah 8 Jurnal & Prosiding Resmi: Mengapa Secara Matematis Bandar Selalu Menang
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40">
              🛑 8 Jurnal & Prosiding Terverifikasi
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1412] via-[#121212] to-[#0d0d0d] border border-rose-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
              <Scale size={14} /> Bukti Ilmiah & Fakta Tak Terbantahkan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Anatomi Ilusi Perjudian: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-yellow-400">
                Kemenangan Semu vs Realita Sistem Bandar
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Berdasarkan 8 penelitian akademis lintas disiplin (Fisika Teori, Matematika Terapan,
              Psikologi Klinis, Sosiologi Kampus, Hukum Pidana, dan Ekonomi Perilaku), perjudian bukanlah permainan keberuntungan.
              Kemenangan sesaat sengaja diberikan oleh sistem sebagai <em>positive reinforcement</em> acak untuk memicu
              lonjakan hormon dopamin. Pada akhirnya, <strong>Hukum Bilangan Besar (Law of Large Numbers - Yang 2026; Arsanata 2024)</strong> dan
              <strong> Teorema Gambler's Ruin (Chen 2025)</strong> menjamin 100% modal pemain akan habis diserap oleh bandar.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#daftar-jurnal"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all"
              >
                Jelajahi 8 Jurnal Riset ↓
              </a>
              <a
                href="#simulasi-matematika"
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold text-xs transition-all"
              >
                Uji Simulasi Law of Large Numbers
              </a>
              <a
                href="#parrondo-ruin"
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold text-xs transition-all"
              >
                Parrondo's Paradox & Gambler's Ruin
              </a>
            </div>
          </div>
        </div>

        {/* 5-Stage Psychological Addiction Map */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-rose-400" />
              <h3 className="text-lg font-black text-white">
                Siklus Perangkap Psikologis Penjudi (Dopamine Loop)
              </h3>
            </div>
            <span className="text-xs text-neutral-400">Teori Operant & Kognitif</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="rounded-2xl bg-[#141414] border border-amber-500/30 p-4 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs font-bold text-amber-300">Umpan Menang Semu</h4>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Pemain diberi kemenangan di awal melalui <em>Variable Ratio Reinforcement</em> (Skinner 1953; Rijal 2026).
              </p>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-rose-500/30 p-4 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="text-xs font-bold text-rose-300">Lonjakan Dopamin</h4>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Otak melepaskan hormon dopamin menciptakan euforia adiktif & ilusi merasa mahir (Nadhifa 2024; Bey 2026).
              </p>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-neutral-700 p-4 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 font-black text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="text-xs font-bold text-white">Efek 'Hampir Menang'</h4>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Kekalahan tipis disalahartikan sebagai "hampir menang", bukan kekalahan (Subagyo & Astuti 2022).
              </p>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-red-500/40 p-4 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 font-black text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="text-xs font-bold text-red-400">Jebakan Loss Chasing</h4>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Mengejar kekalahan dengan taruhan lebih besar karena enggan menerima kerugian (Rijal et al. 2026).
              </p>
            </div>

            <div className="rounded-2xl bg-[#141414] border border-rose-600 p-4 space-y-2 relative">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                5
              </div>
              <h4 className="text-xs font-bold text-rose-400">Kebangkrutan Total</h4>
              <p className="text-[11px] text-neutral-400 leading-normal">
                Hukum bilangan besar bekerja; saldo habis, hutang menumpuk, dan stres kronis (Ghany 2014; Syahfitri 2025).
              </p>
            </div>
          </div>
        </section>

        {/* 8 Research Journals Section */}
        <section id="daftar-jurnal" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>📚 8 Jurnal & Prosiding Riset Ilmiah Terverifikasi</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Kajian lengkap bersumber dari artikel jurnal dan prosiding resmi yang diunggah dan dianalisis
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#2b2b2b]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJournals.map((journal) => (
              <motion.div
                key={journal.id}
                whileHover={{ y: -3 }}
                className="rounded-2xl bg-[#141414] border border-[#282828] hover:border-rose-500/40 p-5 space-y-3 flex flex-col justify-between transition-colors shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {journal.category} • {journal.year}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {journal.journalName}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white hover:text-rose-300 transition-colors leading-snug">
                    {journal.title}
                  </h4>

                  <p className="text-[11px] text-neutral-400 font-medium">
                    Penulis: <span className="text-neutral-300">{journal.authors}</span> ({journal.institution})
                  </p>

                  <p className="text-xs text-neutral-300 leading-relaxed bg-[#0d0d0d] p-3 rounded-xl border border-[#222]">
                    {journal.summary}
                  </p>

                  {/* Highlight Quote */}
                  <div className="bg-[#1a1112] border-l-2 border-rose-500 p-2.5 rounded-r-xl">
                    <p className="text-[11px] text-rose-200 italic leading-snug">
                      {journal.keyQuotes[0]}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222] flex items-center justify-between">
                  <button
                    onClick={() => setActiveJournalModal(journal)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Baca Analisis Lengkap</span>
                    <ChevronRight size={14} />
                  </button>

                  <a
                    href={journal.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white text-[11px] font-semibold border border-[#333] transition-colors"
                  >
                    <FileText size={12} className="text-rose-400" />
                    <span>Buka PDF Asli</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 10 Casino Games Mathematical Probability Table */}
        <section id="tabel-game" className="space-y-4 pt-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Calculator size={20} className="text-amber-400" />
              <span>Tabel Probabilitas & House Edge 10 Game Kasino</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Analisis matematis peluang menang, house edge bandar, dan perangkap psikologis berdasarkan riset
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#282828] bg-[#121212] shadow-xl">
            <table className="w-full text-left text-xs text-neutral-300 border-collapse">
              <thead className="bg-[#1a1a1a] text-neutral-200 border-b border-[#2d2d2d] uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3">Permainan</th>
                  <th className="py-3 px-3">Peluang Menang Pemain</th>
                  <th className="py-3 px-3 text-rose-400">Keuntungan Bandar (House Edge)</th>
                  <th className="py-3 px-3">Nilai Harapan (EV)</th>
                  <th className="py-3 px-3">Perangkap Psikologis Teridentifikasi</th>
                  <th className="py-3 px-3">Landasan Riset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {Object.values(GAME_MATH_PROFILES).map((game) => (
                  <tr key={game.gameId} className="hover:bg-[#181818] transition-colors">
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                      {game.gameTitle}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-300 whitespace-nowrap">
                      {game.winProbabilityText}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                      +{game.houseEdgePct}%
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-300 whitespace-nowrap">
                      {game.expectedValueText}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 text-[11px] min-w-[200px]">
                      {game.psychologicalTrap}
                    </td>
                    <td className="py-3 px-3 text-[10px] text-amber-300/90 whitespace-nowrap">
                      {game.journalCitation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deep Dive: Paper ke-8 Zishuo Yang (2026) - Parrondo's Paradox & Gambler's Ruin */}
        <section id="parrondo-ruin" className="space-y-4 pt-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#1a1215] via-[#121212] to-[#0a0a0a] border border-rose-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <Flame size={20} />
              <span className="text-base font-black text-white">
                Kajian Paper Baru: Zishuo Yang (2026) — Gambler's Ruin & Parrondo's Paradox
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-[#161616] p-4 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>1. Fluktuasi Jangka Pendek (Rounds 1–9)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Pada sampel kecil (n &lt; 50), variansi acak σ/√n mendominasi nilai harapan. Paper Yang (2026) membuktikan di Figure 1 bahwa dalam 9 putaran awal rolet, rata-rata pengembalian pemain mencapai <strong>+0.32</strong> (untung!). Inilah mengapa saldo sempat naik dan terasa "hoki", sebelum hukum probabilitas mengikisnya.
                </p>
              </div>

              <div className="rounded-2xl bg-[#161616] p-4 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <span>2. Teorema Gambler's Ruin (Chen 2025)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Dibuktikan secara rigor oleh Huygens (1657) dan disempurnakan oleh Chen (2025) di Universitas Shandong: pemain bermodal terbatas melawan kasino bermodal tak terhingga dijamin secara matematis <strong>PASTI bangkrut dengan probabilitas P(Ruin) = 100%</strong>. Median putaran hingga bangkrut di rolet adalah 1.847 putaran.
                </p>
              </div>

              <div className="rounded-2xl bg-[#161616] p-4 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>3. Parrondo's Paradox & Submartingale</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Membantah mitos bahwa menggabungkan dua taruhan yang kalah bisa menghasilkan kemenangan. Kerangka kerja Ethier &amp; Lee membuktikan seluruh permainan kasino adalah <em>strict submartingale</em>. Pola taruhan martingale atau pergantian strategi meja apapun tidak bisa membalikkan keunggulan bandar.
                </p>
              </div>

              <div className="rounded-2xl bg-[#161616] p-4 border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <span>4. Logika Batasan Taruhan (Betting Limits)</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Kasino memasang batas maksimum meja (Max Table Limit) sebagai <strong>perisai anti-Martingale</strong>. Ketika pemain menggandakan taruhan setelah kalah (10 &rarr; 20 &rarr; 40... &rarr; 640), sistem memblokir taruhan di atas batas (misal max 500 koin), melenyapkan seluruh uang pemain tanpa bisa membalikkan keadaan.
                </p>
              </div>
            </div>

            {/* Interactive Martingale vs Table Limit Simulator */}
            <div className="bg-[#121212] p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#252525]">
                <div>
                  <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                    <Scale size={16} />
                    <span>Laboratorium Interaktif: Uji Jebakan Martingale vs Batas Meja Kasino</span>
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Buktikan mengapa strategi penggandaan taruhan (Martingale) selalu berujung kehancuran pemain
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-[#333]">
                    <span className="text-neutral-400">Batas Meja (Max 500 Koin):</span>
                    <button
                      onClick={() => setMartingaleTableLimitActive(!martingaleTableLimitActive)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        martingaleTableLimitActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-800 text-neutral-200'
                      }`}
                    >
                      {martingaleTableLimitActive ? 'AKTIF (Kasino Nyata)' : 'NONAKTIF (Teori Khayal)'}
                    </button>
                  </div>

                  <button
                    onClick={handleRunMartingaleSim}
                    disabled={isMartingaleSimulating}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isMartingaleSimulating ? 'animate-spin' : ''} />
                    <span>Uji Siklus Martingale</span>
                  </button>
                </div>
              </div>

              {martingaleSteps.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {martingaleSteps.map((step) => (
                      <div
                        key={step.round}
                        className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                          step.outcome === 'win'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                            : step.outcome === 'blocked'
                            ? 'bg-red-950 border-red-500 text-red-200'
                            : 'bg-[#181818] border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                          <span>Ronde {step.round}</span>
                          <span className="font-bold">
                            {step.outcome === 'win' ? 'MENANG' : step.outcome === 'blocked' ? 'BLOKIR' : 'KALAH'}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-white">
                          Pasang: {step.bet}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-1">
                          Total Risiko: {step.totalRisked}
                        </div>
                      </div>
                    ))}
                  </div>

                  {martingaleFinalResult && (
                    <div className="p-3 rounded-xl bg-[#171214] border border-amber-500/30 text-xs text-neutral-200 leading-relaxed">
                      {martingaleFinalResult}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-neutral-500 italic bg-[#0f0f0f] rounded-xl border border-neutral-900">
                  Klik tombol <strong>"Uji Siklus Martingale"</strong> untuk melihat bagaimana sistem batas meja kasino memblokir strategi penggandaan saat terjadi rentetan kekalahan.
                </div>
              )}
            </div>

            <div className="bg-[#120f11] p-3.5 rounded-2xl border border-rose-500/20 text-xs text-neutral-300 flex items-center justify-between flex-wrap gap-2">
              <span className="text-neutral-400">
                Dokumen: <strong className="text-white">Yang, Zishuo (2026). The Mathematics Behind 'The House Always Wins'. CONF-MPCS 2026.</strong>
              </span>
              <a
                href="/assets/aistudio/The_Mathematics_Behind_The_House_Always_Wins_Law_o_ddb9dbf7.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                <Download size={13} />
                <span>Unduh PDF Makalah Asli</span>
              </a>
            </div>
          </div>
        </section>

        {/* Live Mathematical Simulator: Law of Large Numbers */}
        <section id="simulasi-matematika" className="space-y-4 pt-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#161616] via-[#121212] to-[#0c0c0c] border border-amber-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BarChart2 size={20} className="text-amber-400" />
                  <span>Laboratorium Interaktif: Uji Hukum Bilangan Besar & Gambler's Ruin</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Uji langsung teori Bernoulli (1713) &amp; Yang (2026): Lihat bagaimana variansi acak di putaran awal sempat menaikkan saldo, sebelum kemudian terhisap ke angka 0!
                </p>
              </div>

              {/* Game selection, Bet Sizing, and Round Selectors */}
              <div className="flex flex-col gap-3 w-full lg:w-auto">
                {/* Game Type */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-400">Pilih Game:</span>
                  <div className="flex flex-wrap bg-[#1a1a1a] rounded-xl p-1 border border-[#333]">
                    <button
                      onClick={() => setSimGame('roulette_us')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simGame === 'roulette_us' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Rolet Amerika (-5.26%)
                    </button>
                    <button
                      onClick={() => setSimGame('roulette_eu')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simGame === 'roulette_eu' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Rolet Eropa (-2.70%)
                    </button>
                    <button
                      onClick={() => setSimGame('craps')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simGame === 'craps' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Craps (-1.41%)
                    </button>
                    <button
                      onClick={() => setSimGame('slots')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simGame === 'slots' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Slots (-11.2%)
                    </button>
                  </div>
                </div>

                {/* Bet Size */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-400">Ukuran Taruhan:</span>
                  <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-xl border border-[#333]">
                    <button
                      onClick={() => setSimBetSize(20)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simBetSize === 20 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      20 Koin (50 Unit Modal)
                    </button>
                    <button
                      onClick={() => setSimBetSize(50)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simBetSize === 50 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      50 Koin (20 Unit Modal)
                    </button>
                    <button
                      onClick={() => setSimBetSize(100)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simBetSize === 100 ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      100 Koin (10 Unit Modal)
                    </button>
                  </div>
                </div>

                {/* Rounds & Execution Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-400">Putaran:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setSimRounds(25)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simExecutionMode === 'rounds' && simRounds === 25 ? 'bg-rose-600 text-white' : 'bg-[#222] text-neutral-400'
                      }`}
                      title="Uji Fluktuasi Jangka Pendek (n kecil)"
                    >
                      25 Ronde
                    </button>
                    <button
                      onClick={() => setSimRounds(100)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simExecutionMode === 'rounds' && simRounds === 100 ? 'bg-rose-600 text-white' : 'bg-[#222] text-neutral-400'
                      }`}
                    >
                      100 Ronde
                    </button>
                    <button
                      onClick={() => setSimRounds(1000)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simExecutionMode === 'rounds' && simRounds === 1000 ? 'bg-rose-600 text-white' : 'bg-[#222] text-neutral-400'
                      }`}
                    >
                      1.000 Ronde
                    </button>
                    <button
                      onClick={() => setSimRounds(5000)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simExecutionMode === 'rounds' && simRounds === 5000 ? 'bg-rose-600 text-white' : 'bg-[#222] text-neutral-400'
                      }`}
                    >
                      5.000 Ronde
                    </button>
                    <button
                      onClick={() => setSimRounds(10000)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        simExecutionMode === 'rounds' && simRounds === 10000 ? 'bg-rose-600 text-white' : 'bg-[#222] text-neutral-400'
                      }`}
                    >
                      10.000 Ronde
                    </button>

                    <button
                      onClick={() => handleRunSimulation('until_ruin')}
                      disabled={isSimulating}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        simExecutionMode === 'until_ruin'
                          ? 'bg-red-600 text-white ring-2 ring-red-400'
                          : 'bg-red-950/70 text-red-300 border border-red-700/60 hover:bg-red-900'
                      }`}
                      title="Simulasi otomatis sampai saldo tepat 0 koin (Teorema Gambler's Ruin)"
                    >
                      <span>💀 Uji Hingga Bangkrut (Run to 0)</span>
                    </button>

                    <button
                      onClick={() => handleRunSimulation('rounds')}
                      disabled={isSimulating}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isSimulating ? 'animate-spin' : ''} />
                      <span>Jalankan Simulasi</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {simResults.length > 0 ? (
              <div className="space-y-4 bg-[#0a0a0a] p-4 sm:p-5 rounded-2xl border border-[#222]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#141414] p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">Modal Awal & Taruhan:</span>
                    <strong className="text-white text-sm">1.000 Koin</strong>
                    <span className="text-[10px] text-neutral-400 block font-mono">({simBetSize} koin/bet)</span>
                  </div>
                  <div className="bg-[#141414] p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">Puncak Saldo Sempat Naik:</span>
                    <strong className={`text-sm ${maxBalanceReached > 1000 ? 'text-amber-300' : 'text-neutral-300'}`}>
                      {maxBalanceReached.toLocaleString()} Koin {maxBalanceReached > 1000 ? '(+)' : ''}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">Kemenangan Semu Sesaat</span>
                  </div>
                  <div className="bg-[#141414] p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">
                      {ruinRound !== null
                        ? 'Kebangkrutan Terjadi Pada:'
                        : `Saldo Akhir (${simResults[simResults.length - 1].round} Ronde):`}
                    </span>
                    <strong className={`text-sm ${simResults[simResults.length - 1].balance <= 0 ? 'text-rose-500' : 'text-white'}`}>
                      {simResults[simResults.length - 1].balance <= 0
                        ? `0 Koin (Ronde ke-${ruinRound?.toLocaleString()})`
                        : `${simResults[simResults.length - 1].balance.toLocaleString()} Koin`}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      Teori Ruin: ~{theoreticalRoundsToRuin.toLocaleString()} ronde
                    </span>
                  </div>
                  <div className="bg-[#141414] p-3 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">Status Teorema Ruin (Chen 2025):</span>
                    <strong className={`text-sm ${simResults[simResults.length - 1].balance <= 0 ? 'text-rose-400' : 'text-yellow-400'}`}>
                      {simResults[simResults.length - 1].balance <= 0 ? '💀 BANGKRUT TOTAL (0)' : '⚠️ Belum Habis (Slow Bleed)'}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">
                      {simResults[simResults.length - 1].balance <= 0 ? 'P(Ruin) = 1.0 Terbukti' : 'Sedang Menuju Garis Nol'}
                    </span>
                  </div>
                </div>

                {/* Visual Chart representation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Grafik Pergerakan Saldo (Kuning = Saldo Realistis, Merah = Bangkrut 0, Garis Putih = Garis Teori Nilai Harapan EV)</span>
                    <span className="font-mono text-[10px]">Sampling: {simResults.length} data point</span>
                  </div>

                  <div className="h-44 flex items-end gap-1 pt-6 pb-2 border-b border-[#262626] bg-[#0f0f0f] px-2 rounded-xl">
                    {simResults.map((item, idx) => {
                      const heightPct = Math.min(100, Math.max(4, (item.balance / Math.max(1200, maxBalanceReached)) * 90));
                      const isBankrupt = item.balance <= 0;
                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center group relative h-full justify-end"
                        >
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-t transition-all ${
                              isBankrupt
                                ? 'bg-rose-600'
                                : item.balance > 1000
                                ? 'bg-amber-400'
                                : 'bg-rose-500/80'
                            }`}
                          />
                          {/* Tooltip */}
                          <div className="absolute -top-9 hidden group-hover:block bg-black text-[10px] px-2 py-1 rounded border border-neutral-700 whitespace-nowrap z-20 font-mono shadow-lg">
                            Ronde {item.round} | Saldo: {item.balance} | EV Teori: {item.expected}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Deep-Dive Answer: European Roulette & Craps Illusion */}
                <div className="rounded-2xl bg-[#141214] border border-amber-500/40 p-4 sm:p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <AlertTriangle size={18} className="text-amber-400" />
                    <span>🎯 Analisis Ilmiah: Mengapa Rolet Eropa & Craps Terkesan 'Menjaga Angka'? Apakah Ada yang Salah?</span>
                  </div>

                  <p className="text-neutral-200 leading-relaxed">
                    <strong>TIDAK ADA YANG SALAH!</strong> Justru trial ini dengan sempurna membuktikan <strong>Teorema Kecepatan Pengikisan (Rate of Decay)</strong> dan <strong>Ilusi House Edge Rendah</strong> yang dipaparkan dalam riset Zishuo Yang (2026) dan pembuktian Chen (2025) di Universitas Shandong:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#1c1815] p-3 rounded-xl border border-amber-500/20 space-y-1.5">
                      <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <span>1. Perbedaan Laju Pengikisan (Rate of Decay)</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Dengan modal 1.000 koin dan bet 20 koin:
                        <br />• <strong>Craps (Edge 1.41%):</strong> Kerugian rata-rata hanya <strong>-0.28 koin/ronde</strong>. Pada 100 ronde, ekspektasi kerugian hanya 28 koin! Pada 1.000 ronde, hanya hilang 282 koin (sisa ~718 koin).
                        <br />• <strong>Rolet Eropa (Edge 2.70%):</strong> Kerugian rata-rata <strong>-0.54 koin/ronde</strong>. Pada 1.000 ronde, hanya hilang 540 koin (sisa ~460 koin).
                        <br />• <strong>Rolet Amerika (Edge 5.26%):</strong> Kerugian <strong>-1.05 koin/ronde</strong> $\to$ langsung habis sebelum ronde 1.000!
                      </p>
                    </div>

                    <div className="bg-[#1c1815] p-3 rounded-xl border border-rose-500/20 space-y-1.5">
                      <div className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                        <span>2. Variansi Acak Mengaburkan Kerugian</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        Standar deviasi kumulatif acak adalah σ = Bet × √N. Pada N=100 ronde, fluktuasi acak mencapai <strong>±200 koin</strong>.
                        Karena fluktuasi (±200 koin) jauh lebih besar daripada pengikisan Craps (-28 koin) atau Rolet Eropa (-54 koin), saldo pemain sangat sering masih di angka 900–1.200 koin. Inilah yang menciptakan <strong>ilusi psikologis bahwa saldo "terjaga"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#170e10] p-3 rounded-xl border border-red-500/30 text-[11px] text-neutral-300 space-y-1">
                    <strong className="text-red-400 block">
                      3. Teorema Gambler's Ruin: P(Bangkrut) Tetap 100% Mutlak!
                    </strong>
                    <p className="leading-relaxed">
                      Rumus rata-rata ronde menuju kebangkrutan adalah <strong>E[Rounds to Ruin] = Modal / (House Edge × Bet)</strong>:
                      <br />• <strong>Slots:</strong> Rata-rata bangkrut pada <strong>~446 ronde</strong>.
                      <br />• <strong>Rolet Amerika:</strong> Rata-rata bangkrut pada <strong>~950 ronde</strong>.
                      <br />• <strong>Rolet Eropa:</strong> Rata-rata bangkrut pada <strong>~1.852 ronde</strong> (Chen 2025: median 1.847 ronde).
                      <br />• <strong>Craps:</strong> Rata-rata bangkrut pada <strong>~3.546 ronde</strong>.
                    </p>
                    <p className="pt-1 text-amber-200">
                      <strong>💡 Kesimpulan Ilmiah:</strong> House edge rendah pada Craps dan Rolet Eropa BUKAN pelindung pemain. Kasino mendesainnya sebagai <em>"pembunuh berdarah dingin yang lambat (slow bleed)"</em> agar pemain betah bermain berjam-jam, hingga akhirnya saldo ditarik ke angka 0 tanpa bisa diselamatkan. Coba klik tombol <strong>"💀 Uji Hingga Bangkrut (Run to 0)"</strong> atau perbesar taruhan ke 50 atau 100 koin untuk membuktikannya langsung!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 text-xs bg-[#0c0c0c] rounded-2xl border border-[#222]">
                Pilih game, ukuran taruhan, dan jumlah ronde (atau klik <strong>"💀 Uji Hingga Bangkrut"</strong>), lalu klik <strong>"Jalankan Simulasi"</strong>.
              </div>
            )}
          </div>
        </section>

        {/* Legal Consequences Banner */}
        <div className="rounded-2xl bg-[#141414] border border-rose-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Payung Hukum di Indonesia: KUHP & UU ITE 2024</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Berdasarkan penelitian hukum <em>Kayla Ayesha Nadhifa et al. (2024)</em> dan <em>Subagyo & Astuti (2022)</em>:
          </p>
          <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Pasal 27 ayat (2) UU ITE jo. UU No. 1 Tahun 2024 & Pasal 45 ayat (3):</strong> Mengancam pidana penjara paling lama <strong>10 tahun</strong> dan/atau denda paling banyak <strong>Rp10 Miliar</strong> bagi pelaku dan fasilitator perjudian daring.
            </li>
            <li>
              <strong>Pasal 303 KUHP ayat (1)–(3):</strong> Mengancam pidana penjara paling lama <strong>10 tahun</strong> atau denda bagi siapa saja yang mengadakan atau memanfaatkan perjudian sebagai mata pencaharian.
            </li>
          </ul>
        </div>
      </main>

      {/* Modal Detail Jurnal */}
      {activeJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveJournalModal(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-2xl bg-[#161616] border border-rose-500/40 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2b2b]">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                {activeJournalModal.category} • Riset Akademik
              </span>
              <button
                onClick={() => setActiveJournalModal(null)}
                className="text-neutral-400 hover:text-white text-sm px-2 py-1 rounded-lg bg-[#222]"
              >
                ✕ Tutup
              </button>
            </div>

            <h3 className="text-lg font-black text-white leading-snug">
              {activeJournalModal.title}
            </h3>

            <div className="text-xs text-neutral-400 space-y-0.5">
              <div>Penulis: <strong className="text-neutral-200">{activeJournalModal.authors}</strong></div>
              <div>Institusi: <strong className="text-neutral-200">{activeJournalModal.institution}</strong></div>
              <div>Publikasi: <strong className="text-amber-400">{activeJournalModal.journalName} ({activeJournalModal.year})</strong></div>
            </div>

            <div className="space-y-2 bg-[#101010] p-4 rounded-2xl border border-[#242424]">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                Ringkasan Eksekutif Penelitian:
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {activeJournalModal.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Kutipan Penting dari Dokumen:
              </h4>
              <div className="space-y-2">
                {activeJournalModal.keyQuotes.map((quote, idx) => (
                  <div key={idx} className="bg-[#1a1415] border-l-2 border-rose-500 p-3 rounded-r-xl text-xs text-neutral-200 italic leading-relaxed">
                    {quote}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Poin Kunci & Relevansi Edukasi:
              </h4>
              <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                {activeJournalModal.scientificInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
              <a
                href={activeJournalModal.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-2 shadow"
              >
                <Download size={14} />
                <span>Buka / Unduh Dokumen PDF Asli</span>
              </a>

              <button
                onClick={() => setActiveJournalModal(null)}
                className="px-4 py-2 rounded-xl bg-[#262626] hover:bg-[#333] text-neutral-200 text-xs font-bold"
              >
                Kembali
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
