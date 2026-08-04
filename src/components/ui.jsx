import React from 'react';
import { ArrowRight } from 'lucide-react';

export function StageHead({ n, title, subtitle, children, accent = 'var(--accent-blue)' }) {
  return (
    <div className="panel stage-head" style={{ borderLeftColor: accent }}>
      <div className="stage-kicker" style={{ color: accent }}>
        Stage {n} · {subtitle}
      </div>
      <h2 className="stage-title">{title}</h2>
      <div className="stage-lede">{children}</div>
    </div>
  );
}

export function Metric({ label, value, note, color }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: color || '#fff' }}>{value}</div>
      {note && <div className="metric-note">{note}</div>}
    </div>
  );
}

export function Lesson({ title, children }) {
  return (
    <div className="lesson">
      {title && <div style={{ fontWeight: 800, color: '#fff', marginBottom: 5 }}>{title}</div>}
      {children}
    </div>
  );
}

export function NextButton({ onClick, label = '進入下一關', disabled, hint }) {
  return (
    <div className="spread" style={{ marginTop: 4 }}>
      <span className="small dim">{hint}</span>
      <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
        {label} <ArrowRight size={15} />
      </button>
    </div>
  );
}

export function Gate({ children }) {
  return (
    <div
      className="panel"
      style={{
        borderColor: 'rgba(245,158,11,.35)',
        background: 'linear-gradient(135deg, rgba(245,158,11,.07), rgba(17,24,39,.75))',
      }}
    >
      {children}
    </div>
  );
}
