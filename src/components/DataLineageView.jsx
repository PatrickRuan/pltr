import React from 'react';
import { Database, Server, Cpu, ArrowRight, ShieldCheck, RefreshCw, FileSpreadsheet, Radio, Workflow } from 'lucide-react';

export default function DataLineageView() {
  const sourceSystems = [
    { name: 'SAP ERP Systems', desc: '包含工廠產線 T001W、銷貨單 SD、財務 AR', icon: Database, color: '#3b82f6', type: 'SQL / Relational' },
    { name: 'Oracle SCM & PLM', desc: 'BOM 零組件清單與倉儲備份庫存', icon: Server, color: '#a78bfa', type: 'Enterprise ERP' },
    { name: 'Salesforce Cloud CRM', desc: '客戶 PO 訂單、交付合約條款與違約金', icon: FileSpreadsheet, color: '#06b6d4', type: 'SaaS Cloud' },
    { name: 'CargoSmart IoT Hub', desc: '貨櫃 MQTT 溫濕度感測器與 GPS 定位', icon: Radio, color: '#10b981', type: 'Real-time Streaming' }
  ];

  return (
    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <Workflow size={24} color="#0070f3" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Palantir 核心架構：分散式來源，數據血統 (Data Lineage) 與不搬遷整合
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '900px', lineHeight: '1.6' }}>
          Palantir 與 Cerebras 在核心精神上都強調 <strong style={{ color: '#fff' }}>「尊重資料的原生棲息地 (Federated Data Access)」</strong>，反對傳統將企業所有零散數據強制拷貝倒進集中式 Data Lake 的做法。Palantir 透過 Data Connection 管道對齊底層零散 Schema，並保有完美的雙向血統追蹤與寫回。
        </p>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>
          三層式本體論數據架構圖 (3-Tiered Ontology Integration Architecture)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
          
          {/* Tier 1: Legacy Source Systems */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Server size={18} color="#60a5fa" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#60a5fa' }}>第一層：異質源頭數據系統</h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              數據各自棲息在 ERP, CRM, IoT Hub，保持資料自主獨立性。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sourceSystems.map((sys, idx) => {
                const IconC = sys.icon;
                return (
                  <div key={idx} style={{
                    padding: '10px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${sys.color}`,
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconC size={14} color={sys.color} />
                      {sys.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sys.desc}</div>
                    <span className="mono" style={{ fontSize: '0.7rem', color: sys.color, marginTop: '4px', display: 'inline-block' }}>[{sys.type}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 2: Foundry Data Connection & Ontology Pipeline */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <RefreshCw size={18} color="#38bdf8" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#38bdf8' }}>第二層：Ontology 數據管道對齊</h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              不複製搬遷物理資料，僅將表格對齊至預定義好的強 Schema。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <span className="mono" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>DATA CONNECTION CONNECTORS</span>
                <p style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '4px' }}>
                  建立聯邦查詢 (Federated Access) 與即時數據串流 (Streaming Pipeline)
                </p>
              </div>

              <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <span className="mono" style={{ fontSize: '0.75rem', color: '#c084fc' }}>OBJECT TYPES & LINKS SCHEMA</span>
                <p style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '4px' }}>
                  將異質 Raw Table 轉譯映射為真實世界 <strong style={{ color: '#a78bfa' }}>Objects (物件)</strong> 與 <strong style={{ color: '#a78bfa' }}>Links (關係)</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Tier 3: Operational Applications & Writeback */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} color="#34d399" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34d399' }}>第三層：業務決策應用與源頭寫回</h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              管理者在 Workshop/Foundry 執行操作，點擊直接寫回源頭。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399' }}>Palantir Workshop & Actions</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  前台無程式碼視覺化介面，讓調度員直接進行物流改派、模擬預測。
                </p>
              </div>

              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f87171' }}>雙向 API 寫回 (Writeback)</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  確保 Ontology 上更新的實體狀態即時寫回源頭 SAP / IoT 控制器。
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
