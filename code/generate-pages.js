/* ==========================================================
   占位页生成脚本
   用法：node code/generate-pages.js
   说明：读取 code/占位页模板.html，按下方页面清单生成
   scales/ 与 methods/ 下的占位页。新增页面只需在 PAGES 里加一行。
   ========================================================== */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/* ---------- 线条风格 SVG 图标（stroke: currentColor） ---------- */
const ICONS = {
  home:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  moon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  sprout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  zen:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
};

/* ---------- 页面清单：目录 / 文件名 / 标题 / 副标题 / 图标 ---------- */
const PAGES = [
  { dir: "scales",  file: "childhood-dv.html",        title: "童年家庭暴力评价表",   subtitle: "评估童年期家庭暴力暴露情况",               icon: "home" },
  { dir: "scales",  file: "pregnancy-sleep.html",     title: "孕期睡眠质量评价表",   subtitle: "评估孕期睡眠质量与状况",                   icon: "moon" },
  { dir: "scales",  file: "pregnancy-depression.html",title: "孕期沮丧情绪评价表",   subtitle: "评估孕期情绪低落与沮丧状态",               icon: "heart" },
  { dir: "scales",  file: "childhood-neglect.html",   title: "童年情感忽视评价表",   subtitle: "评估童年期情感忽视经历",                   icon: "sprout" },
  { dir: "scales",  file: "social-support.html",      title: "社会支持评价表",       subtitle: "评估产妇的社会支持水平",                   icon: "users" },

  { dir: "methods", file: "self-regulation.html",     title: "孕期心理自我调节指南", subtitle: "日常情绪调节与放松方法（低风险人群参考）",     icon: "zen" },
  { dir: "methods", file: "healthy-life.html",        title: "孕期健康生活与睡眠建议", subtitle: "作息、睡眠与生活方式建议（低风险人群参考）",  icon: "moon" },
  { dir: "methods", file: "referral.html",            title: "心理科转诊与咨询指引", subtitle: "如何预约专业心理咨询与评估（高风险人群参考）", icon: "cross" },
  { dir: "methods", file: "family-support.html",      title: "家庭支持与照护指南",   subtitle: "家人如何理解与陪伴产妇（高风险人群参考）",     icon: "home" },
  { dir: "methods", file: "emergency-help.html",      title: "紧急心理求助渠道",     subtitle: "紧急情况下的求助联系方式（高风险人群参考）",   icon: "phone" },
  { dir: "methods", file: "relaxation-training.html", title: "孕期放松训练方法",     subtitle: "呼吸、音乐等放松训练指导（高风险人群参考）",   icon: "music" }
];

/* ---------- 生成 ---------- */
const tpl = fs.readFileSync(path.join(ROOT, "code", "占位页模板.html"), "utf8");

PAGES.forEach(function (p) {
  const html = tpl
    .split("__TITLE__").join(p.title)
    .split("__SUBTITLE__").join(p.subtitle)
    .split("__PHICON__").join(ICONS[p.icon] || "");

  const target = path.join(ROOT, p.dir, p.file);
  fs.writeFileSync(target, html, "utf8");
  console.log("生成: " + p.dir + "/" + p.file);
});

console.log("全部占位页生成完成。");
