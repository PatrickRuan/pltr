import React, { useState } from 'react';
import { Database, MessageSquare, ScanLine, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { StageHead, Lesson, NextButton, Gate } from '../components/ui';

const ICONS = { table: Database, chat: MessageSquare, ocr: ScanLine };

function SourceBody({ src }) {
  if (src.format === 'table') {
    return (
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>{src.columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {src.rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} className={cell === '' ? 'empty' : ''}>
                    {cell === '' ? '(空白)' : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (src.format === 'chat') {
    return (
      <div className="term" style={{ whiteSpace: 'normal' }}>
        {src.lines.map((l, i) => (
          <div key={i}>
            {l.d && <div className="chat-day">{l.d}</div>}
            <div className="chat-line">
              <span className="chat-t">{l.t}</span>
              <span className="chat-who">{l.who}</span>
              <span style={{ color: '#e5e7eb' }}>{l.msg}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="term">{src.text.join('\n')}</div>;
}

export default function StageRaw({ ds, onNext }) {
  const [open, setOpen] = useState(ds.sources[0].id);
  const [revealed, setRevealed] = useState({});
  const allRevealed = ds.sources.every((s) => revealed[s.id]);

  return (
    <div className="stack fade">
      <StageHead n={1} title="原始混亂" subtitle="資料長什麼樣子" accent={ds.accent}>
        {ds.intro}
      </StageHead>

      <div className="note-fiction">⚠ {ds.fiction}</div>

      <Gate>
        <div className="row" style={{ gap: 8, marginBottom: 6 }}>
          <Eye size={17} color="#fcd34d" />
          <strong style={{ color: '#fcd34d' }}>先做，再看解答</strong>
        </div>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          下面五份資料是這家公司手上的全部。請你先自己讀過一遍，心裡回答一個問題：
          <strong style={{ color: '#fff' }}>「這裡面有幾個客戶？」</strong>
          讀完之後，再點開每一份的「這份資料哪裡有問題」對答案。
          直接看解答學不會 —— 撞牆的那一下才是這一關的內容。
        </p>
        <p className="small dim" style={{ marginTop: 8 }}>{ds.contrastNote}</p>
      </Gate>

      <div className="row" style={{ gap: 6 }}>
        {ds.sources.map((s) => {
          const Icon = ICONS[s.format] || Database;
          const on = open === s.id;
          return (
            <button
              key={s.id}
              className="btn btn-sm"
              onClick={() => setOpen(s.id)}
              style={{
                borderColor: on ? (s.golden ? 'var(--accent-emerald)' : 'var(--accent-blue)') : undefined,
                background: on ? 'rgba(59,130,246,.14)' : undefined,
              }}
            >
              {s.golden ? <ShieldCheck size={14} color="#6ee7b7" /> : <Icon size={14} />}
              {s.label.split(' —')[0].split('（')[0]}
            </button>
          );
        })}
      </div>

      {ds.sources.filter((s) => s.id === open).map((src) => (
        <div className="panel stack" key={src.id}>
          <div className="spread">
            <div>
              <h3>
                {src.label}
                {src.golden && <span className="tag tag-green" style={{ marginLeft: 8 }}>唯一乾淨的來源</span>}
              </h3>
              <div className="small dim mono" style={{ marginTop: 3 }}>{src.system}</div>
            </div>
          </div>
          <p className="small muted">{src.note}</p>

          <SourceBody src={src} />

          <button
            className="btn btn-sm"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => setRevealed((p) => ({ ...p, [src.id]: !p[src.id] }))}
          >
            {revealed[src.id] ? <EyeOff size={14} /> : <Eye size={14} />}
            {revealed[src.id] ? '收起' : '這份資料哪裡有問題？'}
          </button>

          {revealed[src.id] && (
            <div className="fade" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {src.defects.map((d, i) => (
                <div key={i} className={`defect${src.golden ? ' defect-ok' : ''}`}>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {allRevealed && (
        <Lesson title="這一關的重點">
          你剛才看到的不是「資料品質不好」，是<strong>同一個現實被五個系統各自記了一遍，而且沒有一遍是完整的</strong>。
          Palantir 那套方法的起點不是分析，是承認這件事，然後決定要用哪一份當準。
          <br />
          <br />
          順帶一提：真實專案裡，這一關會花掉你好幾週，而且是跟人開會，不是寫程式。
        </Lesson>
      )}

      <NextButton
        onClick={onNext}
        hint={allRevealed ? '五份都看過了' : `還有 ${ds.sources.length - Object.values(revealed).filter(Boolean).length} 份沒點開「哪裡有問題」`}
        label="下一關：定義物件"
      />
    </div>
  );
}
