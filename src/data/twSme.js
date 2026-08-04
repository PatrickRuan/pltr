// 資料集 B：台灣中小企業
//
// 這份資料是刻意做髒的，而且是照著台灣中小企業真實的髒法做髒的：
// 十五年前的進銷存、老闆自己維護的 Excel、只存在 LINE 裡的改單、
// 手寫單掃描 OCR、以及唯一一份乾淨的資料 —— 財政部電子發票。
//
// 所有公司名稱、統編、金額、對話均為教學杜撰。

export const twSme = {
  id: 'tw-sme',
  label: '台灣中小企業',
  short: '協鴻精密',
  tagline: '台中大甲 CNC 加工廠 · 30 人 · 自行車零件',
  accent: '#f59e0b',
  currency: 'NT$',
  fiction: '本資料集所有公司名稱、統一編號、金額與對話均為教學杜撰，與任何真實企業無關。',
  intro:
    '協鴻精密工業是一家在台中大甲的 CNC 金屬加工廠，30 人，主要做自行車零件。' +
    '老闆想知道「這個月到底賺不賺錢、哪個客戶最會拖」，但沒有人答得出來 —— ' +
    '因為答案散在五個地方，而且每個地方對同一件事的說法都不一樣。' +
    '這是台灣絕大多數中小企業的真實起點，也是 Palantir 那套方法真正要面對的東西。',
  contrastNote:
    '注意這裡沒有 SAP、沒有 Oracle、沒有 Salesforce。中小企業的異質資料源不是三套昂貴的企業軟體，' +
    '是一套老進銷存、一份 Excel、一個 LINE 群組、一疊手寫單，和老師傅的記憶。',

  // ─────────────────────────────────────────────
  // Stage 1：原始混亂
  // ─────────────────────────────────────────────
  sources: [
    {
      id: 'SRC-INV',
      label: '盤古進銷存 v3.2 — 客戶主檔',
      system: '本機 Windows Server，2009 年導入',
      format: 'table',
      note: 'Big5 編碼匯出，欄位名稱是十五年前工程師取的。原廠已倒閉，沒有 API，只能匯 CSV。',
      columns: ['CUST_ID', 'CUST_NM', 'TEL', 'ADDR', 'PAY_TERM', 'MEMO'],
      rows: [
        ['C001', '巨鋒機械(股)', '04-26871234', '台中市大甲區工業路12號 聯絡人王經理0912-334455', '月結60', ''],
        ['C007', '捷鋒', '', '台中大甲', '月結60', '業務陳說跟C001同一家?待查'],
        ['C012', '巨鋒機械興業有限公司', '02-27123456', '台北市內湖區瑞光路88號', '月結30', '新客戶'],
        ['C003', '美崙工業', '04-25661111', '彰化縣大村鄉中山路3段', '月結45', ''],
        ['C019', '台灣車料工業(股)公司', '04-23029876', '台中市西屯區', '現金', '只下過一次單'],
      ],
      defects: [
        'ADDR 欄位裡塞了聯絡人和手機 —— 一個欄位存了三種東西',
        'C007「捷鋒」沒有電話，MEMO 直接寫「跟C001同一家?待查」—— 這個問號放了三年',
        '沒有統一編號欄位。2009 年設計這個系統的人沒想到會需要',
        'C012 和 C001 名字極像，但業務說是完全不同的兩家公司',
      ],
    },
    {
      id: 'SRC-XLS',
      label: '報價單彙整_老闆版.xlsx（工作表「新」）',
      system: '老闆的筆電桌面，另有「新(2)」「新_最新」「新_這個才對」三個版本',
      format: 'table',
      note: '老闆自己維護。他知道哪一格是什麼意思，但只有他知道。',
      columns: ['日期', '客戶', '品名', '數量', '單價', '金額', '備註'],
      rows: [
        ['113/03/15', '巨鋒', '鋁合金座管 6061-T6', '500', '285', '142,500', ''],
        ['', '', '碳纖維把手 CF-220', '200', '1,150', '241,500', '含稅'],
        ['2024/3/20', '美崙', '鋁合金座管 6061-T6', '300', '290', '87,000', '未稅'],
        ['113/3/22', '巨鋒興業', '鋁合金座管 6061', '100', '310', '32,550', '含稅 新客戶先收訂'],
        ['113/4/2', '巨鋒', '鋁合金座管 6061-T6', '500', '285', '', '王經理說改500 見LINE'],
      ],
      defects: [
        '日期兩種曆法混用：113/03/15 是民國，2024/3/20 是西元',
        '第 2 列的日期和客戶是空的 —— 那是合併儲存格，要沿用上一列',
        '金額有的含稅有的未稅，備註欄沒寫的那幾筆你猜',
        '品名「6061-T6」和「6061」是同一個東西還是不同規格？只有廠長知道',
        '最後一列金額空白，備註寫「見LINE」—— 資料的權威來源跑到聊天軟體去了',
      ],
    },
    {
      id: 'SRC-LINE',
      label: 'LINE 群組「協鴻-業務群」匯出.txt',
      system: 'LINE，成員 6 人，訊息保留 30 天',
      format: 'chat',
      note: '公司真正的決策現場。這裡的每一句話都可能是一張沒開的工單。',
      lines: [
        { d: '2024/03/18', t: '09:12', who: '陳志明(業務)', msg: '巨鋒王經理剛打來 上次那批座管改成500支 原本300' },
        { d: '', t: '09:13', who: '林大山(廠長)', msg: '哪批? 3月的還是2月的' },
        { d: '', t: '09:15', who: '陳志明(業務)', msg: '3月那批啦 就報價單上面那個' },
        { d: '', t: '09:16', who: '林大山(廠長)', msg: '好 我叫阿宏改工單' },
        { d: '', t: '09:41', who: '陳志明(業務)', msg: '對了他說6061-T6就好 不用T651' },
        { d: '2024/03/21', t: '14:05', who: '陳志明(業務)', msg: '美崙那邊問下週能不能先出一半' },
        { d: '', t: '14:22', who: '林大山(廠長)', msg: '一半是150? 我這邊排程是整批300' },
        { d: '', t: '14:23', who: '陳志明(業務)', msg: '對 150 剩下的月底' },
        { d: '2024/03/22', t: '08:30', who: '阿宏(出貨)', msg: '巨鋒的貨我先出了 送貨單20240322-03' },
      ],
      defects: [
        '「上次那批」「3月那批」—— 指涉要靠上下文推，沒有任何單號',
        '規格變更（T651 改 T6）發生在聊天室，沒有進任何系統。三個月後出問題時查不到',
        '「先出一半」到底是 150 還是別的，兩個人講完就算數了',
        '訊息 30 天後消失。這家公司的決策紀錄有保存期限',
      ],
    },
    {
      id: 'SRC-OCR',
      label: '送貨單掃描_20240322.pdf → OCR 文字',
      system: '事務機掃描後存在共用資料夾，檔名是日期',
      format: 'ocr',
      note: '手寫單，客戶簽收後掃描存檔。這是唯一能證明「貨真的送到了」的東西。',
      text: [
        '協鴻精密工業有限公司          送貨單',
        'No. 2O24O322-O3',
        '客戶: 巨鋒機械股份有限公可',
        '品名: 鋁合金座管6061-T6',
        '數量: 5OO 支',
        '交貨日: 113年3月22日',
        '簽收: ▨▨▨（手寫簽名，OCR 無法辨識）',
      ],
      defects: [
        '單號「2O24O322-O3」裡的 O 是字母還是數字 0？OCR 分不出來，人也常打錯',
        '「股份有限公可」—— 司被辨識成可。字串比對從這裡就死了',
        '數量「5OO 支」同樣的問題。這張單到底是 500 還是 5OO？',
        '簽收欄無法辨識。如果客戶事後說沒收到，這張單能當證據嗎？',
      ],
    },
    {
      id: 'SRC-TAX',
      label: '財政部電子發票整合服務平台 匯出.csv',
      system: '政府平台，可下載近 6 個月',
      format: 'table',
      golden: true,
      note: '這是整間公司唯一一份乾淨、有權威主鍵、且第三方背書的資料。整份教材的答案藏在這裡。',
      columns: ['買方統一編號', '買方名稱', '發票號碼', '開立日期', '銷售額', '稅額', '總計'],
      rows: [
        ['27889301', '巨鋒機械工業股份有限公司', 'AB12345678', '2024-03-25', '142,500', '7,125', '149,625'],
        ['54120876', '巨鋒機械興業有限公司', 'AB12345690', '2024-03-11', '31,000', '1,550', '32,550'],
        ['16880234', '美崙工業股份有限公司', 'AB12345702', '2024-03-28', '87,000', '4,350', '91,350'],
      ],
      defects: [
        '（這份沒有缺陷，這就是重點）',
        '注意第 2 列：銷售額 31,000、總計 32,550。而 Excel 那筆「巨鋒興業 100 支」金額寫 32,550 標「含稅」—— 對得上，證明 Excel 的金額欄混了兩種口徑',
        '每一列都有統一編號。這是全台灣企業共用的權威識別碼，而且是政府維護的',
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // Stage 2：物件建模
  // ─────────────────────────────────────────────
  objectTypes: [
    { id: 'Customer', label: '客戶 Customer', color: '#3b82f6' },
    { id: 'Order', label: '訂單 Order', color: '#10b981' },
    { id: 'Product', label: '產品 Product', color: '#8b5cf6' },
    { id: 'Delivery', label: '出貨 Delivery', color: '#06b6d4' },
    { id: 'WorkCenter', label: '產能／機台 WorkCenter', color: '#f43f5e' },
  ],
  modelingFields: [
    { id: 'f1', field: '統一編號', from: '財政部發票', answer: 'Customer', role: 'identity',
      why: '這是客戶的權威主鍵。找到它，Stage 3 的一半難題就消失了。' },
    { id: 'f2', field: 'CUST_NM（客戶名稱）', from: '盤古進銷存', answer: 'Customer', role: 'property',
      why: '名稱只是屬性，不是身分。同一個客戶有五種寫法，正因為它不是主鍵。' },
    { id: 'f3', field: '鋁合金座管 6061-T6', from: 'Excel 報價單', answer: 'Product', role: 'identity',
      why: '產品需要自己的物件與料號，否則「6061」和「6061-T6」永遠是兩筆爛帳。' },
    { id: 'f4', field: '數量 500 支', from: 'Excel／LINE／送貨單', answer: 'Order', role: 'property',
      why: '同一筆訂單的數量在三個來源有三個值（300→500，OCR 是 5OO）。這是訂單的屬性，需要版本與依據。' },
    { id: 'f5', field: '送貨單號 20240322-03', from: '手寫單 OCR', answer: 'Delivery', role: 'identity',
      why: '出貨是獨立事件，不是訂單的欄位。一張訂單可以分批出貨（美崙就是）。' },
    { id: 'f6', field: '「上次那批座管改成500支」', from: 'LINE 群組', answer: 'Order', role: 'link',
      why: '這句話是一次訂單變更。它現在不是任何系統裡的資料，但它有法律效力。' },
    { id: 'f7', field: '本週可加工量', from: '廠長腦中的排程', answer: 'WorkCenter', role: 'property',
      why: '整間公司最重要的約束條件，沒有任何系統記錄它。這就是為什麼老闆答不出「能不能接單」。' },
    { id: 'f8', field: '月結60', from: '盤古進銷存', answer: 'Customer', role: 'property',
      why: '付款條件掛在客戶上。它會決定現金流，而現金流是中小企業真正的死因。' },
  ],

  // ─────────────────────────────────────────────
  // Stage 3：實體解析
  // ─────────────────────────────────────────────
  resolution: {
    question: '這五份資料裡，總共有幾個客戶？',
    naiveCount: 11,
    trueCount: 4,
    records: [
      { id: 'R1', name: '巨鋒機械(股)', sourceLabel: '進銷存 C001', externalKey: null, hint: '台中大甲，月結60，聯絡人王經理' },
      { id: 'R2', name: '捷鋒', sourceLabel: '進銷存 C007', externalKey: null, hint: '台中大甲，月結60，無電話' },
      { id: 'R3', name: '巨鋒機械興業有限公司', sourceLabel: '進銷存 C012', externalKey: null, hint: '台北內湖，月結30' },
      { id: 'R4', name: '美崙工業', sourceLabel: '進銷存 C003', externalKey: null, hint: '彰化大村，月結45' },
      { id: 'R5', name: '台灣車料工業(股)公司', sourceLabel: '進銷存 C019', externalKey: null, hint: '台中西屯，現金' },
      { id: 'R6', name: '巨鋒', sourceLabel: 'Excel 報價單', externalKey: null, hint: '座管 500 支' },
      { id: 'R7', name: '巨鋒興業', sourceLabel: 'Excel 報價單', externalKey: null, hint: '座管 100 支，新客戶先收訂' },
      { id: 'R8', name: '巨鋒王經理', sourceLabel: 'LINE 群組', externalKey: null, hint: '打電話來改單的人' },
      { id: 'R9', name: '巨鋒機械股份有限公可', sourceLabel: '送貨單 OCR', externalKey: null, hint: 'OCR 辨識，可能有錯字' },
      { id: 'R10', name: '巨鋒機械工業股份有限公司', sourceLabel: '財政部發票', externalKey: '27889301', hint: '有統編' },
      { id: 'R11', name: '巨鋒機械興業有限公司', sourceLabel: '財政部發票', externalKey: '54120876', hint: '有統編' },
      { id: 'R12', name: '美崙工業股份有限公司', sourceLabel: '財政部發票', externalKey: '16880234', hint: '有統編' },
    ],
    pairs: [
      {
        id: 'P1', left: 'R1', right: 'R10', sameEntity: true,
        humanHint: '大甲的巨鋒機械，和發票上統編 27889301 的巨鋒機械工業。',
        lesson: '最單純的一組：名稱只差「工業」和後綴。這種模糊比對就能過。',
        modelVerdict: { match: true, confidence: 0.94, rationale: '「巨鋒機械(股)」為「巨鋒機械工業股份有限公司」的簡寫，核心商號一致，判為同一法人。' },
      },
      {
        id: 'P2', left: 'R2', right: 'R1', sameEntity: true,
        humanHint: '「捷鋒」是巨鋒機械對外的自行車品牌名。進銷存裡被當成另一家客戶開了新檔。',
        lesson: '字串相似度為零，但它們是同一家。這是規則式方法的天花板 —— 品牌名與法人名之間沒有任何字面關係，只有世界知識才連得起來。',
        modelVerdict: { match: true, confidence: 0.71, rationale: '「捷鋒」為自行車品牌名，其法人實體為巨鋒機械。兩筆的地址（台中大甲）與付款條件（月結60）完全一致，佐證為同一客戶重複建檔。' },
      },
      {
        id: 'P3', left: 'R10', right: 'R11', sameEntity: false,
        humanHint: '統編 27889301 vs 54120876。一家在台中做加工，一家在台北做貿易。名字像，是巧合。',
        lesson: '整份教材最重要的一組。名稱極度相似，模糊比對必然誤判合併；模型也很容易腦補出「同集團關係企業」。只有統編知道答案。',
        modelVerdict: { match: true, confidence: 0.68, rationale: '兩者名稱高度重疊（巨鋒機械），研判為同一集團下之關係企業，應合併為同一客戶主體。' },
        modelIsWrong: true,
      },
      {
        id: 'P4', left: 'R9', right: 'R10', sameEntity: true,
        humanHint: 'OCR 把「公司」讀成「公可」。人一眼就知道是同一家。',
        lesson: 'OCR 雜訊，而且錯字剛好落在後綴上 ——「公可」讓正規化剝不掉「股份有限公司」，整個字串就對不上了。你可以在上面的成績表看到模糊比對在這題失手。想救它就得把門檻調鬆，門檻一鬆，P3 那種誤合併就會變多。這個取捨躲不掉。',
        modelVerdict: { match: true, confidence: 0.97, rationale: '「公可」為「公司」之光學辨識錯誤，其餘字元完全一致，判為同一。' },
      },
      {
        id: 'P5', left: 'R8', right: 'R1', sameEntity: true,
        humanHint: 'LINE 裡的「巨鋒王經理」。進銷存 C001 的地址欄裡寫了「聯絡人王經理」。',
        lesson: '關鍵線索藏在別的欄位裡（地址欄混塞了聯絡人）。要接得起來，得先把 Stage 1 的欄位污染清乾淨。',
        modelVerdict: { match: true, confidence: 0.88, rationale: '「巨鋒王經理」指向巨鋒機械之聯絡人，與 C001 地址欄記載之「聯絡人王經理」一致。此為人員提及，映射至其所屬客戶。' },
      },
      {
        id: 'P6', left: 'R6', right: 'R1', sameEntity: true,
        humanHint: 'Excel 上的「巨鋒」，數量與報價和 C001 的訂單一致。',
        lesson: '簡稱。這種在台灣資料裡佔大宗，而且比想像中難 ——「巨鋒」只有兩個字，跟「巨鋒機械」的字面重疊率算起來只有五成，過不了門檻。人看一眼就知道，演算法不知道。真正的線索不在名字裡，在旁邊那欄一模一樣的品項與數量。',
        modelVerdict: { match: true, confidence: 0.9, rationale: '「巨鋒」為簡稱，訂單品項與數量與 C001 相符。' },
      },
      {
        id: 'P7', left: 'R4', right: 'R12', sameEntity: true,
        humanHint: '美崙工業與美崙工業股份有限公司。',
        lesson: '只差組織後綴，正規化就能解。',
        modelVerdict: { match: true, confidence: 0.96, rationale: '僅差組織型態後綴，判為同一。' },
      },
      {
        id: 'P8', left: 'R5', right: 'R10', sameEntity: false,
        humanHint: '台灣車料工業和巨鋒機械是兩家不同的公司。',
        lesson: '容易的負例。任何方法都該答對 —— 如果某個方法連這個都錯，它的門檻設定有問題。',
        modelVerdict: { match: false, confidence: 0.95, rationale: '商號完全不同，無合併依據。' },
      },
      {
        id: 'P9', left: 'R7', right: 'R11', sameEntity: true,
        humanHint: 'Excel 的「巨鋒興業」對應發票上統編 54120876 的巨鋒機械興業。',
        lesson: '注意：這一筆要合併，但 P3 那筆不能合併。同一個「巨鋒」字根，三家不同的公司關係。',
        modelVerdict: { match: true, confidence: 0.85, rationale: '「巨鋒興業」為「巨鋒機械興業有限公司」之簡稱，金額 32,550 與該公司發票總計相符。' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // Stage 4：關聯圖
  // ─────────────────────────────────────────────
  graph: {
    nodes: [
      { id: 'CUST-JUFENG', label: '巨鋒機械工業', type: 'Customer', x: 760, y: 90, sub: '統編 27889301', merged: ['C001', 'C007', 'Excel 巨鋒', 'LINE 王經理', 'OCR 送貨單'] },
      { id: 'CUST-MEILUN', label: '美崙工業', type: 'Customer', x: 760, y: 240, sub: '統編 16880234', merged: ['C003', 'Excel 美崙'] },
      { id: 'CUST-JFX', label: '巨鋒機械興業', type: 'Customer', x: 760, y: 380, sub: '統編 54120876', merged: ['C012', 'Excel 巨鋒興業'] },
      { id: 'ORD-JF-01', label: '訂單 座管 500支', type: 'Order', x: 520, y: 90, sub: '原 300，LINE 改 500' },
      { id: 'ORD-ML-01', label: '訂單 座管 300支', type: 'Order', x: 520, y: 240, sub: '分批：先 150' },
      { id: 'ORD-JFX-01', label: '訂單 座管 100支', type: 'Order', x: 520, y: 380, sub: '新客戶先收訂' },
      { id: 'PROD-6061', label: '鋁合金座管 6061-T6', type: 'Product', x: 280, y: 240, sub: '含原 6061 寫法' },
      { id: 'WC-CNC', label: 'CNC 機台群', type: 'WorkCenter', x: 90, y: 240, sub: '3 台，本週 685 支' },
      { id: 'DLV-0322', label: '出貨 20240322-03', type: 'Delivery', x: 520, y: 480, sub: '簽收無法辨識' },
    ],
    links: [
      { source: 'WC-CNC', target: 'PROD-6061', label: '加工' },
      { source: 'PROD-6061', target: 'ORD-JF-01', label: '品項' },
      { source: 'PROD-6061', target: 'ORD-ML-01', label: '品項' },
      { source: 'PROD-6061', target: 'ORD-JFX-01', label: '品項' },
      { source: 'ORD-JF-01', target: 'CUST-JUFENG', label: '下單' },
      { source: 'ORD-ML-01', target: 'CUST-MEILUN', label: '下單' },
      { source: 'ORD-JFX-01', target: 'CUST-JFX', label: '下單' },
      { source: 'ORD-JF-01', target: 'DLV-0322', label: '出貨', danger: true },
    ],
    insight:
      '解析前這張圖畫不出來 —— 你會有 11 個客戶節點，其中 5 個其實是同一家，' +
      '而且沒有任何一條線把 LINE 上的改單接到訂單上。解析之後，' +
      '「CNC 機台的產能不足會影響哪些客戶」這個問題第一次變成可以用手指沿著線走完的問題。',
  },

  // ─────────────────────────────────────────────
  // Stage 5：約束傳播
  // ─────────────────────────────────────────────
  scenario: {
    title: '本週產能只夠做 685 支，但手上的單加起來是 900 支',
    setup:
      '三台 CNC 兩班制，本週最多加工 685 支座管。手上三筆訂單合計 900 支。' +
      '缺口 215 支不是「想辦法」就會消失的，它一定會落在某個客戶頭上 —— 問題只是落在誰頭上、代價多少。',
    allocationNote:
      '配置順序是先到先服務（巨鋒 → 美崙 → 巨鋒興業）。這個順序本身就是一個政策決定，' +
      '而大部分中小企業從來沒意識到自己做過這個決定。',
    penaltyNote:
      '注意：中小企業的違約成本通常不是合約罰金，是「客戶下次不找你了」。' +
      '下面的金額是估算的機會損失，不是白紙黑字的罰款。這跟資料集 A 的 BMW 是完全不同的性質 —— ' +
      '看不見的成本最容易被忽略，也最容易讓公司慢慢死掉。',
    resources: {
      'WC-CNC': { label: 'CNC 本週可加工量', unit: '支', available: 685 },
    },
    demands: [
      { id: 'D-JF', label: '巨鋒 鋁合金座管', customer: '巨鋒機械工業', qty: 500, resourceId: 'WC-CNC', etaHrs: 96, deadlineHrs: 72, penalty: 180000, note: 'LINE 上臨時從 300 改成 500，排程沒跟上' },
      { id: 'D-ML', label: '美崙 鋁合金座管', customer: '美崙工業', qty: 300, resourceId: 'WC-CNC', etaHrs: 110, deadlineHrs: 120, penalty: 90000, note: '客戶問能不能先出一半' },
      { id: 'D-JFX', label: '巨鋒興業 鋁合金座管', customer: '巨鋒機械興業', qty: 100, resourceId: 'WC-CNC', etaHrs: 130, deadlineHrs: 168, penalty: 20000, note: '新客戶，已收訂金' },
    ],
    options: [
      { id: 'O-OUT', label: '外包 200 支給隔壁廠', desc: '每支多付 180 元，交期跟得上，但品質要自己驗。', cash: -36000,
        effects: [{ kind: 'consume', resourceId: 'WC-CNC', qty: -200 }], risk: '品質風險自負，退貨成本未計入' },
      { id: 'O-OT', label: '週末加班兩天', desc: '三台機台開週末，加班費與電費約 45,000。', cash: -45000,
        effects: [{ kind: 'consume', resourceId: 'WC-CNC', qty: -140 }], risk: '師傅已連續加班三週，出錯率會上升' },
      { id: 'O-RUSH', label: '插單：巨鋒優先換模', desc: '打亂排程先做巨鋒，換模與待機成本 8,000。', cash: -8000,
        effects: [
          { kind: 'eta', demandId: 'D-JF', deltaHrs: -30 },
          { kind: 'eta', demandId: 'D-ML', deltaHrs: 20 },
        ], risk: '美崙會被往後推 —— 這就是傳播' },
      { id: 'O-NEGO', label: '跟巨鋒協商延後交期 3 天', desc: '給 3% 折讓換取寬限，約 15,000。', cash: -15000,
        effects: [{ kind: 'deadline', demandId: 'D-JF', deltaHrs: 72 }], risk: '一年能用幾次？信用是有限資源' },
    ],
    revealNote:
      '算完之後你會看到一件反直覺的事：最省錢的組合裡沒有「加班」。' +
      '打電話跟客戶談，往往比爆自己的產能便宜 —— 但這件事只有在數字並排放著的時候才看得見。',
  },

  // ─────────────────────────────────────────────
  // Stage 6：動作與寫回
  // ─────────────────────────────────────────────
  writebackIntro:
    '中小企業沒有 SAP 可以寫回。真正的「來源系統」是那套不能改的老進銷存、老闆的 Excel、' +
    '和 LINE 群組。所以寫回的難度不是技術問題，是「哪一份資料才算數」這個組織問題。',
  roleNote:
    '注意這裡只有三個角色，而且權限是斷崖式的：員工幾乎不能改任何東西，老闆什麼都能改，中間沒有東西。' +
    '這不是設計失誤，這就是三十人公司的真實樣子 —— 也是為什麼「導入系統」在中小企業常常等於「老闆一個人的帳號」。',
  defaultRole: 'staff',
  roles: {
    staff: { id: 'staff', label: '業務／廠長', grants: ['logistics'] },
    boss: { id: 'boss', label: '老闆', grants: ['logistics', 'erp', 'finance'] },
    cpa: { id: 'cpa', label: '外部記帳士', grants: ['finance'] },
  },
  actions: [
    {
      id: 'ACT-CONFIRM-500',
      name: '把 LINE 上的改單（300 → 500）正式登錄',
      desc: '把只存在聊天室裡的訂單變更，寫回成有依據、有時間戳、有簽核的正式紀錄。',
      writebacks: [
        { system: '老闆的 Excel', field: '報價單彙整!F5', oldValue: '(空白)', newValue: '142,500', scope: 'logistics', latencyMs: 400 },
        { system: 'LINE Notify', field: '業務群通知', oldValue: '—', newValue: '訂單 2403 已更新為 500 支', scope: 'logistics', latencyMs: 300 },
        { system: '盤古進銷存', field: 'ORD_QTY (C001/2403)', oldValue: '300', newValue: '500', scope: 'erp', latencyMs: 700 },
      ],
      teaches:
        '用預設的「業務／廠長」跑，你會看到最刺眼的一幕：前兩步成功了，第三步被權限擋下，' +
        '然後系統把前兩步回滾。也就是說 —— 通知已經發出去給整個群組了，帳卻沒有真的改。' +
        '再換成「老闆」跑一次，三步就都會過。三個系統、三種權限、沒有一個支援交易，' +
        '這就是為什麼「一鍵寫回」在真實世界是個謊。',
    },
    {
      id: 'ACT-SPLIT-ML',
      name: '美崙訂單分批：先出 150',
      desc: '把 LINE 上談定的分批出貨變成兩張正式出貨單。',
      writebacks: [
        { system: '盤古進銷存', field: 'DLV_PLAN (C003)', oldValue: '300 一次出', newValue: '150 + 150 分批', scope: 'erp', latencyMs: 600 },
        { system: '排程白板（數位化）', field: 'WC-CNC 本週', oldValue: '300', newValue: '150', scope: 'logistics', latencyMs: 350 },
      ],
      teaches: '排程白板是廠長的地盤。系統要改它，得先解決「誰說了算」。',
      conflictDemo: { '盤古進銷存::DLV_PLAN (C003)': '150 + 100 + 50 分批' },
    },
    {
      id: 'ACT-MERGE-CUST',
      name: '合併重複客戶（C007 捷鋒 → C001 巨鋒機械）',
      desc: '把 Stage 3 解析出的結果寫回進銷存，消掉那個放了三年的重複檔。',
      writebacks: [
        { system: '盤古進銷存', field: 'CUST_MASTER C007', oldValue: '獨立客戶', newValue: '併入 C001（別名：捷鋒）', scope: 'erp', latencyMs: 900 },
        { system: '盤古進銷存', field: 'CUST_TAXID C001', oldValue: '(無此欄位)', newValue: '27889301', scope: 'erp', latencyMs: 500, fault: 'timeout' },
        { system: '財政部發票對帳表', field: '客戶對應', oldValue: '未對應', newValue: 'C001 ↔ 27889301', scope: 'finance', latencyMs: 400 },
      ],
      teaches:
        '第二步會失敗 —— 2009 年的進銷存根本沒有統編欄位，你不能把欄位「寫」進一個沒有它的資料表。' +
        '這是中小企業數位化最常見的死法：正確的資料模型，撞上不能改的舊系統。',
    },
  ],

  debrief: [
    { k: '最貴的一課', v: '統一編號不是「另一種方法」，它是唯一一種不用猜的方法。台灣每家公司都有一組政府維護的權威主鍵，這是做這件事的巨大結構優勢 —— 而大部分中小企業的系統裡根本沒有這個欄位。補上它，比導入任何工具都先解決問題。' },
    { k: '模型的位置', v: '模型的準確率確實最高，在「捷鋒 ↔ 巨鋒機械」那種需要世界知識的地方無可取代。但它唯一犯的那個錯，剛好是最貴的那一種：把兩家不同的公司自信地併在一起，而且附上一段很有道理的理由。模型是候選產生器，主鍵才是裁判。' },
    { k: '真正的瓶頸', v: '前三關（髒資料、建模、解析）佔了實務上七到八成的工時。後三關才是簡報上會出現的部分。這個比例倒過來的簡報，就是簡報。' },
    { k: '中小企業的特殊難處', v: '沒有 API、沒有交易保證、沒有權責分明，而且最重要的約束（產能、老師傅的判斷）根本沒被記錄過。技術不是最難的部分。' },
  ],
};
