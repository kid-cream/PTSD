/* ==========================================================
   围产期 PTSD 风险预测模型 · 配置 v3
   ----------------------------------------------------------
   ★ 若要替换成您自己的模型/阈值，只需修改本文件 ★

   模型：logistic 回归
     logit = intercept + Σ( coef × [该变量=风险值 ? 1 : 0] )
     p = 1 / ( 1 + e^(-logit) )

   风险分档（v3 三档）：
     低风险  p < 0.30
     中风险  0.30 ≤ p < 0.70
     高风险  p ≥ 0.70

   阈值配置：
     painSevere   NRS 疼痛数字 ≥ 7（即 7-10）→ 重度 → 产后疼痛(重度)=是
     ssrsHigh     SSRS 总分 > 44 → 社会支持=高水平；否则 中低水平
     psqiPoor     PSQI 总分 > 7（国内标准）→ 睡眠质量=不满意
     epdsRisk     EPDS 总分 ≥ 10 → 孕期沮丧=有
     ppqCutoff    围产期PTSD问卷总分 ≥ 19 → 提示可能存在 PTSD
   ========================================================== */
const PTSD_MODEL = {
  // 截距（对应全部取"无风险"水平时的 log-odds）
  intercept: -2.7116,

  // 风险分档（按概率从小到大）
  riskTiers: [
    { max: 0.30, key: "low",  label: "低风险", note: "该产妇为低风险人群，目前发生 PTSD 的可能性较低。建议保持规律随访，关注睡眠质量与情绪变化，如有不适及时与医护人员沟通。" },
    { max: 0.70, key: "med",  label: "中风险", note: "该产妇为中风险人群，存在一定的 PTSD 发生可能性。建议关注产妇情绪与睡眠状况，可至产科门诊或心理门诊咨询，必要时进行进一步评估。" },
    { max: 1.01, key: "high", label: "高风险", note: "该产妇为高风险人群，建议尽快安排心理科专业评估与咨询，必要时转诊干预。家人请给予更多理解、陪伴与支持，密切观察情绪状态。" }
  ],

  // 各量表判定阈值
  thresholds: {
    painSevere: 7,    // NRS 数字 ≥ 7 → 重度
    ssrsHigh: 44,     // SSRS 总分 > 44 → 高水平
    psqiPoor: 7,      // PSQI 总分 > 7 → 睡眠不满意
    epdsRisk: 10,     // EPDS ≥ 10 → 沮丧有
    ppqCutoff: 19     // PPQ ≥ 19 → 提示 PTSD
  },

  // 预测变量定义：id 与页面下拉框绑定，riskValue 为取该值时计为风险
  variables: [
    { id: "traumatic_birth", name: "创伤性分娩", hint: "是否有创伤性分娩经历", options: ["无", "有"], riskValue: "有", coef: 1.8401 },
    { id: "SSRS",            name: "社会支持",   hint: "社会支持量表（SSRS）水平", options: ["高水平", "中低水平"], riskValue: "中低水平", coef: 1.3103 },
    { id: "Parity",          name: "产妇类型",   hint: "经产妇 / 初产妇", options: ["经产妇", "初产妇"], riskValue: "初产妇", coef: 0.6650 },
    { id: "Painp.2",         name: "产后第三天疼痛程度（重度）", hint: "产后第 3 天是否存在重度疼痛", options: ["否", "是"], riskValue: "是", coef: 1.3046 },
    { id: "ACE_6",           name: "童年家庭暴力", hint: "童年期是否经历家庭暴力", options: ["无", "有"], riskValue: "有", coef: 2.1642 },
    { id: "ACE_1",           name: "童年情感忽视", hint: "童年期是否被情感忽视", options: ["无", "有"], riskValue: "有", coef: 0.7100 },
    { id: "SQP",             name: "孕期睡眠质量", hint: "孕期睡眠质量是否满意", options: ["满意", "不满意"], riskValue: "不满意", coef: 0.6982 },
    { id: "Dispi",           name: "孕期沮丧情绪", hint: "孕期是否出现沮丧情绪", options: ["无", "有"], riskValue: "有", coef: 1.2413 }
  ]
};

/* ---------- 依据风险分档判定风险等级 ---------- */
function classifyRisk(prob) {
  const tiers = PTSD_MODEL.riskTiers;
  for (let i = 0; i < tiers.length; i++) {
    if (prob < tiers[i].max) return tiers[i];
  }
  return tiers[tiers.length - 1];
}
