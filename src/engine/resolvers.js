// 四種實體解析策略。前三種是真的演算法，第四種是「模型」。
//
// 誠實聲明（UI 上也會顯示）：modelResolver 目前不會即時呼叫任何 LLM，
// 它讀取每組配對上預先錄製的 `modelVerdict`。這樣做的原因是這個教材要能
// 零金鑰、純靜態部署。錄製的判斷刻意包含模型會犯的真實錯誤型態
// （過度自信的合併、被品牌別名誤導、對本地知識無能為力），不是照抄答案。
//
// 要接真 API：只需替換下面的 modelResolver，維持相同介面
//   (pair) => { match: boolean, confidence: number, rationale: string }

import { normalize, nameScore } from './text';

/** 策略一：完全比對。正規化後字串一模一樣才算同一個。 */
export const exactResolver = {
  id: 'exact',
  label: '完全比對',
  sublabel: 'normalize() 後字串相等',
  cost: '幾乎為零',
  color: '#6b7280',
  run(pair) {
    const match = normalize(pair.left.name) === normalize(pair.right.name);
    return {
      match,
      confidence: match ? 1 : 0,
      rationale: match
        ? `正規化後兩邊都是「${normalize(pair.left.name)}」`
        : `正規化後為「${normalize(pair.left.name)}」與「${normalize(pair.right.name)}」，不相等`,
    };
  },
};

/** 策略二：模糊比對。相似度過門檻就合併。 */
export const fuzzyResolver = {
  id: 'fuzzy',
  label: '模糊比對',
  sublabel: '編輯距離 + bigram，門檻 0.62',
  cost: '幾乎為零',
  color: '#f59e0b',
  threshold: 0.62,
  run(pair) {
    const score = nameScore(pair.left.name, pair.right.name);
    const match = score >= 0.62;
    return {
      match,
      confidence: score,
      rationale: `名稱相似度 ${(score * 100).toFixed(0)}%，門檻 62% → ${match ? '判為同一' : '判為不同'}`,
    };
  },
};

/**
 * 策略三：外部主鍵優先。
 * 有統編／DUNS／法人代號就以它為準，沒有才退回模糊比對。
 * 這是整份教材最重要的一課，理由寫在 Debrief。
 */
export const keyedResolver = {
  id: 'keyed',
  label: '主鍵優先',
  sublabel: '有統編／法人代號就以它為準，否則退回模糊',
  cost: '幾乎為零',
  color: '#10b981',
  run(pair) {
    const lk = pair.left.externalKey;
    const rk = pair.right.externalKey;
    if (lk && rk) {
      const match = lk === rk;
      return {
        match,
        confidence: 1,
        rationale: match
          ? `雙方都有主鍵且相同（${lk}）→ 確定同一，不需猜`
          : `雙方都有主鍵但不同（${lk} vs ${rk}）→ 確定不同，不需猜`,
      };
    }
    const score = nameScore(pair.left.name, pair.right.name);
    const match = score >= 0.62;
    const missing = !lk ? pair.left.sourceLabel : pair.right.sourceLabel;
    return {
      match,
      confidence: score * 0.8,
      rationale: `「${missing}」這份資料沒有主鍵，只能退回名稱比對（${(score * 100).toFixed(0)}%）→ ${match ? '判為同一' : '判為不同'}`,
    };
  },
};

/** 策略四：模型判斷（預先錄製，見檔頭聲明） */
export const modelResolver = {
  id: 'model',
  label: '模型判斷',
  sublabel: '語意 + 世界知識（本教材為預錄結果）',
  cost: '每組配對約 $0.001～0.01',
  color: '#8b5cf6',
  simulated: true,
  run(pair) {
    const v = pair.modelVerdict;
    if (!v) {
      const score = nameScore(pair.left.name, pair.right.name);
      return { match: score >= 0.62, confidence: score, rationale: '（本組配對未錄製模型判斷，暫以模糊比對代替）' };
    }
    return { match: v.match, confidence: v.confidence, rationale: v.rationale };
  },
};

export const RESOLVERS = [exactResolver, fuzzyResolver, keyedResolver, modelResolver];

export function getResolver(id) {
  return RESOLVERS.find((r) => r.id === id) || exactResolver;
}

/**
 * 拿一個策略跑完整組配對，並對照 ground truth 算出混淆矩陣。
 * predictionsOverride 用來評分「人類學員」的作答。
 */
export function evaluate(pairs, resolver, predictionsOverride = null) {
  const rows = pairs.map((pair) => {
    const result = predictionsOverride
      ? {
          match: predictionsOverride[pair.id],
          confidence: 1,
          rationale: '學員手動判斷',
        }
      : resolver.run(pair);
    const truth = pair.sameEntity;
    let outcome;
    if (result.match === truth) outcome = truth ? 'TP' : 'TN';
    else outcome = result.match ? 'FP' : 'FN';
    return { pair, result, truth, outcome };
  });

  const tally = { TP: 0, TN: 0, FP: 0, FN: 0 };
  for (const r of rows) {
    if (r.result.match === undefined || r.result.match === null) continue;
    tally[r.outcome]++;
  }

  const answered = tally.TP + tally.TN + tally.FP + tally.FN;
  const precision = tally.TP + tally.FP > 0 ? tally.TP / (tally.TP + tally.FP) : null;
  const recall = tally.TP + tally.FN > 0 ? tally.TP / (tally.TP + tally.FN) : null;
  const f1 = precision !== null && recall !== null && precision + recall > 0
    ? (2 * precision * recall) / (precision + recall)
    : null;
  const accuracy = answered > 0 ? (tally.TP + tally.TN) / answered : null;

  return {
    rows,
    tally,
    answered,
    total: pairs.length,
    precision,
    recall,
    f1,
    accuracy,
    mistakes: rows.filter((r) => r.outcome === 'FP' || r.outcome === 'FN'),
  };
}

/** 把通過解析的配對合併成「解析後實體」—— 這是 Stage 4 建圖的輸入 */
export function buildResolvedEntities(records, pairs, resolver) {
  const parent = new Map(records.map((r) => [r.id, r.id]));
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  const union = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(rb, ra);
  };

  for (const pair of pairs) {
    if (resolver.run(pair).match) union(pair.left.id, pair.right.id);
  }

  const clusters = new Map();
  for (const rec of records) {
    const root = find(rec.id);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(rec);
  }
  return Array.from(clusters.values());
}
