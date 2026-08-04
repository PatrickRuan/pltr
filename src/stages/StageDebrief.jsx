import React from 'react';
import { Scale, KeyRound, Clock4, MapPin, Wrench, ArrowLeftRight, Award, Compass } from 'lucide-react';
import { StageHead, Lesson } from '../components/ui';
import { DATASETS } from '../data';

const EFFORT = [
  { stage: '1 · 原始混亂', real: 25, slide: 0 },
  { stage: '2 · 定義物件', real: 18, slide: 5 },
  { stage: '3 · 實體解析', real: 27, slide: 5 },
  { stage: '4 · 規模與維運', real: 15, slide: 0 },
  { stage: '5 · 建立關聯', real: 8, slide: 20 },
  { stage: '6 · 約束傳播', real: 4, slide: 35 },
  { stage: '7 · 動作與寫回', real: 3, slide: 35 },
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
      <StageHead n={8} title="總結與卓越" subtitle="兩份資料集並排看，以及你還能做什麼" accent={ds.accent}>
        你剛才用同一條流水線跑完了一份資料集。另一份的每一關都長得一樣，難度卻完全不同 ——
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
        走完全部關卡之後，可以把它拆成三塊，分開評價：
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

      {/* ── 卓越是什麼 ─────────────────────── */}
      <div className="panel stack" style={{ borderColor: 'rgba(16,185,129,.35)' }}>
        <div className="row" style={{ gap: 8 }}>
          <Award size={19} color="#34d399" />
          <h3>卓越長什麼樣子</h3>
        </div>
        <p className="small muted" style={{ lineHeight: 1.8 }}>
          「做得好」這件事在這一行很難講清楚，因為交付當下看起來都差不多 —— 圖都畫得出來，數字都有。
          差別要到半年後才顯現。所以與其用形容詞，不如用<strong>五個可以檢驗的判準</strong>。
          你可以拿它們去問任何一個做這件事的人，也可以拿來問自己。
        </p>
        <div className="stack" style={{ gap: 8 }}>
          {[
            ['可重現', '別人拿你的規則重跑一次，會得到一模一樣的實體。如果答案取決於誰跑、什麼時候跑，那不是系統，是手工藝。'],
            ['知道自己不知道', '高風險的配對會被標出來給人看，而不是默默合併。一個從不說「我不確定」的系統，不是很準，是很危險。'],
            ['錯了查得出來', '三個月後發現一筆合併是錯的，能查出當時憑什麼合併、是誰核准的、影響了哪些報表。沒有這條，你連修都不知道從哪修。'],
            ['交接得掉', '做的人離職，接手的人多久能改一條規則？如果答案是「重寫」，那前面四條再好都沒有意義。'],
            ['腐爛得慢', '半年沒人維護，準確率掉多少？這個斜率就是你到底做了系統還是做了一次性的專案。'],
          ].map(([h, b], i) => (
            <div key={h} className="panel panel-tight" style={{ borderLeft: '3px solid #10b981' }}>
              <div className="row" style={{ gap: 8, marginBottom: 3 }}>
                <span className="rail-num" style={{ background: 'rgba(16,185,129,.25)', color: '#6ee7b7' }}>{i + 1}</span>
                <strong style={{ color: '#6ee7b7' }}>{h}</strong>
              </div>
              <p className="small muted" style={{ lineHeight: 1.7, paddingLeft: 30 }}>{b}</p>
            </div>
          ))}
        </div>
        <Lesson>
          注意這五條<strong>沒有一條是關於模型多強</strong>。
          這既是好消息也是壞消息：好消息是這個領域不會被模型直接吃掉，因為模型解決不了可重現、可稽核、交接與維運；
          壞消息是同樣的道理，這五條也不構成任何人的護城河 —— <strong>它們是紀律，而紀律是可以學的</strong>。
          你剛剛就學了一遍。
        </Lesson>
      </div>

      {/* ── 你還能做什麼 ───────────────────── */}
      <div className="panel stack" style={{ borderColor: 'rgba(59,130,246,.35)' }}>
        <div className="row" style={{ gap: 8 }}>
          <Compass size={19} color="#60a5fa" />
          <h3>那你還能做什麼？怎樣才叫做得比它好？</h3>
        </div>
        <p className="small muted" style={{ lineHeight: 1.8 }}>
          先把問題問對。「比 Palantir 卓越」如果指的是全面超越，答案是不行，而且理由跟技術無關 ——
          它的優勢裡有一塊是<strong>位置</strong>（政府信任、安全審查、嵌進客戶日常運作），
          那一塊不會因為你程式寫得好就轉移。
          <br /><br />
          但「更卓越」還有另一個定義，而且這個定義是可達成的：
          <strong>在一個它不會來的範圍裡，做到無可取代。</strong>
          這不是安慰獎 —— 這正是所有專業服務業真正的競爭方式。
        </p>

        <div className="grid2">
          <div className="panel panel-tight stack" style={{ gap: 8, borderLeft: '3px solid #10b981' }}>
            <strong style={{ color: '#6ee7b7' }}>你手上真實的不對稱</strong>
            {[
              ['統編這個結構優勢', '台灣每家公司都有政府維護的權威主鍵，加上電子發票平台與公司登記開放資料。你在 Stage 3 親眼看到它值多少。跨國廠商拿不到，也不會為台灣去接。'],
              ['它的成本結構決定它不會來', '前置部署工程師駐點的模式，服務不了三十人的工廠。這不是它做不到，是它做了會虧。這個縫隙不是暫時的，是結構性的。'],
              ['你進得去廠裡', '廠長腦子裡的排程規則沒有 API。要拿到它，得跟他喝過幾次茶、讓他相信寫下來不會害到他。這件事無法遠端、無法外包、也無法自動化。'],
              ['你可以誠實', '大廠的業務不能跟客戶說「這個案子你不該做」。你可以。長期來看這是最強的差異化，而且沒有人能抄。'],
            ].map(([h, b]) => (
              <div key={h}>
                <div className="small" style={{ fontWeight: 700, color: '#fff' }}>{h}</div>
                <p className="tiny muted" style={{ lineHeight: 1.7, marginTop: 2 }}>{b}</p>
              </div>
            ))}
          </div>

          <div className="panel panel-tight stack" style={{ gap: 8, borderLeft: '3px solid #f43f5e' }}>
            <strong style={{ color: '#fda4af' }}>不要在這幾個地方跟它比</strong>
            {[
              ['安全審查與政府採購', '那是十幾年累積的資格與關係，不是產品功能。從零開始的人在這裡沒有勝算，也不該把力氣花在這。'],
              ['連接器的數量', '上千個資料源的連接器是純粹的工程堆疊。你堆不贏，而且堆贏了也不值錢 —— 這正是會被工具進步吃掉的那一塊。'],
              ['「我們也有本體論」', '把它當成產品名詞去對打，你就進了它最擅長的敘事框架。它是一套紀律，不是一個可以拿來比規格的東西。'],
              ['一次做一個平台', '平台是後來長出來的，不是先蓋的。先蓋平台的小團隊，通常在第一個客戶付錢之前就沒了。'],
            ].map(([h, b]) => (
              <div key={h}>
                <div className="small" style={{ fontWeight: 700, color: '#fff' }}>{h}</div>
                <p className="tiny muted" style={{ lineHeight: 1.7, marginTop: 2 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>

        <Lesson title="如果只記得一句話">
          你剛才做完的這條流水線，用了幾百行 JavaScript。
          <strong>這件事的方法不是任何人的專利，難的是紀律、規模、維運，以及跟人打交道。</strong>
          <br /><br />
          所以「我還能做什麼」的答案，不在於你能不能複製它的技術（你可以），
          而在於你要不要接受這門生意真正的樣子：
          前三關佔七成工時、成果半年後才看得出好壞、最難的部分沒有一行程式碼、而且要一直餵它。
          <br /><br />
          願意接受這件事、又能把 Stage 4 那三個代價說清楚的人，本來就不多。
          <strong>那個稀缺性才是你的位置</strong> —— 跟它的位置不一樣，但一樣是位置。
        </Lesson>
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
