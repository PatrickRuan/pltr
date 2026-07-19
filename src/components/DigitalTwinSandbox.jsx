import React, { useState } from 'react';
import { 
  Building2, Truck, Cpu, UserCheck, AlertTriangle, Play, RefreshCw, 
  ArrowRight, ShieldCheck, Server, CheckCircle2, Zap, Radio, CornerDownRight, FileCode2
} from 'lucide-react';
import { ontologyActions } from '../data/ontologyData';

export default function DigitalTwinSandbox({ objects, links, setObjects, setLinks, activeActionLog, setActiveActionLog }) {
  const [selectedObjectId, setSelectedObjectId] = useState('SH-8821');
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(ontologyActions[0].id);

  // Flatten all objects for easy lookup
  const allObjects = [
    ...objects.factories,
    ...objects.shipments,
    ...objects.components,
    ...objects.customers,
    ...objects.riskEvents
  ];

  const selectedObject = allObjects.find(o => o.id === selectedObjectId) || allObjects[0];

  // Handle Action Execution
  const handleExecuteAction = (action) => {
    setIsExecutingAction(true);

    setTimeout(() => {
      // Create new objects state based on action triggered
      const newObjects = { ...objects };

      if (action.id === 'ACTION-AIR-UPGRADE') {
        // Update Shipment SH-8821
        newObjects.shipments = newObjects.shipments.map(s => {
          if (s.id === 'SH-8821') {
            return {
              ...s,
              name: '專機包機空運 CX-909 (原 SH-8821 轉運)',
              status: 'NORMAL',
              properties: {
                ...s.properties,
                '運輸工具 (Mode)': '✈️ 航空包機 (Charter Air Cargo)',
                '預計延遲 (Delay)': '+2 小時 (按時交付)',
                '溫控狀態 (Temp)': '18.0°C ✅ (溫控艙內)',
                '航線狀態': '高雄 -> 台北 -> 慕尼黑直飛 (Air Route)'
              }
            };
          }
          return s;
        });

        // Update Customer BMW Penalty Risk
        newObjects.customers = newObjects.customers.map(c => {
          if (c.id === 'CUST-AUTO-AI') {
            return {
              ...c,
              status: 'RESOLVED',
              properties: {
                ...c.properties,
                '違約金風險 (Contract Risk)': '$0 USD (已解鎖急件包機)',
                '交付預估': '在 28 小時內抵達廠區 (預期內)',
                '研發線狀態': '✅ 恢復正常運轉準備'
              }
            };
          }
          return c;
        });
      } else if (action.id === 'ACTION-COOLER-REBOOT') {
        newObjects.shipments = newObjects.shipments.map(s => {
          if (s.id === 'SH-8821') {
            return {
              ...s,
              properties: {
                ...s.properties,
                '溫控狀態 (Temp)': '17.5°C ✅ (IoT致冷已恢復)'
              }
            };
          }
          return s;
        });
      } else if (action.id === 'ACTION-SAFETY-STOCK-DISPATCH') {
        newObjects.customers = newObjects.customers.map(c => {
          if (c.id === 'CUST-AUTO-AI') {
            return {
              ...c,
              status: 'RESOLVED',
              properties: {
                ...c.properties,
                '違約金風險 (Contract Risk)': '$0 USD (調用備用庫存成功)',
                '交付預估': '由高雄廠備用庫存先飛慕尼黑'
              }
            };
          }
          return c;
        });
      }

      setObjects(newObjects);
      setIsExecutingAction(false);

      // Append Writeback log entry
      const logEntry = {
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        actionName: action.name,
        targetObjects: action.targetObjects,
        writebacks: action.systemWritebacks
      };
      setActiveActionLog(prev => [logEntry, ...prev]);
    }, 1000);
  };

  // Icon selector helper
  const getObjectIcon = (type, status) => {
    if (type === 'Factory') return <Building2 size={18} color="#60a5fa" />;
    if (type === 'Shipment') return <Truck size={18} color={status.includes('RISK') || status.includes('CRITICAL') ? '#f87171' : '#34d399'} />;
    if (type === 'Component') return <Cpu size={18} color="#c084fc" />;
    if (type === 'Customer') return <UserCheck size={18} color={status.includes('RISK') ? '#fbbf24' : '#60a5fa'} />;
    return <AlertTriangle size={18} color="#f43f5e" />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 420px)', gap: '20px', padding: '0 20px 20px 20px' }}>
      
      {/* LEFT COLUMN: Topology Canvas & Object List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Scenario Alert Header */}
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-rose">即時運營事件警報</span>
                <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SCENARIO #AI-CHIP-DELIVERY</span>
              </div>
              <h2 style={{ fontSize: '1.15rem', marginTop: '6px', color: '#fff' }}>
                颱風凱米衝擊：海運貨櫃 SH-8821 延遲 +36hr & 溫控告警
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                滿載 2,000 組 NVIDIA H100 晶片板卡的海運貨櫃遇氣候延遲，直指寶馬 (BMW) 慕尼黑研發中心。若未在 48 小時內抵達，將產生 $2.5M 違約金並中斷研發。
              </p>
            </div>
            <button 
              onClick={() => {
                // Reset state
                window.location.reload();
              }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              <RefreshCw size={13} />
              重置數位孿生
            </button>
          </div>
        </div>

        {/* Dynamic Topology Node Cards Grid */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#60a5fa" />
            數位孿生即時實體清單 (Digital Twin Entities)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            以下為本體論（Ontology）實時對齊之真實物件實體，包含即時動態屬性與原生系統映射。點擊物件即可審視內部屬性與調用 Actions。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {allObjects.map((obj) => {
              const isSelected = obj.id === selectedObjectId;
              const isDanger = obj.status.includes('RISK') || obj.status.includes('CRITICAL');
              const isResolved = obj.status === 'RESOLVED';

              return (
                <div
                  key={obj.id}
                  onClick={() => setSelectedObjectId(obj.id)}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)' 
                      : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected 
                      ? '1px solid #3b82f6' 
                      : isDanger 
                      ? '1px solid rgba(244, 63, 94, 0.4)' 
                      : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getObjectIcon(obj.type, obj.status)}
                      <div>
                        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>{obj.id}</span>
                        <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#f3f4f6' }}>{obj.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>類型: {obj.type}</span>
                    {isDanger && <span className="badge badge-rose pulse-danger">⚠️ 風險中</span>}
                    {isResolved && <span className="badge badge-emerald"><CheckCircle2 size={12}/> 已解除風險</span>}
                    {!isDanger && !isResolved && <span className="badge badge-blue">正常運行</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Writeback Log & Dual-way Sync Console */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode2 size={18} color="#10b981" />
            源頭系統雙向寫回日誌 (Bi-Directional ERP Writeback Console)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            當在 Palantir Ontology 執行業務動作（Actions）時，系統會立即發送 Webhook / API 自動修改底層原始系統（SAP ERP, Oracle, IoT Hub），實現數位對齊實體。
          </p>

          <div style={{
            background: '#050811',
            borderRadius: '8px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '140px',
            maxHeight: '220px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem'
          }}>
            {activeActionLog.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                &gt; 尚未執行任何 Action。請在右側動作控制面板點擊「執行業務動作」體驗數據雙向寫回...
              </div>
            ) : (
              activeActionLog.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <div style={{ color: '#60a5fa', fontWeight: '600' }}>
                    [{log.timestamp}] EXECUTE: {log.actionName}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '2px' }}>
                    Target Object Entities: {log.targetObjects.join(', ')}
                  </div>
                  {log.writebacks.map((wb, wIdx) => (
                    <div key={wIdx} style={{ color: '#34d399', marginLeft: '12px', marginTop: '2px' }}>
                      ↳ WRITEBACK API &rarr; {wb.targetSystem} [{wb.field}]: <span style={{ color: '#f87171', textDecoration: 'line-through' }}>{wb.oldValue}</span> &rarr; <span style={{ color: '#a78bfa', fontWeight: '700' }}>{wb.newValue}</span> (HTTP 200 OK)
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Selected Object Inspector & Action Trigger Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Object Inspector Card */}
        <div className="glass-panel glass-panel-glow" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-purple mono">OBJECT INSPECTOR</span>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {selectedObject.id}</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getObjectIcon(selectedObject.type, selectedObject.status)}
            {selectedObject.name}
          </h3>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              實體屬性 (Properties)
            </span>

            {Object.entries(selectedObject.properties).map(([key, val]) => (
              <div key={key} style={{
                display: 'flex',
                justify: 'space-between',
                padding: '8px 10px',
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '6px',
                fontSize: '0.83rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{key}</span>
                <span style={{ fontWeight: '600', color: val.includes('⚠️') || val.includes('偏低') ? '#f87171' : val.includes('✅') ? '#34d399' : '#f3f4f6' }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Lineage Trace Section */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} />
              原生棲息地數據血統 (Data Lineage)
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              此物件屬性來自獨立源頭系統，未搬遷原始數據庫：
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {selectedObject.lineage.map((lin, idx) => (
                <div key={idx} className="mono" style={{
                  fontSize: '0.75rem',
                  padding: '6px 8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justify: 'space-between'
                }}>
                  <span style={{ color: '#60a5fa' }}>{lin.source} ({lin.type})</span>
                  <span style={{ color: 'var(--text-muted)' }}>{lin.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Palantir Action Trigger Console */}
        <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Zap size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
              本體論業務動作 (Ontology Actions)
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Palantir Ontology 核心靈魂：將決策與模擬化為「可操作動作」，直接變更數位孿生狀態並寫回源頭系統。
          </p>

          {/* Action Choice Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ontologyActions.map((act) => {
              const isSelected = selectedActionId === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActionId(act.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                    border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: isSelected ? '#34d399' : '#f3f4f6' }}>
                    {act.name}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {act.description}
                  </p>
                  {isSelected && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(139, 92, 246, 0.1)', padding: '6px 8px', borderRadius: '4px' }}>
                      💡 影響: {act.impactSummary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Execute Button */}
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => {
                const act = ontologyActions.find(a => a.id === selectedActionId);
                if (act) handleExecuteAction(act);
              }}
              disabled={isExecutingAction}
              className="btn-action"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              {isExecutingAction ? (
                <>
                  <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  同步寫回 SAP ERP & 物流中...
                </>
              ) : (
                <>
                  <Play size={16} />
                  點擊執行 Action (觸發數位孿生 state 與系統寫回)
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
