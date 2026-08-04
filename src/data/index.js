import { semiconductor } from './semiconductor';
import { twSme } from './twSme';

/** 把 pairs 裡的 left/right（字串 id）換成實際的 record 物件，讓 resolvers 可以直接吃 */
function hydrate(ds) {
  const byId = new Map(ds.resolution.records.map((r) => [r.id, r]));
  return {
    ...ds,
    resolution: {
      ...ds.resolution,
      pairs: ds.resolution.pairs.map((p) => ({
        ...p,
        left: byId.get(p.left),
        right: byId.get(p.right),
      })),
    },
  };
}

export const DATASETS = [hydrate(twSme), hydrate(semiconductor)];

export function getDataset(id) {
  return DATASETS.find((d) => d.id === id) || DATASETS[0];
}

export const STAGES = [
  { id: 'raw', n: 1, title: '原始混亂', subtitle: '資料長什麼樣子', blurb: '五份來源，沒有一份能直接用。' },
  { id: 'model', n: 2, title: '定義物件', subtitle: '決定世界由什麼組成', blurb: '欄位屬於哪個物件？誰是身分、誰是屬性。' },
  { id: 'resolve', n: 3, title: '實體解析', subtitle: '這兩筆是同一個東西嗎', blurb: '整套方法最難、也最值錢的一關。' },
  { id: 'whyhard', n: 4, title: '為什麼困難', subtitle: '規模、取捨、腐爛與人', blurb: '把「這也還好」的錯覺拆掉。' },
  { id: 'graph', n: 5, title: '建立關聯', subtitle: '把物件連成圖', blurb: '解析完才畫得出來的那張圖。' },
  { id: 'simulate', n: 6, title: '約束傳播', subtitle: '資源是有限的', blurb: '每個數字都是算出來的，不是寫死的。' },
  { id: 'act', n: 7, title: '動作與寫回', subtitle: '把決策送回現實', blurb: '權限、衝突、部分失敗、稽核。' },
  { id: 'debrief', n: 8, title: '總結與卓越', subtitle: '你還能做什麼', blurb: '同一條流水線，兩種世界，以及往哪走。' },
];
