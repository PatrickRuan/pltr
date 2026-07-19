import React from 'react';
import { BookOpen, Layers, Cpu, Radio, ShieldCheck, Zap, GitBranch, Terminal } from 'lucide-react';

export default function KnowledgeBase() {
  const concepts = [
    {
      title: '1. 物件 (Object Types & Objects)',
      badge: '實體抽象化',
      color: '#3b82f6',
      icon: Cpu,
      content: 'Palantir Ontology 的基本單位。將資料庫裡的零散列（Rows）包裝成真實世界的實體。例如：一個「工廠」、「海運貨櫃」或「客戶訂單」。物件擁有強型別的屬性（Properties），並綁定至底層數據源。'
    },
    {
      title: '2. 屬性 (Properties)',
      badge: '動態與靜態狀態',
      color: '#10b981',
      icon: Radio,
      content: '描述物件的當前狀態。可以是從 SQL DB 讀取的靜態欄位（如訂單金額），也可以是透過 IoT 串流即時寫入的動態欄位（如貨櫃當前溫度、GPS 座標、氣候告警）。'
    },
    {
      title: '3. 鏈結 (Link Types & Links)',
      badge: '實體關聯圖譜',
      color: '#a78bfa',
      icon: GitBranch,
      content: '連接不同物件之間的邏輯關係。例如：[工廠] --(製造)--> [零組件] --(裝載於)--> [貨櫃] --(交付給)--> [客戶]。透過圖形網路（Graph），讓管理員能一眼看出一個零件延遲對全局營運的連鎖影響。'
    },
    {
      title: '4. 業務動作 (Action Types & Actions)',
      badge: '雙向寫回與閉環',
      color: '#f59e0b',
      icon: Zap,
      content: 'Palantir 區隔於傳統 BI 或 RAG 的關鍵！Action 定義了使用者在介面上能執行的合規業務操作。執行 Action 時，Ontology 會驗證業務邏輯，並直接將結果 API 回寫（Writeback）至源頭 ERP 或控制器。'
    },
    {
      title: '5. 數據血統 (Data Lineage)',
      badge: '分散式原生棲息',
      color: '#06b6d4',
      icon: Layers,
      content: '紀錄資料從源頭（SAP, Oracle, Kafka, Salesforce）到 Ontology 屬性的精準映射軌跡。資料無須物理搬遷大一統，即可進行全域即時檢索與審計。'
    },
    {
      title: '6. 數位孿生與模擬 (Digital Twin & Workshop)',
      badge: '營運作業系統',
      color: '#f43f5e',
      icon: Terminal,
      content: '管理者透過 Palantir Workshop 在高畫質的數位模型中進行 What-if 決策模擬（如海運轉包機空運），評估成本與時間後一鍵執行。'
    }
  ];

  return (
    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* KB Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <BookOpen size={24} color="#60a5fa" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
            Palantir Ontology (本體論) 核心術語與設計思維導覽
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '900px' }}>
          本單元幫助您快速理解 Palantir 在 Foundry 與 Gotham 產品中，如何運用「本體論 (Ontology)」建構企業全局營運作業系統 (Operating System for the Enterprise)。
        </p>
      </div>

      {/* Grid of Concept Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {concepts.map((item, idx) => {
          const IconC = item.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${item.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconC size={20} color={item.color} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{item.title}</h3>
                </div>
                <span className="badge mono" style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}40` }}>
                  {item.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                {item.content}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
