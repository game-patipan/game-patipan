// Counts your recent commits per hour of day and per day of week, for the
// "Coding habits" charts that skills.js draws into the metrics image.
// (lowlighter/metrics' own habits plugin relies on commit lists in push events,
// which GitHub no longer includes, so it fails.)
//
// Env: GH_TOKEN (the METRICS_TOKEN secret), TZ_OFFSET_HOURS (default 7 = Asia/Bangkok).
// Prints one line of JavaScript that the workflow prepends to skills.js.
const token = process.env.GH_TOKEN;
const offset = Number(process.env.TZ_OFFSET_HOURS ?? 7);
const MAX_COMMITS = 200;
const MAX_REPOS = 20;
const DAYS_BACK = 180;

async function api(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

const { login } = await api("/user");
const repos = await api(`/user/repos?affiliation=owner&sort=pushed&per_page=${MAX_REPOS}`);
const since = new Date(Date.now() - DAYS_BACK * 86_400_000).toISOString();

const dates = [];
for (const repo of repos) {
  try {
    const commits = await api(`/repos/${repo.full_name}/commits?author=${login}&since=${since}&per_page=100`);
    for (const { commit } of commits) dates.push(new Date(commit.author.date));
  } catch (error) {
    // Empty repositories answer 409; skip any repository that cannot be read.
    console.error(`skipped ${repo.full_name}: ${error.message}`);
  }
}

const recent = dates.sort((a, b) => b - a).slice(0, MAX_COMMITS);
const hours = new Array(24).fill(0);
const days = new Array(7).fill(0);
for (const date of recent) {
  const local = new Date(date.getTime() + offset * 3_600_000);
  hours[local.getUTCHours()] += 1;
  days[local.getUTCDay()] += 1;
}

console.error(`habits: ${recent.length} commits from ${repos.length} repositories`);
console.log(`const HABITS_HOURS="${hours.join(",")}";const HABITS_DAYS="${days.join(",")}";const HABITS_COUNT=${recent.length};`);
