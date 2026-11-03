import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, User, Copy, Check, ShieldAlert, Sparkles, AlertTriangle, BookOpen, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { loginWithToken, createNewAccountWithNickname, CasinoSaveData } from '../utils/storage';
import { sounds } from '../utils/audio';

interface TokenAuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (data: CasinoSaveData, isFirstTime: boolean) => void;
}

export default function TokenAuthModal({ isOpen, onLoginSuccess }: TokenAuthModalProps) {
  const [mode, setMode] = useState<'welcome' | 'signup' | 'signup_success' | 'login'>('welcome');
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [createdAccount, setCreatedAccount] = useState<CasinoSaveData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) {
      setErrorMsg('Silakan masukkan nama panggilan Anda.');
      return;
    }
    sounds.playChip();
    const newAcc = createNewAccountWithNickname(nicknameInput.trim());
    setCreatedAccount(newAcc);
    setMode('signup_success');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMsg('Silakan masukkan nomor token/seed key.');
      return;
    }
    const acc = loginWithToken(tokenInput.trim());
    if (acc) {
      sounds.playJackpot();
      onLoginSuccess(acc, false);
    } else {
      sounds.playBomb();
      setErrorMsg('Token tidak ditemukan atau salah. Periksa kembali nomor token Anda.');
    }
  };

  const handleCopyToken = () => {
    if (createdAccount) {
      navigator.clipboard.writeText(createdAccount.token);
      setCopied(true);
      sounds.playChip();
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-gradient-to-b from-[#1e1e1e] via-[#141414] to-[#0c0c0c] border border-amber-500/40 rounded-3xl p-6 text-white shadow-2xl overflow-hidden"
      >
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {mode === 'welcome' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-rose-950/60">
              🎰
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wider text-white">THE HOUSE WINS</h2>
              <p className="text-xs text-rose-400 font-bold mt-1">Simulasi Virtual Anti-Judi • Saldo Khusus R&D: 10.000 Koin</p>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed bg-[#1a1a1a] p-3 rounded-2xl border border-[#2a2a2a]">
              Aplikasi ini menggunakan sistem akun berbasis <strong>Token (Seed Key)</strong>. Buat akun baru untuk mendapatkan token unik Anda, atau masukkan token yang sudah ada untuk masuk.
            </p>

            {errorMsg && (
              <div className="text-xs bg-rose-950/50 border border-rose-500/50 text-rose-300 p-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setMode('signup');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
              >
                <UserPlus size={16} />
                <span>Buat Akun Baru (Dapatkan Token)</span>
              </button>

              <button
                onClick={() => {
                  setErrorMsg(null);
                  setMode('login');
                }}
                className="w-full py-3 px-4 bg-[#222] hover:bg-[#2c2c2c] text-neutral-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-[#333] transition-colors cursor-pointer"
              >
                <LogIn size={16} />
                <span>Login dengan Nomor Token</span>
              </button>
            </div>

            <div className="text-[10px] text-neutral-500 pt-2">
              🛑 Visi Misi: Membuktikan bahwa bandar selalu menang secara matematis. #StopJudi
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <span className="text-xl">👤</span>
                <h3 className="font-bold text-sm text-amber-300">Buat Akun Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Kembali
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium block">Nama Panggilan / Nickname:</label>
              <input
                type="text"
                placeholder="Contoh: Budi_R&D"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={25}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-semibold"
                autoFocus
              />
            </div>

            <div className="bg-[#161616] p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <span className="text-amber-400 font-bold block">💡 Info Saldo R&D:</span>
              <p>Akun baru akan otomatis mendapatkan modal riset sebesar <strong className="text-white font-mono">10.000 Koin</strong>.</p>
            </div>

            {errorMsg && (
              <div className="text-xs bg-rose-950/50 border border-rose-500/50 text-rose-300 p-2 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold rounded-xl text-xs shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              Generate Token & Buat Akun
            </button>
          </form>
        )}

        {mode === 'signup_success' && createdAccount && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-xl">
              ✨
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Akun Berhasil Dibuat!</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Simpan nomor token / seed key Anda untuk login kembali di masa mendatang.</p>
            </div>

            <div className="bg-[#121212] p-3.5 rounded-2xl border border-amber-500/40 space-y-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Nomor Token Akun Anda (Seed Key):</span>
              <div className="bg-black py-2 px-3 rounded-xl font-mono font-bold text-amber-300 text-sm tracking-wider border border-[#333] select-all">
                {createdAccount.token}
              </div>
              <button
                onClick={handleCopyToken}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#222] hover:bg-[#2c2c2c] text-neutral-200 border border-[#333]'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Token Berhasil Disalin ke Clipboard!' : 'Salin Token Akun'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                sounds.playJackpot();
                onLoginSuccess(createdAccount, true);
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-extrabold rounded-xl text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Mulai Simulasi (Saldo 10K Koin)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h3 className="font-bold text-sm text-amber-300">Login dengan Token</h3>
              </div>
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Kembali
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium block">Masukkan Nomor Token (Seed Key):</label>
              <input
                type="text"
                placeholder="ZK-XXXX-XXXX-XXXX-XXXX"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-amber-300 placeholder-neutral-600 font-mono font-bold focus:outline-none focus:border-amber-400 uppercase"
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="text-xs bg-rose-950/50 border border-rose-500/50 text-rose-300 p-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold rounded-xl text-xs shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              Masuk ke Akun
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
