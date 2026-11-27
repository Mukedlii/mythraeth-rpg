import slotConfig from "../../config/slot.json";
import { Rng } from "./rng";
import type { Enemy, Loadout, Modifiers, RunState, SymbolId, Win } from "./types";

export type SlotConfig = typeof slotConfig;
const cfg: SlotConfig = slotConfig;

type SymbolDef = { name: string; weight: number; kind: string; value: number; targets?: number };
const symbolDefs = cfg.symbols as Record<SymbolId, SymbolDef>;
export const SYMBOL_IDS = Object.keys(symbolDefs) as SymbolId[];

/** 3 rows + 2 diagonals, each listed as the row index used on every reel. */
export const PAYLINES: number[][] = [
  [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2]
];

const newMods = (): Modifiers => ({ damageMult: 1, goldMult: 1, extraSpins: 0, rerollsPerWave: cfg.run.rerollsPerWave, fiveBonus: 0, weightAdd: {} });

/** Hero stats + gear feed the reels: power -> damage, hp/defense -> keep, luck -> wild weight, class -> symbol mix. */
export function symbolWeight(state: RunState, id: SymbolId): number {
  const classAdd = (cfg.classBonus as Record<string, Partial<Record<SymbolId, number>>>)[state.loadout.className]?.[id] ?? 0;
  const luckAdd = id === "wild" ? state.loadout.luck / 40 : id === "coin" ? state.loadout.luck / 60 : 0;
  return Math.max(1, symbolDefs[id].weight + classAdd + luckAdd + (state.mods.weightAdd[id] ?? 0));
}
const damageMult = (s: RunState) => (1 + s.loadout.power / 500) * s.mods.damageMult;
export const keepMaxFor = (l: Loadout) => Math.round(cfg.run.keepHp + l.hp / 5 + l.defense / 4);

const rngOf = (s: RunState) => { const r = new Rng(0); r.state = s.rngState; return r; };
const save = (s: RunState, r: Rng) => { s.rngState = r.state; };

export function createRun(seed: number, loadout: Loadout): RunState {
  const keepMax = keepMaxFor(loadout);
  const lanes = cfg.run.lanes;
  const state: RunState = {
    seed, rngState: seed >>> 0, loadout, wave: 0, phase: "spin", spinsLeft: 0,
    overtimeLeft: cfg.run.overtimeSpins, rerolls: cfg.run.rerolls, keepHp: keepMax, keepMax,
    enemies: [], nextEnemyId: 1, traps: Array(lanes).fill(0), allies: Array(lanes).fill(0),
    grid: null, settled: true, offers: [], mods: newMods(), gold: 0, score: 0, kills: 0, log: []
  };
  beginWave(state, true);
  return state;
}

function spawnWave(s: RunState, r: Rng) {
  const e = cfg.enemies, w = s.wave;
  const count = Math.round(e.baseCount + e.countGrowth * (w - 1));
  const hp = Math.round(e.baseHp * Math.pow(e.hpGrowth, w - 1));
  const damage = Math.round(e.baseDamage * Math.pow(e.damageGrowth, w - 1));
  const isBoss = (cfg.run.bossWaves as number[]).includes(w);
  const minions = isBoss ? Math.floor(count / 2) : count;
  const push = (enemy: Omit<Enemy, "id">) => s.enemies.push({ ...enemy, id: s.nextEnemyId++ });
  for (let i = 0; i < minions; i++) push({ lane: r.int(cfg.run.lanes), hp, maxHp: hp, dist: cfg.run.startDist + r.int(2), damage, boss: false });
  if (isBoss) { const bhp = hp * e.bossHpMult; push({ lane: r.int(cfg.run.lanes), hp: bhp, maxHp: bhp, dist: cfg.run.startDist + 1, damage: e.bossDamage, boss: true }); }
}

function beginWave(s: RunState, first = false) {
  const r = rngOf(s);
  s.wave += 1;
  s.phase = "spin";
  s.spinsLeft = cfg.run.spinsPerWave + s.mods.extraSpins;
  if (!first) s.rerolls += s.mods.rerollsPerWave;
  s.grid = null; s.settled = true; s.offers = [];
  spawnWave(s, r);
  save(s, r);
}

export function roll(s: RunState): SymbolId[][] {
  if (s.phase !== "spin" || s.spinsLeft <= 0 || !s.settled) throw new Error("Cannot roll now");
  const r = rngOf(s);
  s.grid = Array.from({ length: cfg.grid.reels }, () => Array.from({ length: cfg.grid.rows }, () => r.weighted(SYMBOL_IDS, id => symbolWeight(s, id))));
  s.settled = false;
  save(s, r);
  return s.grid;
}

/** Hold mechanic: keep locked reels, re-spin the others. Costs one hold token. */
export function reroll(s: RunState, locks: boolean[]): SymbolId[][] {
  if (!s.grid || s.settled || s.rerolls <= 0) throw new Error("Cannot reroll now");
  if (locks.every(Boolean)) throw new Error("Nothing to reroll");
  const r = rngOf(s);
  for (let reel = 0; reel < cfg.grid.reels; reel++) {
    if (locks[reel]) continue;
    s.grid[reel] = Array.from({ length: cfg.grid.rows }, () => r.weighted(SYMBOL_IDS, id => symbolWeight(s, id)));
  }
  s.rerolls -= 1;
  save(s, r);
  return s.grid;
}

export function evaluate(grid: SymbolId[][], fiveBonus = 0): Win[] {
  const wins: Win[] = [];
  PAYLINES.forEach((rows, line) => {
    const syms = rows.map((row, reel) => grid[reel][row]);
    const base: SymbolId = syms.find(x => x !== "wild") ?? "blade";
    let count = 0;
    for (const x of syms) { if (x === base || x === "wild") count++; else break; }
    if (count >= 3) {
      const m = (cfg.multipliers as Record<string, number>)[String(count)] * (count === 5 ? 1 + fiveBonus : 1);
      wins.push({ symbol: base, count, line, multiplier: m });
    }
  });
  const perSymbol = new Map<SymbolId, number>();
  wins.forEach(w => perSymbol.set(w.symbol, (perSymbol.get(w.symbol) ?? 0) + 1));
  wins.forEach(w => { const n = perSymbol.get(w.symbol) ?? 1; if (n > 1) w.multiplier *= 1 + cfg.synergyBonus * (n - 1); });
  return wins;
}

export const front = (s: RunState, lane?: number) =>
  s.enemies.filter(e => lane === undefined || e.lane === lane).sort((a, b) => a.dist - b.dist || a.hp - b.hp)[0];

function hurt(s: RunState, e: Enemy, amount: number) {
  e.hp -= amount;
  if (e.hp > 0) return;
  s.enemies = s.enemies.filter(x => x.id !== e.id);
  s.kills += 1; s.score += e.boss ? 100 : 10;
  s.gold += Math.round(cfg.enemies.killGold * s.mods.goldMult * (e.boss ? 5 : 1));
}

function applyWin(s: RunState, w: Win, focus: number) {
  const def = symbolDefs[w.symbol];
  const dmg = def.value * w.multiplier * damageMult(s);
  switch (def.kind) {
    case "strike": { const t = front(s, focus) ?? front(s); if (t) hurt(s, t, dmg); break; }
    case "volley": for (let l = 0; l < cfg.run.lanes; l++) { const t = front(s, l); if (t) hurt(s, t, dmg); } break;
    case "chain": {
      const n = (def.targets ?? 3) + (w.count - 3);
      [...s.enemies].sort((a, b) => a.dist - b.dist).slice(0, n).forEach(t => hurt(s, t, dmg));
      break;
    }
    case "heal": s.keepHp = Math.min(s.keepMax, s.keepHp + def.value * w.multiplier); break;
    case "gold": s.gold += Math.round(def.value * w.multiplier * s.mods.goldMult); break;
    case "trap": s.traps[focus] += dmg; break;
    case "summon": s.allies[focus] = Math.min(cfg.run.maxAlliesPerLane, s.allies[focus] + (w.count - 2)); break;
  }
}

function tick(s: RunState) {
  const spirit = symbolDefs.summon.value * damageMult(s);
  for (let l = 0; l < cfg.run.lanes; l++) {
    if (s.allies[l] > 0) { const t = front(s, l); if (t) hurt(s, t, s.allies[l] * spirit); }
    if (s.traps[l] > 0) { const t = front(s, l); if (t && t.dist <= 2) { hurt(s, t, s.traps[l]); s.traps[l] = 0; } }
  }
  for (const e of [...s.enemies]) {
    e.dist -= 1;
    if (e.dist <= 0) { s.keepHp -= e.damage; s.enemies = s.enemies.filter(x => x.id !== e.id); }
  }
}

function offerUpgrades(s: RunState) {
  const r = rngOf(s);
  const pool = cfg.upgrades.map(u => u.id);
  s.offers = [];
  while (s.offers.length < 3 && pool.length) s.offers.push(pool.splice(r.int(pool.length), 1)[0]);
  save(s, r);
}

function endWaveIfNeeded(s: RunState) {
  const final = s.wave >= cfg.run.waves;
  if (s.keepHp <= 0) { s.keepHp = 0; s.phase = "lost"; return; }
  if (s.enemies.length === 0) {
    if (final) { s.phase = "won"; s.score += 200; return; }
    s.gold += s.spinsLeft * 5; s.spinsLeft = 0;
  }
  if (s.spinsLeft > 0) return;
  if (final) {
    if (s.overtimeLeft > 0) { s.overtimeLeft -= 1; s.spinsLeft = 1; return; }
    s.phase = "lost"; return;
  }
  s.phase = "upgrade"; offerUpgrades(s);
}

/** Resolve the current grid: apply wins, advance enemies, handle wave end. Returns the wins for UI. */
export function settle(s: RunState, focusLane?: number): Win[] {
  if (!s.grid || s.settled || s.phase !== "spin") throw new Error("Nothing to settle");
  const focus = focusLane ?? front(s)?.lane ?? 0;
  const wins = evaluate(s.grid, s.mods.fiveBonus);
  wins.forEach(w => applyWin(s, w, focus));
  s.spinsLeft -= 1; s.settled = true;
  s.score += wins.reduce((sum, w) => sum + Math.round(w.multiplier * 5), 0);
  tick(s);
  endWaveIfNeeded(s);
  return wins;
}

export function chooseUpgrade(s: RunState, id: string) {
  if (s.phase !== "upgrade" || !s.offers.includes(id)) throw new Error("Invalid upgrade");
  const u = cfg.upgrades.find(x => x.id === id)!;
  const m = s.mods;
  switch (u.type) {
    case "damage": m.damageMult += u.value; break;
    case "gold": m.goldMult += u.value; break;
    case "spin": m.extraSpins += u.value; break;
    case "reroll": s.rerolls += u.value; break;
    case "keep": s.keepMax += u.value; s.keepHp = Math.min(s.keepMax, s.keepHp + u.value); break;
    case "fiveBonus": m.fiveBonus += u.value; break;
    case "weight": { const sym = (u as { symbol: SymbolId }).symbol; m.weightAdd[sym] = (m.weightAdd[sym] ?? 0) + u.value; break; }
  }
  beginWave(s);
}

export const upgradeInfo = (id: string) => cfg.upgrades.find(u => u.id === id);
export const symbolInfo = (id: SymbolId) => symbolDefs[id];
export const slotSettings = cfg;
