import React, { useState, useMemo } from 'react';
import { Check, X, Link2, Unlink, AlertTriangle, Cpu, Users, KeyRound } from 'lucide-react';
import { StageHead, Lesson, NextButton, Gate, Metric } from '../components/ui';
import { RESOLVERS, evaluate } from '../engine/resolvers';

function pct(v) {
  return v === null ? '—' : `${(v * 100).toFixed(0)}%`;
}

function Scoreboard({ result, label, color, sub }) {
  return (
    <div className="metric" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="spread" style={{ marginBottom: 4 }}>
        <span className="metric-label" style={{ color }}>{label}</span>
        <span className="mono tiny dim">{sub}</span>
      </div>
      <div className="row" style={{ gap: 14 }}>
        <span><span className="tiny dim">準確率 </span><strong className="mono">{pct(result.accuracy)}</strong></span>
        <span><span className="tiny dim">精確率 </span><strong className="mono">{pct(result.precision)}</strong></span>
        <span><span className="tiny dim">召回率 </span><strong className="mono">{pct(result.recall)}</strong></span>
      </div>
      <div className="metric-note mono">
        <span style={{ color: '#34d399' }}>TP {result.tally.TP} · TN {result.tally.TN}</span>
        {'  '}
        <span style={{ color: '#f87171' }}>FP {result.tally.FP} · FN {result.tally.FN}</span>
      </div>
    </div>
  );
}

export default function StageResolve({ ds, onNext }) {
  const pairs = ds.resolution.pairs;
  const [phase, setPhase] = useState('guess'); // guess → judge → compare
  const [guess, setGuess] = useState('');
  const [answers, setAnswers] = useState({});
  const [judged, setJudged] = useState(false);

  const humanResult = useMemo(() => evaluate(pairs, null, answers), [pairs, answers]);
  const machineResults = useMemo(
    () => RESOLVERS.map((r) => ({ resolver: r, result: evaluate(pairs, r) })),
    [pairs]
  );

  const answeredAll = Object.keys(answers).length === pairs.length;

  // ── Phase 1：先猜 ────────────────────────────
  if (phase === 'guess') {
    return (
      <div className="stack fade">
        <StageHead n={3} title="實體解析" subtitle="這兩筆是同一個東西嗎" accent={ds.accent}>
          這是整套方法最難、也最值錢的一關。你 Stage 1 看到的那堆名字，
          有些指的是同一個對象，有些只是長得像。分不出來，後面的每一個數字都是錯的。
        </StageHead>

        <Gate>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <Users size={17} color="#fcd34d" />
            <strong style={{ color: '#fcd34d' }}>先回答，再往下</strong>
          </div>
          <p style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700, marginBottom: 10 }}>
            {ds.resolution.question}
          </p>
          <div className="row">
            <input
              className="btn mono"
              style={{ width: 110, cursor: 'text', textAlign: 'center' }}
              placeholder="輸入數字"
              value={guess}
              inputMode="numeric"
              onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
            />
            <button className="btn btn-primary" disabled={!guess} onClick={() => setPhase('judge')}>
              送出答案
            </button>
          </div>
          <p className="tiny dim" style={{ marginTop: 10 }}>
            不用回去翻，憑印象就好。這一題的重點不是答對，是等一下看到正解時的落差。
          </p>
        </Gate>
      </div>
    );
  }

  const guessNum = Number(guess);

  return (
    <div className="stack fade">
      <StageHead n={3} title="實體解析" subtitle="這兩筆是同一個東西嗎" accent={ds.accent}>
        這是整套方法最難、也最值錢的一關。
      </StageHead>

      <div className="grid3">
        <Metric label="你的答案" value={guessNum} note="憑印象數的" color="#93c5fd" />
        <Metric
          label="表面上看得到的筆數"
          value={ds.resolution.naiveCount}
          note="如果直接把所有來源的名稱去重"
          color="#fcd34d"
        />
        <Metric label="實際上的實體數" value={ds.resolution.trueCount} note="解析之後" color="#34d399" />
      </div>

      <div className="warn">
        <strong>差距就是這一關的全部。</strong> 表面上 {ds.resolution.naiveCount} 筆，實際上只有 {ds.resolution.trueCount} 個。
        中間那 {ds.resolution.naiveCount - ds.resolution.trueCount} 筆的落差，會直接變成：算錯的營收、看錯的客戶排名、
        重複催收的帳款、以及一份沒有人信任的報表。
      </div>

      {/* ── 人工判斷 ───────────────────────── */}
      <div className="panel stack">
        <div className="spread">
          <div>
            <h3>換你判斷</h3>
            <p className="small muted" style={{ marginTop: 3 }}>
              下面每一組是兩筆紀錄。它們是同一個對象嗎？先自己判，等一下拿你的成績跟四種自動化方法比。
            </p>
          </div>
          <span className="tag tag-gray mono">{Object.keys(answers).length} / {pairs.length}</span>
        </div>

        <div className="stack" style={{ gap: 10 }}>
          {pairs.map((p) => {
            const mine = answers[p.id];
            const right = judged && mine === p.sameEntity;
            return (
              <div
                className="panel panel-tight"
                key={p.id}
                style={{
                  borderColor: judged
                    ? right ? 'rgba(16,185,129,.4)' : 'rgba(244,63,94,.45)'
                    : undefined,
                }}
              >
                <div className="spread" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 320px' }}>
                    <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 130 }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{p.left.name}</div>
                        <div className="tiny dim mono">{p.left.sourceLabel}</div>
                        {p.left.externalKey && (
                          <span className="tag tag-green tiny" style={{ marginTop: 4 }}>
                            <KeyRound size={10} />{p.left.externalKey}
                          </span>
                        )}
                      </div>
                      <span className="dim" style={{ paddingTop: 4 }}>vs</span>
                      <div style={{ flex: 1, minWidth: 130 }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{p.right.name}</div>
                        <div className="tiny dim mono">{p.right.sourceLabel}</div>
                        {p.right.externalKey && (
                          <span className="tag tag-green tiny" style={{ marginTop: 4 }}>
                            <KeyRound size={10} />{p.right.externalKey}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ gap: 6 }}>
                    <button
                      className="btn btn-sm"
                      disabled={judged}
                      onClick={() => setAnswers((a) => ({ ...a, [p.id]: true }))}
                      style={{
                        borderColor: mine === true ? 'var(--accent-emerald)' : undefined,
                        background: mine === true ? 'rgba(16,185,129,.15)' : undefined,
                      }}
                    >
                      <Link2 size={13} /> 同一個
                    </button>
                    <button
                      className="btn btn-sm"
                      disabled={judged}
                      onClick={() => setAnswers((a) => ({ ...a, [p.id]: false }))}
                      style={{
                        borderColor: mine === false ? 'var(--accent-rose)' : undefined,
                        background: mine === false ? 'rgba(244,63,94,.15)' : undefined,
                      }}
                    >
                      <Unlink size={13} /> 不同
                    </button>
                  </div>
                </div>

                {judged && (
                  <div className="fade stack" style={{ gap: 7, marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--border-color)' }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className={`tag ${right ? 'tag-green' : 'tag-rose'}`}>
                        {right ? <Check size={12} /> : <X size={12} />}
                        {right ? '你答對了' : '你答錯了'}
                      </span>
                      <span className={`tag ${p.sameEntity ? 'tag-blue' : 'tag-gray'}`}>
                        正解：{p.sameEntity ? '同一個' : '不同'}
                      </span>
                      {p.modelIsWrong && (
                        <span className="tag tag-purple"><AlertTriangle size={11} />模型在這題會答錯</span>
                      )}
                    </div>
                    <p className="small" style={{ color: '#e5e7eb', lineHeight: 1.7 }}>{p.humanHint}</p>
                    <p className="small muted" style={{ lineHeight: 1.7 }}>{p.lesson}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!judged && (
          <button className="btn btn-primary" disabled={!answeredAll} onClick={() => setJudged(true)} style={{ alignSelf: 'flex-start' }}>
            對答案
          </button>
        )}
      </div>

      {/* ── 四種方法並排 ───────────────────── */}
      {judged && (
        <div className="panel stack fade">
          <div>
            <h3>你 vs 四種自動化方法</h3>
            <p className="small muted" style={{ marginTop: 3, lineHeight: 1.7 }}>
              下面的分數是<strong style={{ color: '#fff' }}>當場算出來的</strong> ——
              前三種方法的演算法真的在你的瀏覽器裡跑過這 {pairs.length} 組配對。
            </p>
          </div>

          <div className="grid2">
            <Scoreboard result={humanResult} label="你（人工判斷）" color="#93c5fd" sub="速度：慢，成本：最高" />
            {machineResults.map(({ resolver, result }) => (
              <Scoreboard
                key={resolver.id}
                result={result}
                label={resolver.label}
                color={resolver.color}
                sub={resolver.cost}
              />
            ))}
          </div>

          <div className="note-fiction">
            <Cpu size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
            誠實聲明：「模型判斷」這一欄<strong>不是</strong>即時呼叫 LLM，是預先錄製的判斷結果，
            為了讓這份教材能零金鑰、純靜態部署。錄製的內容刻意包含模型真實會犯的錯誤型態，不是照抄答案。
            要接真 API，替換 <code className="mono">src/engine/resolvers.js</code> 裡的 <code className="mono">modelResolver</code> 即可，介面不變。
            前三種方法則是真的演算法，程式碼在 <code className="mono">src/engine/text.js</code>。
          </div>

          {/* 錯誤解剖 */}
          <div className="stack" style={{ gap: 10 }}>
            <h4>錯在哪裡（這才是重點）</h4>
            {machineResults.map(({ resolver, result }) =>
              result.mistakes.length === 0 ? null : (
                <div className="panel panel-tight" key={resolver.id} style={{ borderLeft: `3px solid ${resolver.color}` }}>
                  <div className="row" style={{ gap: 8, marginBottom: 7 }}>
                    <strong style={{ color: resolver.color }}>{resolver.label}</strong>
                    <span className="tag tag-rose">{result.mistakes.length} 個錯誤</span>
                    <span className="tiny dim">{resolver.sublabel}</span>
                  </div>
                  <div className="stack" style={{ gap: 6 }}>
                    {result.mistakes.map((m) => (
                      <div key={m.pair.id} className="small" style={{ lineHeight: 1.65 }}>
                        <span className={`tag ${m.outcome === 'FP' ? 'tag-rose' : 'tag-amber'}`} style={{ marginRight: 6 }}>
                          {m.outcome === 'FP' ? '誤合併' : '漏合併'}
                        </span>
                        <span style={{ color: '#fff' }}>{m.pair.left.name}</span>
                        <span className="dim"> ／ </span>
                        <span style={{ color: '#fff' }}>{m.pair.right.name}</span>
                        <div className="tiny muted mono" style={{ marginTop: 2 }}>↳ {m.result.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <Lesson title="這一關的重點：不要只看準確率">
            模型的準確率最高，這是實測結果，不用替它辯護也不用替它膨脹。
            但<strong>準確率是個會騙人的指標</strong>，因為它假設兩種錯誤一樣貴 —— 而它們差非常多。
            <br /><br />
            <strong>漏合併（FN）</strong>：同一個客戶被當成兩個。這種錯誤<strong>看得見</strong> ——
            名單上出現兩筆長很像的資料，總有人會發現、會回報、會修。
            <br /><br />
            <strong>誤合併（FP）</strong>：兩個不同的對象被併成一個。這種錯誤<strong>看不見</strong> ——
            帳合起來了，報表很乾淨，數字很漂亮，而且從此沒有任何線索可以發現它錯了。
            等到有人發現時，你已經拿錯的數字做了半年決策。
            <br /><br />
            現在回頭看上面那張表的「精確率」那一欄：完全比對、主鍵優先都是 100%，
            它們<strong>從來不會誤合併</strong>；模糊比對和模型則都各犯了一次 —— 而且犯在同一種地方：
            名字像、語意像、但法人不同。模型還會附上一段聽起來很有說服力的理由。
            <br /><br />
            所以實務上的工作順序是：<strong>先想辦法弄到主鍵</strong>（台灣是統一編號，跨國是稅籍號或 DUNS）——
            它的召回率低沒關係，因為它產生的錯誤是便宜的那種。
            主鍵蓋不到的地方，才用模型當<strong>候選產生器</strong>而不是裁判，最後留人來裁決高風險的那幾組。
            把這個順序倒過來 —— 先丟給模型、出事再說 —— 是這幾年最常見也最貴的錯誤。
          </Lesson>
        </div>
      )}

      <NextButton onClick={onNext} disabled={!judged} hint={judged ? '' : '先完成判斷與對答案'} label="下一關：建立關聯" />
    </div>
  );
}
