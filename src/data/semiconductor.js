// 資料集 A：跨國半導體供應鏈
//
// 這是 Palantir 簡報上會出現的那種場景 —— 但這裡把簡報跳過的部分補回來了：
// 資料是髒的、實體要自己解析、資源是有限的、寫回會失敗。
//
// 所有公司名稱、代號、金額、事件均為教學杜撰。

export const semiconductor = {
  id: 'semiconductor',
  label: '跨國半導體供應鏈',
  short: '半導體',
  tagline: '晶圓代工 → 封測 → 海空運 → 歐美客戶',
  accent: '#3b82f6',
  currency: 'US$',
  fiction: '本資料集所有公司名稱、代號、金額與事件均為教學杜撰，與任何真實企業無關。',
  intro:
    '一批 4,000 顆 AI 加速器模組，從台灣的晶圓廠出發，經封測後分海運與空運送往德國與美國。' +
    '一個颱風打亂了海運，而船上的溫控也出了問題。' +
    '這是 Palantir 最常拿來展示的場景 —— 大型企業、多國系統、高額合約。' +
    '請注意它跟資料集 B 的差別：這裡的每個來源都是有 API、有主鍵、有 IT 部門維護的系統。',
  contrastNote:
    '這裡的異質資料源是 SAP、Salesforce、IoT Hub、船舶追蹤 API —— 全部有文件、有欄位定義、有人維護。' +
    '難度不在「資料在哪裡」，在「同一個東西在四個系統裡有四個名字」。',

  sources: [
    {
      id: 'SRC-SAP',
      label: 'SAP ERP — 客戶主檔 (KNA1)',
      system: 'SAP S/4HANA，總部 IT 維護',
      format: 'table',
      note: '欄位定義完整、有主鍵、有人維護。但主鍵是 SAP 自己的，出了 SAP 沒人認得。',
      columns: ['KUNNR', 'NAME1', 'LAND1', 'STCEG (歐盟稅籍)', 'ZTERM'],
      rows: [
        ['0001042', 'Bayerische Motoren Werke AG', 'DE', 'DE129273398', 'NT60'],
        ['0001043', 'BMW Financial Services NA LLC', 'US', '', 'NT30'],
        ['0002210', 'Microsoft Corporation', 'US', '', 'NT45'],
        ['0002877', 'Bavaria Motorenwerke Handels GmbH', 'DE', 'DE811907980', 'NT30'],
      ],
      defects: [
        'KUNNR 0001042 與 0001043 名字都有 BMW，但一個是德國母公司、一個是美國金融子公司 —— 不同法人、不同合約、不同罰則',
        '0002877「Bavaria Motorenwerke Handels」是一家獨立的經銷商，跟 BMW 集團沒有股權關係。名字是歷史巧合',
        'STCEG（歐盟稅籍號碼）只有德國實體有，美國的沒有 —— 主鍵不是每一列都有',
      ],
    },
    {
      id: 'SRC-SFDC',
      label: 'Salesforce CRM — Account',
      system: '業務部門維護，欄位由各區自行新增',
      format: 'table',
      note: '業務照自己方便命名，因為對他們來說「知道是誰」就夠了。',
      columns: ['AccountId', 'Name', 'BillingCountry', 'DUNS', 'Owner'],
      rows: [
        ['0013X0000A1', 'BMW Autonomous Driving R&D', 'Germany', '315789012', 'K. Müller'],
        ['0013X0000B7', 'MSFT Azure AI Infrastructure', 'United States', '084400000', 'J. Chen'],
        ['0013X0000C2', 'Bavaria Motorenwerke (dealer)', 'Germany', '', 'K. Müller'],
      ],
      defects: [
        '「BMW Autonomous Driving R&D」是一個部門，不是法人。它在 SAP 裡對應到 0001042',
        'DUNS 碼有兩列有、一列沒有 —— 又一個「主鍵只覆蓋部分資料」的例子',
        '同一個業務同時管真 BMW 和那家撞名的經銷商，他自己分得清，系統分不清',
      ],
    },
    {
      id: 'SRC-IOT',
      label: 'CargoSmart IoT Hub — 貨櫃遙測串流',
      system: 'MQTT，10 秒一筆',
      format: 'table',
      note: '資料乾淨、頻率高、完全沒有商業語意。它只知道貨櫃編號，不知道裡面是誰的貨。',
      columns: ['container_id', 'ts (UTC)', 'temp_c', 'humidity', 'gps'],
      rows: [
        ['TCLU-7748213', '2026-08-03T14:20:10Z', '28.5', '71%', '21.8N 120.5E'],
        ['TCLU-7748213', '2026-08-03T14:20:20Z', '28.7', '72%', '21.8N 120.5E'],
        ['TCLU-7748213', '2026-08-03T14:20:30Z', '29.1', '72%', '21.8N 120.5E'],
      ],
      defects: [
        '時間是 UTC，SAP 是當地時區，Salesforce 是使用者時區。三份資料的「同一時刻」不一樣',
        '只有貨櫃號。要知道這批貨是誰的，得經過裝箱單 → 出貨單 → 訂單 → 客戶，四次跳躍',
        '規格上限是 25°C。已經連續超標，但沒有人被通知 —— 因為警報設在物流系統，罰則寫在合約系統',
      ],
    },
    {
      id: 'SRC-NEWS',
      label: '外部新聞與天氣饋送',
      system: '第三方 API，純文字',
      format: 'chat',
      note: '完全非結構化。裡面有最早的預警訊號，但沒有任何欄位可以 JOIN。',
      lines: [
        { d: '2026-08-02', t: '18:40', who: '中央氣象署', msg: '強烈颱風「凱米」轉北，台灣海峽及巴士海峽航道未來 48 小時風浪劇烈' },
        { d: '2026-08-03', t: '07:15', who: '航運快訊', msg: '高雄港今晨起停止裝卸作業，多艘歐洲線貨輪延後離港' },
        { d: '2026-08-03', t: '11:02', who: '產業媒體', msg: '寶馬慕尼黑自駕研發中心傳因 AI 加速器到料延遲，第三季驗證進度恐受影響' },
      ],
      defects: [
        '「寶馬」是中文譯名。要連到 SAP 的「Bayerische Motoren Werke AG」，字串比對完全無能為力',
        '這則新聞比公司內部的任何系統都早知道出事了 —— 但它進不了任何報表',
        '沒有時間戳以外的結構。要用它，得先做實體抽取，而抽取本身就會出錯',
      ],
    },
  ],

  objectTypes: [
    { id: 'Customer', label: '客戶 Customer', color: '#3b82f6' },
    { id: 'Shipment', label: '運輸 Shipment', color: '#06b6d4' },
    { id: 'Component', label: '零組件 Component', color: '#8b5cf6' },
    { id: 'RiskEvent', label: '風險事件 RiskEvent', color: '#f43f5e' },
    { id: 'Contract', label: '合約 Contract', color: '#10b981' },
  ],
  modelingFields: [
    { id: 'g1', field: 'STCEG / DUNS', from: 'SAP／Salesforce', answer: 'Customer', role: 'identity',
      why: '跨國場景的權威主鍵。相當於台灣的統編 —— 但覆蓋率不完整，這是關鍵差別。' },
    { id: 'g2', field: 'container_id TCLU-7748213', from: 'IoT Hub', answer: 'Shipment', role: 'identity',
      why: '貨櫃是運輸物件的身分。IoT 資料唯一能掛上的錨點就是它。' },
    { id: 'g3', field: 'temp_c 28.5', from: 'IoT Hub', answer: 'Shipment', role: 'property',
      why: '動態屬性，10 秒更新一次。要跟合約上的 25°C 上限比對才有意義。' },
    { id: 'g4', field: '「逾期 48 小時罰 US$2.5M」', from: '合約 PDF 第 14 條', answer: 'Contract', role: 'property',
      why: '罰則是合約的屬性，不是客戶的。同一個客戶不同合約罰則不同。' },
    { id: 'g5', field: '颱風「凱米」', from: '氣象 API', answer: 'RiskEvent', role: 'identity',
      why: '外部事件要成為一級物件，才能問「它影響了哪些出貨」。' },
    { id: 'g6', field: '規格上限 25°C', from: '零件規格書', answer: 'Component', role: 'property',
      why: '這是零件的物理特性。它跟 IoT 的即時溫度分屬兩個物件，中間需要一條連結。' },
    { id: 'g7', field: '「寶馬慕尼黑研發中心」', from: '產業媒體', answer: 'Customer', role: 'link',
      why: '非結構化文字裡的實體提及。要接上 SAP 的德文法人名，靠字串比對做不到。' },
    { id: 'g8', field: 'ETA 2026-08-07 06:00', from: '船公司 API', answer: 'Shipment', role: 'property',
      why: '時區陷阱：這是 UTC，合約寫的交期是慕尼黑當地時間。差兩小時就是差一筆罰款。' },
  ],

  resolution: {
    question: 'SAP、Salesforce、新聞這三份資料裡，「BMW」到底是幾個客戶？',
    naiveCount: 7,
    trueCount: 4,
    records: [
      { id: 'S1', name: 'Bayerische Motoren Werke AG', sourceLabel: 'SAP 0001042', externalKey: 'DE129273398', hint: '德國，NT60' },
      { id: 'S2', name: 'BMW Financial Services NA LLC', sourceLabel: 'SAP 0001043', externalKey: null, hint: '美國，金融子公司' },
      { id: 'S3', name: 'Bavaria Motorenwerke Handels GmbH', sourceLabel: 'SAP 0002877', externalKey: 'DE811907980', hint: '德國，獨立經銷商' },
      { id: 'S4', name: 'BMW Autonomous Driving R&D', sourceLabel: 'Salesforce 0013X0000A1', externalKey: 'DE129273398', hint: 'DUNS 315789012' },
      { id: 'S5', name: 'Bavaria Motorenwerke (dealer)', sourceLabel: 'Salesforce 0013X0000C2', externalKey: null, hint: '同一業務負責' },
      { id: 'S6', name: '寶馬慕尼黑自駕研發中心', sourceLabel: '產業媒體', externalKey: null, hint: '中文譯名' },
      { id: 'S7', name: 'MSFT Azure AI Infrastructure', sourceLabel: 'Salesforce 0013X0000B7', externalKey: null, hint: 'DUNS 084400000' },
      { id: 'S8', name: 'Microsoft Corporation', sourceLabel: 'SAP 0002210', externalKey: null, hint: '美國，NT45' },
    ],
    pairs: [
      {
        id: 'Q1', left: 'S1', right: 'S4', sameEntity: true,
        humanHint: 'SAP 的德國法人，和 Salesforce 上那個自駕研發部門，是同一個付錢的實體。',
        lesson: '兩邊都有歐盟稅籍號 DE129273398。有主鍵時，這題不需要猜。',
        modelVerdict: { match: true, confidence: 0.93, rationale: '「BMW Autonomous Driving R&D」為 Bayerische Motoren Werke AG 之研發部門，且雙方稅籍號一致。' },
      },
      {
        id: 'Q2', left: 'S1', right: 'S2', sameEntity: false,
        humanHint: '德國母公司 vs 美國金融子公司。同集團，但不同法人、不同合約、不同罰則。',
        lesson: '「同集團」不等於「同實體」。這個區別在算違約金的時候會變成幾百萬美金的差別。',
        modelVerdict: { match: false, confidence: 0.82, rationale: '兩者同屬 BMW 集團但為不同法人（德國 AG 與美國 LLC），業務性質亦不同，不應合併為同一客戶實體。' },
      },
      {
        id: 'Q3', left: 'S1', right: 'S3', sameEntity: false,
        humanHint: 'Bavaria Motorenwerke 是一家獨立經銷商，跟 BMW 集團沒有股權關係。名字是歷史巧合。',
        lesson: '本組最大的陷阱。Bavaria Motorenwerke 就是 Bayerische Motoren Werke 的意思，語意上完全等價 —— 模型會非常想合併它。只有稅籍號說了實話。',
        modelVerdict: { match: true, confidence: 0.79, rationale: '「Bavaria Motorenwerke」為「Bayerische Motoren Werke」之英譯，語意等同，研判為同一集團實體之不同登記名稱。' },
        modelIsWrong: true,
      },
      {
        id: 'Q4', left: 'S6', right: 'S1', sameEntity: true,
        humanHint: '中文「寶馬」就是 BMW。新聞裡最早的預警訊號要靠這一條才接得進系統。',
        lesson: '跨語言別名。字串比對相似度為零，這是模型真正不可取代的地方 —— 跟資料集 B 的「捷鋒 ↔ 巨鋒」是同一類問題。',
        modelVerdict: { match: true, confidence: 0.91, rationale: '「寶馬」為 BMW 之中文譯名，「慕尼黑自駕研發中心」對應其德國總部研發單位。' },
      },
      {
        id: 'Q5', left: 'S3', right: 'S5', sameEntity: true,
        humanHint: 'SAP 和 Salesforce 各自建了那家經銷商的檔。',
        lesson: '單純的跨系統重複建檔，模糊比對就能解。',
        modelVerdict: { match: true, confidence: 0.94, rationale: '同一經銷商在兩套系統的紀錄。' },
      },
      {
        id: 'Q6', left: 'S7', right: 'S8', sameEntity: true,
        humanHint: 'Azure 是 Microsoft 的產品線。',
        lesson: '產品／品牌名對法人名，又一次。這種模式在真實資料裡佔的比例遠超乎想像。',
        modelVerdict: { match: true, confidence: 0.89, rationale: 'Azure 為 Microsoft Corporation 之雲端事業部，非獨立法人。' },
      },
      {
        id: 'Q7', left: 'S2', right: 'S3', sameEntity: false,
        humanHint: '美國金融子公司 vs 德國經銷商，毫無關係。',
        lesson: '容易的負例，用來檢查你的門檻有沒有鬆過頭。',
        modelVerdict: { match: false, confidence: 0.96, rationale: '不同國家、不同業務、無關聯。' },
      },
    ],
  },

  graph: {
    nodes: [
      { id: 'CUST-BMW', label: 'Bayerische Motoren Werke AG', type: 'Customer', x: 780, y: 90, sub: 'DE129273398', merged: ['SAP 0001042', 'SFDC R&D', '新聞「寶馬」'] },
      { id: 'CUST-MSFT', label: 'Microsoft Corporation', type: 'Customer', x: 780, y: 300, sub: 'SAP 0002210', merged: ['SAP 0002210', 'SFDC Azure'] },
      { id: 'CONTRACT-BMW', label: '合約 #14 條', type: 'Contract', x: 600, y: 160, sub: '逾期 48hr 罰 $2.5M' },
      { id: 'SHIP-8821', label: '海運 TCLU-7748213', type: 'Shipment', x: 540, y: 90, sub: '28.5°C ⚠ 延遲 +36hr' },
      { id: 'SHIP-9043', label: '空運 CX-882', type: 'Shipment', x: 540, y: 300, sub: '16.2°C 正常' },
      { id: 'COMP-ACC', label: 'AI 加速器模組', type: 'Component', x: 300, y: 200, sub: '規格上限 25°C' },
      { id: 'RISK-TY', label: '颱風 凱米', type: 'RiskEvent', x: 300, y: 40, sub: 'Cat.4 · 航道封閉' },
      { id: 'RES-ASE', label: '封測廠備用庫存', type: 'Component', x: 300, y: 380, sub: '2,000 顆' },
    ],
    links: [
      { source: 'COMP-ACC', target: 'SHIP-8821', label: '裝載 2,000' },
      { source: 'COMP-ACC', target: 'SHIP-9043', label: '裝載 2,000' },
      { source: 'SHIP-8821', target: 'CUST-BMW', label: '交付' },
      { source: 'SHIP-9043', target: 'CUST-MSFT', label: '交付' },
      { source: 'CONTRACT-BMW', target: 'CUST-BMW', label: '適用' },
      { source: 'RISK-TY', target: 'SHIP-8821', label: '影響', danger: true },
      { source: 'COMP-ACC', target: 'CONTRACT-BMW', label: '溫度超規 → 違約', danger: true },
      { source: 'RES-ASE', target: 'CUST-BMW', label: '可調度' },
    ],
    insight:
      '這張圖的價值在那條紅線：颱風 → 貨櫃 → 客戶 → 合約條款。' +
      '在解析之前，颱風那則新聞和合約第 14 條之間隔著四個系統和一個中文譯名，沒有人會把它們放在一起看。' +
      '解析之後，「這個颱風會讓我們賠多少錢」變成一個可以沿著線走完的問題 —— 這才是本體論在賣的東西。',
  },

  scenario: {
    title: '颱風延誤 + 貨櫃過熱，48 小時內要交 2,000 顆給 BMW',
    setup:
      '海運貨櫃延遲 36 小時，而且溫度已超規 —— 經評估其中 600 顆可能已受熱損。' +
      '合約第 14 條：逾期或短交 48 小時，罰 US$2,500,000。你有四個選項，可以複選。',
    allocationNote:
      '配置順序：BMW → 封測廠內部維修備品 → Azure。這個順序是你（或某個沒人記得的舊政策）決定的。',
    penaltyNote:
      '這裡的罰款是白紙黑字寫在合約裡的，跟資料集 B 那種「客戶下次不找你」的估算成本性質完全不同。' +
      '大企業的痛可以精算，中小企業的痛只能估 —— 這是兩邊最本質的差異。',
    resources: {
      'RES-8821': { label: '海運在途（扣除熱損）', unit: '顆', available: 1400 },
      'RES-RESERVE': { label: '封測廠備用庫存', unit: '顆', available: 2000 },
      'RES-9043': { label: '空運在途', unit: '顆', available: 2000 },
    },
    demands: [
      { id: 'D-BMW', label: 'BMW 自駕研發中心', customer: 'Bayerische Motoren Werke AG', qty: 2000, resourceId: 'RES-8821', etaHrs: 84, deadlineHrs: 48, penalty: 2500000, note: '合約第 14 條，逾期或短交皆罰' },
      { id: 'D-ASE', label: '封測廠內部維修備品', customer: '（內部）', qty: 800, resourceId: 'RES-RESERVE', etaHrs: 12, deadlineHrs: 240, penalty: 250000, note: '動用備用庫存就會排擠到它' },
      { id: 'D-AZURE', label: 'Azure AI 基礎設施', customer: 'Microsoft Corporation', qty: 2000, resourceId: 'RES-9043', etaHrs: 30, deadlineHrs: 72, penalty: 800000, note: '目前一切正常 —— 除非你動它的貨' },
    ],
    options: [
      { id: 'A-CHARTER', label: '包機轉運：海運卸貨改空運', desc: '貨櫃在高雄卸下，改包機直飛慕尼黑。', cash: -120000,
        effects: [{ kind: 'eta', demandId: 'D-BMW', deltaHrs: -70 }], risk: '包機艙位需 6 小時內確認' },
      { id: 'A-COOL', label: '遠端啟動貨櫃主動致冷', desc: '下 MQTT 指令降溫，搶救可能受熱損的 600 顆。', cash: -5000,
        effects: [{ kind: 'consume', resourceId: 'RES-8821', qty: -600 }], risk: '致冷單元三年沒保養，成功率非 100%' },
      { id: 'A-RESERVE', label: '動用封測廠備用庫存供 BMW', desc: '2,000 顆備品直接空運，不等海運。', cash: -40000,
        effects: [
          { kind: 'source', demandId: 'D-BMW', resourceId: 'RES-RESERVE' },
          { kind: 'eta', demandId: 'D-BMW', deltaHrs: -50 },
        ], risk: '備用庫存見底，內部維修備品會缺' },
      { id: 'A-DIVERT', label: '把 Azure 的空運貨轉給 BMW', desc: '最快、最便宜的一招。', cash: -10000,
        effects: [
          { kind: 'source', demandId: 'D-BMW', resourceId: 'RES-9043' },
          { kind: 'eta', demandId: 'D-BMW', deltaHrs: -60 },
        ], risk: '這一招會發生什麼事？算完再說。' },
    ],
    revealNote:
      '「把 Azure 的貨轉給 BMW」看起來最快最便宜，直覺上很誘人 —— ' +
      '但你可以在數字上親眼看到它把成本推給了另一個客戶。' +
      '這就是為什麼「不建圖就決策」很危險：代價是真的存在的，只是不在你看的那張報表上。',
  },

  writebackIntro:
    '大企業有 API、有權限系統、有稽核要求。這讓寫回在技術上可行，但也讓它變得嚴格：' +
    '每一次寫回都是有法律意義的動作，錯了要有人負責，所以每一步都要能查。',
  roleNote:
    '這裡的權限是分層的：唯讀、排程、主管，每一層能碰的系統範圍不同。' +
    '這種細緻分工是大企業才養得起的東西，也是稽核與法遵的前提。對照資料集 B 看，差別很明顯。',
  defaultRole: 'planner',
  roles: {
    viewer: { id: 'viewer', label: '唯讀分析員', grants: [] },
    planner: { id: 'planner', label: '生產排程員', grants: ['logistics', 'iot'] },
    supervisor: { id: 'supervisor', label: '營運主管', grants: ['logistics', 'iot', 'finance', 'erp'] },
  },
  actions: [
    {
      id: 'ACT-CHARTER',
      name: '執行包機轉運',
      desc: '改運輸方式、改冷鏈模式、更新客戶承諾交期。三個系統，三種權限。',
      writebacks: [
        { system: 'SAP ERP (VBRK)', field: 'Freight_Carrier', oldValue: 'EVERGREEN_OCEAN', newValue: 'CHARTER_AIR', scope: 'erp', latencyMs: 800 },
        { system: 'CargoSmart IoT', field: 'Cooling_Mode', oldValue: 'PASSIVE', newValue: 'ACTIVE_CRYO', scope: 'iot', latencyMs: 300 },
        { system: 'Salesforce', field: 'Delivery_Status', oldValue: 'AT_RISK', newValue: 'ON_TRACK_AIR', scope: 'logistics', latencyMs: 500 },
      ],
      teaches: '用「生產排程員」身分執行看看 —— 第一步就會被權限擋下。權限不是裝飾。',
    },
    {
      id: 'ACT-RESERVE',
      name: '動用備用庫存並沖銷內部備品',
      desc: '這個動作會動到財務科目，需要更高的權限。',
      writebacks: [
        { system: 'Oracle SCM', field: 'Reserved_Stock', oldValue: '2000', newValue: '0', scope: 'erp', latencyMs: 700 },
        { system: 'SAP FI', field: 'Cost_Center_Transfer', oldValue: 'CC-MFG-01', newValue: 'CC-SALES-EU', scope: 'finance', latencyMs: 900 },
        { system: 'Salesforce', field: 'Fulfillment_Source', oldValue: 'SHIPMENT', newValue: 'RESERVE', scope: 'logistics', latencyMs: 400 },
      ],
      teaches: '會計科目轉列是 finance 範圍。只有營運主管過得了這一關。',
      conflictDemo: { 'Oracle SCM::Reserved_Stock': '1200' },
    },
    {
      id: 'ACT-COOL',
      name: '遠端啟動貨櫃致冷',
      desc: '對一台在海上、三年沒保養的設備下指令。',
      writebacks: [
        { system: 'CargoSmart IoT', field: 'Target_Temp', oldValue: '28.5', newValue: '17.5', scope: 'iot', latencyMs: 400 },
        { system: 'CargoSmart IoT', field: 'Compressor_Enable', oldValue: 'false', newValue: 'true', scope: 'iot', latencyMs: 1200, fault: 'timeout' },
        { system: 'SAP QM', field: 'Quality_Hold', oldValue: 'NONE', newValue: 'THERMAL_REVIEW', scope: 'erp', latencyMs: 600 },
      ],
      teaches:
        '第二步逾時 —— 而逾時最可怕的地方是你不知道指令到底有沒有送達。' +
        '壓縮機可能已經啟動了，也可能沒有。這種狀態下的「回滾」本身就是一個危險動作。',
    },
  ],

  debrief: [
    { k: '有主鍵的世界', v: '這裡的實體解析比中小企業容易，因為有稅籍號和 DUNS。但覆蓋率不完整 —— 美國實體沒有 STCEG，經銷商沒有 DUNS。主鍵的價值取決於覆蓋率，不是有沒有。' },
    { k: '最貴的錯誤', v: 'Bavaria Motorenwerke 那一組。語意上完全等價，模型會自信地合併 —— 它在這份資料集裡準確率最高，唯一的錯就是這個。合併之後違約金會算到錯的法人頭上，而且報表看起來完全正常。這種錯誤不會有人發現，直到出事。' },
    { k: '圖的價值', v: '颱風 → 貨櫃 → 客戶 → 合約條款這條路徑，跨了四個系統和一次翻譯。它不是「更好的儀表板」，它是一個原本問不出來的問題。' },
    { k: '對照資料集 B', v: '同一條流水線、同樣六關。差別在於：這裡的難處是「對齊」，那裡的難處是「資料根本不存在」。而後者才是台灣多數企業的起點。' },
  ],
};
