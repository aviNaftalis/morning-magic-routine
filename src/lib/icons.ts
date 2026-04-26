import {
  Shirt, Footprints, Brush, Bath, Bed, Apple, Cookie, Backpack, BookOpen,
  Toilet, Droplet, Sun, Moon, Star, Heart, Smile, Sparkles, Cloud, Coffee,
  Utensils, GlassWater, Pill, Scissors, Watch, Glasses, Music, Gamepad2,
  Hand, Wind, Trophy, Crown, Rocket, Sandwich, Salad, Flower2, Palette,
  type LucideIcon, type LucideProps,
} from "lucide-react";
import { forwardRef } from "react";

// Custom toothbrush icon (Lucide doesn't ship one)
const Toothbrush: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* handle */}
      <path d="M14 10 L21 3" />
      {/* head */}
      <rect x="4" y="10" width="11" height="5" rx="1.5" />
      {/* bristles */}
      <path d="M5 10 V8" />
      <path d="M7.5 10 V7" />
      <path d="M10 10 V7" />
      <path d="M12.5 10 V8" />
      {/* foam bubble */}
      <circle cx="6" cy="18" r="1.2" />
      <circle cx="9" cy="19" r="0.8" />
    </svg>
  )
) as unknown as LucideIcon;
(Toothbrush as unknown as { displayName: string }).displayName = "Toothbrush";

// Custom sandal icon
const Sandal: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* sole */}
      <path d="M6 18c-1.5 0-2.5-1-2.5-2.5S4 13 5.5 13h11c2 0 3.5 1.5 3.5 3s-1.5 2-3 2H6z" />
      {/* straps */}
      <path d="M8 13 L11 9" />
      <path d="M14 13 L11 9" />
      <path d="M11 9 L11 7" />
    </svg>
  )
) as unknown as LucideIcon;
(Sandal as unknown as { displayName: string }).displayName = "Sandal";

// Custom skirt icon
const Skirt: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 6 H17" />
      <path d="M7 6 L3 20" />
      <path d="M17 6 L21 20" />
      <path d="M3 20 Q12 18 21 20" />
      <path d="M9 10 L8 20" />
      <path d="M15 10 L16 20" />
    </svg>
  )
) as unknown as LucideIcon;
(Skirt as unknown as { displayName: string }).displayName = "Skirt";

// Custom cream/lotion tube icon
const CreamTube: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 3 H16 L15 6 H9 Z" />
      <rect x="7" y="6" width="10" height="15" rx="2" />
      <path d="M10 11 H14" />
      <circle cx="12" cy="14.5" r="1" />
    </svg>
  )
) as unknown as LucideIcon;
(CreamTube as unknown as { displayName: string }).displayName = "CreamTube";

// Custom hair brush / ponytail icon
const HairBrush: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* handle */}
      <path d="M14 14 L20 20" />
      {/* oval brush head */}
      <ellipse cx="10" cy="10" rx="6" ry="4" transform="rotate(-45 10 10)" />
      {/* bristles */}
      <path d="M6 6 L4 4" />
      <path d="M9 5 L8 3" />
      <path d="M12 6 L13 4" />
      <path d="M5 9 L3 8" />
      <path d="M6 12 L4 13" />
    </svg>
  )
) as unknown as LucideIcon;
(HairBrush as unknown as { displayName: string }).displayName = "HairBrush";

// Custom lunch box icon
const LunchBox: LucideIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7 V5 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 v2" />
      <path d="M3 12 H21" />
      <circle cx="17" cy="10" r="0.8" />
    </svg>
  )
) as unknown as LucideIcon;
(LunchBox as unknown as { displayName: string }).displayName = "LunchBox";

export const iconMap: Record<string, LucideIcon> = {
  shirt: Shirt,
  pants: Footprints,
  skirt: Skirt,
  sandals: Sandal,
  brush: Brush, // paintbrush (kept for backwards compat)
  toothbrush: Toothbrush,
  hairbrush: HairBrush,
  cream: CreamTube,
  lunchbox: LunchBox,
  bath: Bath,
  bed: Bed,
  apple: Apple,
  cookie: Cookie,
  sandwich: Sandwich,
  salad: Salad,
  backpack: Backpack,
  book: BookOpen,
  toilet: Toilet,
  water: Droplet,
  sun: Sun,
  moon: Moon,
  star: Star,
  heart: Heart,
  smile: Smile,
  sparkles: Sparkles,
  cloud: Cloud,
  coffee: Coffee,
  food: Utensils,
  drink: GlassWater,
  pill: Pill,
  scissors: Scissors,
  watch: Watch,
  glasses: Glasses,
  music: Music,
  game: Gamepad2,
  hand: Hand,
  feet: Footprints,
  wind: Wind,
  flower: Flower2,
  palette: Palette,
  trophy: Trophy,
  crown: Crown,
  rocket: Rocket,
};

export const iconKeys = Object.keys(iconMap);

export function getIcon(key: string): LucideIcon {
  return iconMap[key] ?? Star;
}
