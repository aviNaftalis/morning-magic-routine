import {
  Shirt, Footprints, Brush, Bath, Bed, Apple, Cookie, Backpack, BookOpen,
  Toilet, Droplet, Sun, Moon, Star, Heart, Smile, Sparkles, Cloud, Coffee,
  Utensils, GlassWater, Pill, Scissors, Watch, Glasses, Music, Gamepad2,
  Hand, Footprints as Feet, Wind, Trophy, Crown, Rocket, type LucideIcon
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  shirt: Shirt,
  pants: Footprints,
  brush: Brush,
  bath: Bath,
  bed: Bed,
  apple: Apple,
  cookie: Cookie,
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
  feet: Feet,
  wind: Wind,
  trophy: Trophy,
  crown: Crown,
  rocket: Rocket,
};

export const iconKeys = Object.keys(iconMap);

export function getIcon(key: string): LucideIcon {
  return iconMap[key] ?? Star;
}
