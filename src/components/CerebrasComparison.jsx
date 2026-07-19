import React, { useState } from 'react';
import { GitCompare, Sparkles, Check, X, ArrowRight, Zap, Play, Search, Network, FileText, Cpu, AlertCircle } from 'lucide-react';
import { comparisonScenarios } from '../data/ontologyData';

export default function CerebrasComparison({ onTriggerOntologyAction }) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const scen = comparisonScenarios[activeScenarioIdx];

  return (
    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <GitCompare size={24} color="#a78bfa" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Cerebras 企業級 RAG vs. Palantir Ontology 核心差異與互動對比
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '960px' }}>
          兩者都主張 <strong style={{ color: '#fff' }}>「不搬遷原始資料」</strong>，但 <strong style={{ color: '#a78bfa' }}>Cerebras</strong> 聚焦於非結構化文本的「語意向量對齊（Embedding/RAG）」；而 <strong style={{ color: '#60a5fa' }}>Palantir Ontology</strong> 則是構建強 Schema 的「數位孿生實體模型 (Digital Twin Object)」，旨在推進至業務操作與自動寫回。
        </p>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Cerebras Approach Card */}
        <div className="glass-panel" style={{ padding: '20px', borderTop: '4px solid #a78bfa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="#a78bfa" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                Cerebras 模式 (Vector RAG)
              </h3>
            </div>
            <span className="badge badge-purple mono">語意檢索導向</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#c084fc' }}>核心技術手段</span>
            <p style={{ fontSize: '0.85rem', color: '#f3f4f6', marginTop: '2px', fontWeight: '600' }}>
              Embedding 向量 + 混合搜尋 (Hybrid Search)
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              處理 Slack, Wiki, 代碼庫等非結構化文本。將資料一律化為高維數字向量進行關聯。
            </p>
          </div>

          {/* Simulated Query Box */}
          <div style={{ marginTop: '16px', background: '#070b14', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>模擬情境查詢 response:</span>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#d1d5db',
              marginTop: '6px',
              lineHeight: '1.5'
            }}>
              {scen.cerebrasRag.output}
            </pre>
          </div>

          {/* Key Limitations */}
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              外延限制 (Key Constraints)
            </span>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scen.cerebrasRag.limitations.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Palantir Ontology Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '20px', borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                Palantir Ontology 模式
              </h3>
            </div>
            <span className="badge badge-blue mono">決策與業務動作導向</span>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span className="mono" style={{ fontSize: '0.75rem', color: '#60a5fa' }}>核心技術手段</span>
            <p style={{ fontSize: '0.85rem', color: '#f3f4f6', marginTop: '2px', fontWeight: '600' }}>
              強 Schema 數位孿生 (Objects + Links + Actions)
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              將企業全域異質資料抽象化為真實實體物件、屬性與圖形鏈結。
            </p>
          </div>

          {/* Simulated Query Box */}
          <div style={{ marginTop: '16px', background: '#070b14', padding: '14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'block' }}>本體論圖譜狀態 response:</span>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#f3f4f6',
              marginTop: '6px',
              lineHeight: '1.5'
            }}>
              {scen.palantirOntology.output}
            </pre>

            <div style={{ marginTop: '12px' }}>
              <button 
                onClick={onTriggerOntologyAction}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Zap size={15} />
                進入數位孿生沙盒並點擊執行 Action &rarr;
              </button>
            </div>
          </div>

          {/* Key Advantages */}
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              核心突破 (Key Strengths)
            </span>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scen.palantirOntology.advantages.map((item, idx) => (
                <li key={idx} style={{ fontSize: '0.78rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Summary Table Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
          維度比較一覽表 (Dimensions Comparison Table)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#e2e8f0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(30, 41, 59, 0.5)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>對比維度</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#c084fc' }}>Cerebras (向量 RAG)</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#60a5fa' }}>Palantir Ontology (本體論)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700' }}>資料抽象化層次</td>
                <td style={{ padding: '12px 14px' }}>非結構化語意對齊 (Unstructured Embeddings)</td>
                <td style={{ padding: '12px 14px' }}>結構化數位孿生 (Digital Twin Objects)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700' }}>核心驅動技術</td>
                <td style={{ padding: '12px 14px' }}>LLM + Vector Search + Hybrid BM25</td>
                <td style={{ padding: '12px 14px' }}>Object-Link Graph Network + Action APIs</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 14px', fontWeight: '700' }}>終端產出目標</td>
                <td style={{ padding: '12px 14px' }}>文字答案與知識出處 (Knowledge QA)</td>
                <td style={{ padding: '12px 14px' }}>業務操作與即時狀態寫回 (Actionable Decision)</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 14px', fontWeight: '700' }}>系統比喻</td>
                <td style={{ padding: '12px 14px' }}>超級全能的 AI 圖書館員與資訊密探</td>
                <td style={{ padding: '12px 14px' }}>即時同步的 3D 城市數位沙盒模型</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
