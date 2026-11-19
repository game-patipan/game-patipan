// Builds .github/metrics/skills.js, which the Metrics workflow passes to
// lowlighter/metrics as `extras_js`. Inside metrics' renderer it:
//  - adds "Coding habits" charts (data from .github/metrics/habits.mjs, since the
//    metrics habits plugin no longer works with GitHub's push events),
//  - adds the skills below as a "Mastered technologies and topics" icon grid,
//  - lays everything out in two columns like the lowlighter/metrics showcase.
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

const svgIcon = (d, cls = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"${cls}><path fill-rule="evenodd" d="${d}"/></svg>`;
// Octicons used by metrics' own "topics" and "habits" sections.
const TELESCOPE = "M14.184 1.143a1.75 1.75 0 00-2.502-.57L.912 7.916a1.75 1.75 0 00-.53 2.32l.447.775a1.75 1.75 0 002.275.702l11.745-5.656a1.75 1.75 0 00.757-2.451l-1.422-2.464zm-1.657.669a.25.25 0 01.358.081l1.422 2.464a.25.25 0 01-.108.35l-2.016.97-1.505-2.605 1.85-1.26zM9.436 3.92l1.391 2.41-5.42 2.61-.942-1.63 4.97-3.39zM3.222 8.157l-1.466 1a.25.25 0 00-.075.33l.447.775a.25.25 0 00.325.1l1.598-.769-.83-1.436zm6.253 2.306a.75.75 0 00-.944-.252l-1.809.87a.75.75 0 00-.293.253L4.38 14.326a.75.75 0 101.238.848l1.881-2.75v2.826a.75.75 0 001.5 0v-2.826l1.881 2.75a.75.75 0 001.238-.848l-2.644-3.863z";
const BULB = "M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 01-1.484.211c-.04-.282-.163-.547-.37-.847a8.695 8.695 0 00-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.75.75 0 01-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75zM6 15.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM5.75 12a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z";

// Skills: one icon per technology, in SECTIONS order, with the name as a tooltip.
const icons = SECTIONS.flatMap(([, items]) => items).map(([label, key]) => {
  const { hex, path } = icon(key);
  const cls = DARK_LOGOS.has(key) ? ' class="skill-dark"' : "";
  return `<span class="skill" title="${esc(label)}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"${cls}><path fill="#${hex}" d="${path}"/></svg></span>`;
}).join("");
const SKILLS_HTML = `<section id="skills"><h2 class="field">${svgIcon(TELESCOPE)}Mastered technologies and topics</h2><div class="skill-icons">${icons}</div></section>`;
const HABITS_TITLE = `<h2 class="field wrap">${svgIcon(BULB)}Coding habits and recent activity`;

// metrics purges CSS that its own render does not use, so the chart styles are restated here.
const css = [
  "#skills .skill-icons{display:flex;flex-wrap:wrap;gap:8px;margin:6px 13px 4px}",
  "#skills .skill{display:flex;width:24px;height:24px}",
  "@media (prefers-color-scheme:dark){#skills .skill-dark path{fill:#c9d1d9}}",
  "#habits .chart{display:flex;flex-direction:column;align-items:center;margin:0 8px}",
  "#habits h3{font-size:14px;font-weight:normal;color:#0366d6;margin:8px 0 2px;padding:0}",
  "#habits .h-details{margin:0 4px;padding-top:4px;font-size:.8rem}",
  "#habits .chart-bars{display:flex;justify-content:space-between;align-items:flex-end;align-self:stretch;margin:8px 0 4px;min-height:70px}",
  "#habits .entry{flex-grow:1;display:flex;flex-direction:column;align-items:center;font-size:10px;color:#666}",
  "#habits .value{font-size:8px}",
  "#habits .bar{width:7px;min-height:2px;border-radius:5px;border:1px solid rgba(27,31,35,.06);background:#ebedf0}",
  "#habits .lv1{background:#9be9a8}#habits .lv2{background:#40c463}#habits .lv3{background:#30a14e}#habits .lv4{background:#216e39}",
  "@media (prefers-color-scheme:dark){#habits .lv0{background:#161b22}#habits .entry{color:#8b949e}}",
].join("");

// Two-column, 960px wide layout. The viewBox lets GitHub scale the image to the README width.
const LAYOUT_CSS = [
  // Fixed line-height: "normal" depends on the font, which differs between the
  // renderer and the viewer's browser and would change the content height.
  ".items-wrapper{display:flex;align-items:flex-start;gap:10px;padding-bottom:8px;line-height:1.3}",
  ".items-wrapper>.metrics-col{flex:1 1 0;min-width:0}",
].join("");

// Runs inside metrics' puppeteer page, after rendering and before resizing.
// HABITS_HOURS, HABITS_DAYS and HABITS_COUNT are prepended by the workflow (habits.mjs).
const js = `// Generated by scripts/generate-skills.mjs. Do not edit by hand.
const wrapper = document.querySelector(".items-wrapper");
const style = document.createElement("style");
style.textContent = ${JSON.stringify(css)};
document.querySelector("svg").prepend(style);
const make = (html) => {
const holder = document.createElement("div");
holder.innerHTML = html;
return holder.firstElementChild;
};
const bars = (values, labels) => {
const max = Math.max(1, ...values);
let html = "";
values.forEach((v, i) => {
const p = v / max;
html += \`<div class="entry"><span class="value">\${v}</span><div class="bar lv\${Math.ceil(p / 0.25)}" style="height:\${Math.round(p / 0.02)}px"></div>\${labels.at(i)}</div>\`;
});
return \`<div class="chart-bars">\${html}</div>\`;
};
let habits = null;
if (typeof HABITS_HOURS !== "undefined") {
const hours = HABITS_HOURS.split(",").map(Number);
const days = HABITS_DAYS.split(",").map(Number);
const hourLabels = Array.from(hours, (_, h) => String(h).padStart(2, "0"));
const dayLabels = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
habits = make(\`<section id="habits">${HABITS_TITLE.replace(/`/g, "")} <small class="h-details">(computed from last \${HABITS_COUNT} commits)</small></h2><div class="chart"><h3>Commit activity per hour of day</h3>\${bars(hours, hourLabels)}</div><div class="chart"><h3>Commit activity per day of week</h3>\${bars(days, dayLabels)}</div></section>\`);
}
const skills = make(${JSON.stringify(SKILLS_HTML)});

// Left: profile, repositories, coding habits. Right: calendar, languages, skills.
const left = document.createElement("div");
const right = document.createElement("div");
left.className = right.className = "metrics-col";
const items = Array.from(wrapper.children).filter((e) => e.tagName.toLowerCase() !== "footer");
// A block without its own h2 (like "Most used languages") stays with the block before it.
let column = left;
let pendingHabits = false;
for (const e of items) {
const h2 = e.querySelector("h2");
if (h2) {
if (pendingHabits) left.appendChild(habits);
pendingHabits = false;
column = left;
if (/calendar|languages/i.test(h2.textContent)) column = right;
if (habits && /repositor/i.test(h2.textContent)) pendingHabits = true;
}
column.appendChild(e);
}
if (habits && !habits.parentNode) left.appendChild(habits);
right.appendChild(skills);
wrapper.prepend(left, right);

const svg = document.querySelector("svg");
svg.setAttribute("width", "960");
style.textContent += ${JSON.stringify(LAYOUT_CSS)};
await new Promise((solve) => setTimeout(solve, 500));
// Leave spare height (about 10 percent) at the bottom so other fonts on the viewer's side cannot clip it.
const measured = document.querySelector("svg #metrics-end").getBoundingClientRect().y;
wrapper.style.paddingBottom = \`\${Math.ceil(measured / 10) + 8}px\`;
const height = Math.ceil(document.querySelector("svg #metrics-end").getBoundingClientRect().y);
svg.setAttribute("viewBox", \`0 0 960 \${height}\`);
svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
`;

// The metrics action runs its inputs through an unquoted `echo $INPUTS`, so a word made of shell
// glob characters (like " * ") expands to file names, and runs of spaces collapse into one.
// "%" is avoided too, since metrics URI-decodes its inputs.
const unsafe = js.split(/\s+/).filter((word) => /[*?[]/.test(word));
if (unsafe.length || js.includes("%") || /[ \t]{2}|\t/.test(js)) {
  throw new Error(`skills.js has shell-unsafe content: ${JSON.stringify(unsafe)}, "%", tabs or double spaces`);
}

mkdirSync(".github/metrics", { recursive: true });
writeFileSync(".github/metrics/skills.js", js);
console.log(`.github/metrics/skills.js written (${js.length} bytes)`);
