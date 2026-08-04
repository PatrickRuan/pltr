// 規模、分塊與腐爛 —— 「為什麼這件事困難」那一關的計算後端。
//
// 這一關存在的理由：教材裡只有十幾筆資料，學員三分鐘就做完了，
// 很容易得出「這不難」的結論。難的地方不在單一組配對的判斷，
// 在於這個判斷要乘以幾億次、要在錯誤看不見的情況下做、而且要做十年。

import { normalize } from './text';

/** n 筆紀錄要兩兩比對的組合數 */
export function pairCount(n) {
  return (n * (n - 1)) / 2;
}

/**
 * 把配對數換算成人力與模型的實際代價。
 * 所有參數都攤在外面，因為學員應該看得到它們、也應該能質疑它們。
 */
export const COST_ASSUMPTIONS = {
  humanSecondsPerPair: 20,      // 一組配對看 20 秒（已經算快了）
  humanHoursPerYear: 1800,      // 一個人一年的有效工時
  modelUsdPerPair: 0.004,       // 每組配對的 token 成本
  modelSecondsPerPair: 0.8,     // 每組配對的延遲
  modelConcurrency: 20,         // 同時打幾條
};

export function estimateCost(n, a = COST_ASSUMPTIONS) {
  const pairs = pairCount(n);
  const humanHours = (pairs * a.humanSecondsPerPair) / 3600;
  const humanYears = humanHours / a.humanHoursPerYear;
  const modelUsd = pairs * a.modelUsdPerPair;
  const modelSeconds = (pairs * a.modelSecondsPerPair) / a.modelConcurrency;
  return {
    n,
    pairs,
    humanHours,
    humanYears,
    modelUsd,
    modelSeconds,
    modelDays: modelSeconds / 86400,
  };
}

/** 人看得懂的時間長度 */
export function humanDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(0)} 秒`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)} 分鐘`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} 小時`;
  if (seconds < 86400 * 365) return `${(seconds / 86400).toFixed(1)} 天`;
  return `${(seconds / 86400 / 365).toFixed(1)} 年`;
}

export function compactNumber(n) {
  if (n < 1000) return n.toLocaleString();
  if (n < 1e8) return n.toLocaleString();
  if (n < 1e12) return `${(n / 1e8).toFixed(1)} 億`;
  return `${(n / 1e12).toFixed(2)} 兆`;
}

// ─────────────────────────────────────────────
// 分塊 (Blocking)
// ─────────────────────────────────────────────
//
// 全部兩兩比對做不到，所以實務上先用一個便宜的鍵把紀錄分堆，
// 只比同一堆裡的。問題是：真正該配在一起的兩筆，如果被分到不同堆，
// 你就再也沒有機會發現它們了 —— 而且你不會知道自己漏了什麼。

export const BLOCKING_KEYS = [
  {
    id: 'none',
    label: '不分塊（全部兩兩比）',
    desc: '正確率最高，但代價是 n²',
    fn: () => 'ALL',
  },
  {
    id: 'name2',
    label: '名稱前 2 字',
    desc: '最常見的做法，便宜又直覺',
    fn: (r) => normalize(r.name).replace(/\s/g, '').slice(0, 2) || '∅',
  },
  {
    id: 'key2',
    label: '統編／稅籍號前 2 碼',
    desc: '主鍵最可靠 —— 但沒有主鍵的紀錄怎麼辦？',
    fn: (r) => (r.externalKey ? r.externalKey.slice(0, 2) : '∅無主鍵'),
  },
  {
    id: 'source',
    label: '依來源系統分塊',
    desc: '看起來合理，其實是最糟的一種',
    fn: (r) => r.sourceLabel.split(/[ 0-9]/)[0],
  },
];

/**
 * 算一個分塊鍵的效果：省下多少比對，以及代價是漏掉幾組正確答案。
 * recall 只針對 ground truth 為「同一實體」的配對計算。
 */
export function blockingStats(records, pairs, keyDef) {
  const blocks = new Map();
  for (const r of records) {
    const k = keyDef.fn(r);
    if (!blocks.has(k)) blocks.set(k, []);
    blocks.get(k).push(r);
  }

  let candidates = 0;
  for (const group of blocks.values()) candidates += pairCount(group.length);

  const total = pairCount(records.length);
  const truePairs = pairs.filter((p) => p.sameEntity);
  const kept = truePairs.filter((p) => keyDef.fn(p.left) === keyDef.fn(p.right));
  const lost = truePairs.filter((p) => keyDef.fn(p.left) !== keyDef.fn(p.right));

  return {
    keyId: keyDef.id,
    blocks: [...blocks.entries()]
      .map(([k, v]) => ({ key: k, size: v.length, members: v }))
      .sort((a, b) => b.size - a.size),
    candidates,
    total,
    reduction: total > 0 ? 1 - candidates / total : 0,
    recall: truePairs.length > 0 ? kept.length / truePairs.length : 1,
    kept: kept.length,
    lost,
    truePairsTotal: truePairs.length,
  };
}

// ─────────────────────────────────────────────
// 腐爛 (Drift)
// ─────────────────────────────────────────────
//
// ⚠ 這是一個「模型」，不是量測結果。所有參數都攤在 UI 上讓學員自己調，
// 因為重點不是某個特定數字，是這條曲線的形狀：不維護就會往下掉，而且不會停。

export const DECAY_DEFAULTS = {
  months: 18,
  novelRatePerMonth: 0.08,  // 每月新進資料裡「規則沒見過的模式」比例
  masteredAccuracy: 0.94,   // 規則對已知模式的準確率
  novelAccuracy: 0.45,      // 規則對沒見過的模式的準確率
  maintenanceLagMonths: 2,  // 有人維護時，新模式多久被吸收進規則
};

/**
 * 模擬 N 個月後，一套固定規則的準確率。
 * maintained=false：新模式永遠不會被吸收，未知比例單調上升。
 * maintained=true：新模式在 lag 個月後被吸收，系統進入一個穩定但不為零的失準水位。
 */
export function simulateDecay({ maintained, ...opts } = {}) {
  const o = { ...DECAY_DEFAULTS, ...opts };
  const series = [];
  // 每個元素代表「第 i 個月進來的、還沒被吸收的新模式」佔總體的比例
  let unknownCohorts = [];

  for (let m = 1; m <= o.months; m++) {
    unknownCohorts.push({ age: 0, share: o.novelRatePerMonth });
    unknownCohorts = unknownCohorts.map((c) => ({ ...c, age: c.age + 1 }));

    if (maintained) {
      unknownCohorts = unknownCohorts.filter((c) => c.age <= o.maintenanceLagMonths);
    }

    const unknownShare = Math.min(1, unknownCohorts.reduce((s, c) => s + c.share, 0));
    const accuracy = (1 - unknownShare) * o.masteredAccuracy + unknownShare * o.novelAccuracy;
    series.push({ month: m, unknownShare, accuracy });
  }

  return {
    series,
    final: series[series.length - 1],
    start: o.masteredAccuracy,
    opts: o,
  };
}
