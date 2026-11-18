// Generates assets/skills.svg — the "tech stack" card shown in README.md.
// Edit SECTIONS below, then run: npm install && npm run skills
import { writeFileSync, mkdirSync } from "node:fs";
import * as si from "simple-icons";

// Generic icons for items that have no brand logo (24x24 viewBox).
const CUSTOM = {
  plug: {
    hex: "E8822F",
    path: "M8 2a1 1 0 0 1 1 1v4h6V3a1 1 0 1 1 2 0v4h1a1 1 0 0 1 1 1v3a6 6 0 0 1-5 5.92V20a2 2 0 0 1-2 2h-0a2 2 0 0 1-2-2v-3.08A6 6 0 0 1 5 11V8a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1zm-1 7v2a4 4 0 0 0 8 0V9H7z",
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

// Each section is a list of rows; each row is a list of [label, icon].
const SECTIONS = [
  ["Languages", [[["Python", "siPython"], ["JavaScript", "siJavascript"], ["TypeScript", "siTypescript"]]]],
  ["Frontend", [
    [["Next.js", "siNextdotjs"], ["React", "siReact"], ["Tailwind CSS", "siTailwindcss"]],
    [["CSS", "siCss"], ["Bootstrap", "siBootstrap"]],
  ]],
  ["Backend & Tasks", [[["Django", "siDjango"], ["REST API", "plug"], ["Celery", "siCelery"]]]],
  ["APIs & Integrations", [[["LINE Messaging API", "siLine"], ["Google Sheets API", "siGooglesheets"], ["Google Drive API", "siGoogledrive"]]]],
  ["Databases, Cache & Queue", [
    [["MySQL", "siMysql"], ["PostgreSQL", "siPostgresql"], ["SQLite", "siSqlite"]],
    [["NoSQL", "database"], ["Redis", "siRedis"]],
  ]],
  ["Infrastructure & Security", [[["Linux VPS", "siLinux"], ["Nginx", "siNginx"], ["Fail2ban", "ban"]]]],
  ["DevOps & Cloud", [[["Docker", "siDocker"], ["Kubernetes (K8s)", "siKubernetes"], ["Cloudflare", "siCloudflare"]]]],
  ["Version Control", [[["Git", "siGit"]]]],
];

// Layout (monospace: ~0.6em per character).
const PAD_X = 18, PAD_Y = 20;
const HEAD_SIZE = 12, TEXT_SIZE = 12, CHAR_W = TEXT_SIZE * 0.6;
const ICON = 13, ICON_GAP = 5;
const HEAD_H = 20, ROW_H = 21, SECTION_GAP = 12;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let y = PAD_Y;
let maxX = 0;
const parts = [];

for (const [title, rows] of SECTIONS) {
  parts.push(`<text class="h" x="${PAD_X}" y="${y + HEAD_SIZE}">${esc(title.toUpperCase())}</text>`);
  y += HEAD_H;
  for (const row of rows) {
    let x = PAD_X;
    row.forEach(([label, key], i) => {
      const { hex, path } = icon(key);
      const text = label + (i < row.length - 1 ? "," : "");
      parts.push(
        `<svg x="${x}" y="${y + 1}" width="${ICON}" height="${ICON}" viewBox="0 0 24 24"><path fill="#${hex}" d="${path}"/></svg>`,
        `<text class="t" x="${x + ICON + ICON_GAP}" y="${y + 12}">${esc(text)}</text>`,
      );
      x += ICON + ICON_GAP + text.length * CHAR_W + CHAR_W;
    });
    maxX = Math.max(maxX, x);
    y += ROW_H;
  }
  y += SECTION_GAP;
}

const width = Math.ceil(maxX + PAD_X);
const height = Math.ceil(y - SECTION_GAP + PAD_Y - 6);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Tech stack">
<title>Tech stack</title>
<style>
  .bg { fill: #ECE7DB; }
  text { font-family: "Space Mono", "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace; }
  .h { font-size: ${HEAD_SIZE}px; font-weight: 700; letter-spacing: 1px; fill: #B4552D; }
  .t { font-size: ${TEXT_SIZE}px; fill: #2B2A28; }
</style>
<rect class="bg" width="100%" height="100%" rx="8"/>
${parts.join("\n")}
</svg>
`;

mkdirSync("assets", { recursive: true });
writeFileSync("assets/skills.svg", svg);
console.log(`assets/skills.svg written (${width}x${height})`);
