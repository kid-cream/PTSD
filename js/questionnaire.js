/* ==========================================================
   围产期评估问卷 · 多步问卷（v3）
   ----------------------------------------------------------
   流程：工作人员依次填写 7 个部分 → 点击「生成评估结果」
         → 自动填入下方「产妇信息评估」计算器，并实时显示结果。
   依赖：js/model-config.js（阈值）与 js/ptsd-calculator.js（计算）
   ========================================================== */

(function () {
  "use strict";

  /* ================= 问卷题目定义 ================= */
  const Q_YN = [
    { value: "否", label: "否" },
    { value: "是", label: "是" }
  ];
  const Q_L1_4 = [
    { value: "1", label: "①" },
    { value: "2", label: "②" },
    { value: "3", label: "③" },
    { value: "4", label: "④" }
  ];
  const Q_ACE = [
    { value: "从不", label: "从不" },
    { value: "偶尔", label: "偶尔" },
    { value: "有时", label: "有时" },
    { value: "经常", label: "经常" },
    { value: "总是", label: "总是" }
  ];
  const Q_FREQ4 = [
    { value: "0", label: "无" },
    { value: "1", label: "每周＜1次" },
    { value: "2", label: "每周1～2次" },
    { value: "3", label: "每周≥3次" }
  ];

  const STEPS = [
    {
      id: "basic", title: "基本信息", subtitle: "请选择产妇类型",
      questions: [
        { id: "parity", type: "radio", label: "产妇类型（经产妇或初产妇自己选择即可）", options: [
          { value: "经产妇", label: "经产妇" }, { value: "初产妇", label: "初产妇" } ] }
      ]
    },
    {
      id: "pain", title: "产后第三天疼痛评估", subtitle: "请用 0～10 的数字表示产后第 3 天的疼痛程度（0=无痛，10=最剧烈疼痛）",
      questions: [
        { id: "pain_score", type: "nrs", label: "疼痛数字评分（NRS）", min: 0, max: 10 }
      ]
    },
    {
      id: "traumatic", title: "创伤性分娩评估", subtitle: "请根据分娩过程实际感受，回答以下 4 个问题",
      questions: [
        { id: "tb1", type: "radio", label: "1. 分娩过程感知到自己或宝宝正面临死亡或受死亡威胁", options: Q_YN },
        { id: "tb2", type: "radio", label: "2. 分娩过程感知到自己或宝宝正经历严重伤害", options: Q_YN },
        { id: "tb3", type: "radio", label: "3. 认为分娩是一次困难和令人不愉快的经历", options: Q_YN },
        { id: "tb4", type: "radio", label: "4. 分娩过程感到害怕或无助", options: Q_YN }
      ]
    },
    {
      id: "ssrs", title: "社会支持评定量表（SSRS）", subtitle: "该量表用于反映您在社会中获得的支持，请根据实际情况作答",
      questions: [
        { id: "ssrs1", type: "radio", label: "1. 您有多少关系密切，可以得到支持和帮助的朋友", options: [
          { value: "1", label: "一个也没有" }, { value: "2", label: "1～2个" }, { value: "3", label: "3～5个" }, { value: "4", label: "6个或6个以上" } ] },
        { id: "ssrs2", type: "radio", label: "2. 近一年来您", options: [
          { value: "1", label: "远离家人，且独居一室" }, { value: "2", label: "住处经常变动，多数时间和陌生人住在一起" },
          { value: "3", label: "和同学、同事或朋友住在一起" }, { value: "4", label: "和家人住在一起" } ] },
        { id: "ssrs3", type: "radio", label: "3. 您与邻居", options: [
          { value: "1", label: "相互之间从不关心，只是点头之交" }, { value: "2", label: "遇到困难可能稍微关心" },
          { value: "3", label: "有些邻居都很关心您" }, { value: "4", label: "大多数邻居都很关心您" } ] },
        { id: "ssrs4", type: "radio", label: "4. 您与同事", options: [
          { value: "1", label: "相互之间从不关心，只是点头之交" }, { value: "2", label: "遇到困难可能稍微关心" },
          { value: "3", label: "有些同事很关心您" }, { value: "4", label: "大多数同事都很关心您" } ] },
        { id: "ssrs4", type: "radio", label: "5. 从家庭成员得到的支持和照顾（请在对应选项上选择）", options: [
          { value: "1", label: "父母" }, { value: "2", label: "儿女" },
          { value: "3", label: "兄弟姐妹" }, { value: "4", label: "其他成员" } ] },
        { id: "ssrs6", type: "source", label: "6. 过去，在您遇到急难情况时，曾经得到的经济支持和解决实际问题的帮助的来源有：", sources: ["配偶", "其他家人", "亲戚", "朋友", "同事", "工作单位", "党团工会等官方或半官方组织", "宗教、社会团体等非官方组织", "其他"] },
        { id: "ssrs7", type: "source", label: "7. 过去，在您遇到急难情况时，曾经得到的安慰和关心的来源有：", sources: ["配偶", "其他家人", "亲戚", "朋友", "同事", "工作单位", "党团工会等官方或半官方组织", "宗教、社会团体等非官方组织", "其他"] },
        { id: "ssrs8", type: "radio", label: "8. 您遇到烦恼时的倾诉方式", options: [
          { value: "1", label: "从不向任何人诉述" }, { value: "2", label: "只向关系极为密切的1～2个人诉述" },
          { value: "3", label: "如果朋友主动询问，您会说出来" }, { value: "4", label: "主动诉述自己的烦恼，以获得支持和理解" } ] },
        { id: "ssrs9", type: "radio", label: "9. 您遇到烦恼时的求助方式", options: [
          { value: "1", label: "只靠自己，不接受别人帮助" }, { value: "2", label: "很少请求别人帮助" },
          { value: "3", label: "有时请求别人帮助" }, { value: "4", label: "有困难时经常向家人、亲友、组织求援" } ] },
        { id: "ssrs10", type: "radio", label: "10. 对于团体（如党团组织、宗教组织、工会、学生会等）组织活动，您", options: [
          { value: "1", label: "从不参加" }, { value: "2", label: "偶尔参加" }, { value: "3", label: "经常参加" }, { value: "4", label: "主动参加并积极活动" } ] }
      ]
    },
    {
      id: "ace", title: "童年经历问卷（ACE）", subtitle: "以下问题询问您 18 岁之前可能有过的体验，请根据实际情况回答",
      questions: [
        { id: "ace1",  type: "radio", label: "1. 您父母或监护人理解您遇到的问题和担忧。", options: Q_ACE, group: "情感忽视" },
        { id: "ace2",  type: "radio", label: "2. 您父母或监护人知道您在空闲、不用上学或工作时在做什么。", options: Q_ACE, group: "情感忽视" },
        { id: "ace3",  type: "radio", label: "3. 即使有条件，您父母或监护人还是没有给您提供足够的食物。", options: Q_ACE, group: "躯体忽视" },
        { id: "ace4",  type: "radio", label: "4. 您父母或监护人因酗酒或吸毒，而无法照顾您。", options: Q_ACE, group: "躯体忽视" },
        { id: "ace5",  type: "radio", label: "5. 即便有条件，您父母或监护人也不会让您去学校读书。", options: Q_ACE, group: "躯体忽视" },
        { id: "ace6",  type: "radio", label: "6. 您父母、监护人或其他家庭成员大声训斥、咒骂或者侮辱您。", options: Q_ACE, group: "情感虐待" },
        { id: "ace7",  type: "radio", label: "7. 您父母、监护人或其他家庭成员曾威胁要抛弃您，或者真的抛弃您甚至把您赶出家。", options: Q_ACE, group: "情感虐待" },
        { id: "ace8",  type: "radio", label: "8. 您父母、监护人或其他家庭成员曾对您拳打脚踢或扇耳光。", options: Q_ACE, group: "躯体虐待" },
        { id: "ace9",  type: "radio", label: "9. 您父母、监护人或其他家庭成员曾用物体（如棍子、手杖、刀、鞭子等）击打或划伤您。", options: Q_ACE, group: "躯体虐待" },
        { id: "ace10", type: "radio", label: "10. 有人在您不情愿的情况下触摸或抚摸过您身体的私密部位。", options: Q_ACE, group: "性虐待" },
        { id: "ace11", type: "radio", label: "11. 有人在您不情愿的情况下强迫您触摸他们身体的私密部位。", options: Q_ACE, group: "性虐待" },
        { id: "ace12", type: "radio", label: "12. 有人企图在您不情愿的情况下和您发生性关系。", options: Q_ACE, group: "性虐待" },
        { id: "ace13", type: "radio", label: "13. 有人在您不情愿的情况下确实和您发生了性关系。", options: Q_ACE, group: "性虐待" }
      ]
    },
    {
      id: "psqi", title: "睡眠质量评估（PSQI）", subtitle: "以下问题关于您过去一个月的睡眠情况，请根据实际情况填写",
      questions: [
        { id: "psqi_q1", type: "time", label: "1. 近一个月，晚上上床睡觉通常是几点钟？" },
        { id: "psqi_q2", type: "number", label: "2. 近一个月，每晚通常要多长时间才能入睡？", unit: "分钟", min: 0, max: 300 },
        { id: "psqi_q3", type: "time", label: "3. 近一个月，每天早上通常几点钟起床？" },
        { id: "psqi_q4", type: "number", label: "4. 近一个月，每夜通常实际睡眠多少小时？", unit: "小时", min: 0, max: 24, step: 0.5 },
        { id: "psqi_q5a", type: "radio", label: "5a. 入睡困难（30分钟内不能入睡）", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5b", type: "radio", label: "5b. 夜间易醒或早醒", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5c", type: "radio", label: "5c. 夜间去厕所", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5d", type: "radio", label: "5d. 呼吸不畅", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5e", type: "radio", label: "5e. 咳嗽或鼾声高", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5f", type: "radio", label: "5f. 感觉冷", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5g", type: "radio", label: "5g. 感觉热", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5h", type: "radio", label: "5h. 做噩梦", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5i", type: "radio", label: "5i. 疼痛不适", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q5j", type: "radio", label: "5j. 其他影响睡眠的事情", options: Q_FREQ4, group: "睡眠障碍" },
        { id: "psqi_q6", type: "radio", label: "6. 近一个月，总的来说，您认为自己的睡眠质量如何？", options: [
          { value: "0", label: "很好" }, { value: "1", label: "较好" }, { value: "2", label: "较差" }, { value: "3", label: "很差" } ] },
        { id: "psqi_q7", type: "radio", label: "7. 近一个月，您用药物催眠的情况", options: Q_FREQ4 },
        { id: "psqi_q8", type: "radio", label: "8. 近一个月，您常感到困倦吗？", options: Q_FREQ4 },
        { id: "psqi_q9", type: "radio", label: "9. 近一个月，您做事情的精力不足吗？", options: [
          { value: "0", label: "没有" }, { value: "1", label: "偶尔有" }, { value: "2", label: "有时有" }, { value: "3", label: "经常有" } ] }
      ]
    },
    {
      id: "epds", title: "沮丧情绪评估（EPDS）", subtitle: "以下 10 个问题关于您最近 7 天的感受，请选择最接近您实际情况的答案",
      questions: [
        { id: "epds1",  type: "radio", label: "1. 我能看到事情有趣的一面，并笑出声来", options: [ {value:"0",label:"和以前一样"}, {value:"1",label:"不如以前那样多"}, {value:"2",label:"明显不如以前多"}, {value:"3",label:"完全不能"} ] },
        { id: "epds2",  type: "radio", label: "2. 我欣然期待未来的一切", options: [ {value:"0",label:"和以前一样"}, {value:"1",label:"比以前略少"}, {value:"2",label:"比以前明显减少"}, {value:"3",label:"几乎不能"} ] },
        { id: "epds3",  type: "radio", label: "3. 当事情出错时，我会不必要地责备自己", options: [ {value:"0",label:"从不"}, {value:"1",label:"有时"}, {value:"2",label:"经常"}, {value:"3",label:"几乎总是"} ] },
        { id: "epds4",  type: "radio", label: "4. 我无缘无故感到焦虑和担心", options: [ {value:"0",label:"一点也不"}, {value:"1",label:"极少"}, {value:"2",label:"有时"}, {value:"3",label:"经常"} ] },
        { id: "epds5",  type: "radio", label: "5. 我无缘无故感到恐惧或惊慌", options: [ {value:"0",label:"从不"}, {value:"1",label:"偶尔"}, {value:"2",label:"有时候"}, {value:"3",label:"非常多"} ] },
        { id: "epds6",  type: "radio", label: "6. 事情发展到我无法应付的地步", options: [ {value:"0",label:"不，一切都能应付"}, {value:"1",label:"不是，大多数时候能应付"}, {value:"2",label:"是的，有时候不能应付"}, {value:"3",label:"是的，大多数时候完全无法应付"} ] },
        { id: "epds7",  type: "radio", label: "7. 我因心情不好而难以入睡", options: [ {value:"0",label:"不，完全不是"}, {value:"1",label:"偶尔是这样"}, {value:"2",label:"有时是这样"}, {value:"3",label:"大多数时候是这样"} ] },
        { id: "epds8",  type: "radio", label: "8. 我感到悲伤或悲惨", options: [ {value:"0",label:"从不"}, {value:"1",label:"偶尔"}, {value:"2",label:"经常"}, {value:"3",label:"大多数时候"} ] },
        { id: "epds9",  type: "radio", label: "9. 我因心情不好而哭", options: [ {value:"0",label:"从不"}, {value:"1",label:"偶尔"}, {value:"2",label:"经常"}, {value:"3",label:"大多数时候"} ] },
        { id: "epds10", type: "radio", label: "10. 我产生过伤害自己的想法", options: [ {value:"0",label:"从不"}, {value:"1",label:"偶尔"}, {value:"2",label:"有时"}, {value:"3",label:"经常"} ] }
      ]
    }
  ];

  /* ================= 读取表单值 ================= */
  function val(id) {
    const el = document.getElementById("q-" + id);
    if (!el) return null;
    if (el.type === "checkbox") return el.checked;
    if (el.tagName === "SELECT") return el.value;
    return el.value;
  }
  function radioVal(id) {
    const el = document.querySelector('input[name="q-' + id + '"]:checked');
    return el ? el.value : null;
  }
  function timeHours(id) {
    const t = val(id);
    if (!t) return null;
    const parts = t.split(":");
    return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
  }
  function sourceCount(id) {
    // 该题勾选的来源个数（勾了"无任何来源"则计 0）
    const none = document.getElementById("q-" + id + "_none");
    if (none && none.checked) return 0;
    const boxes = document.querySelectorAll('input[name="q-' + id + '_src"]:checked');
    return boxes.length;
  }

  /* ================= 分步评分 ================= */
  function scoreSSRS() {
    let total = 0;
    ["ssrs1","ssrs2","ssrs3","ssrs4"].forEach(function (id) { total += parseInt(radioVal(id) || "0", 10); });
    ["ssrs5a","ssrs5b","ssrs5c","ssrs5d"].forEach(function (id) { total += parseInt(radioVal(id) || "0", 10); });
    total += sourceCount("ssrs6");
    total += sourceCount("ssrs7");
    ["ssrs8","ssrs9","ssrs10"].forEach(function (id) { total += parseInt(radioVal(id) || "0", 10); });
    return total;
  }

  function scoreACE() {
    // 童年家庭暴力：情感虐待(6,7)+躯体虐待(8,9)，任一非"从不"→有
    const abuse = ["ace6","ace7","ace8","ace9"].some(function (id) { return radioVal(id) && radioVal(id) !== "从不"; });
    // 童年情感忽视：情感忽视(1,2)，任一"从不/偶尔"→有
    const neglect = ["ace1","ace2"].some(function (id) { var v = radioVal(id); return v === "从不" || v === "偶尔"; });
    return { abuse: abuse, neglect: neglect };
  }

  function scorePSQI() {
    // 1 主观睡眠质量 = q6
    const c1 = parseInt(radioVal("psqi_q6") || "0", 10);
    // 2 入睡时间 = q2分段 + q5a
    const q2min = parseInt(val("psqi_q2") || "0", 10);
    let q2s = 0;
    if (q2min > 60) q2s = 3; else if (q2min > 30) q2s = 2; else if (q2min > 15) q2s = 1;
    const q5a = parseInt(radioVal("psqi_q5a") || "0", 10);
    const c2sum = q2s + q5a;
    const c2 = c2sum <= 0 ? 0 : (c2sum <= 2 ? 1 : (c2sum <= 4 ? 2 : 3));
    // 3 睡眠时间 = q4
    const q4 = parseFloat(val("psqi_q4") || "0");
    const c3 = q4 > 7 ? 0 : (q4 >= 6 ? 1 : (q4 >= 5 ? 2 : 3));
    // 4 睡眠效率 = q4 / (q3-q1) * 100
    const q1 = timeHours("psqi_q1");
    const q3 = timeHours("psqi_q3");
    let eff = 100;
    if (q1 != null && q3 != null && (q3 - q1) > 0) eff = (q4 / (q3 - q1)) * 100;
    const c4 = eff > 85 ? 0 : (eff >= 75 ? 1 : (eff >= 65 ? 2 : 3));
    // 5 睡眠障碍 = q5b~q5j 之和
    let c5sum = 0;
    ["psqi_q5b","psqi_q5c","psqi_q5d","psqi_q5e","psqi_q5f","psqi_q5g","psqi_q5h","psqi_q5i","psqi_q5j"].forEach(function (id) {
      c5sum += parseInt(radioVal(id) || "0", 10);
    });
    const c5 = c5sum <= 0 ? 0 : (c5sum <= 9 ? 1 : (c5sum <= 18 ? 2 : 3));
    // 6 催眠药物 = q7
    const c6 = parseInt(radioVal("psqi_q7") || "0", 10);
    // 7 日间功能障碍 = q8 + q9
    const c7sum = parseInt(radioVal("psqi_q8") || "0", 10) + parseInt(radioVal("psqi_q9") || "0", 10);
    const c7 = c7sum <= 0 ? 0 : (c7sum <= 2 ? 1 : (c7sum <= 4 ? 2 : 3));
    return c1 + c2 + c3 + c4 + c5 + c6 + c7;
  }

  function scoreEPDS() {
    let total = 0;
    for (let i = 1; i <= 10; i++) total += parseInt(radioVal("epds" + i) || "0", 10);
    return total;
  }

  /* ================= 汇总并填入计算器 ================= */
  function buildResults() {
    const pain = parseInt(val("pain_score") || "0", 10);
    const tb = [radioVal("tb1"), radioVal("tb2"), radioVal("tb3"), radioVal("tb4")];
    const traumatic = (tb[0] === "是" && tb[1] === "是" && (tb[2] === "是" || tb[3] === "是")) ? "有" : "无";
    const ssrsTotal = scoreSSRS();
    const ace = scoreACE();
    const psqiTotal = scorePSQI();
    const epdsTotal = scoreEPDS();
    const T = PTSD_MODEL.thresholds;

    return {
      pain: pain,
      painSevere: pain >= T.painSevere ? "是" : "否",
      traumatic: traumatic,
      parity: radioVal("parity") || "经产妇",
      ssrsTotal: ssrsTotal,
      ssrs: ssrsTotal > T.ssrsHigh ? "高水平" : "中低水平",
      ace6: ace.abuse ? "有" : "无",
      ace1: ace.neglect ? "有" : "无",
      psqiTotal: psqiTotal,
      sleep: psqiTotal > T.psqiPoor ? "不满意" : "满意",
      epdsTotal: epdsTotal,
      dep: epdsTotal >= T.epdsRisk ? "有" : "无"
    };
  }

  function fillCalculator(r) {
    const map = {
      "calc-Parity": r.parity,
      "calc-Painp.2": r.painSevere,
      "calc-traumatic_birth": r.traumatic,
      "calc-SSRS": r.ssrs,
      "calc-ACE_6": r.ace6,
      "calc-ACE_1": r.ace1,
      "calc-SQP": r.sleep,
      "calc-Dispi": r.dep
    };
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.value !== map[id]) {
        el.value = map[id];
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  /* ================= 渲染问卷 ================= */
  function renderQuestion(q) {
    const wrap = document.createElement("div");
    wrap.className = "q-item" + (q.group ? " q-item-group" : "");

    if (q.group) {
      const g = document.createElement("div");
      g.className = "q-group-label";
      g.textContent = q.group;
      wrap.appendChild(g);
    }

    const label = document.createElement("div");
    label.className = "q-item-label";
    label.textContent = q.label;
    if (q.fullLabel) label.textContent = q.fullLabel;
    if (q.unit) label.textContent = q.label;
    wrap.appendChild(label);

    if (q.type === "radio") {
      const opts = document.createElement("div");
      opts.className = "q-opts";
      q.options.forEach(function (o) {
        const lab = document.createElement("label");
        lab.className = "q-opt";
        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = "q-" + q.id;
        inp.value = o.value;
        const span = document.createElement("span");
        span.textContent = o.label;
        lab.appendChild(inp);
        lab.appendChild(span);
        opts.appendChild(lab);
      });
      wrap.appendChild(opts);
    } else if (q.type === "nrs") {
      const box = document.createElement("div");
      box.className = "nrs-box";
      const slider = document.createElement("input");
      slider.type = "range";
      slider.id = "q-" + q.id;
      slider.min = q.min; slider.max = q.max; slider.step = 1; slider.value = q.min;
      const show = document.createElement("div");
      show.className = "nrs-show";
      const num = document.createElement("span");
      num.className = "nrs-num"; num.textContent = q.min;
      const cat = document.createElement("span");
      cat.className = "nrs-cat"; cat.textContent = nrsCategory(q.min);
      show.appendChild(num);
      show.appendChild(cat);
      slider.addEventListener("input", function () {
        num.textContent = slider.value;
        cat.textContent = nrsCategory(parseInt(slider.value, 10));
      });
      const scale = document.createElement("div");
      scale.className = "nrs-scale";
      scale.textContent = "0（无痛）                           10（最剧烈疼痛）";
      box.appendChild(slider);
      box.appendChild(show);
      box.appendChild(scale);
      wrap.appendChild(box);
    } else if (q.type === "number") {
      const box = document.createElement("div");
      box.className = "q-number";
      const inp = document.createElement("input");
      inp.type = "number";
      inp.id = "q-" + q.id;
      inp.min = q.min; inp.max = q.max; inp.step = q.step || 1;
      box.appendChild(inp);
      if (q.unit) {
        const u = document.createElement("span");
        u.className = "q-unit";
        u.textContent = q.unit;
        box.appendChild(u);
      }
      wrap.appendChild(box);
    } else if (q.type === "time") {
      const box = document.createElement("div");
      box.className = "q-number";
      const inp = document.createElement("input");
      inp.type = "time";
      inp.id = "q-" + q.id;
      box.appendChild(inp);
      wrap.appendChild(box);
    } else if (q.type === "source") {
      const box = document.createElement("div");
      box.className = "q-source";
      const none = document.createElement("label");
      none.className = "q-opt";
      const nInp = document.createElement("input");
      nInp.type = "radio";
      nInp.name = "q-" + q.id + "_none";
      nInp.id = "q-" + q.id + "_none";
      nInp.value = "none";
      const nSpan = document.createElement("span");
      nSpan.textContent = "无任何来源";
      none.appendChild(nInp);
      none.appendChild(nSpan);
      box.appendChild(none);
      q.sources.forEach(function (s) {
        const lab = document.createElement("label");
        lab.className = "q-opt q-opt-check";
        const inp = document.createElement("input");
        inp.type = "checkbox";
        inp.name = "q-" + q.id + "_src";
        inp.value = s;
        const span = document.createElement("span");
        span.textContent = s;
        lab.appendChild(inp);
        lab.appendChild(span);
        box.appendChild(lab);
      });
      wrap.appendChild(box);
    }
    return wrap;
  }

  function nrsCategory(score) {
    if (score <= 3) return "轻度及以下";
    if (score <= 6) return "中度";
    return "重度";
  }

  /* ================= 步骤导航 ================= */
  let current = 0;

  function showStep(i) {
    current = i;
    STEPS.forEach(function (s, idx) {
      const el = document.getElementById("q-step-" + s.id);
      if (el) el.style.display = idx === i ? "block" : "none";
    });
    document.querySelectorAll(".q-step-dot").forEach(function (d, idx) {
      d.classList.toggle("done", idx < i);
      d.classList.toggle("active", idx === i);
    });
    const btnPrev = document.getElementById("q-btn-prev");
    const btnNext = document.getElementById("q-btn-next");
    const btnDone = document.getElementById("q-btn-done");
    btnPrev.style.visibility = i === 0 ? "hidden" : "visible";
    if (i === STEPS.length - 1) {
      btnNext.style.display = "none";
      btnDone.style.display = "inline-block";
    } else {
      btnNext.style.display = "inline-block";
      btnDone.style.display = "none";
    }
  }

  /* ================= 初始化 ================= */
  function init() {
    const host = document.getElementById("questionnaire");
    if (!host) return;

    // 步骤指示器
    const ind = document.getElementById("q-indicator");
    STEPS.forEach(function (s, idx) {
      const dot = document.createElement("div");
      dot.className = "q-step-dot";
      dot.textContent = idx + 1;
      dot.title = s.title;
      ind.appendChild(dot);
    });

    // 渲染每个步骤
    STEPS.forEach(function (s) {
      const sec = document.createElement("div");
      sec.className = "q-step";
      sec.id = "q-step-" + s.id;
      const head = document.createElement("div");
      head.className = "q-step-head";
      const h = document.createElement("h4");
      h.textContent = s.title;
      const p = document.createElement("p");
      p.textContent = s.subtitle;
      head.appendChild(h);
      head.appendChild(p);
      sec.appendChild(head);
      s.questions.forEach(function (q) {
        sec.appendChild(renderQuestion(q));
      });
      host.appendChild(sec);
    });

    // 导航按钮
    document.getElementById("q-btn-prev").addEventListener("click", function () { if (current > 0) showStep(current - 1); });
    document.getElementById("q-btn-next").addEventListener("click", function () { if (current < STEPS.length - 1) showStep(current + 1); });
    document.getElementById("q-btn-done").addEventListener("click", generate);

    showStep(0);
  }

  function generate() {
    // 校验各步是否填写完整
    const r = buildResults();
    const host = document.getElementById("questionnaire");

    // 填入计算器
    fillCalculator(r);

    // 显示完成提示
    const done = document.getElementById("q-done");
    if (done) {
      done.style.display = "block";
      const list = document.getElementById("q-done-list");
      if (list) {
        list.innerHTML =
          "创伤性分娩：" + r.traumatic + "　·　社会支持：" + r.ssrs +
          "（" + r.ssrsTotal + "分）　·　产妇类型：" + r.parity +
          "　·　产后重度疼痛：" + r.painSevere + "（NRS " + r.pain + " 分）<br>" +
          "童年家庭暴力：" + r.ace6 + "　·　童年情感忽视：" + r.ace1 +
          "　·　睡眠质量：" + r.sleep + "（PSQI " + r.psqiTotal + " 分）　·　孕期沮丧：" + r.dep +
          "（EPDS " + r.epdsTotal + " 分）";
      }
    }

    // 滚动到计算器
    const calc = document.getElementById("calc-section");
    if (calc) calc.scrollIntoView({ behavior: "smooth", block: "start" });

    // 触发结果展示
    if (typeof window.renderRiskFromForm === "function") window.renderRiskFromForm();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
