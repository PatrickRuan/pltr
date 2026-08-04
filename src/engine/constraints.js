// 約束傳播引擎。
//
// 這是原本那份 demo 最缺的東西：那邊的「影響評估」是寫死的字串，
// 這裡的每一個數字都是算出來的。資源是有限的，你把庫存撥給 A，B 就會缺，
// 而 B 的違約金會自己浮出來 —— 這才是本體論的重點：約束沿著圖傳播。

/**
 * scenario 結構：
 *   resources: { [id]: { label, unit, available } }
 *   demands:   [ { id, label, customer, qty, resourceId, etaHrs, deadlineHrs, penalty, note } ]
 *   options:   [ { id, label, desc, cash, effects: [...], risk } ]
 *
 * effect 種類：
 *   { kind: 'eta',      demandId, deltaHrs }     調整到貨時間
 *   { kind: 'deadline', demandId, deltaHrs }     調整交期（跟客戶談出來的）
 *   { kind: 'source',   demandId, resourceId }   改由另一個資源池供應
 *   { kind: 'consume',  resourceId, qty }        消耗資源；qty 為負代表「增加產能」（外包、加班）
 *   { kind: 'note',     demandId, text }         附註（不影響計算）
 */

export function simulate(scenario, selectedOptionIds = []) {
  const options = scenario.options.filter((o) => selectedOptionIds.includes(o.id));

  // --- 複製初始狀態 ---
  const resources = {};
  for (const [id, r] of Object.entries(scenario.resources)) {
    resources[id] = { ...r, id, used: 0 };
  }
  const demands = scenario.demands.map((d) => ({ ...d, notes: [] }));
  const byId = new Map(demands.map((d) => [d.id, d]));

  // --- 套用所有選中方案的效果 ---
  // 注意：option.cash 在資料裡是負數（代表現金流出），這裡轉成正的「支出」，
  // 讓 totalCost 是一個「越小越好」的數字。早期版本沒轉，導致 findOptimal
  // 把「花最多錢」當成最佳解 —— 符號錯誤是這類成本模型最典型的 bug。
  let cashCost = 0;
  for (const opt of options) {
    cashCost += Math.abs(opt.cash || 0);
    for (const eff of opt.effects || []) {
      if (eff.kind === 'eta') {
        const d = byId.get(eff.demandId);
        if (d) d.etaHrs = Math.max(0, d.etaHrs + eff.deltaHrs);
      } else if (eff.kind === 'deadline') {
        const d = byId.get(eff.demandId);
        if (d) d.deadlineHrs = Math.max(0, d.deadlineHrs + eff.deltaHrs);
      } else if (eff.kind === 'source') {
        const d = byId.get(eff.demandId);
        if (d) d.resourceId = eff.resourceId;
      } else if (eff.kind === 'consume') {
        if (resources[eff.resourceId]) resources[eff.resourceId].used += eff.qty;
      } else if (eff.kind === 'note') {
        const d = byId.get(eff.demandId);
        if (d) d.notes.push(eff.text);
      }
    }
  }

  // --- 資源分配：按需求順序扣減，扣不到的就是缺料 ---
  for (const d of demands) {
    const pool = resources[d.resourceId];
    if (!pool) {
      d.shortfall = d.qty;
      continue;
    }
    const remaining = pool.available - pool.used;
    const got = Math.max(0, Math.min(d.qty, remaining));
    pool.used += got;
    d.allocated = got;
    d.shortfall = d.qty - got;
  }

  // --- 逐筆判定：準時？缺料？罰多少？ ---
  let penaltyCost = 0;
  for (const d of demands) {
    d.late = d.etaHrs > d.deadlineHrs;
    d.short = d.shortfall > 0;
    d.breached = d.late || d.short;
    d.penaltyIncurred = d.breached ? d.penalty : 0;
    d.reasons = [];
    if (d.late) d.reasons.push(`到貨 ${d.etaHrs}hr 超過期限 ${d.deadlineHrs}hr（逾期 ${d.etaHrs - d.deadlineHrs}hr）`);
    if (d.short) d.reasons.push(`缺料 ${d.shortfall.toLocaleString()} ${resources[d.resourceId]?.unit || ''}`);
    penaltyCost += d.penaltyIncurred;
  }

  const resourceList = Object.values(resources).map((r) => ({
    ...r,
    remaining: r.available - r.used,
    overdrawn: r.used > r.available,
  }));

  return {
    demands,
    resources: resourceList,
    cashCost,
    penaltyCost,
    totalCost: cashCost + penaltyCost,
    breaches: demands.filter((d) => d.breached),
    selectedOptionIds: [...selectedOptionIds],
  };
}

/** 什麼都不做的基準線 —— 所有比較都以它為分母 */
export function baseline(scenario) {
  return simulate(scenario, []);
}

/**
 * 窮舉所有方案組合，找出總成本最低的一組。
 * 方案數量小（≤ 6），2^n 完全跑得動，而且對教學來說「電腦幫你窮舉」本身就是重點：
 * 學員先自己選，再看最佳解，會發現直覺常常漏掉互斥效應。
 */
export function findOptimal(scenario) {
  const ids = scenario.options.map((o) => o.id);
  let best = null;
  for (let mask = 0; mask < 1 << ids.length; mask++) {
    const combo = ids.filter((_, i) => mask & (1 << i));
    const result = simulate(scenario, combo);
    if (!best || result.totalCost < best.totalCost) best = result;
  }
  return best;
}

export function formatMoney(n, currency = 'NT$') {
  const sign = n < 0 ? '-' : '';
  return `${sign}${currency}${Math.abs(Math.round(n)).toLocaleString()}`;
}
