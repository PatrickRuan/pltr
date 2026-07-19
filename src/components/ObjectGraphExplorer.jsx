import React, { useState } from 'react';
import { Network, Filter, Info, Link2, Layers, Cpu, Building2, Truck, UserCheck, AlertTriangle } from 'lucide-react';

export default function ObjectGraphExplorer({ objects, links }) {
  const [filterType, setFilterType] = useState('ALL');
  const [activeNodeId, setActiveNodeId] = useState('SH-8821');

  // Node positions on SVG canvas (x, y)
  const nodePositions = {
    'FAC-TSMC-18': { x: 120, y: 140, color: '#3b82f6', icon: Building2, type: 'Factory' },
    'FAC-ASE-01': { x: 120, y: 340, color: '#3b82f6', icon: Building2, type: 'Factory' },
    'COMP-H100-BOARD': { x: 340, y: 240, color: '#a78bfa', icon: Cpu, type: 'Component' },
    'SH-8821': { x: 580, y: 140, color: '#f87171', icon: Truck, type: 'Shipment' },
    'SH-9043': { x: 580, y: 340, color: '#34d399', icon: Truck, type: 'Shipment' },
    'CUST-AUTO-AI': { x: 820, y: 140, color: '#fbbf24', icon: UserCheck, type: 'Customer' },
    'CUST-CLOUD-DEEP': { x: 820, y: 340, color: '#60a5fa', icon: UserCheck, type: 'Customer' },
    'RISK-TYPHOON-GAEMI': { x: 440, y: 50, color: '#f43f5e', icon: AlertTriangle, type: 'RiskEvent' }
  };

  // Flatten all objects
  const allObjects = [
    ...objects.factories,
    ...objects.shipments,
    ...objects.components,
    ...objects.customers,
    ...objects.riskEvents
  ];

  const activeObject = allObjects.find(o => o.id === activeNodeId) || allObjects[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', padding: '0 20px 20px 20px' }}>
      
      {/* LEFT CANVAS: Interactive SVG Network Graph */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header & Filter Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={20} color="#3b82f6" />
              Palantir Ontology 物件關係網狀圖譜 (Object Link Network)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Palantir 反對硬將資料搬遷集中；而是透過強 Schema 的「Object-Link Graph」構建全域數位孿生。
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Filter size={15} color="var(--text-muted)" />
            {['ALL', 'Factory', 'Shipment', 'Customer'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  background: filterType === type ? '#2563eb' : 'rgba(30, 41, 59, 0.6)',
                  color: filterType === type ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {type === 'ALL' ? '全部物件' : type}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Network Graph Display Area */}
        <div style={{
          background: 'radial-gradient(circle at 50% 50%, #0d1527 0%, #050811 100%)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          flex: 1,
          minHeight: '440px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="440" viewBox="0 0 940 440" style={{ width: '100%', height: '100%' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" opacity="0.7" />
              </marker>
              <marker id="arrow-danger" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" opacity="0.9" />
              </marker>
            </defs>

            {/* Links Lines */}
            {links.map((link, idx) => {
              const start = nodePositions[link.source];
              const end = nodePositions[link.target];
              if (!start || !end) return null;

              const isHighlighted = link.source === activeNodeId || link.target === activeNodeId;
              const isDangerLink = link.source === 'RISK-TYPHOON-GAEMI' || (link.source === 'SH-8821' && link.target === 'CUST-AUTO-AI');

              return (
                <g key={idx}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isDangerLink ? '#f87171' : isHighlighted ? '#60a5fa' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={isDangerLink ? '5,5' : 'none'}
                    className={isDangerLink ? 'link-line' : ''}
                    markerEnd={isDangerLink ? 'url(#arrow-danger)' : 'url(#arrow)'}
                  />
                  {/* Link Label */}
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 8}
                    fill={isHighlighted ? '#93c5fd' : '#6b7280'}
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* Node Circles */}
            {Object.entries(nodePositions).map(([id, pos]) => {
              const obj = allObjects.find(o => o.id === id);
              if (!obj) return null;
              if (filterType !== 'ALL' && pos.type !== filterType) return null;

              const isSelected = id === activeNodeId;
              const IconComp = pos.icon;

              return (
                <g
                  key={id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setActiveNodeId(id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={isSelected ? 26 : 22}
                    fill={pos.color}
                    fillOpacity={isSelected ? '0.3' : '0.15'}
                    stroke={pos.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="node-circle"
                  />
                  <foreignObject x="-12" y="-12" width="24" height="24" style={{ pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <IconComp size={16} color={pos.color} />
                    </div>
                  </foreignObject>

                  {/* Node Label */}
                  <text
                    y="36"
                    fill={isSelected ? '#ffffff' : '#9ca3af'}
                    fontSize="12"
                    fontWeight={isSelected ? '700' : '500'}
                    fontFamily="var(--font-sans)"
                    textAnchor="middle"
                  >
                    {obj.name.split(' (')[0]}
                  </text>
                  <text
                    y="49"
                    fill="#6b7280"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

      </div>

      {/* RIGHT SIDEBAR: Selected Object Link Details */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Layers size={18} color="#a78bfa" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
            物件與關係屬性解析
          </h3>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span className="mono" style={{ fontSize: '0.75rem', color: '#60a5fa' }}>SELECTED OBJECT TYPE</span>
          <h4 style={{ fontSize: '1.1rem', color: '#fff', marginTop: '2px' }}>{activeObject.name}</h4>
          <span className="badge badge-purple mono" style={{ marginTop: '6px' }}>Type: {activeObject.type}</span>
          
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              圖譜鏈結關係 (Outgoing & Incoming Links)
            </span>
            {links.filter(l => l.source === activeNodeId || l.target === activeNodeId).map((l, idx) => (
              <div key={idx} className="mono" style={{
                fontSize: '0.75rem',
                padding: '8px',
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '6px',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Link2 size={13} color="#a78bfa" />
                <span>{l.source}</span>
                <span style={{ color: '#38bdf8' }}>&rarr; [{l.relation}] &rarr;</span>
                <span>{l.target}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              核心屬性 (Static & Dynamic Properties)
            </span>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(activeObject.properties).map(([k, v]) => (
                <div key={k} style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
