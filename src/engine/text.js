// 字串正規化與相似度 —— 實體解析的地基。
// 這裡沒有任何假資料，全部是真的會跑的演算法。

/** 全形轉半形（台灣資料的頭號污染源：Big5 時代的遺產） */
export function toHalfWidth(str) {
  return str.replace(/[！-～]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  ).replace(/　/g, ' ');
}

/** 常見的公司組織後綴 —— 正規化時要剝掉，否則「巨大機械」和「巨大機械股份有限公司」永遠對不上 */
const ORG_SUFFIXES = [
  '股份有限公司', '有限公司', '股份公司',
  '(股)', '（股）', '股', '公司', '企業社', '商行', '工作室',
  'Aktiengesellschaft', 'Corporation', 'Incorporated', 'Limited',
  'GmbH', 'AG', 'Inc', 'Corp', 'Ltd', 'LLC', 'Co', 'PLC', 'SE', 'NV', 'BV',
];

// 長的排前面，否則「股」會先吃掉「股份有限公司」的一部分，把字串攪爛
const SUFFIXES_BY_LENGTH = [...ORG_SUFFIXES].sort((a, b) => b.length - a.length).map((s) => s.toLowerCase());

/**
 * 正規化：小寫、半形、去標點、剝除結尾的組織後綴。
 *
 * 後綴只從「結尾」剝，而且反覆剝到剝不動為止。這很重要 ——
 * 早期版本是全域取代，結果「巨鋒機械股份有限公可」（OCR 把司讀成可）
 * 裡的那個「股」被單獨挖掉，字串直接爛掉。這種細節就是實務上真正在耗時間的東西。
 *
 * 另外注意：剝掉後綴會讓不同的公司變得更像（「巨鋒機械」vs「巨鋒機械興業」），
 * 這是這個方法無法迴避的副作用，Stage 3 會讓學員親眼撞到。
 */
export function normalize(raw) {
  if (!raw) return '';
  let s = toHalfWidth(String(raw)).toLowerCase().trim();
  s = s.replace(/[.,()（）[\]{}·・、,．-]/g, ' ').replace(/\s+/g, ' ').trim();

  let changed = true;
  while (changed) {
    changed = false;
    for (const suffix of SUFFIXES_BY_LENGTH) {
      if (s.length > suffix.length && s.endsWith(suffix)) {
        s = s.slice(0, -suffix.length).trim();
        changed = true;
        break;
      }
    }
  }
  return s.replace(/\s+/g, ' ').trim();
}

/** Levenshtein 編輯距離 */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** 編輯距離轉相似度，0～1 */
export function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na && !nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(na, nb) / maxLen;
}

/** 字元 bigram 的 Dice 係數 —— 對中文比純編輯距離穩一些 */
export function diceCoefficient(a, b) {
  const grams = (s) => {
    const n = normalize(s).replace(/\s/g, '');
    if (n.length < 2) return n ? [n] : [];
    return Array.from({ length: n.length - 1 }, (_, i) => n.slice(i, i + 2));
  };
  const ga = grams(a);
  const gb = grams(b);
  if (!ga.length && !gb.length) return 1;
  if (!ga.length || !gb.length) return 0;

  const pool = new Map();
  for (const g of ga) pool.set(g, (pool.get(g) || 0) + 1);
  let hits = 0;
  for (const g of gb) {
    const c = pool.get(g) || 0;
    if (c > 0) {
      hits++;
      pool.set(g, c - 1);
    }
  }
  return (2 * hits) / (ga.length + gb.length);
}

/** 綜合分數：取編輯距離與 bigram 的較大值 */
export function nameScore(a, b) {
  return Math.max(similarity(a, b), diceCoefficient(a, b));
}
