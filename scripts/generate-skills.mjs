// Builds .github/metrics/skills.js, which the Metrics workflow passes to
// lowlighter/metrics as `extras_js` to add a "Skills" section styled like the
// classic template.
// Edit SECTIONS below, then run: npm install && npm run skills
import { writeFileSync, mkdirSync } from "node:fs";
import * as si from "simple-icons";

// Generic icons for items that have no brand logo (24x24 viewBox).
const CUSTOM = {
  plug: {
    hex: "E8822F",
    path: "M8 2a1 1 0 0 1 1 1v4h6V3a1 1 0 1 1 2 0v4h1a1 1 0 0 1 1 1v3a6 6 0 0 1-5 5.92V20a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-3.08A6 6 0 0 1 5 11V8a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1zm-1 7v2a4 4 0 0 0 8 0V9H7z",
  },
  database: {
    hex: "2EA44F",
    path: "M12 2C7.58 2 4 3.57 4 5.5v13C4 20.43 7.58 22 12 22s8-1.57 8-3.5v-13C20 3.57 16.42 2 12 2zm0 2c3.87 0 6 1.25 6 1.5S15.87 7 12 7 6 5.75 6 5.5 8.13 4 12 4zM6 8.1C7.47 8.66 9.6 9 12 9s4.53-.34 6-.9V12c0 .25-2.13 1.5-6 1.5S6 12.25 6 12V8.1zm0 6.5c1.47.56 3.6.9 6 .9s4.53-.34 6-.9v3.9c0 .25-2.13 1.5-6 1.5s-6-1.25-6-1.5v-3.9z",
  },
  ban: {
    hex: "E5484D",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 0 1 6.32 12.9L7.1 5.68A7.96 7.96 0 0 1 12 4zM4 12c0-1.85.63-3.55 1.68-4.9L16.9 18.32A8 8 0 0 1 4 12z",
  },
};

const icon = (key) => CUSTOM[key] ?? si[key] ?? (() => { throw new Error(`Unknown icon: ${key}`); })();

// [category, [[label, icon], ...]]
const SECTIONS = [
  ["Languages", [["Python", "siPython"], ["JavaScript", "siJavascript"], ["TypeScript", "siTypescript"]]],
  ["Frontend", [["Next.js", "siNextdotjs"], ["React", "siReact"], ["Tailwind CSS", "siTailwindcss"], ["CSS", "siCss"], ["Bootstrap", "siBootstrap"]]],
  ["Backend & Tasks", [["Django", "siDjango"], ["REST API", "plug"], ["Celery", "siCelery"]]],
  ["APIs & Integrations", [["LINE Messaging API", "siLine"], ["Google Sheets API", "siGooglesheets"], ["Google Drive API", "siGoogledrive"]]],
  ["Databases, Cache & Queue", [["MySQL", "siMysql"], ["PostgreSQL", "siPostgresql"], ["SQLite", "siSqlite"], ["NoSQL", "database"], ["Redis", "siRedis"]]],
  ["Infrastructure & Security", [["Linux VPS", "siLinux"], ["Nginx", "siNginx"], ["Fail2ban", "ban"]]],
  ["DevOps & Cloud", [["Docker", "siDocker"], ["Kubernetes (K8s)", "siKubernetes"], ["Cloudflare", "siCloudflare"]]],
  ["Version Control", [["Git", "siGit"]]],
];

// Near-black logos disappear on GitHub's dark theme; they get a light fill there.
const DARK_LOGOS = new Set(["siNextdotjs", "siDjango", "siSqlite"]);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Octicon "tools" (16px), the same icon family as the other metrics section titles.
const TOOLS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M5.433 2.304A4.494 4.494 0 0 0 3.5 6c0 1.598.832 3.002 2.09 3.802.518.328.929.923.902 1.64v.008l-.164 3.337a.75.75 0 1 1-1.498-.073l.163-3.33c.002-.085-.05-.216-.207-.316A5.996 5.996 0 0 1 2 6a5.994 5.994 0 0 1 2.567-4.92 1.482 1.482 0 0 1 1.673-.04c.462.296.76.827.76 1.423v2.82c0 .082.041.16.11.206l.75.51a.25.25 0 0 0 .28 0l.75-.51A.249.249 0 0 0 9 5.282V2.463c0-.596.298-1.127.76-1.423a1.482 1.482 0 0 1 1.673.04A5.994 5.994 0 0 1 14 6a5.996 5.996 0 0 1-2.786 5.068c-.157.1-.209.23-.207.315l.163 3.33a.752.752 0 0 1-1.094.714.75.75 0 0 1-.404-.64l-.164-3.345c-.027-.717.384-1.312.902-1.64A4.495 4.495 0 0 0 12.5 6a4.494 4.494 0 0 0-1.933-3.696c-.024.017-.067.067-.067.16v2.818a1.75 1.75 0 0 1-.767 1.448l-.75.51a1.75 1.75 0 0 1-1.966 0l-.75-.51A1.75 1.75 0 0 1 5.5 5.282V2.463c0-.092-.043-.142-.067-.159Z"/></svg>';

const groups = SECTIONS.map(([category, items]) => {
  const list = items.map(([label, key]) => {
    const { hex, path } = icon(key);
    const cls = DARK_LOGOS.has(key) ? ' class="skill-dark"' : "";
    return `<div class="skill"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"${cls}><path fill="#${hex}" d="${path}"/></svg>${esc(label)}</div>`;
  }).join("");
  return `<div class="skill-group"><div class="skill-category">${esc(category)}</div><div class="skill-list">${list}</div></div>`;
}).join("");

const css = [
  "#skills .skill-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 12px;margin:4px 13px 8px}",
  "#skills .skill-category{font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#0366d6;margin-bottom:4px}",
  "#skills .skill-list{display:flex;flex-wrap:wrap;gap:3px 10px}",
  "#skills .skill{display:flex;align-items:center;font-size:12px;white-space:nowrap}",
  "#skills .skill svg{margin-right:5px;flex-shrink:0}",
  "@media (prefers-color-scheme:dark){#skills .skill-dark path{fill:#c9d1d9}}",
].join("");

// Explicit columns (CSS multi-column overflowed when a block could not break).
const LAYOUT_CSS = [
  ".items-wrapper{display:flex;align-items:flex-start;gap:10px;padding-bottom:8px}",
  ".items-wrapper>.metrics-col{flex:1 1 0;min-width:0}",
].join("");

const html = `<section id="skills"><h2 class="field">${TOOLS_ICON}Skills</h2><div class="skill-grid">${groups}</div></section>`;

// Runs inside metrics' puppeteer page, after rendering and before resizing.
const js = `// Generated by scripts/generate-skills.mjs. Do not edit by hand.
const wrapper = document.querySelector(".items-wrapper");
const style = document.createElement("style");
style.textContent = ${JSON.stringify(css)};
document.querySelector("svg").prepend(style);
const holder = document.createElement("div");
holder.innerHTML = ${JSON.stringify(html)};
// Two columns like the metrics showcase: Skills and the contributions calendar on the
// right, every other section (profile, activity, repositories, languages) on the left.
const items = [...wrapper.children].filter((e) => e.tagName.toLowerCase() !== "footer");
const left = document.createElement("div");
const right = document.createElement("div");
left.className = right.className = "metrics-col";
items.forEach((e) => (/calendar/i.test(e.querySelector("h2")?.textContent ?? "") ? right : left).appendChild(e));
right.prepend(holder.firstElementChild);
wrapper.prepend(left, right);

// 960px wide; the viewBox lets GitHub scale the image down to the README width
// instead of clipping the right column.
const svg = document.querySelector("svg");
svg.setAttribute("width", "960");
style.textContent += ${JSON.stringify(LAYOUT_CSS)};
await new Promise((solve) => setTimeout(solve, 500));
const height = Math.ceil(document.querySelector("svg #metrics-end").getBoundingClientRect().y);
svg.setAttribute("viewBox", \`0 0 960 \${height}\`);
svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
`;

mkdirSync(".github/metrics", { recursive: true });
writeFileSync(".github/metrics/skills.js", js);
console.log(`.github/metrics/skills.js written (${js.length} bytes)`);
