/* ==========================================================
   围产期创伤后应激障碍问卷（PPQ）· 14 题
   来源：陈静芬-硕士论文 附录4
   计分：每题 0-4（频率），总分 0-56
   判定：总分 ≥ PTSD_MODEL.thresholds.ppqCutoff（默认 19）
         → 提示可能存在产后 PTSD，建议心理科专业评估
   ========================================================== */

(function () {
  "use strict";

  const OPTIONS = [
    { value: "0", label: "一个月内从不" },
    { value: "1", label: "一个月内一次或两次" },
    { value: "2", label: "一个月内有时" },
    { value: "3", label: "经常，但少于一个月" },
    { value: "4", label: "经常，多于一个月" }
  ];

  const ITEMS = [
    "1. 您曾做过关于生孩子或者孩子生病住院的噩梦吗？",
    "2. 您曾有过关于生孩子或者孩子住院的苦恼回忆吗？",
    "3. 您曾有过那种突然的，就好像再次生孩子的感觉吗？",
    "4. 您曾设法避免想到生孩子的过程及您小孩的住院吗？",
    "5. 您曾避免过那些会让您想起生产过程或者孩子住院的事吗？（例如不看关于婴儿的电视节目）",
    "6. 您有过不能记起孩子住院期间的一些事情吗？",
    "7. 对于您经常做的事情，您是否已经丧失了兴趣？（例如：没兴趣工作或对家庭失去兴趣）",
    "8. 您有没有孤独或者与其他人远离的感觉？（例如您有没有觉得没有人可以理解您？）",
    "9. 您有没有变得难以感受到他人的柔情和爱意？",
    "10. 您有没有入睡或者保持睡眠特别的困难？",
    "11. 您有没有变得比平常更容易暴躁或者生气？",
    "12. 您有没有变得比生孩子前更难集中自己的注意力？",
    "13. 您有没有感觉更加胆战心惊的？（比如对噪音更敏感或者很容易受到惊吓）",
    "14. 您有没有对生孩子感到更加的愧疚，比您觉得您应该感受到的？"
  ];

  function render() {
    const host = document.getElementById("ppq-list");
    if (!host) return;
    ITEMS.forEach(function (text, i) {
      const item = document.createElement("div");
      item.className = "ppq-item";
      const label = document.createElement("div");
      label.className = "q-item-label";
      label.textContent = text;
      item.appendChild(label);
      const opts = document.createElement("div");
      opts.className = "q-opts";
      OPTIONS.forEach(function (o) {
        const lab = document.createElement("label");
        lab.className = "q-opt";
        const inp = document.createElement("input");
        inp.type = "radio";
        inp.name = "ppq-" + (i + 1);
        inp.value = o.value;
        const span = document.createElement("span");
        span.textContent = o.label;
        lab.appendChild(inp);
        lab.appendChild(span);
        opts.appendChild(lab);
      });
      item.appendChild(opts);
      host.appendChild(item);
    });
  }

  function compute() {
    let total = 0;
    let answered = 0;
    for (let i = 1; i <= ITEMS.length; i++) {
      const el = document.querySelector('input[name="ppq-' + i + '"]:checked');
      if (el) { total += parseInt(el.value, 10); answered++; }
    }
    return { total: total, answered: answered };
  }

  function submit() {
    const r = compute();
    const cutoff = PTSD_MODEL.thresholds.ppqCutoff;
    const hasPTSD = r.total >= cutoff;

    const sec = document.getElementById("ppq-result");
    const badge = document.getElementById("ppq-badge");
    const scoreEl = document.getElementById("ppq-score");
    const note = document.getElementById("ppq-note");

    badge.className = "result-badge " + (hasPTSD ? "high" : "low");
    badge.textContent = hasPTSD ? "提示可能存在 PTSD" : "未见明显 PTSD 症状";

    scoreEl.textContent = r.total;
    scoreEl.className = "prob-value " + (hasPTSD ? "high" : "low");

    note.className = "result-note " + (hasPTSD ? "high" : "low");
    note.innerHTML =
      (r.answered < ITEMS.length ? "尚有 " + (ITEMS.length - r.answered) + " 题未作答，结果仅供参考。 " : "") +
      (hasPTSD
        ? "该产妇围产期创伤后应激障碍问卷得分较高（总分 ≥ " + cutoff + " 分），提示可能存在产后创伤后应激障碍（PTSD）相关症状，建议尽快转诊心理科进行专业评估与干预。家人应给予理解与支持。"
        : "该产妇围产期创伤后应激障碍问卷得分较低（总分 < " + cutoff + " 分），未见明显 PTSD 相关症状。建议保持观察，若出现失眠、情绪困扰等症状持续不缓解，可随时复评或咨询。");

    if (sec) sec.style.display = "block";
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    const form = document.getElementById("ppq-form");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); submit(); });
  });
})();
