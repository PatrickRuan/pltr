import React from 'react';
import { Terminal, Clock, Cpu, CheckCircle2, ShieldCheck, Sparkles, Code2, Zap, Layers } from 'lucide-react';

export default function DevLogView() {
  const steps = [
    {
      step: 'Step 1: 需求分析與本體論情境設計',
      time: '22:30:35',
      desc: '深入研讀使用者提供之 Cerebras RAG vs. Palantir Ontology 比較論文文案。設計具體半導體供應鏈數位孿生（TSMC 18 廠, 日月光, H100 晶片, 海運貨櫃 SH-8821, 寶馬 BMW, 凱米颱風）實體物件情境。',
      tech: 'Domain Modeling / Palantir Foundry Architecture'
    },
    {
      step: 'Step 2: 自動化工程腳手架建立',
      time: '22:30:54',
      desc: '調用 Gemini CLI 工具精準執行 npx create-vite 初始化 React Vite 專案，自動安裝 lucide-react 與相關 UI 模組，建構兼具質感與高效能的專案結構。',
      tech: 'Gemini CLI + Vite + React'
    },
    {
      step: 'Step 3: 本體論資料引擎與 Writeback 模擬',
      time: '22:32:52',
      desc: '建立 ontologyData.js，包含 Objects, Properties, Links, Actions 與雙向 ERP / IoT Writeback JSON 規格，實現物件狀態變更自動連鎖影響全域屬性（如違約金歸零、溫控恢復）。',
      tech: 'State Management / Data Engine'
    },
    {
      step: 'Step 4: 多維度互動 UI 與網絡圖譜開發',
      time: '22:34:00',
      desc: '一次完成 5 大核心模組開發：數位孿生實體沙盒、SVG 物件鏈結圖譜、3 層式數據血統圖、Cerebras RAG 對比矩陣、Ontology 本體論白話知識庫。',
      tech: 'Vanilla CSS / SVG Custom Canvas / Glassmorphism UI'
    },
    {
      step: 'Step 5: 驗證編譯與 5273 通訊埠部署',
      time: '22:35:43',
      desc: '執行 npm run build 通過零錯誤生產編譯，並順利啟動背景開發伺服器於 http://localhost:5273/。',
      tech: 'Gemini CLI Task Runner / Port 5273'
    }
  ];

  return (
    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Dev Engine Banner */}
      <div className="glass-panel glass-panel-glow" style={{ padding: '24px', borderLeft: '4px solid #0070f3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue mono">DEVELOPMENT ENGINE</span>
              <span className="badge badge-purple mono">Powered by Gemini CLI</span>
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '6px' }}>
              📝 開發歷程與工具紀錄 (Development Log & Tooling)
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '850px' }}>
              本專案全程由 <strong style={{ color: '#60a5fa' }}>Gemini CLI (Google DeepMind Antigravity AI Engine)</strong> 自動化生成。包含需求解析、數位孿生建模、Vite React 專案創建、SVG 互動圖譜繪製與本機 Port 5273 伺服器啟動。
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '12px 18px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Cpu size={24} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>開發工具 (CLI Tools)</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>Gemini CLI / Antigravity Agent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#a78bfa" />
          全自動開發極速時間軸 (Development Process Timeline)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '800',
                fontSize: '0.9rem',
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)'
              }}>
                {idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#fff' }}>{item.step}</h4>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>[{item.time}]</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>
                  {item.desc}
                </p>

                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code2 size={13} color="#a78bfa" />
                  <span className="mono" style={{ fontSize: '0.74rem', color: '#a78bfa' }}>{item.tech}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Box */}
      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '0.95rem' }}>
          <CheckCircle2 size={18} />
          Gemini CLI 開發完成小結
        </div>
        <p style={{ fontSize: '0.84rem', color: '#d1d5db', marginTop: '6px', lineHeight: '1.5' }}>
          從理解 Palantir 本體論論文、架構規劃、自動建立 React 專案、編寫 CSS 視覺設計、SVG 圖譜繪製到零錯誤通過 Build 測試並啟動 Port 5273 伺服器，全過程由 <strong>Gemini CLI</strong> 流暢執行完畢！
        </p>
      </div>

    </div>
  );
}
