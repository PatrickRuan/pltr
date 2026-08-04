import React, { useState } from 'react';
import {
  Hammer, Bug, ShieldCheck, FolderTree, CircleAlert, Sparkles, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Lesson } from '../components/ui';

const BUGS = [
  {
    t: '成本函數的符號反了，害最佳解變成最爛解',
    where: 'src/engine/constraints.js',
    what:
      '方案的 cash 欄位在資料裡寫成負數（-36000），代表現金流出。' +
      '引擎直接把它加進 totalCost，於是「花越多錢」的組合 totalCost 越小 —— ' +
      'findOptimal 挑出來的「最佳解」其實是花最多錢的那一組。',
    how:
      '把 cashCost 改成取絕對值累加，讓 totalCost 是一個「越小越好」的數。' +
      '修正後最佳解從「外包＋加班＋談延期 NT$96,000」變成正確的「外包＋談延期 NT$71,000」。',
    lesson:
      '這個錯的可怕之處是：它不會噴錯、不會壞掉、畫面上一切正常，而且數字看起來很專業。' +
      '它就是 Stage 3 講的那種「看不見的錯誤」，只是換成成本模型的版本。' +
      '會發現它，唯一的原因是我事先手算過一次答案，然後拿程式的輸出去對。',
  },
  {
    t: '正規化把字串攪爛，OCR 那一題永遠對不上',
    where: 'src/engine/text.js',
    what:
      '剝除公司後綴時用的是全域取代。「巨鋒機械股份有限公可」（OCR 把「司」讀成「可」）' +
      '因為結尾不是完整的「股份有限公司」，中間那個「股」被單獨挖掉，' +
      '字串變成「巨鋒機械份有限公可」，比對從此不可能成功。',
    how:
      '改成只從結尾剝、長的後綴優先、反覆剝到剝不動為止。' +
      '同時發現「工業股份有限公司」不該列為後綴 —— 它會把「美崙工業」削成「美崙」。',
    lesson:
      '這種等級的細節，就是實務上真正在吃掉時間的東西。' +
      '它不有趣、不能寫進簡報、講出來沒有人覺得厲害，但你不處理它，後面全部是錯的。' +
      '教材裡把這段修正的理由寫在原始碼註解裡，就是想讓新人看見這一層。',
  },
  {
    t: '我寫的文案，跟程式實際跑出來的結果不符',
    where: 'src/data/*.js 與 StageResolve.jsx',
    what:
      '我先寫好了教學結論（「模糊比對最擅長處理簡稱」「主鍵優先會贏」），' +
      '再去跑引擎。結果：「巨鋒」對「巨鋒機械」的字面重疊只有五成，過不了門檻，模糊比對答錯；' +
      '而模型的準確率其實是四種方法裡最高的（89%／86%），主鍵優先並沒有贏。',
    how:
      '改文案，不改數字。把那一關的結論從「主鍵會贏」換成更硬也更真的版本：' +
      '準確率是會騙人的指標，因為漏合併看得見、誤合併看不見 —— ' +
      '而完全比對與主鍵優先的精確率都是 100%，它們從不誤合併。',
    lesson:
      '這是整個專案我最想讓新人看到的一段。' +
      '當你的敘述和你的量測衝突時，改敘述，不要改量測。' +
      '這聽起來像廢話，但實務上反過來做的人非常多 —— 尤其是當那個敘述已經寫進提案、講給客戶聽過之後。',
  },
];

const LIMITS = [
  ['「模型判斷」是預錄的，不是即時呼叫', '為了零金鑰、純靜態部署。錄的內容包含模型真實會犯的錯誤型態，不是照抄答案。介面保持可抽換，接真 API 只要換一個函式。'],
  ['資料量是玩具等級', '每份資料集十幾筆。Stage 4 用計算補上規模感，但那是算給你看，不是讓你跑。真的要感受，得拿真實資料。'],
  ['沒有真的資料管線', '沒有 CDC、沒有排程、沒有增量更新。這些在真實系統裡佔的工程量比這整個 repo 還大。'],
  ['腐爛曲線是模型不是量測', 'Stage 4 那條線的參數都攤在 UI 上，可以調也應該被質疑。它要傳達的是形狀，不是數字。'],
  ['約束求解用的是窮舉', '方案只有四個，2⁴ = 16 種組合，暴力跑得動。真實排程問題要用 MIP 或啟發式，那是另一個領域。'],
  ['沒有多人協作與併發', '真實的本體論是多人同時在改的。衝突偵測這裡只做了單機的樂觀鎖示範。'],
];

const FILES = [
  ['src/engine/text.js', '字串正規化與相似度。全形轉半形、公司後綴、Levenshtein、bigram Dice'],
  ['src/engine/resolvers.js', '四種實體解析策略 + 混淆矩陣評分。前三種是真演算法'],
  ['src/engine/constraints.js', '資源配置、成本函數、窮舉最佳解'],
  ['src/engine/writeback.js', '權限、樂觀鎖、逾時、補償回滾、稽核軌跡'],
  ['src/engine/scale.js', '組合爆炸、分塊統計、腐爛模型'],
  ['src/data/twSme.js', '台灣中小企業資料集（協鴻精密）'],
  ['src/data/semiconductor.js', '跨國半導體供應鏈資料集'],
  ['src/data/index.js', '資料集註冊與關卡定義。要加自己的資料集從這裡進去'],
  ['src/stages/', '八個關卡的 UI。每一關只負責呈現，計算全在 engine'],
];

function Collapse({ title, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel stack" style={{ gap: 10, borderLeft: `3px solid ${color}` }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="row"
        style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', gap: 9 }}
      >
        {open ? <ChevronDown size={16} color={color} /> : <ChevronRight size={16} color={color} />}
        <Icon size={17} color={color} />
        <h3 style={{ flex: 1 }}>{title}</h3>
      </button>
      {open && <div className="fade stack" style={{ gap: 12 }}>{children}</div>}
    </div>
  );
}

export default function MakingOf() {
  const [openBug, setOpenBug] = useState(0);

  return (
    <div className="stack fade">
      <div className="panel stage-head" style={{ borderLeftColor: '#8b5cf6' }}>
        <div className="stage-kicker" style={{ color: '#8b5cf6' }}>Making of · 工程紀錄</div>
        <h2 className="stage-title">這個專案是怎麼做出來的</h2>
        <div className="stage-lede">
          這一頁不是宣傳。它記錄的是：起點是什麼、做了哪些取捨、<strong>過程中犯了哪些錯又怎麼被抓到</strong>、
          以及還有什麼沒做。
          <br /><br />
          放這一頁的理由跟整份教材是同一個 —— 只看成品學不到東西，看見過程才會。
        </div>
      </div>

      <Collapse title="起點：前一版有什麼問題" icon={Hammer} color="#f59e0b" defaultOpen>
        <p className="small muted" style={{ lineHeight: 1.8 }}>
          這個 repo 原本是一份 Palantir 本體論的展示 demo，約 1,600 行、六個元件、一份寫死的資料檔。
          它做得不醜，但它展示的是本體論<strong>做完之後</strong>長什麼樣子，
          而這套方法的價值全部產生在<strong>做的過程</strong>裡。
        </p>
        <div className="stack" style={{ gap: 7 }}>
          {[
            ['資料是乾淨的', '一份已經對齊好的完美 JSON。沒有 schema 衝突、沒有缺值、沒有單位不一致。而真實工作有七八成花在這裡。'],
            ['沒有實體解析', '物件之間的連結是一個手寫死的陣列。但「判斷這兩筆是不是同一個東西」正是這家公司最原始的技術賭注 —— 整個 demo 把它跳過了。'],
            ['寫回是 setTimeout(1000) 後印 200 OK', '權限、樂觀鎖、逾時、部分成功、補償回滾，全部不存在。那不是簡化，是把最難的部分刪掉之後宣稱它很簡單。'],
            ['資源永遠夠', '資料裡明明埋了張力（總量 4,000 顆、兩個客戶各要 2,000），但三個方案都是零代價的 happy path。有圖，卻沒有沿著圖傳播。'],
            ['對照組是稻草人', '拿一個刻意弱化的 RAG（純向量檢索、不能呼叫工具）去比，然後宣布本體論贏。真正的對照組是「LLM + tool calling 直接打 API」。'],
            ['有一頁自我宣傳', '「本專案全程由某某 AI 引擎自動生成」。那是行銷，不是工程紀錄 —— 也正是為什麼這一頁的寫法要不一樣。'],
          ].map(([h, b]) => (
            <div key={h} className="panel panel-tight">
              <div style={{ fontWeight: 700, color: '#fcd34d', marginBottom: 3 }}>{h}</div>
              <p className="small muted" style={{ lineHeight: 1.7 }}>{b}</p>
            </div>
          ))}
        </div>
      </Collapse>

      <Collapse title="三條設計原則" icon={Sparkles} color="#3b82f6">
        <div className="grid2">
          {[
            ['先撞牆，再給工具', '每一關都先要求作答，「對答案」鎖在作答之後。Stage 1 先叫你數客戶數量並數錯；Stage 5 先叫你選方案再看最佳解。直接看解答學不會 —— 落差才是內容。'],
            ['一套引擎，兩份資料集', '流水線是共用的，資料集是可插拔的。同一條路跑半導體供應鏈和台中的 CNC 廠，難度天差地遠 —— 那個落差本身就是最重要的一課，而且不需要多寫一行 UI。'],
            ['文案要對齊計算，不能反過來', '畫面上每個分數與金額都是當場算出來的。我寫的教學結論如果和引擎跑出來的不符，改的是文案。這條原則在下一段有三個實例。'],
          ].map(([h, b]) => (
            <div key={h} className="panel panel-tight" style={{ borderLeft: '3px solid #3b82f6' }}>
              <div style={{ fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>{h}</div>
              <p className="small muted" style={{ lineHeight: 1.75 }}>{b}</p>
            </div>
          ))}
        </div>
      </Collapse>

      <Collapse title="做的過程中抓到的三個錯" icon={Bug} color="#f43f5e" defaultOpen>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          這三個都是<strong>寫完之後、驗證時才發現的</strong>。留在這裡是因為它們比成品更有教學價值 ——
          尤其第一個和第三個，剛好就是這份教材在 Stage 3 和 Stage 4 講的那種「看不見的錯誤」。
        </p>
        <div className="stack" style={{ gap: 9 }}>
          {BUGS.map((b, i) => {
            const open = openBug === i;
            return (
              <div key={i} className="panel panel-tight" style={{ borderLeft: `3px solid ${open ? '#f43f5e' : 'rgba(244,63,94,.35)'}` }}>
                <button
                  onClick={() => setOpenBug(open ? null : i)}
                  className="row"
                  style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', gap: 8 }}
                >
                  {open ? <ChevronDown size={14} color="#f87171" /> : <ChevronRight size={14} color="#f87171" />}
                  <span style={{ flex: 1 }}>
                    <strong style={{ color: open ? '#fda4af' : '#fff' }}>{b.t}</strong>
                    <span className="tiny dim mono" style={{ display: 'block', marginTop: 2 }}>{b.where}</span>
                  </span>
                </button>
                {open && (
                  <div className="fade stack" style={{ gap: 9, marginTop: 10, paddingLeft: 22 }}>
                    <div>
                      <span className="tag tag-rose">發生了什麼</span>
                      <p className="small muted" style={{ marginTop: 4, lineHeight: 1.75 }}>{b.what}</p>
                    </div>
                    <div>
                      <span className="tag tag-blue">怎麼修的</span>
                      <p className="small muted" style={{ marginTop: 4, lineHeight: 1.75 }}>{b.how}</p>
                    </div>
                    <div className="lesson small">{b.lesson}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Collapse>

      <Collapse title="怎麼驗證的" icon={ShieldCheck} color="#10b981">
        <p className="small muted" style={{ lineHeight: 1.8 }}>
          一份宣稱「數字都是真的算出來的」的教材，自己得先被驗過。做法有三層：
        </p>
        <div className="stack" style={{ gap: 8 }}>
          {[
            ['先手算，再寫程式', '兩份資料集的最佳解、每一組配對的正解、腐爛曲線的形狀，都是先在紙上推一次，再拿引擎的輸出去對。第一個 bug 就是這樣抓到的 —— 如果沒有事先的期望值，那個錯永遠不會被發現。'],
            ['引擎脫離畫面單獨跑', '把 engine 從 UI 拆開，用 Node 直接跑兩份資料集的全部組合，印出四種解析策略的混淆矩陣、以及 2ⁿ 種決策組合的成本排行。畫面還沒長出來以前，數字就已經對過了。'],
            ['逐關在瀏覽器裡實際操作', '八個關卡逐一走過，確認 UI 顯示的數字跟引擎單獨跑出來的一致。寫回的四種失敗模式（403 權限、409 衝突、504 逾時、補償回滾）逐一觸發確認。'],
          ].map(([h, b]) => (
            <div key={h} className="panel panel-tight" style={{ borderLeft: '3px solid #10b981' }}>
              <div style={{ fontWeight: 700, color: '#6ee7b7', marginBottom: 4 }}>{h}</div>
              <p className="small muted" style={{ lineHeight: 1.75 }}>{b}</p>
            </div>
          ))}
        </div>
        <Lesson title="順序才是重點">
          注意上面三層的順序：<strong>先有期望值，才寫程式，最後才看畫面。</strong>
          倒過來做 —— 先寫程式、跑出一個數字、然後說服自己那就是答案 ——
          是這一行最常見的自我欺騙，而且做得越快越容易發生。
        </Lesson>
      </Collapse>

      <Collapse title="已知的限制與沒做的事" icon={CircleAlert} color="#f59e0b">
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          誠實列出來，因為一份教「怎麼看穿別人簡報」的教材，不能自己變成一份簡報。
        </p>
        <div className="stack" style={{ gap: 7 }}>
          {LIMITS.map(([h, b]) => (
            <div key={h} className="panel panel-tight">
              <div className="row" style={{ gap: 7, marginBottom: 3 }}>
                <CircleAlert size={13} color="#fbbf24" />
                <strong style={{ color: '#fcd34d' }}>{h}</strong>
              </div>
              <p className="small muted" style={{ lineHeight: 1.7, paddingLeft: 20 }}>{b}</p>
            </div>
          ))}
        </div>
      </Collapse>

      <Collapse title="檔案地圖：想改的話從哪裡下手" icon={FolderTree} color="#06b6d4">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th style={{ width: 220 }}>路徑</th><th>做什麼</th></tr></thead>
            <tbody>
              {FILES.map(([p, d]) => (
                <tr key={p}>
                  <td className="mono" style={{ color: '#67e8f9' }}>{p}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ lineHeight: 1.8 }}>
          最重要的一條界線：<strong>計算全部在 <code className="mono">engine/</code>，關卡只負責呈現。</strong>
          這不是為了漂亮，是為了讓引擎可以脫離畫面單獨被驗證 —— 上一段講的第二層驗證就靠這條界線。
          <br /><br />
          要加自己的資料集，複製 <code className="mono">src/data/twSme.js</code> 的結構，
          在 <code className="mono">src/data/index.js</code> 註冊，八個關卡會自動套用，
          不需要動任何 UI 程式碼。拿真實企業的資料來練，這是入口。
        </p>
      </Collapse>

      <Lesson title="為什麼要有這一頁">
        前一版有一頁叫「開發歷程」，內容是「本專案全程由某某 AI 引擎自動生成，
        一次完成五大核心模組開發，零錯誤生產編譯」。那一頁沒有任何一句話是可以被檢驗的，
        它唯一的功能是讓看的人覺得厲害。
        <br /><br />
        這一頁反過來：起點的六個問題是具體的、三個 bug 是有檔名的、六條限制是承認做不到的。
        你可以拿任何一條去對原始碼。
        <br /><br />
        <strong>這兩種寫法的差別，正好就是這整份教材想教的判斷力</strong> ——
        看到一份東西的時候，先問「它有沒有把難的部分留在畫面上」。
        留下來的，多半是真的做過；刪掉的，多半是還沒面對。
        這個判準對別人的簡報有效，對你自己的也一樣。
      </Lesson>
    </div>
  );
}
