import React, { useState, useEffect } from 'react';
import { Network, Code2 } from 'lucide-react';
import './App.css';
import { DATASETS, getDataset, STAGES } from './data';
import StageRaw from './stages/StageRaw';
import StageModel from './stages/StageModel';
import StageResolve from './stages/StageResolve';
import StageGraph from './stages/StageGraph';
import StageSimulate from './stages/StageSimulate';
import StageAct from './stages/StageAct';
import StageDebrief from './stages/StageDebrief';

export default function App() {
  const [dsId, setDsId] = useState(DATASETS[0].id);
  const [stage, setStage] = useState('raw');
  const [furthest, setFurthest] = useState(0);

  const ds = getDataset(dsId);
  const idx = STAGES.findIndex((s) => s.id === stage);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage, dsId]);

  const go = (id) => {
    const i = STAGES.findIndex((s) => s.id === id);
    setStage(id);
    setFurthest((f) => Math.max(f, i));
  };
  const next = () => {
    if (idx < STAGES.length - 1) go(STAGES[idx + 1].id);
  };
  const switchDs = (id) => {
    setDsId(id);
    setStage('raw');
    setFurthest(0);
  };

  const props = { ds, onNext: next };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <Network size={20} color={ds.accent} />
            <span>本體論工作台</span>
            <span className="tiny dim" style={{ fontWeight: 500 }}>
              Palantir 做的那件事，親手做一遍
            </span>
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div className="ds-switch">
              {DATASETS.map((d) => (
                <button
                  key={d.id}
                  data-on={d.id === dsId}
                  onClick={() => d.id !== dsId && switchDs(d.id)}
                  style={{ background: d.id === dsId ? `${d.accent}30` : undefined }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="rail">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              className="rail-item"
              data-on={s.id === stage}
              data-done={i < furthest}
              onClick={() => i <= furthest && go(s.id)}
              disabled={i > furthest}
              style={{ opacity: i > furthest ? 0.45 : 1, cursor: i > furthest ? 'not-allowed' : 'pointer' }}
              title={i > furthest ? '先完成前面的關卡' : s.blurb}
            >
              <span className="rail-num">{s.n}</span>
              <span>
                <span className="rail-title">{s.title}</span>
                <br />
                <span className="rail-sub">{s.subtitle}</span>
              </span>
            </button>
          ))}
        </nav>
      </header>

      <main className="wrap" style={{ paddingTop: 20, paddingBottom: 40, flex: 1 }}>
        <div className="spread" style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 9 }}>
            <span className="tag" style={{ background: `${ds.accent}22`, color: ds.accent, borderColor: `${ds.accent}55` }}>
              資料集：{ds.label}
            </span>
            <span className="small dim">{ds.tagline}</span>
          </div>
          <div style={{ flex: '1 1 160px', maxWidth: 240 }}>
            <div className="bar">
              <span style={{ width: `${((idx + 1) / STAGES.length) * 100}%`, background: ds.accent }} />
            </div>
            <div className="tiny dim mono" style={{ marginTop: 4, textAlign: 'right' }}>
              {idx + 1} / {STAGES.length}
            </div>
          </div>
        </div>

        {stage === 'raw' && <StageRaw key={dsId} {...props} />}
        {stage === 'model' && <StageModel key={dsId} {...props} />}
        {stage === 'resolve' && <StageResolve key={dsId} {...props} />}
        {stage === 'graph' && <StageGraph key={dsId} {...props} />}
        {stage === 'simulate' && <StageSimulate key={dsId} {...props} />}
        {stage === 'act' && <StageAct key={dsId} {...props} />}
        {stage === 'debrief' && (
          <StageDebrief
            key={dsId}
            ds={ds}
            onRestart={() => { setStage('raw'); setFurthest(0); }}
            onSwitch={switchDs}
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', background: 'rgba(9,13,22,.9)' }}>
        <div className="wrap spread" style={{ padding: 0 }}>
          <span className="tiny dim">
            教學用沙盒 · 所有公司名稱、統編、金額與事件均為杜撰 · 與 Palantir Technologies 無任何關聯
          </span>
          <span className="tiny dim row" style={{ gap: 5 }}>
            <Code2 size={12} /> 演算法在 src/engine，資料在 src/data
          </span>
        </div>
      </footer>
    </div>
  );
}
