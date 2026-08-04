import React from 'react';
import { Scale, KeyRound, Clock4, MapPin, Wrench, ArrowLeftRight } from 'lucide-react';
import { StageHead, Lesson } from '../components/ui';
import { DATASETS } from '../data';

const EFFORT = [
  { stage: '1 · 原始混亂', real: 25, slide: 0 },
  { stage: '2 · 定義物件', real: 20, slide: 5 },
  { stage: '3 · 實體解析', real: 30, slide: 5 },
  { stage: '4 · 建立關聯', real: 10, slide: 20 },
  { stage: '5 · 約束傳播', real: 8, slide: 35 },
  { stage: '6 · 動作與寫回', real: 7, slide: 35 },
];

const CONTRAST = [
  {
    dim: '資料源',
    icon: MapPin,
    semi: 'SAP、Salesforce、IoT Hub、船舶 API —— 都有文件、有欄位定義、有人維護',
    sme: '一套原廠倒閉的進銷存、老闆的 Excel、LINE 群組、手寫單掃描、老師傅的記憶',
  },
  {
    dim: '主鍵',
    icon: KeyRound,
    semi: '歐盟稅籍號、DUNS —— 有，但覆蓋率不完整（美國實體沒有、經銷商沒有）',
    sme: '統一編號 —— 全台灣通用、政府維護、覆蓋率接近 100%。但公司系統裡沒這個欄位',
  },
  {
    dim: '最難的一步',
    icon: Wrench,
    semi: '對齊。資料都在，但同一個東西在四個系統有四個名字',
    sme: '存在。最重要的約束（產能、規格變更、口頭改單）根本沒被任何系統記錄過',
  },
  {
    dim: '違約成本',
    icon: Scale,
    semi: '白紙黑字寫在合約第 14 條，可精算，會進董事會報告',
    sme: '「客戶下次不找你了」—— 看不見、算不出、沒人負責，但公司是這樣慢慢死掉的',
  },
  {
    dim: '寫回的障礙',
    icon: ArrowLeftRight,
    semi: '技術可行但嚴格：權限、稽核、法遵。難在流程',
    sme: '沒有 API 可寫。難在「哪一份資料才算數」這個組織問題',
  },
  {
    dim: '導入時間',
    icon: Clock4,
    semi: '數月到數年，有專職 IT 與外部顧問',
    sme: '通常沒有專職 IT。所有事情都要在老闆的耐心用完之前看到成果',
  },
];

export default function StageDebrief({ ds, onRestart, onSwitch }) {
  const other = DATASETS.find((d) => d.id !== ds.id);

  return (
    <div className="stack fade">
      <StageHead n={7} title="總結對照" subtitle="兩份資料集並排看" accent={ds.accent}>
        你剛才用同一條六步流水線，跑完了一份資料集。另一份的每一關都長得一樣，難度卻完全不同 ——
        那個落差，就是這份教材真正想教的東西。
      </StageHead>

      {/* 工時分配 */}
      <div className="panel stack">
        <h3>工時的真相</h3>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          左邊是實務上每一關真正花掉的時間；右邊是廠商簡報裡每一關佔的篇幅。
          <strong style={{ color: '#fff' }}>這兩個分佈幾乎是倒過來的。</strong>
          任何一份把重量放在後三關的介紹，你都可以合理推論：它沒打算讓你看見前三關。
        </p>
        <div className="stack" style={{ gap: 9, marginTop: 4 }}>
          <div className="row" style={{ gap: 20 }}>
            <span className="tiny"><span className="tag tag-blue">實務工時</span></span>
            <span className="tiny"><span className="tag tag-amber">簡報篇幅</span></span>
          </div>
          {EFFORT.map((e) => (
            <div key={e.stage}>
              <div className="spread" style={{ marginBottom: 4 }}>
                <span className="small mono">{e.stage}</span>
                <span className="tiny dim mono">實務 {e.real}% ／ 簡報 {e.slide}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div className="bar"><span style={{ width: `${e.real * 3}%`, background: '#3b82f6' }} /></div>
                <div className="bar"><span style={{ width: `${e.slide * 3}%`, background: '#f59e0b' }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 兩份資料集對照 */}
      <div className="panel stack">
        <h3>半導體 vs 台灣中小企業</h3>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>面向</th>
                <th style={{ color: '#93c5fd' }}>跨國半導體供應鏈</th>
                <th style={{ color: '#fcd34d' }}>台灣中小企業</th>
              </tr>
            </thead>
            <tbody>
              {CONTRAST.map((c) => {
                const Icon = c.icon;
                return (
                  <tr key={c.dim}>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <Icon size={14} color="#9ca3af" />
                        <strong style={{ color: '#fff' }}>{c.dim}</strong>
                      </div>
                    </td>
                    <td style={{ lineHeight: 1.65 }}>{c.semi}</td>
                    <td style={{ lineHeight: 1.65 }}>{c.sme}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 本資料集的重點 */}
      <div className="panel stack">
        <h3>「{ds.label}」這一輪的重點</h3>
        <div className="stack" style={{ gap: 10 }}>
          {ds.debrief.map((d) => (
            <div key={d.k} className="panel panel-tight" style={{ borderLeft: `3px solid ${ds.accent}` }}>
              <div style={{ fontWeight: 800, color: '#fff', marginBottom: 4 }}>{d.k}</div>
              <p className="small muted" style={{ lineHeight: 1.75 }}>{d.v}</p>
            </div>
          ))}
        </div>
      </div>

      <Lesson title="Palantir 到底在賣什麼">
        走完六關之後，可以把它拆成三塊，分開評價：
        <br /><br />
        <strong>一、方法。</strong>「把混亂變成物件、把物件連成圖、讓決策沿著圖傳播、再寫回源頭」——
        這是對的，而且不是 Palantir 發明的。你剛才親手做完了，用的是幾百行 JavaScript。
        <br /><br />
        <strong>二、產品。</strong>把這套方法工程化成能跑在真實企業的東西：權限、稽核、資料血統、
        版本、上千個資料源的連接器。這很難、很值錢，但不神秘，而且會隨著工具變好而變便宜。
        <br /><br />
        <strong>三、位置。</strong>取得美國政府與大型企業的信任、通過安全審查、嵌進客戶日常運作。
        這一塊是唯一不會因為模型變強而變便宜的東西。
        <br /><br />
        新人最常見的誤解是把三者混為一談 —— 聽到「本體論」就以為是某種專利技術。
        它不是。它是一種紀律，而紀律是可以學的。你剛剛就學完了一遍。
      </Lesson>

      <div className="panel stack" style={{ borderColor: 'rgba(245,158,11,.35)' }}>
        <h3>如果要拿去台灣中小企業練</h3>
        <p className="small muted" style={{ lineHeight: 1.8 }}>
          幾個先講在前面的忠告，都是從上面那張對照表推出來的：
        </p>
        <div className="stack" style={{ gap: 8 }}>
          {[
            ['別賣 Stage 5、6，賣 Stage 1、2、3。', '中小企業卡死的地方是「資料根本不存在或不一致」，不是「決策模擬不夠炫」。拿儀表板去談，三個月後會發現沒有資料可以餵。'],
            ['第一件事永遠是統一編號。', '把統編補進客戶主檔，比任何 AI 都先解決問題。這是台灣做這件事最大的結構優勢，而多數公司的系統裡沒有這個欄位。'],
            ['不要碰他們的老系統。', '原廠倒閉的進銷存不能改也不敢改。做一層旁路的物件層，讀進來、對齊、寫回只寫看得懂的地方（Excel、Google Sheet、LINE 通知）。'],
            ['最重要的約束通常在人腦裡。', '產能、換模時間、哪個客戶不能得罪 —— 這些沒有任何系統記錄。第一版的價值往往就是「終於把廠長腦中的排程寫下來」。'],
            ['先做一個問題，不要做一個平台。', '挑一個老闆每週都要問、但沒人答得出來的問題（例如「這個月哪個客戶真的賺錢」），把那條路徑打通。平台是後來長出來的，不是先蓋的。'],
          ].map(([h, b]) => (
            <div key={h} className="panel panel-tight">
              <div style={{ fontWeight: 700, color: '#fcd34d', marginBottom: 3 }}>{h}</div>
              <p className="small muted" style={{ lineHeight: 1.7 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel spread">
        <div>
          <h4>接下來</h4>
          <p className="small muted" style={{ marginTop: 3 }}>
            用另一份資料集再跑一次，六關完全一樣，難度會完全不同。
          </p>
        </div>
        <div className="row">
          <button className="btn" onClick={onRestart}>重跑這一份</button>
          <button className="btn btn-go" onClick={() => onSwitch(other.id)}>
            換「{other.label}」再跑一次
          </button>
        </div>
      </div>
    </div>
  );
}
