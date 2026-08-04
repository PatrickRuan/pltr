// 寫回引擎。
//
// 原本那份 demo 的寫回是 setTimeout 一秒後印「HTTP 200 OK」。
// 真實世界的寫回沒有一次是那樣的。這裡把四件會出事的事情做出來：
//   1. 權限 —— 你的角色不一定能改那個欄位
//   2. 衝突 —— 你讀到值之後，有人在來源系統改過了（樂觀鎖失敗）
//   3. 部分成功 —— 三個系統改了兩個，第三個掛掉
//   4. 補償 —— 跨系統沒有交易保證，只能補償回滾，而補償本身也可能失敗
// 外加一條不可竄改的稽核軌跡，因為那才是 Palantir 賣給政府的東西。

// 角色由各資料集自己定義 —— 因為權限模型本身就是組織的樣子。
// 大企業有細緻的職能分工；中小企業通常只有「老闆」和「其他人」，中間沒有東西。
// 這個差異不是技術差異，是這份教材想讓學員看見的東西之一。
export const DEFAULT_ROLES = {
  planner: { id: 'planner', label: '生產排程員', grants: ['logistics', 'iot'] },
};

let auditSeq = 0;

function stamp() {
  auditSeq += 1;
  return {
    seq: auditSeq,
    at: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
  };
}

/**
 * 執行一次寫回。回傳完整的逐步結果，UI 負責把它一步一步演出來。
 *
 * action.writebacks: [{ system, field, oldValue, newValue, scope, latencyMs, fault }]
 *   scope —— 需要的權限範圍，對照 ROLES[x].grants
 *   fault —— 'conflict' | 'timeout' | null，用來重現特定教學情境
 *
 * env.currentValues —— 來源系統「現在」的值。若與 oldValue 不符即為衝突，
 *   這模擬的是有人在你按下按鈕之前先改過了。
 */
export function planWriteback(action, { role = 'planner', currentValues = {}, roles = DEFAULT_ROLES } = {}) {
  const grants = roles[role]?.grants || [];
  const steps = [];
  let aborted = false;

  for (const wb of action.writebacks) {
    if (aborted) {
      steps.push({ ...wb, status: 'skipped', message: '前一步失敗，此步未執行' });
      continue;
    }

    if (!grants.includes(wb.scope)) {
      steps.push({
        ...wb,
        status: 'denied',
        message: `403 Forbidden —— 角色「${roles[role]?.label || role}」沒有 ${wb.scope} 範圍的寫入權`,
      });
      aborted = true;
      continue;
    }

    const liveValue = currentValues[`${wb.system}::${wb.field}`];
    if (liveValue !== undefined && liveValue !== wb.oldValue) {
      steps.push({
        ...wb,
        status: 'conflict',
        message: `409 Conflict —— 你讀到的是「${wb.oldValue}」，來源系統現在是「${liveValue}」。有人先改過了。`,
        liveValue,
      });
      aborted = true;
      continue;
    }

    if (wb.fault === 'timeout') {
      steps.push({
        ...wb,
        status: 'timeout',
        message: '504 Gateway Timeout —— 對方系統無回應。危險：可能已經寫進去了，只是回應掉了。',
      });
      aborted = true;
      continue;
    }

    steps.push({ ...wb, status: 'ok', message: '200 OK' });
  }

  // 失敗時，已成功的步驟需要補償回滾
  const compensations = [];
  if (aborted) {
    const succeeded = steps.filter((s) => s.status === 'ok');
    for (const s of [...succeeded].reverse()) {
      compensations.push({
        system: s.system,
        field: s.field,
        from: s.newValue,
        to: s.oldValue,
        status: s.compensationFault === 'fail' ? 'failed' : 'ok',
        message: s.compensationFault === 'fail'
          ? '補償失敗 —— 系統已進入不一致狀態，需人工介入'
          : '已回滾至原值',
      });
    }
  }

  const committed = !aborted;
  return {
    ...stamp(),
    actionId: action.id,
    actionName: action.name,
    role,
    roleLabel: roles[role]?.label || role,
    steps,
    compensations,
    committed,
    inconsistent: compensations.some((c) => c.status === 'failed'),
    summary: committed
      ? `全部 ${steps.length} 個系統寫入成功`
      : `於第 ${steps.findIndex((s) => s.status !== 'ok' && s.status !== 'skipped') + 1} 步中止，${compensations.length} 筆已補償回滾`,
  };
}

/** 稽核軌跡條目 —— 只增不刪，這是重點 */
export function toAuditEntry(result, extra = {}) {
  return {
    seq: result.seq,
    at: result.at,
    actor: result.roleLabel,
    action: result.actionName,
    outcome: result.committed ? 'COMMITTED' : result.inconsistent ? 'INCONSISTENT' : 'ROLLED_BACK',
    detail: result.summary,
    ...extra,
  };
}
