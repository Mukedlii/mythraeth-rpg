import { playRun, type Policy } from "../lib/slot/bot";
import type { Loadout } from "../lib/slot/types";

const runs = Number(process.argv[2] ?? 10000);
const loadouts: Record<string, Loadout> = {
  "Starter Aldric (Warrior, no gear)": { className: "Warrior", hp: 248, power: 82, defense: 76, luck: 31 },
  "Geared Aldric (mockup, Gear Power 2480)": { className: "Warrior", hp: 248 + 120, power: 82 + 250, defense: 76, luck: 31 + 15 },
  "Vaelith (Mage)": { className: "Mage", hp: 174, power: 91, defense: 43, luck: 55 }
};

for (const [name, loadout] of Object.entries(loadouts)) {
  for (const policy of ["random", "greedy"] as Policy[]) {
    let wins = 0, waveSum = 0, scoreSum = 0;
    for (let i = 0; i < runs; i++) {
      const s = playRun(1000 + i, loadout, policy);
      if (s.phase === "won") wins++;
      waveSum += s.wave; scoreSum += s.score;
    }
    console.log(`${name} | ${policy.padEnd(6)} | win ${(wins / runs * 100).toFixed(1)}% | avg wave ${(waveSum / runs).toFixed(2)} | avg score ${Math.round(scoreSum / runs)}`);
  }
}
