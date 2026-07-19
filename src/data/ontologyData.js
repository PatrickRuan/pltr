// Palantir Ontology Demo Data & Schema Definition

export const initialObjects = {
  factories: [
    {
      id: 'FAC-TSMC-18',
      type: 'Factory',
      name: '台積電 18 廠 (TSMC Fab 18)',
      location: '台南科學園區 (Tainan, TW)',
      status: 'OPERATIONAL',
      properties: {
        '產能利用率 (Capacity)': '96.2%',
        '良率 (Yield Rate)': '98.4%',
        '晶圓備料 (Wafer Stock)': '12,500 片 (偏低)',
        '生產生態網 (Eco Line)': '3nm N3E Advanced Node',
        'ERP 綁定 ID': 'SAP_PLANT_1801'
      },
      lineage: [
        { source: 'SAP ERP (T001W)', type: 'SQL Database', field: 'PLANT_STATUS', latency: '即時 Sync' },
        { source: 'Fab IoT OPC-UA', type: 'Industrial Stream', field: 'TEMP_PRESSURE', latency: '< 500ms' }
      ]
    },
    {
      id: 'FAC-ASE-01',
      type: 'Factory',
      name: '日月光 封測 1 廠 (ASE Pack 01)',
      location: '高雄楠梓 (Kaohsiung, TW)',
      status: 'OPERATIONAL',
      properties: {
        'CoWoS 封測產能': '91.8%',
        '急件備用庫存': '2,000 Units (H100 Mod)',
        'ERP 綁定 ID': 'SAP_ASE_KAO_01'
      },
      lineage: [
        { source: 'Oracle SCM', type: 'SQL Database', field: 'STOCK_LEVEL', latency: '5 分鐘' }
      ]
    }
  ],

  shipments: [
    {
      id: 'SH-8821',
      type: 'Shipment',
      name: '海運貨櫃集裝 SH-8821',
      carrier: '長榮海運 (Evergreen Line)',
      route: '高雄港 -> 漢堡港/慕尼黑',
      status: 'CRITICAL_RISK',
      properties: {
        '運輸工具 (Mode)': '海運貨輪 (Ocean Freight)',
        '預計延遲 (Delay)': '+36 小時 (颱風影響)',
        '溫控狀態 (Temp)': '28.5°C ⚠️ (過熱警報)',
        '裝載數量 (Qty)': '2,000 組 H100 AI 板卡',
        '貨物價值 (Cargo Value)': '$60,000,000 USD',
        'GPS 座標': '21.8° N, 120.5° E'
      },
      lineage: [
        { source: 'MarineTraffic API', type: 'REST Endpoint', field: 'GPS_LAT_LON', latency: '1 分鐘' },
        { source: 'CargoSmart IoT Hub', type: 'MQTT Stream', field: 'CONTAINER_TEMP', latency: '10 秒' }
      ]
    },
    {
      id: 'SH-9043',
      type: 'Shipment',
      name: '空運快遞班機 CX-882',
      carrier: '國泰航空貨運',
      route: '桃園機場 -> 奧斯汀 (Austin)',
      status: 'NORMAL',
      properties: {
        '運輸工具 (Mode)': '航空貨運 (Air Freight)',
        '預計延遲 (Delay)': '0 小時 (正常)',
        '溫控狀態 (Temp)': '16.2°C (正常)',
        '裝載數量 (Qty)': '2,000 組 H100 AI 板卡',
        'GPS 座標': '31.2° N, 140.8° W'
      },
      lineage: [
        { source: 'FlightAware API', type: 'REST API', field: 'FLIGHT_POS', latency: '30 秒' }
      ]
    }
  ],

  components: [
    {
      id: 'COMP-H100-BOARD',
      type: 'Component',
      name: 'NVIDIA H100 GPU AI 主板',
      status: 'IN_TRANSIT',
      properties: {
        '規格 (Spec)': 'H100 SXM5 80GB',
        '安全存溫 (Max Safe Temp)': '25.0°C',
        '受影響單位': '4,000 Units TOTAL'
      },
      lineage: [
        { source: 'PLM Teamcenter', type: 'Product Database', field: 'BOM_SPEC', latency: '靜態' }
      ]
    }
  ],

  customers: [
    {
      id: 'CUST-AUTO-AI',
      type: 'Customer',
      name: '寶馬自動駕駛研發中心 (BMW Autonomous AI)',
      location: '慕尼黑, 德國 (Munich, DE)',
      status: 'HIGH_IMPACT_RISK',
      properties: {
        '訂單編號': 'PO-99201-BMW',
        '需求數量': '2,000 Units H100',
        '交付截止日 (Deadline)': '48 小時內',
        '違約金風險 (Contract Risk)': '$2,500,000 USD',
        '研發線狀態': '⚠️ 面臨停工倒數'
      },
      lineage: [
        { source: 'Salesforce CRM', type: 'Cloud CRM', field: 'CONTRACT_TERMS', latency: '即時 Sync' },
        { source: 'SAP Financials', type: 'ERP AR', field: 'PENALTY_CLAUSE', latency: '每日 Sync' }
      ]
    },
    {
      id: 'CUST-CLOUD-DEEP',
      type: 'Customer',
      name: '微軟雲端資料中心 (Azure AI Hub)',
      location: '德州奧斯汀 (Austin, TX)',
      status: 'NORMAL',
      properties: {
        '訂單編號 PO': 'PO-88102-MSFT',
        '需求數量': '2,000 Units H100',
        '交付截止日': '72 小時內',
        '違約金風險': '$0 USD'
      },
      lineage: [
        { source: 'Salesforce CRM', type: 'Cloud CRM', field: 'CUSTOMER_PO', latency: '即時' }
      ]
    }
  ],

  riskEvents: [
    {
      id: 'RISK-TYPHOON-GAEMI',
      type: 'RiskEvent',
      name: '強烈颱風「凱米」(Typhoon Gaemi)',
      status: 'ACTIVE_DISRUPTION',
      properties: {
        '風暴等級': 'Category 4 Ultra Typhoons',
        '中心風速': '195 km/h',
        '受影響航道': '台灣海峽與西太平洋航線',
        '警報狀態': '海上陸上颱風警報中'
      },
      lineage: [
        { source: 'NOAA Weather API', type: 'External Geo Data', field: 'TYPHOON_VECTOR', latency: '15 分鐘' }
      ]
    }
  ]
};

export const initialLinks = [
  { source: 'FAC-TSMC-18', target: 'COMP-H100-BOARD', relation: 'MANUFACTURER_OF', label: '製造晶片' },
  { source: 'FAC-ASE-01', target: 'COMP-H100-BOARD', relation: 'PACKAGED_BY', label: '先進封測' },
  { source: 'COMP-H100-BOARD', target: 'SH-8821', relation: 'LOADED_INTO', label: '裝載於 (2,000組)' },
  { source: 'COMP-H100-BOARD', target: 'SH-9043', relation: 'LOADED_INTO', label: '裝載於 (2,000組)' },
  { source: 'SH-8821', target: 'CUST-AUTO-AI', relation: 'DESTINED_FOR', label: '預計交付' },
  { source: 'SH-9043', target: 'CUST-CLOUD-DEEP', relation: 'DESTINED_FOR', label: '預計交付' },
  { source: 'RISK-TYPHOON-GAEMI', target: 'SH-8821', relation: 'IMPACTS', label: '造成海運延誤' }
];

export const ontologyActions = [
  {
    id: 'ACTION-AIR-UPGRADE',
    name: '✈️ 升級為專機航空急件 (Reroute via Charter Air Cargo)',
    description: '將海運貨櫃 SH-8821 之 2,000 組晶片緊急卸貨，轉由包機 CX-909 直接空運至慕尼黑專用機場。',
    impactSummary: '將延遲時間從 +36hr 縮短至 +2hr，並解決貨櫃過熱問題，免除 BMW $2.5M 違約金！',
    targetObjects: ['SH-8821', 'CUST-AUTO-AI'],
    systemWritebacks: [
      { targetSystem: 'SAP ERP (VBRK)', field: 'Freight_Carrier', oldValue: 'EVERGREEN_OCEAN', newValue: 'CATHAY_AIR_CHARTER' },
      { targetSystem: 'CargoSmart IoT Hub', field: 'Cooling_Mode', oldValue: 'PASSIVE_CONTAINER', newValue: 'ACTIVE_CRYO_CONTAINER' },
      { targetSystem: 'Salesforce CRM', field: 'Delivery_Status', oldValue: 'AT_RISK', newValue: 'ON_TRACK_AIR' }
    ]
  },
  {
    id: 'ACTION-COOLER-REBOOT',
    name: '🌡️ 遠端啟動貨櫃主動致冷單元 (Remote IoT Cooling Boost)',
    description: '透過 Palantir Action 發送 MQTT 遙控指令至貨櫃內部致冷晶片，強制調降艙內溫度。',
    impactSummary: '立即降低貨櫃溫度至 17.5°C，防止晶片硬體受熱損壞，但無法解開海運颱風延遲。',
    targetObjects: ['SH-8821', 'COMP-H100-BOARD'],
    systemWritebacks: [
      { targetSystem: 'CargoSmart IoT Hub', field: 'Target_Temp', oldValue: '28.5°C', newValue: '17.5°C' }
    ]
  },
  {
    id: 'ACTION-SAFETY-STOCK-DISPATCH',
    name: '🛡️ 撥發高雄廠緊急備用庫存 (Dispatch Emergency Reserve Stock)',
    description: '直接動用日月光高雄 1 廠預留之 2,000 組 H100 備用庫存，利用聯邦快遞空運直飛 BMW。',
    impactSummary: '滿足 BMW 48 小時交付要求，海運貨櫃則轉為補充各地備份庫存。',
    targetObjects: ['FAC-ASE-01', 'CUST-AUTO-AI'],
    systemWritebacks: [
      { targetSystem: 'Oracle SCM', field: 'Reserved_Stock', oldValue: '2000', newValue: '0' },
      { targetSystem: 'SAP ERP (SD)', field: 'Sales_Order_Source', oldValue: 'PO-99201-BMW', newValue: 'RESERVE_STOCK_DISPATCH' }
    ]
  }
];

// Cerebras RAG vs Palantir Ontology Side-by-side Playground scenarios
export const comparisonScenarios = [
  {
    id: 'scen-1',
    query: '「強烈颱風凱米導致海運貨櫃 SH-8821 延誤與過熱，我們該怎麼處理？」',
    cerebrasRag: {
      type: 'Semantic Vector Retrieval (語意向量搜尋)',
      output: `[檢索到相關文件 3 筆]:
1. SOP-Logistics-2024.pdf (相似度 0.92): "海運遇颱風延誤時，需填寫 SOP 表單 #802 通報航運公司，並在 24 小時內回報客戶理賠專員。"
2. Slack_Logistics_Chat.txt (相似度 0.88): "上次 SH-702 過熱，我們請船務人員巡視冷氣發電機..."
3. Contract_BMW_2025.pdf (相似度 0.85): "若逾期超過 48 小時，需支付 $2,500,000 USD 罰款。"

💡 AI 總機回答: "根據 SOP 與過去對話，建議您填寫 #802 表單通報船務，並準備違約金理賠通知。"`,
      limitations: [
        '❌ 無法直接獲知「BMW 訂單與 SH-8821 在系統中的強綁定狀態」',
        '❌ 只能輸出「文字報告與建議」，無法在介面上點選並直接調動物流系統',
        '❌ 無法自動進行模擬 (What-if Scenario) 評估改派空運的成本效益',
        '❌ 無法將變更寫回（Writeback）至企業 SAP 或 IoT 設備'
      ]
    },
  palantirOntology: {
      type: 'Digital Twin Object Action (數位孿生物件動作)',
      output: `[解析本體論圖譜實體]:
- 物件 1: Shipment { ID: "SH-8821", Temp: 28.5°C ⚠️, Delay: +36h }
- 鏈結 1: Shipment -> Customer { Name: "BMW Autonomous AI", PenaltyRisk: "$2,500,000" }
- 鏈結 2: RiskEvent { "颱風凱米" } -> Impacts -> Shipment

⚡ 推薦可執行業務動作 (Action Types):
1. [Action: 升級為專機航空急件] -> 可免除 $2.5M 罰款，預估轉運成本 +$120,000 USD
2. [Action: 遠端啟動致冷單元] -> 降溫至 17.5°C，防止晶片壞死

👉 點擊按鈕直接寫回（Writeback）至 SAP ERP 與 CargoSmart 物流系統！`,
      advantages: [
        '✅ 結構化強 Schema (Object - Property - Link) 清晰掌握影響範圍',
        '✅ 不只是搜尋知識，更能「操作業務 (Action-Oriented)」',
        '✅ 雙向數據管道（Bi-directional Pipelines），點擊即可寫回源頭系統',
        '✅ 即時數據血統 (Lineage) 追蹤，資料原生棲息地免搬遷大一統'
      ]
    }
  }
];
