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
  const [activeTab, setActiveTab] = useState("Arena");
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
  const [inventory, setInventory] = useState<Gear[]>(starterGear);
  const [equipped, setEquipped] = useState<Record<string, Partial<Record<GearSlot, string>>>>({ warden: { Weapon: "starter-sword", Armor: "starter-armor", Boots: "starter-boots", Necklace: "starter-necklace" } });
  const [gearFilter, setGearFilter] = useState<"All" | GearSlot>("All");
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
        if (Array.isArray(save.inventory)) setInventory(save.inventory);
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
    { label: "Equipment", icon: <Swords size={18}/>, tab: "Equipment" },
    { label: "Dungeon", icon: <Castle size={18}/>, tab: "Dungeon" },
    { label: "Quests", icon: <ScrollText size={18}/>, tab: "Quests" },
    { label: "Summon", icon: <Sparkles size={18}/>, tab: "Summon" },
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
  const equipGear = (item: Gear) => {\n    const otherOwner = Object.entries(equipped).find(([heroId, slots]) => heroId !== activeHeroId && Object.values(slots).includes(item.id));\n    if (otherOwner) { showToast("This item is equipped by another hero."); return; }\n    setEquipped(prev => ({ ...prev, [activeHeroId]: { ...(prev[activeHeroId] || {}), [item.slot]: item.id } }));\n    showToast(`${item.name} equipped on ${activeHero.name}.`);\n  };
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
      <button className="brand" onClick={() => setActiveTab("Home")} aria-label="MYTHRAETH home"><span className="brand-mark"><Crown size={22}/></span><span><b>MYTHRAETH</b><small>RISE OF THE RUNEBORN</small></span></button>
      <div className="player-chip"><div className="player-avatar"><img src={activeHero.image} alt="Active hero"/></div><span><b>Lv. {activeHero.level} · Runebound</b><small>{activeHero.name}</small></span></div>
      <div className="resources"><span><Coins size={16}/> {fmt(gold)}</span><span><Gem size={16}/> {fmt(gems)}</span></div>
      <button className="menu-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle navigation"><Menu/></button>
    </header>

    <div className="game-layout">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="realm-label">THE SHATTERED REALMS</div>
        {nav.map(item => <button key={item.tab} onClick={() => {setActiveTab(item.tab);setMenuOpen(false);}} className={`nav-item ${activeTab === item.tab ? "active" : ""}`}>{item.icon}<span>{item.label}</span>{activeTab === item.tab && <ChevronRight size={15}/>}</button>)}
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

        {activeTab === "Equipment" && <div className="equipment-view">
      <div className="page-heading"><div className="eyebrow"><Swords size={14}/> THE ARMOURY</div><h1>Hero <em>Equipment</em></h1><p>Equip relics, strengthen your champion and prepare for battle.</p></div>
      <div className="equipment-hero"><HeroArt hero={activeHero}/><div><span className={`rarity-text ${rarityClass[activeHero.rarity]}`}>{activeHero.rarity.toUpperCase()} CHAMPION</span><h2>{activeHero.name}</h2><p>{activeHero.className} · Level {activeHero.level}</p><div className="gear-statline"><span>HP <b>{activeHero.hp}</b></span><span>PWR <b>{activeHero.power}</b></span><span>DEF <b>{activeHero.defense}</b></span><span>LCK <b>{activeHero.luck}</b></span></div></div></div>
      <div className="section-title"><div><span className="eyebrow">ACTIVE LOADOUT</span><h2>Equipped items</h2></div><span className="attempts">{activeGear.length} / 4 SLOTS FILLED</span></div>
      <div className="equipped-grid">{gearSlots.map(slot => { const item = inventory.find(g => g.id === equipped[activeHeroId]?.[slot]); return <article className={`gear-card ${item ? rarityClass[item.rarity] : "empty"}`} key={slot}><div className="gear-slot-icon">{slot === "Weapon" ? <Swords/> : slot === "Armor" ? <Shield/> : slot === "Boots" ? <Zap/> : <Gem/>}</div><div><small>{slot.toUpperCase()}</small><b>{item ? item.name : "Empty slot"}</b><span>{item ? `${item.rarity === "Common" ? "NORMAL" : item.rarity.toUpperCase()} · ${gearBonusText(item)}` : "Choose an item below"}</span></div>{item && <button className="gear-action" onClick={() => unequipGear(slot)}>UNEQUIP</button>}</article>; })}</div>
      <div className="section-title"><div><span className="eyebrow">YOUR TREASURE</span><h2>Equipment inventory</h2></div><span className="attempts">{inventory.length} ITEMS</span></div>
      <div className="filter-tabs gear-filters">{(["All", ...gearSlots] as const).map(slot => <button key={slot} className={gearFilter===slot?"selected":""} onClick={() => setGearFilter(slot)}>{slot}</button>)}</div>
      <div className="gear-inventory">{inventory.filter(item => gearFilter === "All" || item.slot === gearFilter).map(item => { const isEquipped = equipped[activeHeroId]?.[item.slot] === item.id; const usedByOtherHero = Object.entries(equipped).some(([heroId, slots]) => heroId !== activeHeroId && Object.values(slots).includes(item.id)); return <article className={`gear-item ${rarityClass[item.rarity]}`} key={item.id}><div className="gear-item-top"><span className="gear-slot-label">{item.slot}</span><b className="rarity-text">{item.rarity === "Common" ? "NORMAL" : item.rarity.toUpperCase()}</b></div><h3>{item.name}</h3><p>{item.description}</p><div className="gear-bonuses">{item.hp>0&&<span>+{item.hp} HP</span>}{item.power>0&&<span>+{item.power} PWR</span>}{item.defense>0&&<span>+{item.defense} DEF</span>}{item.luck>0&&<span>+{item.luck} LCK</span>}</div><button className={`button ${isEquipped?"button-blue":"button-gold"}`} disabled={isEquipped || usedByOtherHero} onClick={() => equipGear(item)}>{isEquipped?"EQUIPPED":usedByOtherHero?"IN USE":`EQUIP ${item.slot.toUpperCase()}`}</button></article>; })}</div>
      <p className="gear-note">Victory in the Rune Arena grants a random equipment drop. Higher rarity items have stronger bonuses.</p>
    </div>}

    {activeTab === "Heroes" && <div className="heroes-view">
          <div className="page-heading"><div className="eyebrow"><Shield size={14}/> YOUR LEGACY</div><h1>Hero <em>Collection</em></h1><p>Gather the Runeborn. Shape your destiny.</p></div>
          <div className="collection-summary"><div><b>{heroes.length}</b><span>HEROES OWNED</span></div><div><b>{new Set(heroes.map(h=>h.className)).size}</b><span>CLASSES</span></div><div><b>{summonCount}</b><span>SUMMONS</span></div><div><b>{fmt(totalPower)}</b><span>SQUAD POWER</span></div></div>
          <div className="collection-tools"><div className="filter-tabs">{["All","Common","Rare","Epic","Legendary","Mythic"].map(f=><button key={f} onClick={()=>setFilter(f)} className={filter===f?"selected":""}>{f}</button>)}</div><span>{filteredHeroes.length} DISCOVERED</span></div>
          <div className="hero-grid">{filteredHeroes.map(hero=><button key={hero.id} onClick={()=>setActiveHeroId(hero.id)} className={`hero-card ${activeHeroId===hero.id?"chosen":""}`}><HeroArt hero={hero}/><div className="hero-card-info"><span className={`rarity-text ${rarityClass[hero.rarity]}`}>{hero.rarity.toUpperCase()}</span><h3>{hero.name}</h3><p>{hero.className} · {hero.element}</p><div className="mini-stats"><span>⚔ {hero.power}</span><span>🛡 {hero.defense}</span><span>Lv. {hero.level}</span></div></div></button>)}</div>
          <div className="selected-hero-panel"><HeroArt hero={activeHero} large/><div className="selected-details"><span className={`rarity-text ${rarityClass[activeHero.rarity]}`}>{activeHero.rarity.toUpperCase()} · {activeHero.className.toUpperCase()}</span><h2>{activeHero.name}</h2><p>{activeHero.title}</p><div className="selected-stats"><span><small>HP</small><b>{activeHero.hp}</b></span><span><small>POWER</small><b>{activeHero.power}</b></span><span><small>DEFENSE</small><b>{activeHero.defense}</b></span><span><small>LUCK</small><b>{activeHero.luck}</b></span></div><button className="button button-blue" onClick={()=>showToast(`${activeHero.name} is your active champion.`)}>SET AS CHAMPION</button></div></div>
        </div>}

        {activeTab === "Home" && <div className="home-view"><div className="hero-banner"><img src="/heroes/warden.webp" alt="Runeborn champion"/><div><div className="eyebrow">WELCOME TO THE VEILFALL</div><h1>Your legend <em>begins.</em></h1><p>The old kingdoms have fallen. The runes have awakened. Gather your champions and reclaim the realms.</p><button className="button button-gold" onClick={()=>setActiveTab("Arena")}>ENTER THE ARENA <Swords size={16}/></button></div></div><div className="home-cards"><button onClick={()=>setActiveTab("Heroes")}><Shield/><b>Hero Collection</b><span>Manage your champions</span></button><button onClick={()=>setActiveTab("Dungeon")}><Castle/><b>Ancient Dungeons</b><span>Explore the forgotten halls</span></button><button onClick={()=>setActiveTab("Summon")}><Sparkles/><b>Summoning Altar</b><span>Discover new Runeborn</span></button></div></div>}

        {activeTab === "Summon" && <div className="summon-view"><div className="summon-art"><div className="summon-orbit"/><Sparkles size={64}/><span>THE ASTRAL ALTAR</span></div><div className="page-heading"><div className="eyebrow">CALL UPON THE ANCIENTS</div><h1>Summon the <em>Runeborn</em></h1><p>Spend 300 crystals to discover a new champion.</p></div><button className="button button-purple summon-button" onClick={summon}><Sparkles size={18}/> SUMMON HERO · 300 <Gem size={17}/></button><small className="muted">Your new hero is added to your collection and selected automatically.</small></div>}

        {activeTab === "Dungeon" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">DESCEND INTO DARKNESS</div><h1>Ancient <em>Dungeons</em></h1><p>Three forgotten gates stand before you. Their secrets are not freely given.</p></div><div className="dungeon-grid">{["The Hollow Keep","Frostgrave Depths","Ashen Cathedral"].map((name,i)=><article key={name}><div className="dungeon-symbol">{i===0?<Castle/>:i===1?<Sparkles/>:<Flame/>}</div><span className="eyebrow">DUNGEON 0{i+1}</span><h3>{name}</h3><p>{["A fortress swallowed by the Veil.","A frozen labyrinth beneath the mountains.","A sanctuary consumed by old fire."][i]}</p><b>RECOMMENDED POWER · {120+i*55}</b><button className="button button-blue" onClick={()=>showToast("Dungeon expedition is coming in the next chapter.")}>PREPARE EXPEDITION</button></article>)}</div></div>}

        {activeTab === "Quests" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">THE CHRONICLE</div><h1>Daily <em>Quests</em></h1><p>Every legend is built one deed at a time.</p></div><div className="quest-list">{[{name:"Arena Challenger",desc:"Enter the Rune Arena and face a champion.",reward:500},{name:"Gather the Runeborn",desc:"Summon a new hero at the Astral Altar.",reward:350},{name:"A Growing Legend",desc:"Own five heroes in your collection.",reward:800}].map((q,i)=><article key={q.name}><div className="quest-icon"><ScrollText/></div><div><b>{q.name}</b><p>{q.desc}</p><small>REWARD · {q.reward} GOLD</small></div><button className="button button-gold" disabled={claimedQuests.includes(q.name)} onClick={()=>claimQuest(q.reward,q.name)}>{claimedQuests.includes(q.name)?"CLAIMED":"CLAIM"}</button></article>)}</div></div>}

        {activeTab === "Guild" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">STAND TOGETHER</div><h1>Runeborn <em>Guilds</em></h1><p>Even the strongest champion needs allies.</p></div><div className="coming-panel"><Users size={48}/><h2>The Guild Hall is awakening.</h2><p>Guild creation, member ranks, shared quests and seasonal wars are planned for a future chapter.</p></div></div>}

        {activeTab === "Rankings" && <div className="simple-view"><div className="page-heading"><div className="eyebrow">THE ETERNAL LADDER</div><h1>Realm <em>Rankings</em></h1><p>Only the strongest names survive the chronicles.</p></div><div className="ranking-list">{["Aetherion","Valkyra","DreadSaint","Mukedlii","Nyx"].map((n,i)=><div key={n}><b className="rank-number">0{i+1}</b><span className="rank-avatar">{n[0]}</span><strong>{n}</strong><span>{fmt(248000-i*18400)} PWR</span><Trophy size={17}/></div>)}</div></div>}

        <footer className="content-footer"><span>MYTHRAETH © 2026</span><span>BUILT FOR THE RUNEBORN</span><button onClick={()=>{localStorage.removeItem("mythraeth-save-v1");setHeroes(initialHeroes);setActiveHeroId("warden");setGold(245670);setGems(12450);setSummonCount(0);setAttempts(3);setClaimedQuests([]);setInventory(starterGear);setEquipped({ warden: { Weapon: "starter-sword", Armor: "starter-armor", Boots: "starter-boots", Necklace: "starter-necklace" } });showToast("Local save reset.");}}><RotateCcw size={12}/> RESET LOCAL SAVE</button></footer>
      </section>
    </div>

    <nav className="mobile-nav">{nav.slice(0,6).map(item=><button key={item.tab} onClick={()=>setActiveTab(item.tab)} className={activeTab===item.tab?"active":""}>{item.icon}<small>{item.label}</small></button>)}</nav>

    {battleOpen && <div className="modal-backdrop"><section className="battle-modal"><button className="modal-close" onClick={()=>setBattleOpen(false)}><X/></button><div className="battle-title"><span className="eyebrow">RUNE ARENA · DUEL {turn}</span><h2>{battleHp>0&&enemyHp>0?"The Clash of Champions":enemyHp<=0?"VICTORY":"DEFEAT"}</h2></div><div className="battle-duel"><div className="duelist"><HeroArt hero={activeHero}/><b>{activeHero.name}</b><small>YOUR CHAMPION</small><div className="hp-track"><i style={{width:`${Math.max(0,battleHp/activeHero.hp*100)}%`}}/></div><small>{battleHp} / {activeHero.hp} HP</small></div><div className="versus">VS</div><div className="duelist enemy-duelist"><div className="enemy-battle-art"><img src={selectedEnemy.image} alt={selectedEnemy.name}/></div><b>{selectedEnemy.name}</b><small>ARENA OPPONENT</small><div className="hp-track enemy-hp"><i style={{width:`${Math.max(0,enemyHp/selectedEnemy.hp*100)}%`}}/></div><small>{enemyHp} / {selectedEnemy.hp} HP</small></div></div><div className="battle-log">{battleLog.map((line,i)=><p key={i}>{line}</p>)}</div>{battleHp>0&&enemyHp>0?<div className="battle-actions"><button disabled={busy} onClick={()=>takeTurn("strike")}><Swords/> STRIKE</button><button disabled={busy} onClick={()=>takeTurn("rune")}><Sparkles/> RUNE BURST</button><button disabled={busy} onClick={()=>takeTurn("guard")}><Shield/> GUARD</button></div>:<button className="button button-gold battle-end" onClick={()=>setBattleOpen(false)}>RETURN TO ARENA</button>}</section></div>}
    {toast && <div className="toast"><Sparkles size={16}/>{toast}</div>}
  </main>;
}
