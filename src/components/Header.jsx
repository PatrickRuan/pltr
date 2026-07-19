import React from 'react';
import { Network, Cpu, Database, GitCompare, BookOpen, Activity, AlertCircle, Terminal } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, hasAlert }) {
  const tabs = [
    { id: 'sandbox', label: '🌐 數位孿生沙盒 (Digital Twin)', icon: Activity },
    { id: 'graph', label: '🔗 物件圖譜 (Object Graph)', icon: Network },
    { id: 'lineage', label: '🧬 數據血統 (Data Lineage)', icon: Database },
    { id: 'comparison', label: '⚖️ Cerebras vs Palantir 對比', icon: GitCompare },
    { id: 'kb', label: '📚 本體論觀念解析 (Ontology Guide)', icon: BookOpen },
    { id: 'devlog', label: '📝 開發歷程 (Dev Log)', icon: Terminal }
  ];

  return (
    <header className="glass-panel style-header" style={{ margin: '16px 20px', padding: '16px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0070f3 0%, #3b82f6 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Palantir <span className="gradient-text">Ontology</span> 實體互動沙盒
              </h1>
              <span className="badge badge-blue mono">Foundry Architecture 2.0</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              從「異質數據整合」到「物件化數位孿生 (Digital Twin)」與「雙向業務動作 (Actions)」
            </p>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasAlert ? (
            <div className="badge badge-rose pulse-danger" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              <AlertCircle size={15} style={{ marginRight: '6px' }} />
              供應鏈警報: 海運貨櫃風暴延遲與過熱中
            </div>
          ) : (
            <div className="badge badge-emerald pulse-success" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              <Activity size={15} style={{ marginRight: '6px' }} />
              Ontology 狀態: 已升級航空急件 / 營運最佳化中
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <nav style={{ display: 'flex', gap: '8px', marginTop: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'rgba(30, 41, 59, 0.4)',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border-color)',
                color: isActive ? '#60a5fa' : 'var(--text-muted)',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#60a5fa' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
