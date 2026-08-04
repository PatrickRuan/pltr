import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Boxes, Timer, Users, ChevronDown, ChevronRight, AlertTriangle, Wrench,
} from 'lucide-react';
import { StageHead, Lesson, NextButton, Metric } from '../components/ui';
import {
  estimateCost, humanDuration, compactNumber,
  BLOCKING_KEYS, blockingStats, simulateDecay, DECAY_DEFAULTS, COST_ASSUMPTIONS,
} from '../engine/scale';

const SCALES = [
  { n: 12, label: '這份教材', note: '你剛才做的' },
  { n: 500, label: '一家小工廠', note: '十五年的客戶主檔' },
  { n: 5000, label: '一家中型企業', note: '含歷史與重複建檔' },
  { n: 50000, label: '一家集團', note: '併購來的各家系統' },
  { n: 500000, label: '一個政府部門', note: '或一家跨國企業' },
];

const FRICTIONS = [
  {
    t: '業務不想讓你看到他的客戶名單',
    why: '客戶關係是他的個人資產，也是他的談判籌碼。系統把它變成公司資產，等於削弱他。',
    do: '先做他有好處的部分（幫他自動算獎金、自動催帳），資料是副產品。不要一開始就要主檔。',
  },
  {
    t: '廠長的排程在他腦子裡，寫下來等於交出權力',
    why: '「只有我知道怎麼排」是他三十年的地位來源。你要他把它交出來，卻沒給他別的東西。',
    do: '把他寫下來的規則掛他的名字，讓系統顯示「依林廠長規則」。讓他變成規則的作者，不是被取代的人。',
  },
  {
    t: '老闆要的數字和報稅的數字對不起來，而他不想解釋',
    why: '兩本帳在台灣中小企業不是例外。你把資料打通，等於把這件事攤在桌上。',
    do: '事先講清楚系統看哪一本、不碰哪一本。含糊帶過的結果是專案做到一半被喊停。',
  },
  {
    t: '提供資料的人沒有動機，因為做完了好處是別人的',
    why: '會計要多花兩週整理，省下的時間是業務的。這是典型的成本與收益不在同一個人身上。',
    do: '找出誰痛，讓誰痛的人當專案的主人。沒有人痛的專案不要接。',
  },
  {
    t: '需求在你做到一半時變了，因為老闆去上了一堂 AI 課',
    why: '這不是他善變。是他從來沒看過中間產物，只能憑外界的說法想像可能性。',
    do: '每兩週給一次能點的東西，哪怕很醜。看得到的東西會把想像力收斂回來。',
  },
  {
    t: '做完了，然後沒有人用',
    why: '你解決的是你看到的問題，不是他每天早上真正在煩的那個問題。',
    do: '第一版只做一個問題：老闆每週都要問、但沒有人答得出來的那一個。做對了他會自己來問你下一個。',
  },
];

function DecayChart({ un, mt }) {
  const W = 620, H = 200, P = 34;
  const months = un.series.length;
  const x = (m) => P + ((m - 1) / (months - 1)) * (W - P * 2);
  const y = (a) => H - P - ((a - 0.3) / (1.0 - 0.3)) * (H - P * 2);
  const path = (s) => s.series.map((p, i) => `${i ? 'L' : 'M'}${x(p.month)},${y(p.accuracy)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {[0.4, 0.6, 0.8, 1.0].map((g) => (
        <g key={g}>
          <line x1={P} y1={y(g)} x2={W - P} y2={y(g)} stroke="rgba(255,255,255,.07)" />
          <text x={P - 6} y={y(g) + 3} fill="#6b7280" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
            {(g * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      {[1, 6, 12, 18].filter((m) => m <= months).map((m) => (
        <text key={m} x={x(m)} y={H - P + 14} fill="#6b7280" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
          M{m}
        </text>
      ))}
      <path d={path(mt)} fill="none" stroke="#10b981" strokeWidth="2.2" />
      <path d={path(un)} fill="none" stroke="#f43f5e" strokeWidth="2.2" />
      <text x={W - P} y={y(mt.final.accuracy) - 7} fill="#34d399" fontSize="10" textAnchor="end" fontWeight="700">
        有人維護 {(mt.final.accuracy * 100).toFixed(0)}%
      </text>
      <text x={W - P} y={y(un.final.accuracy) + 15} fill="#fda4af" fontSize="10" textAnchor="end" fontWeight="700">
        沒人維護 {(un.final.accuracy * 100).toFixed(0)}%
      </text>
    </svg>
  );
}

export default function StageWhyHard({ ds, onNext }) {
  const [scaleN, setScaleN] = useState(12);
  const [blockId, setBlockId] = useState('none');
  const [novelRate, setNovelRate] = useState(DECAY_DEFAULTS.novelRatePerMonth);
  const [openFriction, setOpenFriction] = useState(null);
  const [seenAll, setSeenAll] = useState({});

  const records = ds.resolution.records;
  const pairs = ds.resolution.pairs;

  const est = useMemo(() => estimateCost(scaleN), [scaleN]);
  const blockDef = BLOCKING_KEYS.find((k) => k.id === blockId);
  const bs = useMemo(() => blockingStats(records, pairs, blockDef), [records, pairs, blockDef]);
  const decayU = useMemo(() => simulateDecay({ maintained: false, novelRatePerMonth: novelRate }), [novelRate]);
  const decayM = useMemo(() => simulateDecay({ maintained: true, novelRatePerMonth: novelRate }), [novelRate]);

  const mark = (k) => setSeenAll((p) => ({ ...p, [k]: true }));
  const ready = seenAll.scale && seenAll.block && seenAll.friction;

  return (
    <div className="stack fade">
      <StageHead n={4} title="為什麼這件事困難" subtitle="規模、取捨、腐爛與人" accent={ds.accent}>
        你剛才用十幾分鐘做完了三關，很可能覺得「這也還好」。
        這一關的存在，就是要把那個錯覺拆掉。
        <strong>難的地方不在單一個判斷，在於這個判斷要乘以幾億次、要在錯誤看不見的情況下做、而且要做十年。</strong>
      </StageHead>

      {/* ── A. 組合爆炸 ───────────────────── */}
      <div className="panel stack">
        <div className="row" style={{ gap: 8 }}>
          <TrendingUp size={18} color="#f87171" />
          <h3>一、數量的問題</h3>
        </div>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          要判斷「有沒有重複」，原則上每兩筆都得比一次。n 筆紀錄就是 n(n−1)/2 組。
          這個式子是平方的，而平方在真實世界裡是很兇的東西。點下面任一個規模看看。
        </p>

        <div className="row" style={{ gap: 6 }}>
          {SCALES.map((s) => (
            <button
              key={s.n}
              className="btn btn-sm"
              onClick={() => { setScaleN(s.n); if (s.n >= 50000) mark('scale'); }}
              style={{
                borderColor: scaleN === s.n ? 'var(--accent-rose)' : undefined,
                background: scaleN === s.n ? 'rgba(244,63,94,.14)' : undefined,
              }}
            >
              {s.n.toLocaleString()} 筆
              <span className="tiny dim">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="grid3">
          <Metric
            label="要比對的組合數"
            value={compactNumber(est.pairs)}
            note={`${scaleN.toLocaleString()} × ${(scaleN - 1).toLocaleString()} ÷ 2`}
            color="#f87171"
          />
          <Metric
            label="全部靠人看"
            value={est.humanYears < 1 ? humanDuration(est.humanHours * 3600) : `${Math.round(est.humanYears).toLocaleString()} 人年`}
            note={`每組 ${COST_ASSUMPTIONS.humanSecondsPerPair} 秒，一人一年 ${COST_ASSUMPTIONS.humanHoursPerYear} 工時`}
            color="#fcd34d"
          />
          <Metric
            label="全部丟給模型"
            value={est.modelUsd < 1 ? `$${est.modelUsd.toFixed(2)}` : `$${Math.round(est.modelUsd).toLocaleString()}`}
            note={`每組 $${COST_ASSUMPTIONS.modelUsdPerPair}，${COST_ASSUMPTIONS.modelConcurrency} 條並行要跑 ${humanDuration(est.modelSeconds)}`}
            color="#c4b5fd"
          />
        </div>

        {scaleN >= 50000 && (
          <div className="warn fade">
            <AlertTriangle size={15} style={{ verticalAlign: -3, marginRight: 5 }} />
            <strong>看清楚模型那一欄的時間。</strong>
            不是錢的問題而已 —— 就算你付得起 ${Math.round(est.modelUsd).toLocaleString()}，
            它要跑 {humanDuration(est.modelSeconds)}。等它跑完，資料早就變了。
            「模型變便宜就解決了」這句話在這裡是不成立的：<strong>成本是線性下降，問題是平方成長。</strong>
          </div>
        )}
      </div>

      {/* ── B. 分塊 ───────────────────────── */}
      <div className="panel stack">
        <div className="row" style={{ gap: 8 }}>
          <Boxes size={18} color="#fbbf24" />
          <h3>二、所以要先分堆 —— 而分堆會先扔掉答案</h3>
        </div>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          既然不可能全比，實務上會先用一個便宜的鍵把紀錄分堆，只比同一堆裡的。這叫 blocking。
          問題來了：<strong>真正該配在一起的兩筆，如果被分到不同堆，你就永遠不會發現它們</strong> ——
          而且你不會知道自己漏了什麼，因為漏掉的東西根本沒進到你的比對清單裡。
          <br />
          下面用這份資料集真實的 {records.length} 筆紀錄算給你看，換不同的鍵試試。
        </p>

        <div className="row" style={{ gap: 6 }}>
          {BLOCKING_KEYS.map((k) => (
            <button
              key={k.id}
              className="btn btn-sm"
              onClick={() => { setBlockId(k.id); if (k.id !== 'none') mark('block'); }}
              style={{
                borderColor: blockId === k.id ? 'var(--accent-amber)' : undefined,
                background: blockId === k.id ? 'rgba(245,158,11,.14)' : undefined,
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="tiny dim">{blockDef.desc}</p>

        <div className="grid3">
          <Metric
            label="要比對的組合"
            value={`${bs.candidates} / ${bs.total}`}
            note={`省下 ${(bs.reduction * 100).toFixed(0)}% 的計算`}
            color={bs.reduction > 0 ? '#34d399' : '#9ca3af'}
          />
          <Metric
            label="召回率"
            value={`${(bs.recall * 100).toFixed(0)}%`}
            note={`${bs.truePairsTotal} 組正解裡，還留在比對清單上的有 ${bs.kept} 組`}
            color={bs.recall === 1 ? '#34d399' : bs.recall >= 0.8 ? '#fcd34d' : '#f87171'}
          />
          <Metric
            label="在開始比對前就漏掉的"
            value={bs.lost.length}
            note={bs.lost.length === 0 ? '沒有漏' : '這些配對再也沒有機會被發現'}
            color={bs.lost.length ? '#f87171' : '#34d399'}
          />
        </div>

        {bs.lost.length > 0 && (
          <div className="warn fade">
            <div style={{ fontWeight: 700, marginBottom: 6 }}>被分到不同堆、因此永遠不會被比到的正解：</div>
            {bs.lost.map((p) => (
              <div key={p.id} className="small mono" style={{ padding: '2px 0' }}>
                ✗ {p.left.name} <span className="dim">／</span> {p.right.name}
                <span className="tiny dim">（{blockDef.label}：「{blockDef.fn(p.left)}」vs「{blockDef.fn(p.right)}」）</span>
              </div>
            ))}
          </div>
        )}

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>分堆的鍵</th><th>筆數</th><th>成員</th></tr></thead>
            <tbody>
              {bs.blocks.map((b) => (
                <tr key={b.key}>
                  <td className="mono" style={{ color: '#fcd34d' }}>{b.key}</td>
                  <td className="mono">{b.size}</td>
                  <td className="tiny">{b.members.map((m) => m.name).join('、')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {seenAll.block && (
          <Lesson title="注意這裡跟上一關的矛盾">
            上一關的結論是「主鍵最可靠」。但你可以試試用<strong>統編分塊</strong> ——
            召回率會掉下來，因為多數紀錄根本沒有統編，它們全被丟進同一個「無主鍵」的大堆裡，
            而有統編的那幾筆反而被隔開了。
            <br /><br />
            <strong>同一個欄位，在「判斷」時是最強的證據，在「分堆」時卻可能是最糟的鍵。</strong>
            這不是誰對誰錯，是這個領域的東西沒有一個是普遍最好的 —— 每一個選擇都要看它被放在哪一步。
            會分辨這件事，跟只會背「用主鍵最好」，差距就是資深和新手的差距。
            <br /><br />
            另外試試「依來源系統分塊」。它聽起來很合理（先各系統內部去重嘛），
            結果召回率是所有選項裡最低的 —— 因為<strong>跨系統的配對正是你要找的東西</strong>，
            而這個鍵把它們全部隔開了。這個錯誤在真實專案裡非常常見。
          </Lesson>
        )}
      </div>

      {/* ── C. 腐爛 ───────────────────────── */}
      <div className="panel stack">
        <div className="row" style={{ gap: 8 }}>
          <Timer size={18} color="#06b6d4" />
          <h3>三、它會腐爛</h3>
        </div>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          就算你今天把一切做對了，它也不會停在那裡。新客戶帶來新的命名習慣、公司併購、
          業務換人、系統換版、政府改格式。你三月定的規則，對六月進來的資料越來越不適用。
        </p>

        <div className="row" style={{ gap: 12 }}>
          <span className="small dim">每月新資料裡「規則沒見過的模式」比例</span>
          <input
            type="range" min="2" max="20" value={Math.round(novelRate * 100)}
            onChange={(e) => { setNovelRate(Number(e.target.value) / 100); mark('decay'); }}
            style={{ flex: '1 1 180px', accentColor: '#06b6d4' }}
          />
          <span className="mono small" style={{ color: '#06b6d4', minWidth: 40 }}>{(novelRate * 100).toFixed(0)}%</span>
        </div>

        <DecayChart un={decayU} mt={decayM} />

        <div className="grid3">
          <Metric label="第一天" value={`${(DECAY_DEFAULTS.masteredAccuracy * 100).toFixed(0)}%`} note="交付時的準確率" color="#34d399" />
          <Metric label="18 個月後（沒人維護）" value={`${(decayU.final.accuracy * 100).toFixed(0)}%`} note="規則沒變，世界變了" color="#f87171" />
          <Metric label="18 個月後（有人維護）" value={`${(decayM.final.accuracy * 100).toFixed(0)}%`} note={`新模式在 ${DECAY_DEFAULTS.maintenanceLagMonths} 個月內被吸收`} color="#34d399" />
        </div>

        <div className="note-fiction">
          ⚠ 這條曲線是一個<strong>模型</strong>，不是量測結果。參數就攤在旁邊讓你調、也讓你質疑。
          重點不是某個特定數字，是形狀：沒人維護就會一路往下，而且不會自己停。
          另外注意有維護那條也<strong>回不到第一天的 94%</strong> ——
          永遠有一批還沒被吸收的新模式，這個水位是這門生意的常態，不是失敗。
        </div>

        <Lesson title="這一段真正的意思">
          如果你把這件事當成一個「專案」，你會在驗收那天達到最高分，然後開始下滑。
          它其實是一個<strong>要有人餵的東西</strong>。
          <br /><br />
          這也解釋了 Palantir 的商業模式一個常被誤解的地方：它賣的很大一部分不是那套軟體，
          是<strong>「有人幫你維持這條線不往下掉」</strong>。那些前置部署工程師之所以要駐點，
          原因就在這張圖上。你可以說那不是軟體公司的樣子 —— 但要先承認這條線是真的存在的。
        </Lesson>
      </div>

      {/* ── D. 人 ─────────────────────────── */}
      <div className="panel stack">
        <div className="row" style={{ gap: 8 }}>
          <Users size={18} color="#a78bfa" />
          <h3>四、最難的部分沒有一行程式碼</h3>
        </div>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          上面三件事都還算好的，因為它們至少是問題明確、可以量的。
          真正讓專案死掉的通常是下面這些。點開任一張看看 —— 它們不是抱怨，每一條都有可以做的事。
        </p>

        <div className="stack" style={{ gap: 8 }}>
          {FRICTIONS.map((f, i) => {
            const open = openFriction === i;
            return (
              <div key={i} className="panel panel-tight" style={{ borderLeft: '3px solid #8b5cf6' }}>
                <button
                  className="row"
                  onClick={() => { setOpenFriction(open ? null : i); mark('friction'); }}
                  style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'left', gap: 8 }}
                >
                  {open ? <ChevronDown size={15} color="#a78bfa" /> : <ChevronRight size={15} color="#a78bfa" />}
                  <strong style={{ color: open ? '#c4b5fd' : '#fff' }}>{f.t}</strong>
                </button>
                {open && (
                  <div className="fade stack" style={{ gap: 7, marginTop: 9, paddingLeft: 23 }}>
                    <div>
                      <span className="tag tag-rose">為什麼會這樣</span>
                      <p className="small muted" style={{ marginTop: 4, lineHeight: 1.7 }}>{f.why}</p>
                    </div>
                    <div>
                      <span className="tag tag-green"><Wrench size={11} />你能做什麼</span>
                      <p className="small" style={{ marginTop: 4, lineHeight: 1.7, color: '#d1fae5' }}>{f.do}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {ready && (
        <Lesson title="所以這一關要你帶走什麼">
          三件事。
          <br /><br />
          <strong>一、規模會把簡單的東西變成難的東西。</strong>
          一組配對判斷 20 秒是簡單的；十二億組不是。而且成本線性下降、問題平方成長 ——
          「等模型變便宜」解決不了平方。
          <br /><br />
          <strong>二、每一個讓它變可行的手段，都在偷偷付代價。</strong>
          分塊讓計算變可行，代價是還沒開始就先扔掉了一部分正確答案，而且你看不到扔掉了什麼。
          這一關到目前為止你看到的每一個取捨都長這樣：沒有免費的正確，只有你知不知道自己付了什麼。
          <br /><br />
          <strong>三、它是活的。</strong>
          交付那天是最高分，之後每天都在掉，除非有人一直餵它。
          <br /><br />
          能同時把這三件事放在心上、還做得完的人，就是這一行的資深工程師。
          這不是聰明的問題，是<strong>知道自己在付什麼代價</strong>的問題。
        </Lesson>
      )}

      <NextButton
        onClick={onNext}
        disabled={!ready}
        hint={ready ? '' : '把「數量」拉到 5 萬筆以上、換一個分塊的鍵、並至少點開一張阻力卡片'}
        label="下一關：建立關聯"
      />
    </div>
  );
}
