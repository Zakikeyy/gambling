/**
 * LocalStorage persistence, Game Win Tracking, Daily Claim System, and Token/Seed Key Accounts
 */

export interface BetHistoryItem {
  id: string;
  gameName: string;
  amount: number;
  timestamp: number;
  isWin: boolean;
}

export interface CasinoStats {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  gameWins: {
    mines: number;
    slots: number;
    blackjack: number;
    roulette: number;
    baccarat: number;
    craps: number;
    scratch: number;
    horses: number;
    wheel: number;
    plinko: number;
  };
}

export interface CasinoSaveData {
  token: string;
  balance: number;
  nickname: string;
  lastClaimDate: string | null;
  soundEnabled: boolean;
  isAdmin: boolean;
  stats: CasinoStats;
  history: BetHistoryItem[];
}

const ACTIVE_TOKEN_KEY = 'zakikey_active_token';
const ACCOUNTS_REGISTRY_KEY = 'zakikey_accounts_registry_v1';

// Designated Admin / GM Seed Keys
export const ADMIN_SEED_KEYS = [
  'ZK-W69L-D8XN-SRBK-B5SX',
  'ZK-ADMIN-7777-9999-XXXX',
  'ZK-ZAKI-KEY1-9999-ADMIN',
];

export const generateSeedToken = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = 'ZK';
  for (let i = 0; i < 4; i++) {
    token += '-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  return token;
};

export const getTodayDateStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
};

export const checkIsClaimableToday = (lastClaimDate: string | null): boolean => {
  if (!lastClaimDate) return true;
  return lastClaimDate !== getTodayDateStr();
};

export const getDefaultGameWins = () => ({
  mines: 0,
  slots: 0,
  blackjack: 0,
  roulette: 0,
  baccarat: 0,
  craps: 0,
  scratch: 0,
  horses: 0,
  wheel: 0,
  plinko: 0,
});

export const getDefaultCasinoData = (customNickname = 'Pemain 1', customToken?: string): CasinoSaveData => {
  const token = customToken || generateSeedToken();
  const isAdmin = ADMIN_SEED_KEYS.includes(token);

  return {
    token,
    balance: 5000, // 5k starting coins requested
    nickname: customNickname,
    lastClaimDate: null,
    soundEnabled: true,
    isAdmin,
    stats: {
      totalBets: 0,
      totalWins: 0,
      totalLosses: 0,
      biggestWin: 0,
      gameWins: getDefaultGameWins(),
    },
    history: [],
  };
};

export const loadAccountsRegistry = (): Record<string, CasinoSaveData> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
    if (!raw) {
      // Pre-register Admin seed keys so they work out of the box
      const initialRegistry: Record<string, CasinoSaveData> = {};
      ADMIN_SEED_KEYS.forEach((adminToken, idx) => {
        initialRegistry[adminToken] = getDefaultCasinoData(`Admin GM ${idx + 1}`, adminToken);
      });
      localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(initialRegistry));
      return initialRegistry;
    }
    const registry = JSON.parse(raw);
    // Ensure admin keys exist in registry
    ADMIN_SEED_KEYS.forEach((adminToken) => {
      if (!registry[adminToken]) {
        registry[adminToken] = getDefaultCasinoData('Admin GM', adminToken);
      }
    });
    return registry;
  } catch {
    return {};
  }
};

export const saveAccountsRegistry = (registry: Record<string, CasinoSaveData>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(registry));
  } catch {}
};

export const loadCasinoData = (): { data: CasinoSaveData; isNewAccount: boolean } => {
  if (typeof window === 'undefined') {
    return { data: getDefaultCasinoData(), isNewAccount: true };
  }

  try {
    const registry = loadAccountsRegistry();
    let activeToken = localStorage.getItem(ACTIVE_TOKEN_KEY);

    if (activeToken && registry[activeToken]) {
      return { data: registry[activeToken], isNewAccount: false };
    }

    // If no active token, check if there's any account in registry
    const tokens = Object.keys(registry);
    if (tokens.length > 0) {
      const firstToken = tokens[0];
      localStorage.setItem(ACTIVE_TOKEN_KEY, firstToken);
      return { data: registry[firstToken], isNewAccount: false };
    }

    // First time visitor: create default 5k account
    const defaultAccount = getDefaultCasinoData();
    registry[defaultAccount.token] = defaultAccount;
    saveAccountsRegistry(registry);
    localStorage.setItem(ACTIVE_TOKEN_KEY, defaultAccount.token);

    return { data: defaultAccount, isNewAccount: true };
  } catch {
    const fallback = getDefaultCasinoData();
    return { data: fallback, isNewAccount: true };
  }
};

export const saveCasinoData = (updates: Partial<CasinoSaveData>): CasinoSaveData => {
  if (typeof window === 'undefined') return getDefaultCasinoData();

  const registry = loadAccountsRegistry();
  const activeToken = localStorage.getItem(ACTIVE_TOKEN_KEY);

  let current: CasinoSaveData;
  if (activeToken && registry[activeToken]) {
    current = { ...registry[activeToken], ...updates };
  } else {
    current = { ...getDefaultCasinoData(), ...updates };
  }

  current.isAdmin = ADMIN_SEED_KEYS.includes(current.token);
  registry[current.token] = current;
  saveAccountsRegistry(registry);
  localStorage.setItem(ACTIVE_TOKEN_KEY, current.token);

  return current;
};

export const loginWithToken = (token: string): CasinoSaveData | null => {
  if (typeof window === 'undefined') return null;
  const cleanToken = token.trim();
  const registry = loadAccountsRegistry();

  if (registry[cleanToken]) {
    localStorage.setItem(ACTIVE_TOKEN_KEY, cleanToken);
    return registry[cleanToken];
  }

  // If it's a valid admin token not yet in local registry
  if (ADMIN_SEED_KEYS.includes(cleanToken)) {
    const adminAcc = getDefaultCasinoData('Admin GM', cleanToken);
    registry[cleanToken] = adminAcc;
    saveAccountsRegistry(registry);
    localStorage.setItem(ACTIVE_TOKEN_KEY, cleanToken);
    return adminAcc;
  }

  return null;
};

export const createNewAccountWithNickname = (nickname: string): CasinoSaveData => {
  const newAccount = getDefaultCasinoData(nickname.trim() || 'Pemain');
  const registry = loadAccountsRegistry();
  registry[newAccount.token] = newAccount;
  saveAccountsRegistry(registry);
  localStorage.setItem(ACTIVE_TOKEN_KEY, newAccount.token);
  return newAccount;
};
