import { guessCategory, inDays } from '@/features/pantry/categories';
import { daysLeft, matchRecipe } from '@/features/pantry/pantryUtils';
import type { PantryItem } from '@/features/pantry/types';
import type { Recipe } from '@/features/recipes/types';

import type { PreferenceId } from './preferences';

/** Öneri adayı: kendi defterinden ya da topluluktan (Keşfet) */
export type Candidate = {
  recipe: Recipe;
  origin: 'own' | 'community';
  avgRating: number;
  ratingCount: number;
};

export type RecommendContext = {
  pantry: PantryItem[];
  preferences: PreferenceId[];
  /** Sihirli Tencere'ye atılan kiler malzemeleri */
  selectedIds: string[];
  /** recipeId → son pişirilme zamanı (ISO) */
  lastCooked: Record<string, string>;
  today: Date;
};

export type Recommendation = { candidate: Candidate; score: number; matchPercent: number; reasons: string[] };

// Puan ağırlıkları (ayarlanabilir); gerekçeler kullanıcıya gösterilir
const WEIGHT = {
  pantryMatch: 0.4, // %100 eşleşme = 40 puan
  rescue: 12, // bozulmak üzere olan her malzeme
  selected: 15, // tencereye atılan her malzeme
  favorite: 10,
  quick: 12,
  sweet: 10,
  dietConflict: -40,
  cookedRecently: -25,
  communityRating: 8, // (Bayes ortalama - 3) ile çarpılır
};
const QUICK_MINUTES = 20;
const RESCUE_DAYS = 2;
const RECENT_DAYS = 2;

// ponytail: anahtar kelime listesi; malzeme adlarında geçmeyen gluten/et kaçabilir
const GLUTEN = ['un', 'ekmek', 'makarna', 'penne', 'spagetti', 'erişte', 'bulgur', 'irmik', 'yufka', 'galeta', 'bisküvi', 'arpa', 'lavaş', 'tortilla', 'şehriye'];

const norm = (text: string) => text.trim().toLocaleLowerCase('tr-TR');
const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase('tr-TR') + text.slice(1);
const words = (text: string) => norm(text).split(/\s+/);

const pantryHas = (ingredient: string, item: PantryItem) => norm(item.name).includes(norm(ingredient));

function scoreOne(candidate: Candidate, ctx: RecommendContext): Recommendation {
  const { recipe } = candidate;
  const reasons: string[] = [];
  const penalties: string[] = [];
  const names = recipe.ingredients.map((i) => i.name);
  let score = 0;

  const match = matchRecipe(recipe, ctx.pantry);
  score += match.percent * WEIGHT.pantryMatch;
  if (match.have.length >= 2) reasons.push(`🧺 Kilerindeki ${match.have.length} malzemeyle`);

  const selected = ctx.pantry.filter((p) => ctx.selectedIds.includes(p.id));
  const usesSelected = names.filter((n) => selected.some((p) => pantryHas(n, p))).length;
  score += usesSelected * WEIGHT.selected;
  if (usesSelected > 0) reasons.push(`🪄 Tenceredeki ${usesSelected} malzemeyi kullanır`);

  const rescued = names.filter((n) =>
    ctx.pantry.some((p) => pantryHas(n, p) && daysLeft(p.expiresOn, ctx.today) <= RESCUE_DAYS && daysLeft(p.expiresOn, ctx.today) >= 0),
  );
  score += rescued.length * WEIGHT.rescue;
  if (rescued.length > 0) reasons.push(`🛟 ${capitalize(rescued[0])} bozulmadan değerlendirilir`);

  if (ctx.preferences.includes('vejetaryen') && names.some((n) => guessCategory(n) === 'et')) {
    score += WEIGHT.dietConflict;
    penalties.push('🥩 İçinde et var');
  }
  if (ctx.preferences.includes('glutensiz') && names.some((n) => words(n).some((w) => GLUTEN.some((g) => w.startsWith(g))))) {
    score += WEIGHT.dietConflict;
    penalties.push('🌾 Gluten içeriyor');
  }
  if (ctx.preferences.includes('pratik') && recipe.minutes <= QUICK_MINUTES) {
    score += WEIGHT.quick;
    reasons.push(`⚡ Sadece ${recipe.minutes} dk`);
  }
  if (ctx.preferences.includes('tatli') && recipe.tags.includes('tatli')) {
    score += WEIGHT.sweet;
    reasons.push('🍓 Tatlı krizine birebir');
  }

  if (recipe.favorite) {
    score += WEIGHT.favorite;
    reasons.push('❤️ Favorin');
  }
  const last = ctx.lastCooked[recipe.id];
  if (last && daysLeft(inDays(0, new Date(last)), ctx.today) >= -RECENT_DAYS) {
    score += WEIGHT.cookedRecently;
    penalties.push('🔁 Yakın zamanda pişirdin');
  }
  score += Math.min(recipe.cookedCount, 5);

  if (candidate.origin === 'community') {
    // Az oylu tarif tek 5 yıldızla şişmesin: 3 yıldızlık 2 hayali oyla ağırlıklı ortalama
    const bayes = (candidate.avgRating * candidate.ratingCount + 6) / (candidate.ratingCount + 2);
    score += (bayes - 3) * WEIGHT.communityRating;
    if (candidate.ratingCount >= 3 && candidate.avgRating >= 4) reasons.push(`⭐ Toplulukta ${candidate.avgRating.toFixed(1)}`);
  }

  return { candidate, score, matchPercent: match.percent, reasons: [...reasons, ...penalties] };
}

/** Adayları puanlar ve en uygundan sıralar */
export function recommend(candidates: Candidate[], ctx: RecommendContext): Recommendation[] {
  return candidates.map((c) => scoreOne(c, ctx)).sort((a, b) => b.score - a.score);
}

/** Günün tarifi: en iyi 5 içinden tarihe göre seçilir — gün içinde sabit, her gün değişir */
export function dailyPick(ranked: Recommendation[], today: Date): Recommendation | null {
  // Diyete aykırı ya da dün pişirilen (eksi puanlı) tarif günün tarifi olmasın
  const positive = ranked.filter((r) => r.score > 0);
  const top = (positive.length > 0 ? positive : ranked).slice(0, 5);
  if (top.length === 0) return null;
  const seed = [...inDays(0, today)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return top[seed % top.length];
}
