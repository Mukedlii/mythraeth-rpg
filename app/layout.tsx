import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MYTHRAETH — Rise of the Runeborn",
  description: "A dark fantasy hero-collection RPG. Build your squad, enter the arena, become a legend.",
  applicationName: "MYTHRAETH"
};

export const viewport: Viewport = {
  themeColor: "#080914",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
