import { test } from "node:test";
import assert from "node:assert/strict";
import { createRun, evaluate, roll, reroll, settle, chooseUpgrade, keepMaxFor } from "./engine";
import { playRun } from "./bot";
import { Rng } from "./rng";
import type { Loadout, SymbolId } from "./types";

const hero: Loadout = { className: "Warrior", hp: 248, power: 82, defense: 76, luck: 31 };
const grid = (rows: SymbolId[][]) => rows; // grid[reel][row]

test("rng is deterministic for the same seed", () => {
  const a = new Rng(42), b = new Rng(42);
  for (let i = 0; i < 20; i++) assert.equal(a.next(), b.next());
});

test("same seed and same actions give the same run", () => {
  const x = playRun(7, hero, "greedy"), y = playRun(7, hero, "greedy");
  assert.equal(x.score, y.score); assert.equal(x.wave, y.wave); assert.equal(x.phase, y.phase);
});

test("a straight 3-of-a-kind on a row wins; 2 does not", () => {
  const miss = grid([["blade","coin","coin"],["blade","arrow","coin"],["shield","bolt","coin"],["coin","coin","coin"],["coin","coin","coin"]]);
  assert.equal(evaluate(miss).filter(w => w.line === 0).length, 0);
  const hit = grid([["blade","coin","coin"],["blade","arrow","coin"],["blade","bolt","coin"],["coin","coin","coin"],["coin","coin","coin"]]);
  const w = evaluate(hit).find(x => x.line === 0);
  assert.equal(w?.symbol, "blade"); assert.equal(w?.count, 3);
});

test("wild substitutes and extends the run", () => {
  const g = grid([["wild","coin","coin"],["blade","arrow","coin"],["blade","bolt","coin"],["wild","coin","coin"],["blade","coin","coin"]]);
  const w = evaluate(g).find(x => x.line === 0)!;
  assert.equal(w.symbol, "blade"); assert.equal(w.count, 5);
});

test("five-of-a-kind pays more than three", () => {
  const three = evaluate(grid([["blade","a","a"],["blade","a","a"],["blade","a","a"],["x","a","a"],["x","a","a"]] as unknown as SymbolId[][])).find(w => w.line === 0)!;
  const five = evaluate(grid([["blade","a","a"],["blade","a","a"],["blade","a","a"],["blade","a","a"],["blade","a","a"]] as unknown as SymbolId[][])).find(w => w.line === 0)!;
  assert.ok(five.multiplier > three.multiplier);
});

test("hold tokens: reroll keeps locked reels and costs a token", () => {
  const s = createRun(3, hero);
  const g = roll(s).map(col => [...col]);
  const tokens = s.rerolls;
  const after = reroll(s, [true, true, false, false, false]);
  assert.deepEqual(after[0], g[0]); assert.deepEqual(after[1], g[1]);
  assert.equal(s.rerolls, tokens - 1);
});

test("cannot roll twice without settling", () => {
  const s = createRun(5, hero);
  roll(s);
  assert.throws(() => roll(s));
});

test("a wave ends in the upgrade phase and a chosen upgrade starts the next wave", () => {
  const s = createRun(11, hero);
  while (s.phase === "spin") { roll(s); settle(s); }
  if (s.phase === "upgrade") {
    assert.equal(s.offers.length, 3);
    chooseUpgrade(s, s.offers[0]);
    assert.equal(s.wave, 2); assert.equal(s.phase, "spin");
  } else assert.equal(s.phase, "lost");
});

test("an invalid upgrade is rejected", () => {
  const s = createRun(11, hero);
  while (s.phase === "spin") { roll(s); settle(s); }
  if (s.phase === "upgrade") assert.throws(() => chooseUpgrade(s, "not_offered"));
});

test("better gear gives a sturdier keep and a higher win rate", () => {
  const strong: Loadout = { ...hero, hp: hero.hp + 120, power: hero.power + 250 };
  assert.ok(keepMaxFor(strong) > keepMaxFor(hero));
  const rate = (l: Loadout) => { let w = 0; for (let i = 0; i < 300; i++) if (playRun(i, l, "greedy").phase === "won") w++; return w / 300; };
  assert.ok(rate(strong) > rate(hero));
});

test("every run terminates in won or lost", () => {
  for (let i = 0; i < 200; i++) assert.ok(["won", "lost"].includes(playRun(i, hero, "random").phase));
});
