import React, { useState } from 'react';
import { GitMerge, Layers } from 'lucide-react';
import { StageHead, Lesson, NextButton } from '../components/ui';

export default function StageGraph({ ds, onNext }) {
  const [active, setActive] = useState(ds.graph.nodes[0].id);
  const [resolved, setResolved] = useState(false);

  const byId = new Map(ds.graph.nodes.map((n) => [n.id, n]));
  const typeColor = (t) => ds.objectTypes.find((o) => o.id === t)?.color || '#64748b';
  const node = byId.get(active);
  const related = ds.graph.links.filter((l) => l.source === active || l.target === active);

  // 未解析狀態：把已合併的來源重新拆成散落的節點，示範「解析前畫不出圖」
  const shatter = (n) => (resolved ? [n] : (n.merged || [null]).map((m, i) => ({ ...n, _i: i, _label: m || n.label })));

  return (
    <div className="stack fade">
      <StageHead n={4} title="建立關聯" subtitle="把物件連成圖" accent={ds.accent}>
        物件定義好、實體解析完，這時候才畫得出圖。
        圖本身不是目的 —— 它的價值在於讓某些原本問不出來的問題，變成可以用手指沿著線走完的問題。
      </StageHead>

      <div className="panel stack">
        <div className="spread">
          <h3>物件關聯圖</h3>
          <div className="row" style={{ gap: 6 }}>
            <button
              className="btn btn-sm"
              onClick={() => setResolved(false)}
              style={{ borderColor: !resolved ? 'var(--accent-rose)' : undefined, background: !resolved ? 'rgba(244,63,94,.14)' : undefined }}
            >
              解析前
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setResolved(true)}
              style={{ borderColor: resolved ? 'var(--accent-emerald)' : undefined, background: resolved ? 'rgba(16,185,129,.14)' : undefined }}
            >
              <GitMerge size={13} /> 解析後
            </button>
          </div>
        </div>

        <p className="small muted">
          切換上面兩個按鈕。<strong style={{ color: '#fff' }}>「解析前」</strong>是 Stage 3 沒做的世界：
          同一個客戶散成好幾個節點，連線接不起來，圖是碎的。
        </p>

        <div className="graph-canvas">
          <svg viewBox="0 0 900 520" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <marker id="ah" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#60a5fa" opacity="0.75" />
              </marker>
              <marker id="ahd" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#f87171" />
              </marker>
            </defs>

            {resolved &&
              ds.graph.links.map((l, i) => {
                const a = byId.get(l.source);
                const b = byId.get(l.target);
                if (!a || !b) return null;
                const hot = l.source === active || l.target === active;
                return (
                  <g key={i}>
                    <line
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={l.danger ? '#f87171' : hot ? '#60a5fa' : 'rgba(255,255,255,.14)'}
                      strokeWidth={hot ? 2.4 : 1.4}
                      className={l.danger ? 'edge-danger' : ''}
                      markerEnd={l.danger ? 'url(#ahd)' : 'url(#ah)'}
                    />
                    <text
                      x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 7}
                      fill={l.danger ? '#fda4af' : hot ? '#93c5fd' : '#5b6472'}
                      fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle"
                    >
                      {l.label}
                    </text>
                  </g>
                );
              })}

            {ds.graph.nodes.flatMap((n) =>
              shatter(n).map((s, i) => {
                const on = resolved && n.id === active;
                const jitterX = resolved ? 0 : (i - ((n.merged?.length || 1) - 1) / 2) * 46;
                const jitterY = resolved ? 0 : (i % 2) * 30 - 14;
                return (
                  <g
                    key={`${n.id}-${i}`}
                    transform={`translate(${n.x + jitterX}, ${n.y + jitterY})`}
                    className="node-hit"
                    onClick={() => resolved && setActive(n.id)}
                    opacity={resolved ? 1 : 0.85}
                  >
                    <circle
                      r={resolved ? (on ? 25 : 21) : 13}
                      fill={typeColor(n.type)}
                      fillOpacity={on ? 0.4 : 0.16}
                      stroke={typeColor(n.type)}
                      strokeWidth={on ? 2.6 : 1.4}
                      strokeDasharray={resolved ? 'none' : '3 3'}
                    />
                    <text
                      y={resolved ? 38 : 26}
                      fill={on ? '#fff' : resolved ? '#9ca3af' : '#6b7280'}
                      fontSize={resolved ? 12 : 10}
                      fontWeight={on ? 700 : 500}
                      textAnchor="middle"
                    >
                      {(resolved ? n.label : s._label).length > 16
                        ? `${(resolved ? n.label : s._label).slice(0, 15)}…`
                        : resolved ? n.label : s._label}
                    </text>
                    {resolved && (
                      <text y={52} fill="#6b7280" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                        {n.sub}
                      </text>
                    )}
                  </g>
                );
              })
            )}

            {!resolved && (
              <text x="450" y="500" fill="#f87171" fontSize="13" textAnchor="middle" fontWeight="700">
                沒有任何一條線 —— 因為系統還不知道哪些節點是同一個東西
              </text>
            )}
          </svg>
        </div>

        {resolved && node && (
          <div className="grid2 fade">
            <div className="panel panel-tight stack" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <Layers size={15} color={typeColor(node.type)} />
                <strong style={{ color: '#fff' }}>{node.label}</strong>
                <span className="tag" style={{ background: `${typeColor(node.type)}22`, color: typeColor(node.type) }}>
                  {node.type}
                </span>
              </div>
              <div className="small muted mono">{node.sub}</div>
              {node.merged && (
                <div>
                  <div className="tiny dim" style={{ marginBottom: 4 }}>由這幾筆合併而成：</div>
                  <div className="row" style={{ gap: 5 }}>
                    {node.merged.map((m) => <span key={m} className="tag tag-gray">{m}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div className="panel panel-tight stack" style={{ gap: 6 }}>
              <div className="tiny dim">關聯（點圖上的節點切換）</div>
              {related.length === 0 && <div className="small dim">沒有關聯</div>}
              {related.map((l, i) => (
                <div key={i} className="small mono" style={{ color: l.danger ? '#fda4af' : '#cbd5e1' }}>
                  {byId.get(l.source)?.label} <span className="dim">—[{l.label}]→</span> {byId.get(l.target)?.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Lesson title="這一關的重點">{ds.graph.insight}</Lesson>

      <NextButton onClick={onNext} disabled={!resolved} hint={resolved ? '' : '先切到「解析後」看看差別'} label="下一關：約束傳播" />
    </div>
  );
}
