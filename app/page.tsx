"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Swords, Shield, Sparkles, Crown, Castle, ScrollText, Gem, Coins,
  Users, Trophy, ShoppingBag, Home, Flame, Heart, Zap, Star, X,
  ChevronRight, Plus, LockKeyhole, CircleHelp, Menu, RotateCcw
} from "lucide-react";

type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
type Hero = {
  id: string; name: string; title: string; className: string; rarity: Rarity;
  level: number; hp: number; power: number; defense: number; luck: number;
  image: string; color: string; element: string;
};
type Enemy = { id: string; name: string; epithet: string; level: number; hp: number; power: number; gold: number; gems: number; image: string; };
type GearSlot = "Weapon" | "Armor" | "Boots" | "Necklace";
type Gear = { id: string; name: string; slot: GearSlot; rarity: Rarity; hp: number; power: number; defense: number; luck: number; description: string; };
const gearSlots: GearSlot[] = ["Weapon", "Armor", "Boots", "Necklace"];
const starterGear: Gear[] = [
  { id: "starter-sword", name: "Runebound Ironblade", slot: "Weapon", rarity: "Common", hp: 0, power: 5, defense: 0, luck: 0, description: "A dependable blade for a new champion." },
  { id: "starter-armor", name: "Veilguard Hauberk", slot: "Armor", rarity: "Common", hp: 8, power: 0, defense: 5, luck: 0, description: "Simple layered protection." },
  { id: "starter-boots", name: "Wayfarer Boots", slot: "Boots", rarity: "Common", hp: 2, power: 0, defense: 2, luck: 1, description: "Worn leather made for long journeys." },
  { id: "starter-necklace", name: "Dull Rune Pendant", slot: "Necklace", rarity: "Common", hp: 0, power: 1, defense: 0, luck: 3, description: "A faintly glowing fragment of an old rune." }
];
const armoryStock: Gear[] = [
  { id: "stock-flameblade", name: "Dragon Slayer Blade", slot: "Weapon", rarity: "Legendary", hp: 120, power: 250, defense: 0, luck: 15, description: "A legendary blade forged in the heart of a dragon flame." },
  { id: "stock-frostedge", name: "Frostbite Edge", slot: "Weapon", rarity: "Rare", hp: 0, power: 42, defense: 0, luck: 5, description: "An icy blade that never loses its edge." },
  { id: "stock-voidstaff", name: "Voidcaller Staff", slot: "Weapon", rarity: "Epic", hp: 0, power: 95, defense: 0, luck: 18, description: "A staff humming with forbidden magic." },
  { id: "stock-sunhelm", name: "Crown of the First King", slot: "Armor", rarity: "Legendary", hp: 145, power: 12, defense: 92, luck: 8, description: "A royal crown blessed by the old gods." },
  { id: "stock-icehelm", name: "Glacier Sentinel Helm", slot: "Armor", rarity: "Rare", hp: 45, power: 0, defense: 34, luck: 0, description: "A frost-forged helm of the northern watch." },
  { id: "stock-voidplate", name: "Voidforged Plate", slot: "Armor", rarity: "Epic", hp: 110, power: 5, defense: 76, luck: 7, description: "Dark plate armor bound with a purple rune." },
  { id: "stock-stormboots", name: "Stormstride Greaves", slot: "Boots", rarity: "Rare", hp: 20, power: 0, defense: 32, luck: 8, description: "Light greaves charged with storm energy." },
  { id: "stock-sunboots", name: "Sovereign Warboots", slot: "Boots", rarity: "Legendary", hp: 55, power: 8, defense: 58, luck: 12, description: "Golden boots worn by the immortal guard." },
  { id: "stock-sapphire", name: "Sapphire Heart Pendant", slot: "Necklace", rarity: "Epic", hp: 35, power: 12, defense: 0, luck: 32, description: "A blue crystal that sharpens the senses." },
  { id: "stock-goldchain", name: "Sunfire Chain", slot: "Necklace", rarity: "Legendary", hp: 65, power: 18, defense: 12, luck: 24, description: "A golden relic carrying the light of dawn." },
  { id: "stock-ruby-ring", name: "Blood Oath Ring", slot: "Necklace", rarity: "Rare", hp: 12, power: 25, defense: 0, luck: 14, description: "A ring sealed with a crimson vow." },
  { id: "stock-wardboots", name: "Warden's Treads", slot: "Boots", rarity: "Common", hp: 8, power: 0, defense: 12, luck: 3, description: "Reliable boots for a road-worn champion." }
];

const gearNames: Record<GearSlot, string[]> = {
  Weapon: ["Runebreaker", "Oathfang", "Starfall Edge", "Duskpiercer"],
  Armor: ["Warden's Aegis", "Veilforged Plate", "Crown of Embers", "Abyssal Bulwark"],
  Boots: ["Stormstep Greaves", "Pathfinder Treads", "Ashwalker Boots", "Wraithstride"],
  Necklace: ["Heart of the Veil", "Elder Rune Pendant", "Moonshard Amulet", "Emberbound Torque"]
};

const initialHeroes: Hero[] = [
  { id: "warden", name: "Aldric Stormguard", title: "The Oathbound", className: "Warrior", rarity: "Legendary", level: 45, hp: 248, power: 82, defense: 76, luck: 31, image: "/heroes/warden.webp", color: "blue", element: "Storm" },
  { id: "frost", name: "Vaelith", title: "Queen of the Frozen Veil", className: "Mage", rarity: "Epic", level: 38, hp: 174, power: 91, defense: 43, luck: 55, image: "/heroes/frost-queen.webp", color: "cyan", element: "Frost" },
  { id: "demon", name: "Nyxara", title: "The Crimson Pact", className: "Assassin", rarity: "Epic", level: 36, hp: 156, power: 96, defense: 39, luck: 72, image: "/heroes/lich-king.webp", color: "red", element: "Shadow" },
  { id: "angel", name: "Seraphine", title: "Dawn's Last Light", className: "Guardian", rarity: "Legendary", level: 40, hp: 232, power: 64, defense: 89, luck: 42, image: "/heroes/iron-warlord.webp", color: "gold", element: "Radiance" },
  { id: "ranger", name: "Kaelen", title: "Whisper of the Wild", className: "Ranger", rarity: "Rare", level: 28, hp: 142, power: 73, defense: 41, luck: 66, image: "/heroes/warden.webp", color: "green", element: "Nature" }
];

const enemies: Enemy[] = [
  { id: "gloomfang", name: "Gloomfang", epithet: "The Hollow Ravager", level: 32, hp: 188, power: 34, gold: 850, gems: 8, image: "/heroes/lich-king.webp" },
  { id: "frostborn", name: "The Frostborn", epithet: "Sentinel of the Shard", level: 35, hp: 216, power: 42, gold: 1100, gems: 10, image: "/heroes/frost-queen.webp" },
  { id: "dreadlord", name: "Dreadlord Varyn", epithet: "King Beneath the Mountain", level: 41, hp: 260, power: 51, gold: 1500, gems: 15, image: "/heroes/warden.webp" }
];

const rarityRank: Record<Rarity, number> = { Common: 1, Rare: 2, Epic: 3, Legendary: 4, Mythic: 5 };
const rarityClass: Record<Rarity, string> = { Common: "common", Rare: "rare", Epic: "epic", Legendary: "legendary", Mythic: "mythic" };
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const gearBonusText = (item: Gear) => [item.hp && `+${item.hp} HP`, item.power && `+${item.power} PWR`, item.defense && `+${item.defense} DEF`, item.luck && `+${item.luck} LCK`].filter(Boolean).join(" · ");

function IconLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="icon-label">{icon}{children}</span>;
}

function gearSprite(item: Gear) {
  const rarity = item.rarity;
  if (item.slot === "Weapon") return rarity === "Common" ? 1 : rarity === "Epic" || rarity === "Mythic" ? 2 : 0;
  if (item.slot === "Armor") return rarity === "Common" || rarity === "Rare" ? 4 : 5;
  if (item.slot === "Boots") return rarity === "Legendary" || rarity === "Mythic" ? 15 : 6;
  return rarity === "Legendary" ? 7 : rarity === "Epic" ? 9 : 8;
}
function GearArt({ item, compact = false }: { item: Gear; compact?: boolean }) {
  const sprite = gearSprite(item);
  return <div role="img" aria-label={item.name} className={`gear-art sprite-item ${rarityClass[item.rarity]} ${compact ? "gear-art-compact" : ""}`} style={{ backgroundPosition: `${(sprite % 4) * 33.333}% ${Math.floor(sprite / 4) * 33.333}%` }}><span className="gear-art-rarity">{item.rarity === "Common" ? "N" : item.rarity === "Rare" ? "R" : item.rarity === "Epic" ? "E" : "L"}</span></div>;
}

function HeroArt({ hero, large = false }: { hero: Hero; large?: boolean }) {
  return <div className={`hero-art ${large ? "hero-art-large" : ""} ${rarityClass[hero.rarity]}`}>
    <img src={hero.image} alt={hero.name} />
    <span className="art-glow" />
    <span className="art-rarity">{hero.rarity}</span>
  </div>;
}

export default function MythraethGame() {
  const [heroes, setHeroes] = useState<Hero[]>(initialHeroes);
  const [loaded, setLoaded] = useState(false);
  const [activeHeroId, setActiveHeroId] = useState("warden");
  const [activeTab, setActiveTab] = useState("Heroes");
  const [gold, setGold] = useState(245670);
  const [gems, setGems] = useState(12450);
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy>(enemies[0]);
  const [battleOpen, setBattleOpen] = useState(false);
  const [battleHp, setBattleHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turn, setTurn] = useState(1);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [summonCount, setSummonCount] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
  const [inventory, setInventory] = useState<Gear[]>([...starterGear, ...armoryStock]);
  const [equipped, setEquipped] = useState<Record<string, Partial<Record<GearSlot, string>>>>({ warden: { Weapon: "starter-sword", Armor: "starter-armor", Boots: "starter-boots", Necklace: "starter-necklace" } });
  const [gearFilter, setGearFilter] = useState<"All" | GearSlot>("All");
  const [selectedGearId, setSelectedGearId] = useState("stock-flameblade");
  const [inventoryTab, setInventoryTab] = useState<"Inventory" | "Craft" | "Salvage">("Inventory");
  const [filter, setFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);

  const baseHero = heroes.find(h => h.id === activeHeroId) || heroes[0];
  const activeGear = gearSlots.map(slot => inventory.find(item => item.id === equipped[activeHeroId]?.[slot])).filter((item): item is Gear => Boolean(item));
  const activeBonus = activeGear.reduce((sum, item) => ({ hp: sum.hp + item.hp, power: sum.power + item.power, defense: sum.defense + item.defense, luck: sum.luck + item.luck }), { hp: 0, power: 0, defense: 0, luck: 0 });
  const activeHero: Hero = { ...baseHero, hp: baseHero.hp + activeBonus.hp, power: baseHero.power + activeBonus.power, defense: baseHero.defense + activeBonus.defense, luck: baseHero.luck + activeBonus.luck };
  const totalPower = useMemo(() => heroes.slice(0, 3).reduce((sum, h) => {
    const worn = equipped[h.id] || {};
    const bonus = Object.values(worn).reduce((b, id) => { const item = inventory.find(g => g.id === id); return item ? b + item.power + item.defense : b; }, 0);
    return sum + h.power + h.defense + bonus;
  }, 0), [heroes, equipped, inventory]);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mythraeth-save-v1");
      if (raw) {
        const save = JSON.parse(raw);
        if (Array.isArray(save.heroes) && save.heroes.length) setHeroes(save.heroes);
        if (save.activeHeroId) setActiveHeroId(save.activeHeroId);
        if (typeof save.gold === "number") setGold(save.gold);
        if (typeof save.gems === "number") setGems(save.gems);
        if (typeof save.summonCount === "number") setSummonCount(save.summonCount);
        if (typeof save.attempts === "number") setAttempts(save.attempts);
        if (Array.isArray(save.claimedQuests)) setClaimedQuests(save.claimedQuests);
        if (Array.isArray(save.inventory)) setInventory([...save.inventory, ...armoryStock.filter(stock => !save.inventory.some((item: Gear) => item.id === stock.id))]);
        if (save.equipped && typeof save.equipped === "object") setEquipped(save.equipped);
      }
    } catch { /* start with a clean save if local data is invalid */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("mythraeth-save-v1", JSON.stringify({ heroes, activeHeroId, gold, gems, summonCount, attempts, claimedQuests, inventory, equipped })); }
    catch { /* local save is optional */ }
  }, [loaded, heroes, activeHeroId, gold, gems, summonCount, attempts, claimedQuests, inventory, equipped]);

  const nav = [
    { label: "Home", icon: <Home size={18}/>, tab: "Home" },
    { label: "Arena", icon: <Swords size={19}/>, tab: "Arena" },
    { label: "Heroes", icon: <Shield size={18}/>, tab: "Heroes" },
    { label: "Dungeon", icon: <Castle size={18}/>, tab: "Dungeon" },
    { label: "Quests", icon: <ScrollText size={18}/>, tab: "Quests" },
    { label: "Shop", icon: <ShoppingBag size={18}/>, tab: "Shop" },
    { label: "Guild", icon: <Users size={18}/>, tab: "Guild" },
    { label: "Rankings", icon: <Trophy size={18}/>, tab: "Rankings" }
  ];

  const createLoot = (): Gear => {
    const roll = Math.random();
    const rarity: Rarity = roll > .985 ? "Legendary" : roll > .86 ? "Epic" : roll > .52 ? "Rare" : "Common";
    const slot = gearSlots[Math.floor(Math.random() * gearSlots.length)];
    const tier = rarity === "Legendary" ? 4 : rarity === "Epic" ? 3 : rarity === "Rare" ? 2 : 1;
    const names = gearNames[slot];
    const name = names[Math.floor(Math.random() * names.length)];
    const main = 2 + tier * 4 + Math.floor(Math.random() * (tier * 3));
    const bonus = Math.floor(Math.random() * (tier * 2 + 1));
    const stats = slot === "Weapon" ? { hp: 0, power: main, defense: 0, luck: bonus } : slot === "Armor" ? { hp: main * 2, power: 0, defense: main, luck: 0 } : slot === "Boots" ? { hp: bonus, power: 0, defense: main, luck: bonus + 1 } : { hp: bonus, power: bonus, defense: 0, luck: main };
    return { id: `gear-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name, slot, rarity, ...stats, description: `${rarity} ${slot.toLowerCase()} recovered from the Rune Arena.` };
  };
  const equipGear = (item: Gear) => {
    const otherOwner = Object.entries(equipped).find(([heroId, slots]) => heroId !== activeHeroId && Object.values(slots).includes(item.id));
    if (otherOwner) { showToast("This item is equipped by another hero."); return; }
    setEquipped(prev => ({ ...prev, [activeHeroId]: { ...(prev[activeHeroId] || {}), [item.slot]: item.id } }));
    showToast(`${item.name} equipped on ${activeHero.name}.`);
  };
  const autoEquipBest = () => {
    const nextSlots: Partial<Record<GearSlot, string>> = {};
    for (const slot of gearSlots) {
      const best = inventory.filter(item => item.slot === slot && !Object.entries(equipped).some(([heroId, slots]) => heroId !== activeHeroId && Object.values(slots).includes(item.id))).sort((a, b) => {
        const score = (g: Gear) => rarityRank[g.rarity] * 100 + g.hp * .8 + g.power * 1.4 + g.defense * 1.2 + g.luck;
        return score(b) - score(a);
      })[0];
      if (best) nextSlots[slot] = best.id;
    }
    setEquipped(prev => ({ ...prev, [activeHeroId]: nextSlots }));
    showToast("Best available equipment equipped.");
  };
  const upgradeGear = (item: Gear) => {
    const cost = rarityRank[item.rarity] * 350;
    if (gold < cost) { showToast(`Upgrade requires ${cost} gold.`); return; }
    setGold(v => v - cost);
    setInventory(items => items.map(g => g.id === item.id ? { ...g, hp: g.hp ? g.hp + Math.max(2, Math.round(g.hp * .08)) : 0, power: g.power ? g.power + Math.max(2, Math.round(g.power * .08)) : 0, defense: g.defense ? g.defense + Math.max(2, Math.round(g.defense * .08)) : 0, luck: g.luck ? g.luck + 1 : 0, description: `${g.description} · Enhanced` } : g));
    showToast(`${item.name} upgraded.`);
  };
  const sellGear = (item: Gear) => {
    if (Object.values(equipped).some(slots => Object.values(slots).includes(item.id))) { showToast("Unequip this item before selling it."); return; }
    const value = rarityRank[item.rarity] * 180;
    setInventory(items => items.filter(g => g.id !== item.id)); setGold(v => v + value);
    setSelectedGearId(""); showToast(`${item.name} sold for ${value} gold.`);
  };
  const craftGear = () => {
    if (gold < 900) { showToast("Crafting requires 900 gold."); return; }
    setGold(v => v - 900); const item = createLoot(); setInventory(items => [item, ...items]); setSelectedGearId(item.id); setInventoryTab("Inventory"); showToast(`Crafted ${item.rarity} ${item.name}!`);
  };
  const unequipGear = (slot: GearSlot) => { setEquipped(prev => { const next = { ...prev, [activeHeroId]: { ...(prev[activeHeroId] || {}) } }; delete next[activeHeroId][slot]; return next; }); showToast(`${slot} unequipped.`); };

  const startBattle = (enemy: Enemy) => {
    if (attempts <= 0) { showToast("No Arena attempts left today."); return; }
    setAttempts(v => v - 1);
    setSelectedEnemy(enemy); setBattleHp(activeHero.hp); setEnemyHp(enemy.hp);
    setTurn(1); setBattleLog([`The battle begins. ${enemy.name} enters the arena.`]); setBattleOpen(true);
  };

  const takeTurn = (skill: "strike" | "rune" | "guard") => {
    if (busy || battleHp <= 0 || enemyHp <= 0) return;
    setBusy(true);
    const damage = skill === "rune" ? activeHero.power * 1.75 + activeHero.luck * .35 : skill === "guard" ? activeHero.power * .45 : activeHero.power;
    const dealt = Math.max(8, Math.round(damage + Math.random() * 8));
    const remaining = Math.max(0, enemyHp - dealt);
    const action = skill === "rune" ? "Rune Burst" : skill === "guard" ? "Shield Counter" : "Runeblade Strike";
    setEnemyHp(remaining);
    setBattleLog(log => [`${activeHero.name} uses ${action} for ${dealt} damage.`, ...log].slice(0, 5));
    window.setTimeout(() => {
      if (remaining <= 0) {
        setBattleLog(log => [`${selectedEnemy.name} has fallen. Victory!`, ...log].slice(0, 5));
        setGold(v => v + selectedEnemy.gold); setGems(v => v + selectedEnemy.gems);
        showToast(`Victory! +${selectedEnemy.gold} gold · +${selectedEnemy.gems} gems`);
        setBusy(false); return;
      }
      const incoming = Math.max(4, Math.round(selectedEnemy.power * (skill === "guard" ? .45 : 1) - activeHero.defense * .16 + Math.random() * 5));
      setBattleHp(hp => Math.max(0, hp - incoming));
      setBattleLog(log => [`${selectedEnemy.name} strikes back for ${incoming} damage.`, ...log].slice(0, 5));
      setTurn(v => v + 1); setBusy(false);
    }, 420);
  };

  const summon = () => {
    if (gems < 300) { showToast("Not enough gems. You need 300."); return; }
    setGems(v => v - 300);
    const pool = [
      { name: "Mordane", title: "Ashen Spellblade", className: "Mage", image: "/heroes/frost-queen.webp", color: "cyan", element: "Frost" },
      { name: "Vesper", title: "The Veil Walker", className: "Assassin", image: "/heroes/lich-king.webp", color: "red", element: "Shadow" },
      { name: "Elyra", title: "Keeper of First Light", className: "Guardian", image: "/heroes/iron-warlord.webp", color: "gold", element: "Radiance" },
      { name: "Thorne", title: "Wildheart Sentinel", className: "Ranger", image: "/heroes/warden.webp", color: "green", element: "Nature" }
    ];
    const found = pool[Math.floor(Math.random() * pool.length)];
    const rarity: Rarity = Math.random() > .88 ? "Legendary" : Math.random() > .48 ? "Epic" : "Rare";
    const hero: Hero = { ...found, id: `summon-${Date.now()}`, rarity, level: 1, hp: 115 + Math.floor(Math.random()*35), power: 32 + Math.floor(Math.random()*24), defense: 24 + Math.floor(Math.random()*20), luck: 20 + Math.floor(Math.random()*30) };
    setHeroes(list => [...list, hero]); setActiveHeroId(hero.id); setSummonCount(v => v + 1);
    showToast(`${rarity} hero summoned: ${hero.name}!`);
  };

  const claimQuest = (reward: number, label: string) => {
    if (claimedQuests.includes(label)) { showToast("This quest has already been claimed."); return; }
    setClaimedQuests(list => [...list, label]); setGold(v => v + reward); showToast(`${label} claimed · +${reward} gold`);
  };
  const filteredHeroes = filter === "All" ? heroes : heroes.filter(h => h.rarity === filter);

  return <main className="game-shell">
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <header className="topbar">
      <div className="player-chip"><div className="player-avatar"><img src={activeHero.image} alt="Active hero"/></div><span><b>Lv. {activeHero.level}</b><small>Player123 · VIP 1</small></span></div>
      <button className="brand" onClick={() => setActiveTab("Home")} aria-label="MYTHRAETH home"><span><b>MYTHRAETH</b><small>RISE OF THE RUNEBORN</small></span></button>
      <div className="resources"><span><Coins size={16}/> {fmt(gold)} <Plus size={12}/></span><span><Gem size={16}/> {fmt(gems)} <Plus size={12}/></span><button className="hud-icon" onClick={()=>showToast("Settings are coming soon.")}>⚙</button><button className="hud-icon" onClick={()=>showToast("Settings are coming soon.")}>⚙</button></div><button className="hud-rank" onClick={()=>setActiveTab("Rankings")}><Trophy size={13}/> RANKINGS</button>
    </header>

    <div className="game-layout">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="realm-label"><span>✦</span> THE SHATTERED REALMS <span>✦</span></div>
        <div className="nav-section-label">ADVENTURE</div>
        {nav.slice(0,5).map(item => <button key={item.tab} onClick={() => {setActiveTab(item.tab);setMenuOpen(false);}} className={`nav-item ${activeTab === item.tab ? "active" : ""}`}>{item.icon}<span>{item.label}</span>{activeTab === item.tab && <ChevronRight size={15}/>}</button>)}
        <div className="nav-section-label nav-section-secondary">KINGDOM</div>
        {nav.slice(5).map(item => <button key={item.tab} onClick={() => {setActiveTab(item.tab);setMenuOpen(false);}} className={`nav-item ${activeTab === item.tab ? "active" : ""}`}>{item.icon}<span>{item.label}</span>{activeTab === item.tab && <ChevronRight size={15}/>}</button>)}
        <div className="sidebar-bottom"><div className="season-icon"><Flame size={18}/></div><div><b>Season of Embers</b><small>12 days remaining</small></div></div>
      </aside>

      <section className="content">
        <div className="content-topline"><span>WORLD 01</span><i/> <span>THE VEILFALL FRONTIER</span><span className="online"><b/> LIVE REALM</span></div>

        {activeTab === "Arena" && <div className="arena-view">
          <div className="arena-heading"><div><div className="eyebrow"><Swords size={14}/> THE RUNE ARENA</div><h1>Prove your <em>legend.</em></h1><p>Challenge the champions. Claim the runes. Rise above the realms.</p></div><div className="league-badge"><Crown/><span><b>GOLD LEAGUE</b><small>RANK #247</small></span></div></div>
          <div className="arena-hero-panel">
            <div className="champion-visual"><img src={activeHero.image} alt={activeHero.name}/><div className="champion-vignette"/><div className="champion-caption"><span>YOUR CHAMPION</span><h2>{activeHero.name}</h2><small>{activeHero.rarity} · {activeHero.className}</small></div></div>
            <div className="champion-stats"><div className="stat-label">SQUAD POWER <b>{fmt(totalPower)}</b></div><div className="power-meter"><span style={{width: `${Math.min(100,totalPower/7)}%`}}/></div><div className="stat-grid"><span><Heart/> HP <b>{activeHero.hp}</b></span><span><Zap/> PWR <b>{activeHero.power}</b></span><span><Shield/> DEF <b>{activeHero.defense}</b></span><span><Sparkles/> LCK <b>{activeHero.luck}</b></span></div><button className="button button-blue" onClick={() => setActiveTab("Heroes")}><Users size={17}/> EDIT YOUR SQUAD</button></div>
          </div>
          <div className="section-title"><div><span className="eyebrow">CHOOSE YOUR OPPONENT</span><h2>Champions of the Arena</h2></div><span className="attempts">DAILY ATTEMPTS <b>{attempts} / 5</b></span></div>
          <div className="enemy-list">{enemies.map((enemy, i) => <article className="enemy-card" key={enemy.id}><div className="enemy-art"><img src={enemy.image} alt={enemy.name}/><span>0{i+1}</span></div><div className="enemy-info"><span className="eyebrow">ARENA CHALLENGER · LV. {enemy.level}</span><h3>{enemy.name}</h3><p>{enemy.epithet}</p><div className="enemy-power"><Swords size={14}/> POWER {enemy.power}</div></div><div className="enemy-rewards"><small>VICTORY REWARDS</small><b><Coins size={15}/> {fmt(enemy.gold)}</b><b><Gem size={15}/> {enemy.gems}</b></div><button className="button button-gold" onClick={() => startBattle(enemy)}>FIGHT <Swords size={16}/></button></article>)}</div>
          <div className="arena-footer"><span><Shield size={15}/> Your active champion enters the Rune Arena.</span><span>SEASON 04 · THE VEILFALL</span></div>
        </div>}

        {(activeTab === "Heroes" || activeTab === "Equipment") && <div className="armory-screen">
          <section className="armory-hero-panel">
            <div className="armory-hero-backdrop"><img src={activeHero.image} alt={activeHero.name}/></div>
            <div className="armory-hero-top"><span className="vip-medal">VIP 1</span><span className={`rarity-text ${rarityClass[activeHero.rarity]}`}>{activeHero.rarity.toUpperCase()}</span></div>
            <div className="armory-hero-info"><span className="eyebrow">YOUR CHAMPION</span><h1>{activeHero.name.split(" ")[0]}</h1><p>⚔ Lv. {activeHero.level} {activeHero.className}</p><div className="armory-stats"><span><Heart/> HP <b>{fmt(activeHero.hp * 13)}</b></span><span><Swords/> PWR <b>{fmt(activeHero.power * 10)}</b></span><span><Shield/> DEF <b>{fmt(activeHero.defense * 10)}</b></span><span><Sparkles/> LCK <b>{fmt(activeHero.luck * 10)}</b></span></div></div>
          </section>
          <section className="armory-loadout">
            <div className="armory-section-heading"><span>CHAMPION GEAR</span><b>GEAR POWER <strong>{fmt(totalPower * 10)}</strong></b></div>
            <div className="armory-slot-grid">{gearSlots.map(slot=>{const item=inventory.find(g=>g.id===equipped[activeHeroId]?.[slot]);return <button key={slot} className={`armory-slot ${item?rarityClass[item.rarity]:"empty"}`} onClick={()=>{if(item)setSelectedGearId(item.id);else setGearFilter(slot);}}>{item?<GearArt item={item}/>:<span className="empty-slot-icon">{slot==="Weapon"?<Swords/>:slot==="Armor"?<Shield/>:slot==="Boots"?<Zap/>:<Gem/>}</span>}<small>{item?.name||slot}</small>{item&&<b>+{rarityRank[item.rarity]*2}</b>}</button>})}</div>
            <button className="button button-blue auto-equip-wide" onClick={autoEquipBest}><Shield size={14}/> AUTO EQUIP</button>
          </section>
          <section className="armory-inventory">
            <div className="inventory-tabs">{(["Inventory","Craft","Salvage"] as const).map(tab=><button key={tab} className={inventoryTab===tab?"selected":""} onClick={()=>setInventoryTab(tab)}>{tab==="Inventory"?<ShoppingBag size={13}/>:tab==="Craft"?<Sparkles size={13}/>:<RotateCcw size={13}/>} {tab}</button>)}</div>
            {inventoryTab==="Inventory"&&<><div className="armory-item-grid">{inventory.slice().reverse().map(item=><button key={item.id} className={`armory-item ${rarityClass[item.rarity]} ${selectedGearId===item.id?"selected":""}`} onClick={()=>setSelectedGearId(item.id)} title={`${item.name} · ${item.rarity}`}><GearArt item={item}/><span className="item-stars">{"★".repeat(Math.min(5,rarityRank[item.rarity]+1))}</span></button>)}</div><div className="rarity-legend"><span>Rarity:</span><i>◆ Normal</i><i>◆ Rare</i><i>◆ Epic</i><i>◆ Legendary</i></div></>}
            {inventoryTab==="Craft"&&<div className="craft-panel"><div className="craft-emblem"><Sparkles size={38}/></div><h3>Forge a new relic</h3><p>Spend 900 gold to craft a random weapon, armor, boots or necklace.</p><button className="button button-purple" onClick={craftGear}>CRAFT ITEM · 900 <Coins size={14}/></button></div>}
            {inventoryTab==="Salvage"&&<div className="craft-panel"><div className="craft-emblem"><RotateCcw size={38}/></div><h3>Salvage equipment</h3><p>Select an item from your inventory, then salvage it for gold. Equipped items are protected.</p><button className="button button-gold" disabled={!inventory.find(g=>g.id===selectedGearId)||Object.values(equipped).some(slots=>Object.values(slots).includes(selectedGearId))} onClick={()=>{const item=inventory.find(g=>g.id===selectedGearId);if(item)sellGear(item);}}>SALVAGE SELECTED</button></div>}
          </section>
          <section className="armory-item-detail">{(()=>{const item=inventory.find(g=>g.id===selectedGearId)||inventory.find(g=>g.id==="stock-flameblade")||inventory[0];if(!item)return <span>Select an item from your inventory.</span>;const isEquipped=equipped[activeHeroId]?.[item.slot]===item.id;return <><div className="detail-art"><GearArt item={item}/></div><div className="detail-copy"><small className={`rarity-text ${rarityClass[item.rarity]}`}>{item.rarity.toUpperCase()} · {item.slot.toUpperCase()}</small><h3>{item.name}</h3><p>{gearBonusText(item)||item.description}</p></div><div className="detail-actions"><button className="button button-blue" disabled={isEquipped} onClick={()=>equipGear(item)}><Shield size={13}/> {isEquipped?"EQUIPPED":"EQUIP"}</button><button className="button button-purple" onClick={()=>upgradeGear(item)}><Plus size={13}/> UPGRADE</button><button className="button button-gold" disabled={Object.values(equipped).some(slots=>Object.values(slots).includes(item.id))} onClick={()=>sellGear(item)}><Coins size={13}/> SELL</button></div></>;})()}</section>
        </div>}

        {activeTab === "Home" && <div className="home-view"><div className="hero-banner"><img src="/heroes/warden.webp" alt="Runeborn champion"/><div><div className="eyebrow">WELCOME TO THE VEILFALL</div><h1>Your legend <em>begins.</em></h1><p>The old kingdoms have fallen. The runes have awakened. Gather your champions and reclaim the realms.</p><button className="button button-gold" onClick={()=>setActiveTab("Arena")}>ENTER THE ARENA <Swords size={16}/></button></div></div><div className="home-cards"><button onClick={()=>setActiveTab("Heroes")}><Shield/><b>Hero Collection</b><span>Manage your champions</span></button><button onClick={()=>setActiveTab("Dungeon")}><Castle/><b>Ancient Dungeons</b><span>Explore the forgotten halls</span></button><button onClick={()=>setActiveTab("Shop")}><Sparkles/><b>Summoning Altar</b><span>Discover new Runeborn</span></button></div></div>}

        {activeTab === "Shop" && <div className="summon-view"><div className="summon-art"><div className="summon-orbit"/><Sparkles size={64}/><span>THE ASTRAL ALTAR</span></div><div className="page-heading"><div className="eyebrow">CALL UPON THE ANCIENTS</div><h1>Summon the <em>Runeborn</em></h1><p>Spend 300 crystals to discover a new champion.</p></div><button className="button button-purple summon-button" onClick={summon}><Sparkles size={18}/> SUMMON HERO · 300 <Gem size={17}/></button><small className="muted">Your new hero is added to your collection and selected automatically.</small></div>}

        {activeTab === "Dungeon" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">DESCEND INTO DARKNESS</div><h1>Ancient <em>Dungeons</em></h1><p>Three forgotten gates stand before you. Their secrets are not freely given.</p></div><div className="dungeon-grid">{["The Hollow Keep","Frostgrave Depths","Ashen Cathedral"].map((name,i)=><article key={name}><div className="dungeon-symbol">{i===0?<Castle/>:i===1?<Sparkles/>:<Flame/>}</div><span className="eyebrow">DUNGEON 0{i+1}</span><h3>{name}</h3><p>{["A fortress swallowed by the Veil.","A frozen labyrinth beneath the mountains.","A sanctuary consumed by old fire."][i]}</p><b>RECOMMENDED POWER · {120+i*55}</b><button className="button button-blue" onClick={()=>showToast("Dungeon expedition is coming in the next chapter.")}>PREPARE EXPEDITION</button></article>)}</div></div>}

        {activeTab === "Quests" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">THE CHRONICLE</div><h1>Daily <em>Quests</em></h1><p>Every legend is built one deed at a time.</p></div><div className="quest-list">{[{name:"Arena Challenger",desc:"Enter the Rune Arena and face a champion.",reward:500},{name:"Gather the Runeborn",desc:"Summon a new hero at the Astral Altar.",reward:350},{name:"A Growing Legend",desc:"Own five heroes in your collection.",reward:800}].map((q,i)=><article key={q.name}><div className="quest-icon"><ScrollText/></div><div><b>{q.name}</b><p>{q.desc}</p><small>REWARD · {q.reward} GOLD</small></div><button className="button button-gold" disabled={claimedQuests.includes(q.name)} onClick={()=>claimQuest(q.reward,q.name)}>{claimedQuests.includes(q.name)?"CLAIMED":"CLAIM"}</button></article>)}</div></div>}

        {activeTab === "Guild" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">STAND TOGETHER</div><h1>Runeborn <em>Guilds</em></h1><p>Even the strongest champion needs allies.</p></div><div className="coming-panel"><Users size={48}/><h2>The Guild Hall is awakening.</h2><p>Guild creation, member ranks, shared quests and seasonal wars are planned for a future chapter.</p></div></div>}

        {activeTab === "Rankings" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">THE ETERNAL LADDER</div><h1>Realm <em>Rankings</em></h1><p>Only the strongest names survive the chronicles.</p></div><div className="ranking-list">{["Aetherion","Valkyra","DreadSaint","Mukedlii","Nyx"].map((n,i)=><div key={n}><b className="rank-number">0{i+1}</b><span className="rank-avatar">{n[0]}</span><strong>{n}</strong><span>{fmt(248000-i*18400)} PWR</span><Trophy size={17}/></div>)}</div></div>}

        <footer className="content-footer"><span>MYTHRAETH © 2026</span><span>BUILT FOR THE RUNEBORN</span><button onClick={()=>{localStorage.removeItem("mythraeth-save-v1");setHeroes(initialHeroes);setActiveHeroId("warden");setGold(245670);setGems(12450);setSummonCount(0);setAttempts(3);setClaimedQuests([]);setInventory([...starterGear, ...armoryStock]);setSelectedGearId("stock-flameblade");setEquipped({ warden: { Weapon: "starter-sword", Armor: "starter-armor", Boots: "starter-boots", Necklace: "starter-necklace" } });showToast("Local save reset.");}}><RotateCcw size={12}/> RESET LOCAL SAVE</button></footer>
      </section>
    </div>

    <nav className="mobile-nav">{nav.map(item=><button key={item.tab} onClick={()=>setActiveTab(item.tab)} className={activeTab===item.tab?"active":""}>{item.icon}<small>{item.label}</small></button>)}</nav>

    {battleOpen && <div className="modal-backdrop"><section className="battle-modal"><button className="modal-close" onClick={()=>setBattleOpen(false)}><X/></button><div className="battle-title"><span className="eyebrow">RUNE ARENA · DUEL {turn}</span><h2>{battleHp>0&&enemyHp>0?"The Clash of Champions":enemyHp<=0?"VICTORY":"DEFEAT"}</h2></div><div className="battle-duel"><div className="duelist"><HeroArt hero={activeHero}/><b>{activeHero.name}</b><small>YOUR CHAMPION</small><div className="hp-track"><i style={{width:`${Math.max(0,battleHp/activeHero.hp*100)}%`}}/></div><small>{battleHp} / {activeHero.hp} HP</small></div><div className="versus">VS</div><div className="duelist enemy-duelist"><div className="enemy-battle-art"><img src={selectedEnemy.image} alt={selectedEnemy.name}/></div><b>{selectedEnemy.name}</b><small>ARENA OPPONENT</small><div className="hp-track enemy-hp"><i style={{width:`${Math.max(0,enemyHp/selectedEnemy.hp*100)}%`}}/></div><small>{enemyHp} / {selectedEnemy.hp} HP</small></div></div><div className="battle-log">{battleLog.map((line,i)=><p key={i}>{line}</p>)}</div>{battleHp>0&&enemyHp>0?<div className="battle-actions"><button disabled={busy} onClick={()=>takeTurn("strike")}><Swords/> STRIKE</button><button disabled={busy} onClick={()=>takeTurn("rune")}><Sparkles/> RUNE BURST</button><button disabled={busy} onClick={()=>takeTurn("guard")}><Shield/> GUARD</button></div>:<button className="button button-gold battle-end" onClick={()=>setBattleOpen(false)}>RETURN TO ARENA</button>}</section></div>}
    {toast && <div className="toast"><Sparkles size={16}/>{toast}</div>}
  </main>;
}
