import { PAYLINES, chooseUpgrade, createRun, front, reroll, roll, settle, upgradeInfo } from "./engine";
import type { Loadout, RunState, SymbolId } from "./types";

export type Policy = "random" | "greedy";

/** Length of the leading run on the best payline (wild counts), and how many reels to hold. */
function bestPartial(grid: SymbolId[][]): number {
  let best = 0;
  for (const rows of PAYLINES) {
    const syms = rows.map((row, reel) => grid[reel][row]);
    const base = syms.find(x => x !== "wild");
    let n = 0;
    for (const x of syms) { if (x === base || x === "wild") n++; else break; }
    best = Math.max(best, n);
  }
  return best;
}

const GREEDY_PRIORITY = ["extra_spin", "sharp_runes", "keep_walls", "more_summons", "more_bolts", "big_five", "reroll_pack", "more_wilds", "more_blades", "more_traps", "deep_pockets", "thin_reels"];

export function pickUpgrade(s: RunState, policy: Policy, pickRandom: () => number): string {
  if (policy === "random") return s.offers[Math.floor(pickRandom() * s.offers.length)];
  return [...s.offers].sort((a, b) => GREEDY_PRIORITY.indexOf(a) - GREEDY_PRIORITY.indexOf(b))[0];
}

/** Plays one full run automatically. "greedy" also uses hold tokens and smart upgrades. */
export function playRun(seed: number, loadout: Loadout, policy: Policy = "greedy"): RunState {
  const s = createRun(seed, loadout);
  let guard = 0;
  let pseudo = seed >>> 0;
  const pickRandom = () => { pseudo = (Math.imul(pseudo, 1664525) + 1013904223) >>> 0; return pseudo / 4294967296; };
  while ((s.phase === "spin" || s.phase === "upgrade") && guard++ < 500) {
    if (s.phase === "upgrade") { chooseUpgrade(s, pickUpgrade(s, policy, pickRandom)); continue; }
    const grid = roll(s);
    if (policy === "greedy" && s.rerolls > 0) {
      const held = bestPartial(grid);
      if (held >= 2 && held < 5) {
        const locks = grid.map((_, reel) => reel < held);
        reroll(s, locks);
      }
    }
    settle(s, front(s)?.lane);
  }
  return s;
}

export { upgradeInfo };
