/* ==========================================================
   围产期 PTSD 风险评估 · 计算与结果渲染（v3 三档版）
   计算逻辑读取 js/model-config.js 中的 PTSD_MODEL 配置
   ========================================================== */

(function () {
  "use strict";

  /* ---------- 调节方法入口（按风险等级展示不同内容） ---------- */
  const ICON_ZEN   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>';
  const ICON_MOON  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  const ICON_CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>';
  const ICON_HOME  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>';
  const ICON_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const ICON_MUSIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';

  const METHODS = {
    low: [
      { icon: ICON_ZEN,   title: "孕期心理自我调节指南", desc: "情绪调节与放松方法", href: "methods/self-regulation.html" },
      { icon: ICON_MOON,  title: "孕期健康生活与睡眠建议", desc: "作息、睡眠与生活方式", href: "methods/healthy-life.html" }
    ],
    med: [
      { icon: ICON_ZEN,   title: "孕期心理自我调节指南", desc: "情绪调节与放松方法", href: "methods/self-regulation.html" },
      { icon: ICON_MUSIC, title: "孕期放松训练方法",     desc: "呼吸、音乐等放松训练", href: "methods/relaxation-training.html" },
      { icon: ICON_CROSS, title: "心理科转诊与咨询指引", desc: "专业心理咨询与评估预约", href: "methods/referral.html" }
    ],
    high: [
      { icon: ICON_CROSS, title: "心理科转诊与咨询指引", desc: "专业心理咨询与评估预约", href: "methods/referral.html" },
      { icon: ICON_HOME,  title: "家庭支持与照护指南",   desc: "家人的理解与陪伴",     href: "methods/family-support.html" },
      { icon: ICON_PHONE, title: "紧急心理求助渠道",     desc: "紧急求助联系方式",     href: "methods/emergency-help.html" },
      { icon: ICON_MUSIC, title: "孕期放松训练方法",     desc: "呼吸、音乐等放松训练", href: "methods/relaxation-training.html" }
    ]
  };

  /* ---------- 依据配置动态生成计算器题目列表 ---------- */
  function buildList() {
    const list = document.getElementById("calc-list");
    if (!list) return;

    PTSD_MODEL.variables.forEach(function (v, i) {
      const row = document.createElement("div");
      row.className = "q-row";

      const label = document.createElement("div");
      label.className = "q-label";
      const num = document.createElement("span");
      num.className = "q-num";
      num.textContent = i + 1;
      const nameBox = document.createElement("div");
      const name = document.createElement("span");
      name.className = "q-name";
      name.textContent = v.name;
      nameBox.appendChild(name);
      if (v.hint) {
        const hint = document.createElement("span");
        hint.className = "q-hint";
        hint.textContent = v.hint;
        nameBox.appendChild(hint);
      }
      label.appendChild(num);
      label.appendChild(nameBox);

      const selWrap = document.createElement("div");
      selWrap.className = "q-select";
      const sel = document.createElement("select");
      sel.id = "calc-" + v.id;
      sel.name = v.id;
      v.options.forEach(function (opt) {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
      });
      selWrap.appendChild(sel);

      row.appendChild(label);
      row.appendChild(selWrap);
      list.appendChild(row);
    });
  }

  /* ---------- 计算风险 ---------- */
  function computeRisk() {
    let logit = PTSD_MODEL.intercept;
    PTSD_MODEL.variables.forEach(function (v) {
      const el = document.getElementById("calc-" + v.id);
      if (el && el.value === v.riskValue) {
        logit += v.coef;
      }
    });
    const p = 1 / (1 + Math.exp(-logit));
    return p;
  }

  /* ---------- 渲染结果（右侧面板，三档风险） ---------- */
  function renderResult(result, scroll) {
    const empty = document.getElementById("result-empty");
    const content = document.getElementById("result-content");
    if (!content) return;

    const tier = classifyRisk(result.prob);
    const pct = (result.prob * 100).toFixed(2);

    // 徽章
    const badge = document.getElementById("result-badge");
    badge.textContent = tier.label + "人群";
    badge.className = "result-badge " + tier.key;

    // 概率
    const probEl = document.getElementById("result-prob");
    probEl.textContent = pct;
    probEl.className = "prob-value " + tier.key;

    // 进度条
    const fill = document.getElementById("result-bar");
    fill.className = "prob-fill " + tier.key;
    requestAnimationFrame(function () {
      fill.style.width = pct + "%";
    });

    // 提示文案
    const note = document.getElementById("result-note");
    note.textContent = tier.note;
    note.className = "result-note " + tier.key;

    // 调节方法入口
    const grid = document.getElementById("method-grid");
    grid.innerHTML = "";
    (METHODS[tier.key] || []).forEach(function (m) {
      const a = document.createElement("a");
      a.className = "method-card";
      a.href = m.href;
      a.innerHTML =
        '<span class="mc-icon">' + m.icon + "</span>" +
        '<span><span class="mc-title">' + m.title + '</span><span class="mc-desc">' + m.desc + "</span></span>";
      grid.appendChild(a);
    });

    // 切换显示
    if (empty) empty.style.display = "none";
    content.hidden = false;

    if (scroll && window.innerWidth < 860) {
      const card = content.closest(".result-card");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---------- 供问卷"生成评估结果"调用 ---------- */
  function renderRiskFromForm() {
    renderResult({ prob: computeRisk() }, true);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    buildList();

    const form = document.getElementById("calc-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        renderResult({ prob: computeRisk() }, true);
      });
    }

    // 计算器任一输入变化 → 实时更新结果
    PTSD_MODEL.variables.forEach(function (v) {
      const el = document.getElementById("calc-" + v.id);
      if (el) {
        el.addEventListener("change", function () {
          renderResult({ prob: computeRisk() }, false);
        });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);

  // 暴露给 questionnaire.js 使用
  window.renderRiskFromForm = renderRiskFromForm;
  window.renderRiskResult = function (p, scroll) { renderResult({ prob: p }, !!scroll); };
})();
