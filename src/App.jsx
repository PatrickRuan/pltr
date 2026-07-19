import React, { useState } from 'react';
import Header from './components/Header';
import DigitalTwinSandbox from './components/DigitalTwinSandbox';
import ObjectGraphExplorer from './components/ObjectGraphExplorer';
import DataLineageView from './components/DataLineageView';
import CerebrasComparison from './components/CerebrasComparison';
import KnowledgeBase from './components/KnowledgeBase';
import DevLogView from './components/DevLogView';
import { initialObjects, initialLinks } from './data/ontologyData';

export default function App() {
  const [activeTab, setActiveTab] = useState('sandbox');
  const [objects, setObjects] = useState(initialObjects);
  const [links, setLinks] = useState(initialLinks);
  const [activeActionLog, setActiveActionLog] = useState([]);

  // Check if shipment SH-8821 still has risk alert
  const sh8821 = objects.shipments.find(s => s.id === 'SH-8821');
  const hasAlert = sh8821 ? sh8821.status.includes('RISK') || sh8821.status.includes('CRITICAL') : true;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header & Main Navbar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasAlert={hasAlert}
      />

      {/* Dynamic Content Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'sandbox' && (
          <DigitalTwinSandbox 
            objects={objects} 
            links={links} 
            setObjects={setObjects} 
            setLinks={setLinks}
            activeActionLog={activeActionLog}
            setActiveActionLog={setActiveActionLog}
          />
        )}

        {activeTab === 'graph' && (
          <ObjectGraphExplorer 
            objects={objects} 
            links={links} 
          />
        )}

        {activeTab === 'lineage' && (
          <DataLineageView />
        )}

        {activeTab === 'comparison' && (
          <CerebrasComparison 
            onTriggerOntologyAction={() => setActiveTab('sandbox')}
          />
        )}

        {activeTab === 'kb' && (
          <KnowledgeBase />
        )}

        {activeTab === 'devlog' && (
          <DevLogView />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '20px',
        background: 'rgba(9, 13, 22, 0.9)'
      }}>
        Palantir Ontology (本體論資料模型) 互動體驗系統 &copy; 2026 | Built for Concrete Hands-On Understanding
      </footer>

    </div>
  );
}
