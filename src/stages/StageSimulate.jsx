import React, { useState, useMemo } from 'react';
import { Calculator, TriangleAlert, Sparkles, RotateCcw, CircleCheck } from 'lucide-react';
import { StageHead, Lesson, NextButton, Gate, Metric } from '../components/ui';
import { simulate, baseline, findOptimal, formatMoney } from '../engine/constraints';

function DemandRow({ d, resources, currency }) {
  const pool = resources.find((r) => r.id === d.resourceId);
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 700, color: '#fff' }}>{d.label}</div>
        <div className="tiny dim">{d.customer}</div>
      </td>
      <td className="mono">{d.qty.toLocaleString()}</td>
      <td className="mono">
        {d.allocated?.toLocaleString() ?? 0}
        {d.short && <span style={{ color: '#f87171' }}> (缺 {d.shortfall.toLocaleString()})</span>}
        <div className="tiny dim">{pool?.label}</div>
      </td>
      <td className="mono" style={{ color: d.late ? '#f87171' : '#34d399' }}>
        {d.etaHrs}hr / 限 {d.deadlineHrs}hr
      </td>
      <td>
        {d.breached ? (
          <>
            <span className="tag tag-rose">違約</span>
            <div className="tiny" style={{ color: '#fca5a5', marginTop: 3 }}>
              {d.reasons.join('；')}
            </div>
          </>
        ) : (
          <span className="tag tag-green"><CircleCheck size={11} />達成</span>
        )}
      </td>
      <td className="mono" style={{ color: d.penaltyIncurred ? '#f87171' : '#6b7280', textAlign: 'right' }}>
        {d.penaltyIncurred ? formatMoney(d.penaltyIncurred, currency) : '—'}
      </td>
    </tr>
  );
}

export default function StageSimulate({ ds, onNext }) {
  const sc = ds.scenario;
  const [picked, setPicked] = useState([]);
  const [ran, setRan] = useState(false);
  const [showOptimal, setShowOptimal] = useState(false);

  const base = useMemo(() => baseline(sc), [sc]);
  const mine = useMemo(() => simulate(sc, picked), [sc, picked]);
  const best = useMemo(() => findOptimal(sc), [sc]);

  const cur = ds.currency;
  const saved = base.totalCost - mine.totalCost;

  const toggle = (id) => {
    setRan(false);
    setShowOptimal(false);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  return (
    <div className="stack fade">
      <StageHead n={5} title="約束傳播" subtitle="資源是有限的" accent={ds.accent}>
        圖畫好之後，才輪到決策。這一關的每一個數字都是<strong>算出來的</strong>，
        不是寫死的字串 —— 你可以打開 <code className="mono">src/engine/constraints.js</code> 看它怎麼算。
        重點只有一個：<strong>資源是有限的，你把它給了 A，B 就會少</strong>，而那個代價會自己沿著圖浮出來。
      </StageHead>

      <div className="panel stack">
        <h3>{sc.title}</h3>
        <p className="small muted" style={{ lineHeight: 1.75 }}>{sc.setup}</p>
        <div className="warn">{sc.penaltyNote}</div>
        <p className="tiny dim">{sc.allocationNote}</p>
      </div>

      {/* 基準線 */}
      <div className="panel stack">
        <div className="spread">
          <h4>基準線：什麼都不做</h4>
          <span className="tag tag-rose mono">總代價 {formatMoney(base.totalCost, cur)}</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>需求</th><th>需要</th><th>配到</th><th>時間</th><th>結果</th><th style={{ textAlign: 'right' }}>代價</th></tr>
            </thead>
            <tbody>
              {base.demands.map((d) => <DemandRow key={d.id} d={d} resources={base.resources} currency={cur} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* 選項 */}
      <Gate>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <Calculator size={17} color="#fcd34d" />
          <strong style={{ color: '#fcd34d' }}>換你決策（可複選）</strong>
        </div>
        <p className="small muted" style={{ lineHeight: 1.7 }}>
          先憑直覺選一組，按下「計算」。<strong style={{ color: '#fff' }}>選完再看最佳解</strong> ——
          直接看答案就學不到那個落差了。
        </p>
      </Gate>

      <div className="stack" style={{ gap: 10 }}>
        {sc.options.map((o) => {
          const on = picked.includes(o.id);
          const inBest = showOptimal && best.selectedOptionIds.includes(o.id);
          return (
            <button key={o.id} className="pick" data-on={on} onClick={() => toggle(o.id)}>
              <div className="spread">
                <div style={{ flex: '1 1 260px' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong style={{ color: on ? '#93c5fd' : '#fff' }}>{o.label}</strong>
                    {inBest && <span className="tag tag-green"><Sparkles size={11} />最佳解含此項</span>}
                  </div>
                  <p className="small muted" style={{ marginTop: 3 }}>{o.desc}</p>
                  <p className="tiny" style={{ color: '#fbbf24', marginTop: 4 }}>風險：{o.risk}</p>
                </div>
                <span className="mono small" style={{ color: '#f87171', whiteSpace: 'nowrap' }}>
                  {formatMoney(o.cash, cur)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="row">
        <button className="btn btn-primary" onClick={() => setRan(true)} disabled={picked.length === 0}>
          <Calculator size={15} /> 計算這組決策的後果
        </button>
        <button className="btn btn-sm" onClick={() => { setPicked([]); setRan(false); setShowOptimal(false); }}>
          <RotateCcw size={13} /> 清空
        </button>
      </div>

      {/* 結果 */}
      {ran && (
        <div className="panel stack fade">
          <div className="spread">
            <h4>你的決策結果</h4>
            <span className={`tag ${saved > 0 ? 'tag-green' : 'tag-rose'} mono`}>
              {saved > 0 ? `比基準線省 ${formatMoney(saved, cur)}` : `比基準線多花 ${formatMoney(-saved, cur)}`}
            </span>
          </div>

          <div className="grid3">
            <Metric label="現金支出" value={formatMoney(mine.cashCost, cur)} note="你主動花掉的錢" color="#fcd34d" />
            <Metric
              label="違約代價"
              value={formatMoney(mine.penaltyCost, cur)}
              note={mine.breaches.length ? `${mine.breaches.length} 筆未達成` : '全部達成'}
              color={mine.penaltyCost ? '#f87171' : '#34d399'}
            />
            <Metric
              label="總代價"
              value={formatMoney(mine.totalCost, cur)}
              note={`基準線 ${formatMoney(base.totalCost, cur)}`}
              color={mine.totalCost <= best.totalCost ? '#34d399' : '#fff'}
            />
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>需求</th><th>需要</th><th>配到</th><th>時間</th><th>結果</th><th style={{ textAlign: 'right' }}>代價</th></tr>
              </thead>
              <tbody>
                {mine.demands.map((d) => <DemandRow key={d.id} d={d} resources={mine.resources} currency={cur} />)}
              </tbody>
            </table>
          </div>

          <div className="grid3">
            {mine.resources.map((r) => (
              <div className="metric" key={r.id} style={{ borderLeft: `3px solid ${r.remaining < 0 ? '#f43f5e' : '#10b981'}` }}>
                <div className="metric-label">{r.label}</div>
                <div className="metric-value" style={{ fontSize: '1.05rem', color: r.remaining < 0 ? '#f87171' : '#e5e7eb' }}>
                  用 {r.used.toLocaleString()} / 有 {r.available.toLocaleString()} {r.unit}
                </div>
                <div className="bar" style={{ marginTop: 7 }}>
                  <span
                    style={{
                      width: `${Math.min(100, (r.used / Math.max(1, r.available)) * 100)}%`,
                      background: r.used > r.available ? '#f43f5e' : r.used / r.available > 0.85 ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {mine.breaches.length > 0 && (
            <div className="warn">
              <TriangleAlert size={15} style={{ verticalAlign: -3, marginRight: 5 }} />
              <strong>注意違約的是誰。</strong>
              有些選項會讓你自己的客戶準時，代價是<strong>另一個客戶</strong>出事 ——
              而那個客戶不在你剛才看的那張報表上。這就是「約束沿著圖傳播」的實際長相。
            </div>
          )}

          {!showOptimal ? (
            <button className="btn btn-go" onClick={() => setShowOptimal(true)} style={{ alignSelf: 'flex-start' }}>
              <Sparkles size={15} /> 讓電腦窮舉所有組合，看最佳解
            </button>
          ) : (
            <div className="stack fade">
              <div className="panel panel-tight" style={{ borderColor: 'rgba(16,185,129,.4)' }}>
                <div className="spread">
                  <div>
                    <div className="row" style={{ gap: 8 }}>
                      <Sparkles size={15} color="#34d399" />
                      <strong style={{ color: '#34d399' }}>最佳組合</strong>
                    </div>
                    <div className="small" style={{ color: '#fff', marginTop: 5 }}>
                      {best.selectedOptionIds.length === 0
                        ? '什麼都不做'
                        : best.selectedOptionIds.map((id) => sc.options.find((o) => o.id === id)?.label).join('　＋　')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                      {formatMoney(best.totalCost, cur)}
                    </div>
                    <div className="tiny dim">
                      你的方案 {formatMoney(mine.totalCost, cur)}
                      {mine.totalCost > best.totalCost && `（差 ${formatMoney(mine.totalCost - best.totalCost, cur)}）`}
                    </div>
                  </div>
                </div>
                <div className="tiny dim mono" style={{ marginTop: 8 }}>
                  窮舉 2^{sc.options.length} = {2 ** sc.options.length} 種組合，逐一代入同一個成本函數比較。
                </div>
              </div>
              <Lesson title="這一關的重點">{sc.revealNote}</Lesson>
            </div>
          )}
        </div>
      )}

      <NextButton onClick={onNext} disabled={!showOptimal} hint={showOptimal ? '' : '先算一次，再看最佳解'} label="下一關：動作與寫回" />
    </div>
  );
}
