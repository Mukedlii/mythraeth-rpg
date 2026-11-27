import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Coins, Gem, Plus } from "lucide-react";

export type GearRarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export function Panel({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`game-panel ${className}`} {...props}>{children}</div>;
}

export function RarityFrame({ rarity, children, className = "", ariaLabel, style }: { rarity: GearRarity; children: ReactNode; className?: string; ariaLabel?: string; style?: CSSProperties }) {
  return <div role="img" aria-label={ariaLabel} style={style} className={`rarity-frame ${rarity.toLowerCase()} ${className}`}>{children}</div>;
}

export function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return <span className="star-rating" aria-label={`${value} out of ${max} stars`}>{Array.from({ length: max }, (_, i) => <span key={i} aria-hidden="true">{i < value ? "★" : "☆"}</span>)}</span>;
}

export function GameButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`game-button ${className}`} {...props}>{children}</button>;
}

export function CurrencyPill({ kind, value, onAdd }: { kind: "gold" | "gems"; value: string; onAdd: () => void }) {
  return <span className={`currency-pill currency-${kind}`}><span className="currency-value">{kind === "gold" ? <Coins size={14}/> : <Gem size={14}/>} {value}</span><button type="button" onClick={onAdd} aria-label={`Add ${kind}`}><Plus size={12}/></button></span>;
}

export function ItemSlot({ label, rarity, children, onClick, level }: { label: string; rarity?: GearRarity; children: ReactNode; onClick: () => void; level?: number }) {
  return <button type="button" className={`item-slot ${rarity ? rarity.toLowerCase() : "empty"}`} onClick={onClick} aria-label={`${label}${level ? ` plus ${level}` : ""}`}>
    {children}<small>{label}</small>{level !== undefined && <b>+{level}</b>}
  </button>;
}
