import React, { useState } from 'react';
import { Play, ShieldAlert, Undo2, ScrollText, UserCog, CircleCheck, CircleX, Clock } from 'lucide-react';
import { StageHead, Lesson, NextButton, Gate } from '../components/ui';
import { planWriteback, toAuditEntry } from '../engine/writeback';

const STATUS = {
  ok: { icon: CircleCheck, color: '#34d399', tag: 'tag-green' },
  denied: { icon: ShieldAlert, color: '#f87171', tag: 'tag-rose' },
  conflict: { icon: CircleX, color: '#fbbf24', tag: 'tag-amber' },
  timeout: { icon: Clock, color: '#fb923c', tag: 'tag-amber' },
  skipped: { icon: CircleX, color: '#6b7280', tag: 'tag-gray' },
};

export default function StageAct({ ds, onNext }) {
  const roles = ds.roles;
  const [role, setRole] = useState(ds.defaultRole);
  const [conflictOn, setConflictOn] = useState(false);
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});
  const [audit, setAudit] = useState([]);

  const run = (action) => {
    setRunning(action.id);
    setTimeout(() => {
      const currentValues = conflictOn ? action.conflictDemo || {} : {};
      const result = planWriteback(action, { role, currentValues, roles });
      setResults((p) => ({ ...p, [action.id]: result }));
      setAudit((p) => [toAuditEntry(result), ...p]);
      setRunning(null);
    }, 600);
  };

  const anyRun = Object.keys(results).length > 0;
  const anyFailed = Object.values(results).some((r) => !r.committed);

  return (
    <div className="stack fade">
      <StageHead n={6} title="動作與寫回" subtitle="把決策送回現實" accent={ds.accent}>
        決策算完了，接下來要把它寫回那些來源系統 —— 這是 Palantir 跟一般 BI 或 RAG 最大的差別，
        也是簡報上最常被美化的一步。真實的寫回沒有一次是「一鍵完成」的。
      </StageHead>

      <div className="panel">
        <p className="small muted" style={{ lineHeight: 1.75 }}>{ds.writebackIntro}</p>
      </div>

      <Gate>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <UserCog size={17} color="#fcd34d" />
          <strong style={{ color: '#fcd34d' }}>先設定你的身分與環境，再執行</strong>
        </div>
        <p className="small muted" style={{ marginBottom: 8, lineHeight: 1.7 }}>
          用不同角色跑同一個動作，結果會不一樣。這不是裝飾 —— 權限是 Palantir 賣給政府與受監理產業的核心，
          而且是絕大多數自製系統做不出來的部分。
        </p>
        <p className="tiny dim" style={{ marginBottom: 10, lineHeight: 1.7 }}>{ds.roleNote}</p>
        <div className="row" style={{ gap: 6, marginBottom: 10 }}>
          {Object.values(roles).map((r) => (
            <button
              key={r.id}
              className="btn btn-sm"
              onClick={() => setRole(r.id)}
              style={{
                borderColor: role === r.id ? 'var(--accent-blue)' : undefined,
                background: role === r.id ? 'rgba(59,130,246,.15)' : undefined,
              }}
            >
              {r.label}
              <span className="tiny dim mono">{r.grants.length ? r.grants.join('/') : '無寫入權'}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn-sm"
          onClick={() => setConflictOn((v) => !v)}
          style={{
            borderColor: conflictOn ? 'var(--accent-amber)' : undefined,
            background: conflictOn ? 'rgba(245,158,11,.15)' : undefined,
          }}
        >
          {conflictOn ? '✓ ' : ''}模擬「有人先改過了」（樂觀鎖衝突）
        </button>
      </Gate>

      <div className="stack" style={{ gap: 14 }}>
        {ds.actions.map((action) => {
          const res = results[action.id];
          return (
            <div className="panel stack" key={action.id} style={{ gap: 12 }}>
              <div className="spread">
                <div style={{ flex: '1 1 300px' }}>
                  <h4>{action.name}</h4>
                  <p className="small muted" style={{ marginTop: 3 }}>{action.desc}</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={running === action.id}
                  onClick={() => run(action)}
                >
                  {running === action.id ? '寫入中…' : <><Play size={13} /> 執行</>}
                </button>
              </div>

              {/* 預告要動哪些系統 */}
              <div className="term">
                {action.writebacks.map((w, i) => (
                  <div key={i}>
                    <span style={{ color: '#6b7280' }}>{i + 1}. </span>
                    <span style={{ color: '#60a5fa' }}>{w.system}</span>
                    <span style={{ color: '#6b7280' }}> [{w.field}] </span>
                    <span style={{ color: '#f87171' }}>{w.oldValue}</span>
                    <span style={{ color: '#6b7280' }}> → </span>
                    <span style={{ color: '#a78bfa' }}>{w.newValue}</span>
                    <span className="tag tag-gray" style={{ marginLeft: 8 }}>需要 {w.scope} 權限</span>
                  </div>
                ))}
              </div>

              {res && (
                <div className="stack fade" style={{ gap: 9 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`tag ${res.committed ? 'tag-green' : res.inconsistent ? 'tag-rose' : 'tag-amber'}`}>
                      {res.committed ? '全部成功' : res.inconsistent ? '狀態不一致' : '已中止並回滾'}
                    </span>
                    <span className="tiny dim mono">{res.summary}</span>
                  </div>

                  <div className="term">
                    {res.steps.map((s, i) => {
                      const cfg = STATUS[s.status];
                      const Icon = cfg.icon;
                      return (
                        <div key={i} style={{ color: cfg.color }}>
                          <Icon size={12} style={{ verticalAlign: -2, marginRight: 5 }} />
                          {s.system} [{s.field}] — {s.message}
                        </div>
                      );
                    })}
                    {res.compensations.length > 0 && (
                      <>
                        <div style={{ color: '#6b7280', marginTop: 6 }}>── 補償回滾 ──</div>
                        {res.compensations.map((c, i) => (
                          <div key={i} style={{ color: c.status === 'ok' ? '#fbbf24' : '#f87171' }}>
                            <Undo2 size={12} style={{ verticalAlign: -2, marginRight: 5 }} />
                            {c.system} [{c.field}] {c.from} → {c.to} — {c.message}
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="lesson small">{action.teaches}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 稽核軌跡 */}
      <div className="panel stack">
        <div className="row" style={{ gap: 8 }}>
          <ScrollText size={17} color="#06b6d4" />
          <h4>稽核軌跡（只增不刪）</h4>
        </div>
        <p className="small muted">
          每一次執行都留一筆，成功失敗都留。這條軌跡不能改、不能刪 ——
          它才是 Palantir 賣給政府與受監理產業的東西，比任何儀表板都值錢。
        </p>
        <div className="term" style={{ minHeight: 90 }}>
          {audit.length === 0 ? (
            <span className="dim">&gt; 尚無紀錄。執行上面任一動作後，這裡會開始累積。</span>
          ) : (
            audit.map((a) => (
              <div key={a.seq}>
                <span style={{ color: '#6b7280' }}>#{String(a.seq).padStart(3, '0')} [{a.at}] </span>
                <span style={{ color: '#93c5fd' }}>{a.actor}</span>
                <span style={{ color: '#6b7280' }}> · </span>
                <span style={{ color: '#e5e7eb' }}>{a.action}</span>
                <span style={{ color: '#6b7280' }}> → </span>
                <span style={{ color: a.outcome === 'COMMITTED' ? '#34d399' : a.outcome === 'INCONSISTENT' ? '#f87171' : '#fbbf24' }}>
                  {a.outcome}
                </span>
                <div className="dim" style={{ paddingLeft: 22 }}>↳ {a.detail}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {anyRun && (
        <Lesson title="這一關的重點">
          你剛才看到的四種失敗 —— 權限不足、樂觀鎖衝突、逾時、部分成功後回滾 ——
          是分散式寫回的全部日常。<strong>跨系統沒有交易保證</strong>，所以「一鍵寫回」本質上是一連串
          可能各自失敗的獨立請求，加上一套補償邏輯，再加上一條沒人能改的稽核軌跡。
          {anyFailed && (
            <>
              <br /><br />
              特別注意「逾時」那種：你不知道對方到底寫進去沒有。這時候<strong>自動回滾本身就是危險動作</strong> ——
              如果對方其實成功了，你的回滾會把正確的值改掉。真實系統在這裡要靠冪等鍵與對帳，不是靠重試。
            </>
          )}
          <br /><br />
          原本那份 demo 把這一整關寫成 <code className="mono">setTimeout(1000)</code> 之後印一行 200 OK。
          那不是簡化，那是把最難的部分刪掉之後宣稱它很簡單。
        </Lesson>
      )}

      <NextButton onClick={onNext} disabled={!anyRun} hint={anyRun ? '' : '至少執行一個動作'} label="最後一關：總結對照" />
    </div>
  );
}
