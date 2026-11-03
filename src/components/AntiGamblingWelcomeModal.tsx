import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, BookOpen, AlertTriangle, Scale, HeartHandshake, X } from 'lucide-react';

interface AntiGamblingWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AntiGamblingWelcomeModal({ isOpen, onClose }: AntiGamblingWelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-gradient-to-b from-[#221013] via-[#160a0c] to-[#0f0607] border border-rose-500/50 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-950/60 font-black">
              🛑
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-wide">PERINGATAN & VISI MISI #StopJudi</h3>
              <p className="text-[11px] text-rose-400 font-semibold">The House Always Wins • Simulasi Edukasi Murni</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs leading-relaxed text-neutral-300">
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-rose-200">
            <strong className="text-white block mb-1 font-bold text-sm">Sistem Permainan Ini:</strong>
            Aplikasi ini dirancang sebagai simulator virtual transparan. Setiap game (Slot, Roulette, Blackjack, Mines, dll.) diatur secara matematis dengan <strong className="text-white">House Edge</strong> (keunggulan bandar) dan Nilai Harapan Negatif (<strong className="text-white">EV &lt; 0</strong>). Anda diberikan saldo awal 10.000 koin untuk keperluan riset & development (R&D) dan pembuktian ilmiah.
          </div>

          <div className="space-y-2 bg-[#141212] p-4 rounded-2xl border border-neutral-800">
            <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <BookOpen size={15} />
              <span>Visi & Misi Utama Kami:</span>
            </h4>
            <p>• <strong>Membuka Mata:</strong> Menunjukkan secara empiris bahwa tidak ada pemain di dunia yang dapat mengalahkan bandar dalam jangka panjang.</p>
            <p>• <strong>Ilusi Kemenangan Sesaat:</strong> Menjelaskan bahwa kemenangan kecil di awal permainan hanyalah umpan psikologis (<strong className="text-amber-300">False Win / Positive Reinforcement</strong>) yang dirancang agar pemain penasaran dan terus menghabiskan uangnya.</p>
            <p>• <strong>Realita Kebangkrutan:</strong> Mengingatkan bahwa hukum bilangan besar (<strong className="text-amber-300">Law of Large Numbers</strong>) dan limit taruhan akan selalu memastikan kekalahan total pemain.</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-rose-950/60 to-black rounded-2xl border border-rose-500/40 text-center space-y-2">
            <div className="text-sm font-black text-rose-300">Pesan Penting untuk Anda:</div>
            <p className="text-neutral-200 font-medium">
              Jangan pernah mempertaruhkan uang nyata, masa depan, dan kebahagiaan keluarga Anda pada perjudian dalam bentuk apapun. Bandar selalu menang.
            </p>
            <div className="text-amber-400 font-extrabold text-sm pt-1">
              Sayangi diri Anda dan masa depan Anda. #StopJudi
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer transition-all uppercase tracking-wider"
          >
            Saya Paham & Siap Melakukan Riset (Mulai)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
