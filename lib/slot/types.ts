export type SymbolId = "blade" | "arrow" | "bolt" | "shield" | "coin" | "trap" | "summon" | "wild";

export type Loadout = { className: string; hp: number; power: number; defense: number; luck: number };

export type Enemy = { id: number; lane: number; hp: number; maxHp: number; dist: number; damage: number; boss: boolean };

export type Win = { symbol: SymbolId; count: number; line: number; multiplier: number };

export type Modifiers = {
  damageMult: number; goldMult: number; extraSpins: number; rerollsPerWave: number; fiveBonus: number;
  weightAdd: Partial<Record<SymbolId, number>>;
};

export type Phase = "spin" | "upgrade" | "won" | "lost";

export type RunState = {
  seed: number;
  rngState: number;
  loadout: Loadout;
  wave: number;
  phase: Phase;
  spinsLeft: number;
  overtimeLeft: number;
  rerolls: number;
  keepHp: number;
  keepMax: number;
  enemies: Enemy[];
  nextEnemyId: number;
  traps: number[];
  allies: number[];
  grid: SymbolId[][] | null;
  settled: boolean;
  offers: string[];
  mods: Modifiers;
  gold: number;
  score: number;
  kills: number;
  log: string[];
};
