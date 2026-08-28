(function (w) {
  const ON_SITE = /cnstl\.cn$/i.test(location.hostname);
  const API_BASE = ON_SITE ? "/app/api.ashx?r=" : "https://cnstl.cn/app/api.ashx?r=";
  const MATCH_ID = 1;
  const SOLO_GAME_COUNT = 44877;

  async function api(route) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      const res = await fetch(API_BASE + route, { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) throw new Error("暂时读不到数据，请稍后重试");
      const json = await res.json();
      if (json.code !== 0) throw new Error(json.msg || "暂时读不到数据，请稍后重试");
      return { data: json.data, total: json.total || 0 };
    } catch (err) {
      if (err && err.name === "AbortError") throw new Error("请求超时，请稍后重试");
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtDate(value) {
    if (!value) return "";
    const match = /Date\((\d+)\)/.exec(String(value));
    if (match) return new Date(Number(match[1])).toLocaleDateString("zh-CN");
    return String(value).slice(0, 10);
  }

  function teamLabel(ref, name) {
    const shortName = ref || name || "未命名";
    const fullName = name && name !== ref ? name : "";
    return { shortName, fullName };
  }

  function winRate(w, l, d) {
    const total = (w || 0) + (l || 0) + (d || 0);
    if (!total) return "0.0%";
    return (((w || 0) / total) * 100).toFixed(1) + "%";
  }

  function recordHtml(w, l, d) {
    return (
      '<span class="wl">' +
      '<b class="win">' +
      (w || 0) +
      "胜</b> <b class=\"lose\">" +
      (l || 0) +
      "负</b> <b class=\"draw\">" +
      (d || 0) +
      "平</b></span>"
    );
  }

  w.STL = { api, esc, fmtDate, teamLabel, winRate, recordHtml, MATCH_ID, SOLO_GAME_COUNT };
})(window);