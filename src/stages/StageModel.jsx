import React, { useState } from 'react';
import { Check, X, Boxes, KeyRound } from 'lucide-react';
import { StageHead, Lesson, NextButton, Gate, Metric } from '../components/ui';

const ROLE_LABEL = {
  identity: { text: '身分 Identity', cls: 'tag-green', hint: '這個欄位可以唯一指認一個物件' },
  property: { text: '屬性 Property', cls: 'tag-blue', hint: '描述狀態，會變，不能拿來指認' },
  link: { text: '關聯 Link', cls: 'tag-purple', hint: '它指向另一個物件' },
};

export default function StageModel({ ds, onNext }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const total = ds.modelingFields.length;
  const done = Object.keys(answers).length;
  const correct = ds.modelingFields.filter((f) => answers[f.id] === f.answer).length;

  return (
    <div className="stack fade">
      <StageHead n={2} title="定義物件" subtitle="決定世界由什麼組成" accent={ds.accent}>
        資料清乾淨之後，第一個真正的設計決策是：<strong>這個世界由哪些「東西」組成？</strong>
        這一步沒有標準答案是騙人的 —— 有些答案明顯比較好，因為它們讓後面的問題問得出來。
        建模建錯，後面五關全部歪掉，而且要三個月後才會發現。
      </StageHead>

      <Gate>
        <div className="row" style={{ gap: 8, marginBottom: 6 }}>
          <Boxes size={17} color="#fcd34d" />
          <strong style={{ color: '#fcd34d' }}>你的任務</strong>
        </div>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          下面每一個欄位（或一句話）都來自上一關的某份資料。請幫它決定：它屬於哪一個物件型別？
          全部作答完再按「對答案」。注意有幾題的正解不是你第一直覺會選的那個。
        </p>
      </Gate>

      <div className="grid3">
        {ds.objectTypes.map((t) => (
          <div className="metric" key={t.id} style={{ borderLeft: `3px solid ${t.color}` }}>
            <div className="metric-label" style={{ color: t.color }}>{t.label}</div>
          </div>
        ))}
      </div>

      <div className="stack">
        {ds.modelingFields.map((f) => {
          const picked = answers[f.id];
          const right = picked === f.answer;
          return (
            <div className="panel panel-tight stack" key={f.id} style={{ gap: 10 }}>
              <div className="spread">
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{f.field}</div>
                  <div className="tiny dim mono">來源：{f.from}</div>
                </div>
                {checked && (
                  <span className={`tag ${right ? 'tag-green' : 'tag-rose'}`}>
                    {right ? <Check size={12} /> : <X size={12} />}
                    {right ? '答對' : `正解：${ds.objectTypes.find((t) => t.id === f.answer)?.label}`}
                  </span>
                )}
              </div>

              <div className="row" style={{ gap: 6 }}>
                {ds.objectTypes.map((t) => {
                  const on = picked === t.id;
                  return (
                    <button
                      key={t.id}
                      className="btn btn-sm"
                      disabled={checked}
                      onClick={() => setAnswers((p) => ({ ...p, [f.id]: t.id }))}
                      style={{
                        borderColor: on ? t.color : undefined,
                        background: on ? `${t.color}22` : undefined,
                        color: on ? '#fff' : undefined,
                      }}
                    >
                      {t.label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div className="fade stack" style={{ gap: 8 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`tag ${ROLE_LABEL[f.role].cls}`}>
                      {f.role === 'identity' && <KeyRound size={11} />}
                      {ROLE_LABEL[f.role].text}
                    </span>
                    <span className="tiny dim">{ROLE_LABEL[f.role].hint}</span>
                  </div>
                  <p className="small muted" style={{ lineHeight: 1.7 }}>{f.why}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!checked ? (
        <button
          className="btn btn-primary"
          disabled={done < total}
          onClick={() => setChecked(true)}
          style={{ alignSelf: 'flex-start' }}
        >
          對答案（已作答 {done}/{total}）
        </button>
      ) : (
        <>
          <div className="grid3">
            <Metric
              label="答對"
              value={`${correct} / ${total}`}
              color={correct === total ? '#34d399' : correct >= total * 0.6 ? '#fcd34d' : '#f87171'}
              note={correct === total ? '完全正確' : '錯的那幾題正是實務上最常建錯的地方'}
            />
            <Metric label="身分欄位" value={ds.modelingFields.filter((f) => f.role === 'identity').length} note="能唯一指認物件的欄位" />
            <Metric label="物件型別" value={ds.objectTypes.length} note="這個世界被拆成幾種東西" />
          </div>

          <Lesson title="這一關的重點">
            注意標成 <strong>身分 Identity</strong> 的那幾個欄位 —— 尤其是主鍵類的。
            下一關你會發現：<strong>整個實體解析的難度，取決於你這一關有沒有找到一個好的身分欄位。</strong>
            找得到，後面就是查表；找不到，你就要開始猜，而猜就會錯。
          </Lesson>
        </>
      )}

      <NextButton onClick={onNext} disabled={!checked} hint={checked ? '' : '先對完答案'} label="下一關：實體解析" />
    </div>
  );
}
