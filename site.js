/* Invatek shared script: install button on every page, and drag-to-reorder for tabs. */
(function () {
  "use strict";
  var D = document, W = window;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  var css = D.createElement("style");
  css.textContent =
    ".ivm{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center;padding:0}" +
    "@media(min-width:600px){.ivm{align-items:center;padding:20px}}" +
    ".ivc{background:var(--surface);color:var(--fg);width:100%;max-width:460px;border-radius:20px 20px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:12px;max-height:88vh;overflow:auto;box-shadow:0 -8px 40px rgba(0,0,0,.25)}" +
    "@media(min-width:600px){.ivc{border-radius:20px}}" +
    ".ivc h2{margin:0;font-family:var(--font-display);font-size:22px;letter-spacing:-.02em}" +
    ".ivc ol{margin:0;padding-left:22px;display:flex;flex-direction:column;gap:8px}" +
    ".ivc p{margin:0;color:var(--muted);font-size:14px}" +
    ".ivc .row{display:flex;gap:8px;justify-content:flex-end;margin-top:4px}" +
    ".dragtip{margin:-6px 0 0;font-size:13px;color:var(--muted)}" +
    ".dragtip button{background:none;border:none;padding:0 2px;color:var(--accent);font-weight:700;text-decoration:underline;font-size:13px}" +
    ".sortable>*{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}" +
    ".sortable .ph{opacity:.35;outline:2px dashed var(--accent);outline-offset:-2px}" +
    ".dragghost{position:fixed;z-index:400;pointer-events:none;margin:0!important;opacity:.96;transform:scale(1.06);box-shadow:0 10px 28px rgba(0,0,0,.28);border-radius:14px}" +
    "#installBtn{white-space:nowrap}@media(max-width:480px){#installBtn{padding:7px 10px;font-size:13px}}";
  D.head.appendChild(css);

  /* ---------- install the app ---------- */
  var btn = D.getElementById("installBtn"), evt = null;
  function installed() {
    return (W.matchMedia && matchMedia("(display-mode: standalone)").matches) || W.navigator.standalone === true;
  }
  function closeModal() { var m = D.getElementById("ivm"); if (m) { m.remove(); D.body.style.overflow = ""; } }
  function help() {
    var ua = navigator.userAgent || "", steps, note = "";
    var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var inApp = /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|; wv\)/.test(ua);
    if (ios) {
      if (/CriOS|FxiOS|EdgiOS/.test(ua)) steps = ["Open invatek.in in <b>Safari</b>.", "Tap the <b>Share</b> button (a square with an arrow).", "Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>."];
      else steps = ["Tap the <b>Share</b> button at the bottom (a square with an arrow).", "Scroll down and tap <b>Add to Home Screen</b>.", "Tap <b>Add</b>. Invatek now opens like an app."];
    } else if (inApp) {
      steps = ["This page is open inside another app, which cannot install websites.", "Tap the menu (three dots) and choose <b>Open in Chrome</b> or <b>Open in browser</b>.", "In Chrome, tap this Install button again."];
    } else if (/Android/.test(ua)) {
      steps = ["Tap the menu (<b>three dots</b>) at the top right of Chrome.", "Tap <b>Install app</b> or <b>Add to Home screen</b>.", "Tap <b>Install</b>. The icon appears with your other apps."];
      note = "If you do not see the option, close this tab, open invatek.in again and use the site for a few seconds first.";
    } else if (/Edg\//.test(ua)) {
      steps = ["Click the <b>three dots</b> menu at the top right of Edge.", "Choose <b>Apps</b>, then <b>Install this site as an app</b>.", "Click <b>Install</b>."];
    } else if (/Chrome\//.test(ua)) {
      steps = ["Look at the right end of the address bar for the <b>install icon</b> (a small screen with a down arrow). Click it.", "Or open the <b>three dots</b> menu and choose <b>Install Invatek</b> (under Cast, save and share).", "Click <b>Install</b>."];
    } else {
      steps = ["This browser cannot install web apps.", "Open invatek.in in <b>Chrome</b> or <b>Edge</b>, then use this button again."];
    }
    closeModal();
    var m = D.createElement("div"); m.className = "ivm"; m.id = "ivm"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "Install Invatek");
    m.innerHTML = '<div class="ivc"><h2>Install Invatek</h2><ol>' + steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +
      "<p>" + (note ? note + " " : "") + "Already installed? Open Invatek from your home screen or app list.</p>" +
      '<div class="row"><button type="button" class="btn" id="ivmClose">Got it</button></div></div>';
    D.body.appendChild(m); D.body.style.overflow = "hidden";
    m.addEventListener("click", function (e) { if (e.target === m) closeModal(); });
    D.getElementById("ivmClose").addEventListener("click", closeModal);
  }
  if (btn && !installed()) {
    W.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); evt = e; btn.hidden = false; });
    W.addEventListener("appinstalled", function () { evt = null; btn.hidden = true; });
    btn.hidden = false;
    if (W.innerWidth <= 400) btn.textContent = "Install";
    btn.addEventListener("click", function () {
      if (!evt) { help(); return; }
      var e = evt; evt = null;
      try {
        e.prompt();
        e.userChoice.then(function (c) { if (c && c.outcome === "accepted") btn.hidden = true; }).catch(function () {});
      } catch (x) { help(); }
    });
  }
  D.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    W.addEventListener("load", function () { try { navigator.serviceWorker.register("/sw.js"); } catch (e) {} });
  }

  /* ---------- drag to reorder ---------- */
  var state = null, suppress = false, guardOn = false;
  function nodes(cont, sel) { return [].slice.call(cont.children).filter(function (n) { return n.matches(sel); }); }
  function applyOrder(cfg, ids) {
    var all = nodes(cfg.cont, cfg.sel), fixed = all.filter(function (n) { return n.matches(cfg.fixed || "x-none"); });
    var mv = all.filter(function (n) { return fixed.indexOf(n) < 0; });
    var pos = {}; ids.forEach(function (id, i) { pos[id] = i; });
    mv = mv.map(function (n, i) { return { n: n, k: pos.hasOwnProperty(cfg.id(n)) ? pos[cfg.id(n)] : 1000 + i }; }).sort(function (a, b) { return a.k - b.k; });
    fixed.forEach(function (n) { cfg.cont.appendChild(n); });
    mv.forEach(function (o) { cfg.cont.appendChild(o.n); });
  }
  function ids(cfg) { return nodes(cfg.cont, cfg.sel).filter(function (n) { return !n.matches(cfg.fixed || "x-none"); }).map(cfg.id); }
  function save(cfg) { lsSet(cfg.key, JSON.stringify(ids(cfg))); if (cfg.after) cfg.after(); }

  function sortable(cfg) {
    var cont = cfg.cont; if (!cont || cont.__sort) return; cont.__sort = cfg;
    cont.classList.add("sortable");
    cfg.original = ids(cfg);
    try { var s = JSON.parse(lsGet(cfg.key) || "null"); if (s && s.length) applyOrder(cfg, s); } catch (e) {}
    nodes(cont, cfg.sel).forEach(function (n) { n.setAttribute("draggable", "false"); });
    cont.addEventListener("dragstart", function (e) { e.preventDefault(); });
    cont.addEventListener("contextmenu", function (e) { if (state && state.on) e.preventDefault(); });
    cont.addEventListener("pointerdown", function (e) {
      if (e.button > 0 || state) return;
      var it = e.target.closest(cfg.sel); if (!it || it.parentNode !== cont || it.matches(cfg.fixed || "x-none")) return;
      state = { cfg: cfg, it: it, id: e.pointerId, x: e.clientX, y: e.clientY, on: false, touch: e.pointerType !== "mouse", t: null, ghost: null, ox: 0, oy: 0 };
      if (state.touch) { var st = state; st.t = setTimeout(function () { if (state === st) begin(); }, 330); }
    });
    cont.addEventListener("click", function (e) { if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; } }, true);
    cont.addEventListener("keydown", function (e) {
      if (!e.altKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      var it = e.target.closest(cfg.sel); if (!it || it.matches(cfg.fixed || "x-none")) return;
      var list = nodes(cont, cfg.sel).filter(function (n) { return !n.matches(cfg.fixed || "x-none"); }), i = list.indexOf(it);
      var j = e.key === "ArrowLeft" ? i - 1 : i + 1; if (j < 0 || j >= list.length) return;
      e.preventDefault();
      if (j < i) cont.insertBefore(it, list[j]); else cont.insertBefore(it, list[j].nextSibling);
      save(cfg); it.focus();
    });
  }
  function begin() {
    var s = state; if (!s || s.on) return; s.on = true;
    if (s.t) { clearTimeout(s.t); s.t = null; }
    var r = s.it.getBoundingClientRect();
    s.ox = s.x - r.left; s.oy = s.y - r.top;
    var g = s.it.cloneNode(true); g.removeAttribute("id"); g.className = (s.it.className || "") + " dragghost"; g.style.width = r.width + "px"; g.style.height = r.height + "px";
    g.style.left = r.left + "px"; g.style.top = r.top + "px"; g.setAttribute("aria-hidden", "true"); g.removeAttribute("href");
    D.body.appendChild(g); s.ghost = g; s.it.classList.add("ph");
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
  }
  function cancelPending() { if (state && state.t) clearTimeout(state.t); if (state && !state.on) state = null; }
  function move(e) {
    var s = state, cfg = s.cfg, cont = cfg.cont;
    s.ghost.style.left = (e.clientX - s.ox) + "px"; s.ghost.style.top = (e.clientY - s.oy) + "px";
    s.ghost.style.display = "none";
    var el = D.elementFromPoint(e.clientX, e.clientY); s.ghost.style.display = "";
    var over = el && el.closest ? el.closest(cfg.sel) : null;
    if (!over || over === s.it || over.parentNode !== cont || over.matches(cfg.fixed || "x-none")) return;
    var r = over.getBoundingClientRect(), after = !!(s.it.compareDocumentPosition(over) & 4);
    var sr = s.it.getBoundingClientRect(), sameRow = Math.abs((sr.top + sr.height / 2) - (r.top + r.height / 2)) < r.height / 2;
    var past = sameRow ? (after ? e.clientX > r.left + r.width / 2 : e.clientX < r.left + r.width / 2)
                       : true;
    if (!past) return;
    if (after) cont.insertBefore(s.it, over.nextSibling); else cont.insertBefore(s.it, over);
  }
  function finish(ok) {
    var s = state; if (!s) return; state = null;
    if (s.t) clearTimeout(s.t);
    if (s.ghost) s.ghost.remove();
    s.it.classList.remove("ph");
    if (s.on) {
      suppress = true; setTimeout(function () { suppress = false; }, 400);
      if (ok) save(s.cfg);
    }
  }
  function guard() {
    if (guardOn) return; guardOn = true;
    D.addEventListener("pointermove", function (e) {
      var s = state; if (!s || e.pointerId !== s.id) return;
      var d = Math.abs(e.clientX - s.x) + Math.abs(e.clientY - s.y);
      if (!s.on) {
        if (s.touch) { if (d > 10) cancelPending(); return; }
        if (d > 6) begin(); else return;
      }
      e.preventDefault(); move(e);
    }, { passive: false });
    D.addEventListener("pointerup", function (e) { if (state && e.pointerId === state.id) finish(true); });
    D.addEventListener("pointercancel", function (e) { if (state && e.pointerId === state.id) finish(state.on); });
    D.addEventListener("touchmove", function (e) { if (state && state.on && e.cancelable) e.preventDefault(); }, { passive: false });
  }
  function pathId(n) { var h = n.getAttribute("href") || ""; return h.replace(/[?#].*$/, "") || "/"; }

  function init() {
    guard();
    try { var vs = D.createElement("p"); vs.style.cssText = "text-align:center;font-size:11px;color:var(--muted);margin:8px 0 70px"; vs.textContent = "Site version 11"; (D.querySelector(".wrap") || D.body).appendChild(vs); } catch (e) {}
    var main = [D.querySelector(".modetabs"), D.getElementById("tabbar2")].filter(Boolean);
    var cfgs = main.map(function (c) { return { cont: c, sel: "a", key: "inv-order-main", id: pathId }; });
    cfgs.forEach(function (cfg) {
      cfg.after = function () { cfgs.forEach(function (o) { if (o !== cfg) applyOrder(o, ids(cfg)); }); };
      sortable(cfg);
    });
    if (cfgs.length > 1 && lsGet("inv-order-main")) { try { applyOrder(cfgs[1], JSON.parse(lsGet("inv-order-main"))); } catch (e) {} }
    var cats = D.querySelector(".cats");
    if (cats) {
      var cc = { cont: cats, sel: ".chip", fixed: '[data-cat="all"]', key: "inv-order-cats", id: function (n) { return n.getAttribute("data-cat"); } };
      sortable(cc);
      var tip = D.createElement("p"); tip.className = "dragtip";
      tip.innerHTML = 'Tip: press and hold a category (or the PDF tools / Invoice tab), then drag it where you like. <button type="button">Reset order</button>';
      cats.parentNode.insertBefore(tip, cats.nextSibling);
      tip.querySelector("button").addEventListener("click", function () {
        lsDel("inv-order-cats"); lsDel("inv-order-main");
        applyOrder(cc, cc.original);
        cfgs.forEach(function (c) { applyOrder(c, c.original); });
      });
    }
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", init); else init();
})();
