const { api, esc, fmtDate, teamLabel, winRate, recordHtml, MATCH_ID, SOLO_GAME_COUNT } = window.STL;
const IMG = window.STL_IMAGES || {};
function pic(name, fallback) {
  return IMG[name] || fallback;
}
const root = document.getElementById("app");

function parseHash() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart || "/";
  const query = {};
  new URLSearchParams(queryPart || "").forEach((value, key) => {
    query[key] = value;
  });
  return { path, query };
}

function go(href) {
  location.hash = href.startsWith("#") ? href.slice(1) : href;
}

function qs(query) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const text = params.toString();
  return text ? "?" + text : "";
}

function layout(active, banner, body) {
  const nav = [
    ["#/league", "联赛", active === "league"],
    ["#/events", "赛事系统", active === "events"],
    ["#/teams", "战队", active === "teams"],
    ["#/games", "比赛", active === "games"],
    ["#/players", "选手", active === "players"],
  ]
    .map(
      ([href, label, on]) => `<a href="${href}" class="${on ? "active" : ""}">${label}</a>`,
    )
    .join("");
  return `
    <div class="archive">
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="#/">
            <span class="brand-kicker">TEAM LEAGUE ARCHIVE</span>
            <span class="brand-title">我爱星际争霸</span>
          </a>
          <nav class="nav">${nav}</nav>
        </div>
      </header>
      <div class="hero">
        <img src="${esc(banner.src)}" alt="" />
        <div class="mask"></div>
        <div class="copy">
          <div class="k">${esc(banner.kicker)}</div>
          <h1>${esc(banner.title)}</h1>
          <p>${esc(banner.hint)}</p>
        </div>
      </div>
      <main class="main">${body}</main>
      <footer class="footer">
        特别感谢 SCI)_Dp)_R、小色、F91、SCI)_OruA、SCI)_802、SUN-LYH、Nefelibata666、XuanFengTui、亮 资助服务器<br />
        STL我爱星际争霸 All Rights Reserved.
        <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">粤ICP备15065552号-1</a>
      </footer>
    </div>`;
}

function pager(page, total, size, hrefFn) {
  const max = Math.max(1, Math.ceil(total / size));
  if (max <= 1) return "";
  const prev = page > 1 ? `<a class="btn ghost" href="${hrefFn(page - 1)}">上一页</a>` : `<button disabled>上一页</button>`;
  const next = page < max ? `<a class="btn ghost" href="${hrefFn(page + 1)}">下一页</a>` : `<button disabled>下一页</button>`;
  return `<div class="pager">${prev}<span>${page} / ${max}</span>${next}</div>`;
}

function teamRows(list) {
  if (!list.length) return `<div class="empty">暂无战队数据</div>`;
  return list
    .map((team, index) => {
      const label = teamLabel(team.Ref, team.Name);
      return `<a class="row" href="#/teams/${team.Unit_ID}">
        <span class="rank ${index < 3 ? "hot" : ""}">${index + 1}</span>
        <span class="name"><strong>${esc(label.shortName)}</strong>${label.fullName ? `<small>${esc(label.fullName)}</small>` : ""}</span>
        <span>${recordHtml(team.W, team.L, team.D)}<span class="rate">${winRate(team.W, team.L, team.D)}</span></span>
      </a>`;
    })
    .join("");
}

function playerRows(list) {
  if (!list.length) return `<div class="empty">暂无选手数据</div>`;
  return list
    .map((player, index) => {
      const label = teamLabel(player.Ref, player.Name);
      return `<a class="row" href="#/players/${player.Unit_ID}">
        <span class="rank ${index < 3 ? "hot" : ""}">${index + 1}</span>
        <span class="name"><strong>${esc(label.shortName)}</strong>${label.fullName ? `<small>${esc(label.fullName)}</small>` : ""}</span>
        <span>${recordHtml(player.W, player.L, player.D)}<span class="rate">${winRate(player.W, player.L, player.D)}</span></span>
      </a>`;
    })
    .join("");
}

function scoreHtml(a, b) {
  const left = a > b ? "win" : a < b ? "lose" : "";
  const right = b > a ? "win" : b < a ? "lose" : "";
  return `<span class="score"><span class="${left}">${a ?? 0}</span> : <span class="${right}">${b ?? 0}</span></span>`;
}

function gameRows(list) {
  if (!list.length) return `<div class="empty">暂无比赛记录</div>`;
  return list
    .map((game) => {
      const left = teamLabel(game.U1Ref, game.U1Name);
      const right = teamLabel(game.U2Ref, game.U2Name);
      return `<a class="game" href="#/games/${game.Game_ID}">
        <strong>${esc(left.shortName)}</strong>
        <span>${scoreHtml(game.Point1, game.Point2)}<div class="rate">${esc(fmtDate(game.Date))}</div></span>
        <strong class="right">${esc(right.shortName)}</strong>
      </a>`;
    })
    .join("");
}

function searchBar(placeholder, value, action, extra) {
  return `<form class="search" data-nav="${esc(action)}" data-extra="${esc(JSON.stringify(extra || {}))}">
    <input name="q" value="${esc(value)}" placeholder="${esc(placeholder)}" />
    <button class="btn" type="submit">搜索</button>
  </form>`;
}

async function pageHome() {
  return `
    <main class="splash">
      <img class="bg" src="${pic("podium", "images/podium.jpg")}" alt="荣光之巅" />
      <div class="veil"></div>
      <div class="inner">
        <div></div>
        <section>
          <div class="kicker">TEAM LEAGUE ARCHIVE</div>
          <h1>我爱星际争霸</h1>
          <p class="lead">国内民间星际争霸战队联赛资料馆。</p>
          <div class="stats">
            <div class="stat"><div class="l">参赛战队</div><div class="n">129</div></div>
            <div class="stat"><div class="l">参赛选手</div><div class="n">9713</div></div>
            <div class="stat"><div class="l">战队比赛记录</div><div class="n">5617</div></div>
            <div class="stat"><div class="l">个人比赛记录</div><div class="n">44877</div></div>
          </div>
        </section>
        <div>
          <a class="btn" href="#/league">进入资料馆</a>
          <p class="foot">STL我爱星际争霸 All Rights Reserved. <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">粤ICP备15065552号-1</a></p>
        </div>
      </div>
    </main>`;
}

async function pageLeague() {
  const [matchRes, topRes] = await Promise.all([
    api(`match/detail&id=${MATCH_ID}`),
    api(`unit/top&match_id=${MATCH_ID}`),
  ]);
  const match = matchRes.data.match || {};
  const top = topRes.data || {};
  const body = `
    <div class="stats">
      <div class="stat"><div class="l">参赛战队</div><div class="n">${esc(match.TotalTeam ?? "—")}</div></div>
      <div class="stat"><div class="l">参赛选手</div><div class="n">${esc(match.TotalPlayer ?? "—")}</div></div>
      <div class="stat"><div class="l">战队比赛记录</div><div class="n">${esc(match.TotalGame ?? "—")}</div></div>
      <div class="stat"><div class="l">个人比赛记录</div><div class="n">${SOLO_GAME_COUNT}</div></div>
    </div>
    <section class="panel"><div class="panel-h"><h2>战队榜</h2><a href="#/teams">全部</a></div>${teamRows((top.teams || []).slice(0, 8))}</section>
    <section class="panel"><div class="panel-h"><h2>选手榜</h2><a href="#/players">全部</a></div>${playerRows((top.players || []).slice(0, 8))}</section>
    <section class="panel"><div class="panel-h"><h2>赛事系统</h2><a href="#/events">全部赛事</a></div>
      <div class="match-card">除 STL 主赛事外，资料馆还收录其他赛事完整数据。</div>
    </section>`;
  return layout("league", { src: pic("stl_banner", "images/stl-banner.jpg"), kicker: "TEAM LEAGUE ARCHIVE", title: "中国星际战队联赛", hint: "民间星际争霸战队联赛资料馆" }, body);
}

async function pageEvents(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const res = await api(`match/list&page=${page}&size=24`);
  const list = res.data || [];
  const cards = list
    .map((match) => {
      const name = match.match_ID === 1 ? "STL 主赛事：" + (match.MatchName || "") : match.MatchName || "未命名赛事";
      const href = match.match_ID === 1 ? "#/league" : "#/events/" + match.match_ID;
      const meta = [
        match.MatchType === "Team" ? "战队赛" : "个人赛",
        match.TotalTeam ? match.TotalTeam + " 队" : "",
        match.TotalPlayer ? match.TotalPlayer + " 人" : "",
        match.TotalGame ? match.TotalGame + " 场" : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return `<a class="match-card" href="${href}"><strong>${esc(name)}</strong><small>${esc(meta)}</small></a>`;
    })
    .join("");
  const body = `<section class="panel"><div class="panel-h"><h2>全部赛事 · ${res.total || 0}</h2></div>
    <div class="grid-2">${cards || '<div class="empty">暂无赛事</div>'}</div>
    ${pager(page, res.total || 0, 24, (p) => "#/events" + qs({ page: p }))}
  </section>`;
  return layout("events", { src: pic("original", "images/original.jpg"), kicker: "EVENTS", title: "赛事系统", hint: "全部赛事完整数据" }, body);
}

async function pageEvent(id) {
  const [matchRes, topRes] = await Promise.all([
    api(`match/detail&id=${id}`),
    api(`unit/top&match_id=${id}`).catch(() => ({ data: { teams: [], players: [] } })),
  ]);
  const match = matchRes.data.match || {};
  const top = topRes.data || {};
  const body = `
    <div class="stats">
      <div class="stat"><div class="l">参赛战队</div><div class="n">${esc(match.TotalTeam ?? "—")}</div></div>
      <div class="stat"><div class="l">参赛选手</div><div class="n">${esc(match.TotalPlayer ?? "—")}</div></div>
      <div class="stat"><div class="l">比赛记录</div><div class="n">${esc(match.TotalGame ?? "—")}</div></div>
    </div>
    <div class="actions">
      <a class="btn" href="#/teams${qs({ match: id })}">战队 / 搜索</a>
      <a class="btn ghost" href="#/players${qs({ match: id })}">选手 / 搜索</a>
      <a class="btn ghost" href="#/games${qs({ match: id })}">比赛记录</a>
    </div>
    ${
      (top.teams || []).length
        ? `<section class="panel"><div class="panel-h"><h2>战队榜</h2><a href="#/teams${qs({ match: id })}">全部</a></div>${teamRows(top.teams.slice(0, 8))}</section>`
        : ""
    }
    ${
      (top.players || []).length
        ? `<section class="panel"><div class="panel-h"><h2>选手榜</h2><a href="#/players${qs({ match: id })}">全部</a></div>${playerRows(top.players.slice(0, 8))}</section>`
        : ""
    }`;
  return layout("events", { src: pic("original", "images/original.jpg"), kicker: match.MatchType === "Team" ? "TEAM EVENT" : "EVENT", title: match.MatchName || "赛事", hint: match.Description || "赛事完整数据" }, body);
}

async function pageTeams(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const match = Number(query.match) || MATCH_ID;
  const q = query.q || "";
  let route = `unit/list&match_id=${match}&type=team&page=${page}&size=30`;
  if (q) route += `&keyword=${encodeURIComponent(q)}`;
  const res = await api(route);
  const body = `
    ${searchBar("队伍名 / ID", q, "#/teams", { match })}
    <section class="panel"><div class="panel-h"><h2>${q ? "搜索「" + esc(q) + "」" : "战队榜"}</h2></div>
      ${teamRows(res.data || [])}
      ${pager(page, res.total || 0, 30, (p) => "#/teams" + qs({ page: p, q, match }))}
    </section>`;
  return layout("teams", { src: pic("reunion", "images/reunion.jpg"), kicker: "TEAMS", title: "战队", hint: "搜索战队，查看胜负平" }, body);
}

async function pagePlayers(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const match = Number(query.match) || MATCH_ID;
  const q = query.q || "";
  let route = `unit/list&match_id=${match}&type=player&page=${page}&size=30`;
  if (q) route += `&keyword=${encodeURIComponent(q)}`;
  const res = await api(route);
  const body = `
    ${searchBar("选手名 / ID", q, "#/players", { match })}
    <section class="panel"><div class="panel-h"><h2>${q ? "搜索「" + esc(q) + "」" : "选手榜"}</h2></div>
      ${playerRows(res.data || [])}
      ${pager(page, res.total || 0, 30, (p) => "#/players" + qs({ page: p, q, match }))}
    </section>`;
  return layout("players", { src: pic("cafe", "images/cafe.jpg"), kicker: "PLAYERS", title: "选手", hint: "搜索选手，查看个人战绩" }, body);
}

async function pageGames(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const match = Number(query.match) || MATCH_ID;
  const res = await api(`game/list&match_id=${match}&page=${page}`);
  const body = `<section class="panel"><div class="panel-h"><h2>对阵</h2></div>
    ${gameRows(res.data || [])}
    ${pager(page, res.total || 0, 20, (p) => "#/games" + qs({ page: p, match }))}
  </section>`;
  return layout("games", { src: pic("battle", "images/battle.jpg"), kicker: "MATCHES", title: "比赛", hint: "对阵记录与分局" }, body);
}

async function pageTeam(id) {
  const res = await api(`unit/detail&id=${id}`);
  const unit = res.data.unit || {};
  const players = res.data.players || [];
  const label = teamLabel(unit.Ref, unit.Name);
  const body = `
    <div class="stats">
      <div class="stat"><div class="l">胜</div><div class="n win">${unit.W ?? 0}</div></div>
      <div class="stat"><div class="l">负</div><div class="n lose">${unit.L ?? 0}</div></div>
      <div class="stat"><div class="l">平</div><div class="n draw">${unit.D ?? 0}</div></div>
      <div class="stat"><div class="l">队员</div><div class="n">${unit.PlayerCount ?? players.length}</div></div>
    </div>
    <div class="actions"><a class="btn ghost" href="#/teams">返回战队榜</a></div>
    <section class="panel"><div class="panel-h"><h2>队员</h2></div>${playerRows(players.slice(0, 40))}</section>`;
  return layout("teams", { src: pic("reunion", "images/reunion.jpg"), kicker: "TEAM", title: label.shortName, hint: label.fullName || unit.MatchName || "战队详情" }, body);
}

async function pagePlayer(id) {
  const res = await api(`unit/detail&id=${id}`);
  const unit = res.data.unit || {};
  const label = teamLabel(unit.Ref, unit.Name);
  const body = `
    <div class="stat3">
      <div class="stat"><div class="l">胜</div><div class="n win">${unit.W ?? 0}</div></div>
      <div class="stat"><div class="l">负</div><div class="n lose">${unit.L ?? 0}</div></div>
      <div class="stat"><div class="l">平</div><div class="n draw">${unit.D ?? 0}</div></div>
    </div>
    <div class="actions">
      ${unit.ParentUnit_ID ? `<a class="btn ghost" href="#/teams/${unit.ParentUnit_ID}">所属战队</a>` : ""}
      <a class="btn ghost" href="#/players">返回选手榜</a>
    </div>`;
  return layout("players", { src: pic("cafe", "images/cafe.jpg"), kicker: "PLAYER", title: label.shortName, hint: label.fullName || unit.MatchName || "选手详情" }, body);
}

async function pageGame(id) {
  const res = await api(`game/detail&id=${id}`);
  const game = res.data.game || {};
  const children = res.data.children || [];
  const left = teamLabel(game.U1Ref, game.U1Name);
  const right = teamLabel(game.U2Ref, game.U2Name);
  const body = `
    <div class="stats">
      <div class="stat"><div class="l">${esc(left.shortName)}</div><div class="n">${game.Point1 ?? 0}</div></div>
      <div class="stat"><div class="l">${esc(right.shortName)}</div><div class="n">${game.Point2 ?? 0}</div></div>
      <div class="stat"><div class="l">日期</div><div class="n" style="font-size:16px">${esc(fmtDate(game.Date))}</div></div>
    </div>
    <div class="actions">
      ${game.Unit1_ID ? `<a class="btn ghost" href="#/teams/${game.Unit1_ID}">查看主队</a>` : ""}
      ${game.Unit2_ID ? `<a class="btn ghost" href="#/teams/${game.Unit2_ID}">查看客队</a>` : ""}
      <a class="btn ghost" href="#/games">返回列表</a>
    </div>
    ${children.length ? `<section class="panel"><div class="panel-h"><h2>分局</h2></div>${gameRows(children)}</section>` : ""}`;
  return layout("games", { src: pic("battle", "images/battle.jpg"), kicker: "MATCH", title: game.GameName || "比赛", hint: game.ScheduleName || "" }, body);
}

async function render() {
  const { path, query } = parseHash();
  root.innerHTML = `<div class="loading">正在读取战绩…</div>`;
  try {
    if (path === "/" || path === "/home") root.innerHTML = await pageHome();
    else if (path === "/league") root.innerHTML = await pageLeague();
    else if (path === "/events") root.innerHTML = await pageEvents(query);
    else if (path.startsWith("/events/")) root.innerHTML = await pageEvent(path.split("/")[2]);
    else if (path === "/teams") root.innerHTML = await pageTeams(query);
    else if (path.startsWith("/teams/")) root.innerHTML = await pageTeam(path.split("/")[2]);
    else if (path === "/players") root.innerHTML = await pagePlayers(query);
    else if (path.startsWith("/players/")) root.innerHTML = await pagePlayer(path.split("/")[2]);
    else if (path === "/games") root.innerHTML = await pageGames(query);
    else if (path.startsWith("/games/")) root.innerHTML = await pageGame(path.split("/")[2]);
    else root.innerHTML = `<div class="error">页面不存在</div>`;
  } catch (err) {
    root.innerHTML = `<div class="error">${esc(err.message || "暂时读不到数据，请稍后重试")}</div>`;
  }
}

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.dataset.nav) return;
  event.preventDefault();
  const q = String(new FormData(form).get("q") || "");
  const extra = JSON.parse(form.dataset.extra || "{}");
  go(form.dataset.nav + qs({ ...extra, q, page: 1 }));
});

window.addEventListener("hashchange", render);
render();