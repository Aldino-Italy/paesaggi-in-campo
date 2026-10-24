/* Paesaggi in campo. Applicazione di campo per le escursioni del corso
   «Analisi e interpretazione dei paesaggi naturali» (DiSSGeA, Università di Padova).
   Single-page app senza dipendenze oltre Leaflet. */
(function () {
"use strict";

/* ------------------------------------------------------------------ utilità */
const D = window.DATA, EX = { vajont: D.vajont, carso: D.carso };
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>");
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "html") e.innerHTML = attrs[k];
    else if (k === "on") for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]);
    else if (k === "cls") e.className = attrs[k];
    else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  }
  for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
}
const store = {
  get(k, d) { try { const v = localStorage.getItem("pic." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("pic." + k, JSON.stringify(v)); } catch (e) {} }
};
const R = 6371000;
function haversine(a, b) {
  const toR = Math.PI / 180, dLat = (b[0] - a[0]) * toR, dLon = (b[1] - a[1]) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a, b) {
  const toR = Math.PI / 180, f1 = a[0] * toR, f2 = b[0] * toR, dl = (b[1] - a[1]) * toR;
  const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
const fmtDist = m => m < 1000 ? Math.round(m) + " m" : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace(".", ",") + " km";
const fmtAz = d => Math.round(d).toString().padStart(3, "0") + "°";
const cardinal = d => ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"][Math.round(d / 22.5) % 16];
const figById = (ex, id) => ex.figures.find(f => f.id === id);
const figNum = (ex, id) => ex.figures.findIndex(f => f.id === id) + 1;
let toastTimer;
function toast(msg, btn, fn, ms) {
  const t = $("#toast"); t.innerHTML = esc(msg);
  if (btn) t.append(el("button", { on: { click: () => { t.classList.remove("on"); fn && fn(); } } }, btn));
  t.classList.add("on"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), ms || (btn ? 9000 : 3500));
}
const SVG = {
  gps: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/></svg>',
  legend: '<svg viewBox="0 0 24 24"><path d="M4 6h4M4 12h4M4 18h4M11 6h9M11 12h9M11 18h9"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 3v12M6 9l6 6 6-6M4 21h16"/></svg>',
  bus: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v3M16 18v3M8 14h.01M16 14h.01"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  pdf: '<svg viewBox="0 0 24 24"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/></svg>',
  fit: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
};

/* ------------------------------------------------------------------ geolocalizzazione */
const Geo = {
  pos: null, acc: null, heading: null, speed: null, compass: null, watchId: null, listeners: new Set(), headFns: new Set(), err: null, compassOn: false, compassState: "off", compassAbs: false, _sx: 0, _sy: 0, _emitT: 0, aos: null, absT: 0,
  diag: { abs: 0, absNull: 0, rel: 0, relAbs: 0, wk: 0, aos: 0, aosErr: "", perm: "", src: "", last: null },
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  onHeading(fn) { this.headFns.add(fn); return () => this.headFns.delete(fn); },
  emit() { this.listeners.forEach(f => { try { f(this); } catch (e) { console.error(e); } }); },
  start() {
    if (this.watchId != null || !navigator.geolocation) return;
    this.watchId = navigator.geolocation.watchPosition(p => {
      this.pos = [p.coords.latitude, p.coords.longitude]; this.acc = p.coords.accuracy; this.err = null;
      if (p.coords.heading != null && !isNaN(p.coords.heading) && p.coords.speed > 0.8) this.heading = p.coords.heading;
      this.speed = p.coords.speed; this.emit(); Fence.check();
    }, e => { this.err = e; this.emit(); }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
    this.startCompass();
    $("#btnGps").style.color = "var(--red)";
  },
  stop() { if (this.watchId != null) navigator.geolocation.clearWatch(this.watchId); this.watchId = null; $("#btnGps").style.color = ""; this.emit(); },
  active() { return this.watchId != null; },
  // bussola: le letture (fino a 60 al secondo) vanno solo a chi disegna la direzione; le altre viste si aggiornano al massimo una volta al secondo
  // direzione verso cui guarda il telefono: il lato alto dello schermo quando è piatto, la fotocamera posteriore quando è in piedi;
  // si calcola dalla matrice di rotazione (alpha, beta, gamma) e resta stabile anche col telefono inclinato, dove 360 - alpha sbaglia
  headingFromAxes(X, Y, Z) {
    const so = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * Math.PI / 180;
    const ux = Math.cos(so) * Y[0] + Math.sin(so) * X[0], uy = Math.cos(so) * Y[1] + Math.sin(so) * X[1];
    const E = ux - Z[0], N = uy - Z[1]; if (Math.hypot(E, N) < 0.15) return null;
    return (Math.atan2(E, N) * 180 / Math.PI + 360) % 360;
  },
  headingFromEuler(al, be, ga) {
    const d = Math.PI / 180, cA = Math.cos(al * d), sA = Math.sin(al * d), cB = Math.cos(be * d), sB = Math.sin(be * d), cG = Math.cos(ga * d), sG = Math.sin(ga * d);
    return this.headingFromAxes([cA * cG - sA * sB * sG, cG * sA + cA * sB * sG, -cB * sG], [-cB * sA, cA * cB, sB], [cG * sA * sB + cA * sG, sA * sG - cA * cG * sB, cB * cG]);
  },
  headingFromQuat(q) {
    const [x, y, z, w] = q;
    return this.headingFromAxes([1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)], [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)], [2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)]);
  },
  feedHeading(hd, src) {
    const r = hd * Math.PI / 180;
    // smorzamento a tempo: il tremolio sparisce in circa due decimi di secondo, e dopo una pausa nelle letture la rosa salta subito al valore nuovo
    const now0 = performance.now(), dt = (now0 - (this._ht || 0)) / 1000; this._ht = now0;
    const k = this.compass == null || dt > 0.6 ? 1 : 1 - Math.exp(-dt / 0.12);
    this._sx = this._sx * (1 - k) + Math.sin(r) * k; this._sy = this._sy * (1 - k) + Math.cos(r) * k;
    this.compass = (Math.atan2(this._sx, this._sy) * 180 / Math.PI + 360) % 360; this.compassState = "ok"; this.diag.src = src;
    this.headFns.forEach(f => { try { f(this); } catch (err) { console.error(err); } });
    const now = Date.now(); if (now - this._emitT > 1000) { this._emitT = now; this.emit(); }
  },
  startCompass(gesture) {
    const needPerm = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
    const D = this.diag, setState = st => { this.compassState = st; this.headFns.forEach(f => { try { f(this); } catch (err) {} }); };
    // ricevitori sempre attivi: eventi di orientamento assoluto (Chrome), bussola di Safari, e in riserva il sensore di orientamento assoluto
    if (!this.compassOn) {
      this.compassOn = true; setState("wait");
      const onAbs = e => {
        if (e.alpha == null) { D.absNull++; return; }
        D.abs++; D.last = [e.alpha, e.beta, e.gamma]; this.compassAbs = true; this.absT = Date.now(); this.rawSig(e.alpha.toFixed(4) + e.beta + e.gamma);
        const hd = this.headingFromEuler(e.alpha, e.beta || 0, e.gamma || 0); D.evHd = hd; if (hd != null) this.feedHeading(hd, "evento assoluto");
      };
      const onRel = e => {
        if (e.webkitCompassHeading != null && !isNaN(e.webkitCompassHeading) && e.webkitCompassHeading >= 0) {
          D.wk++; const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0; this.feedHeading((e.webkitCompassHeading + so) % 360, "bussola di Safari"); return;
        }
        if (e.alpha == null) return;
        if (e.absolute === true) { D.relAbs++; onAbs({ alpha: e.alpha, beta: e.beta, gamma: e.gamma }); return; }
        D.rel++; D.relLast = [e.alpha, e.beta, e.gamma]; if (!this.compassAbs && this.compassState === "wait") setState("rel");
      };
      this._onAbs = onAbs; this._onRel = onRel; this.attachCompass();
      setTimeout(() => { if (this.compassState === "wait") setState(needPerm && !gesture ? "perm" : "none"); }, 4000);
    } else if (gesture) this.startAOS(true);
    if (!needPerm || this.compassState === "ok") return;
    // la richiesta chiede anche il magnetometro (absolute = true); su iPhone il parametro viene ignorato
    const fail = () => { if (this.compassState !== "ok") setState(gesture ? (this.compassState === "rel" ? "rel" : "denied") : "perm"); };
    try { DeviceOrientationEvent.requestPermission(true).then(st => { D.perm = st; if (st !== "granted") setTimeout(fail, 600); else if (gesture) this.startAOS(true); }).catch(err => { D.perm = "errore " + (err && err.name || ""); setTimeout(fail, 600); }); } catch (e) { fail(); }
  },
  // dopo un passaggio in secondo piano alcuni telefoni non riprendono a mandare letture finché la pagina non si ricarica:
  // i ricevitori si staccano e si riattaccano, che equivale a riaccendere i sensori
  attachCompass() {
    if ("ondeviceorientationabsolute" in window) window.addEventListener("deviceorientationabsolute", this._onAbs, true);
    window.addEventListener("deviceorientation", this._onRel, true);
    this.startAOS(true); this._rawT = performance.now();
  },
  restartCompass() {
    if (!this.compassOn || !this._onAbs) return;
    window.removeEventListener("deviceorientationabsolute", this._onAbs, true); window.removeEventListener("deviceorientation", this._onRel, true);
    if (this.aos) { try { this.aos.stop(); } catch (e) {} this.aos = null; }
    this.diag.restarts = (this.diag.restarts || 0) + 1; setTimeout(() => this.attachCompass(), 150);
  },
  rawSig(s) { if (s !== this._sig) { this._sig = s; this._rawT = performance.now(); } },
  startAOS(retry) {
    if (typeof AbsoluteOrientationSensor !== "function" || (this.aos && !retry)) return;
    try {
      if (this.aos) { try { this.aos.stop(); } catch (e) {} }
      const s = new AbsoluteOrientationSensor({ frequency: 30, referenceFrame: "device" });
      s.addEventListener("reading", () => {
        this.diag.aos++; if (!s.quaternion) return; this.diag.aosHd = this.headingFromQuat(s.quaternion); this.rawSig(s.quaternion.map(v => v.toFixed(6)).join());
        // il sensore serve solo se gli eventi assoluti non arrivano
        if (Date.now() - this.absT < 1500) return;
        const hd = this.headingFromQuat(s.quaternion); if (hd != null) this.feedHeading(hd, "sensore di orientamento");
      });
      s.addEventListener("error", e => { this.diag.aosErr = (e.error && (e.error.name + " " + (e.error.message || ""))) || "errore"; });
      s.start(); this.aos = s;
    } catch (e) { this.diag.aosErr = e.name || "non disponibile"; }
  },
  bestHeading() { return this.compass != null ? this.compass : this.heading; }
};

/* geofence sulle tappe e sulle letture dal finestrino */
const Fence = {
  last: {}, check() {
    const ex = cur.ex; if (!ex || !Geo.pos) return;
    const now = Date.now();
    for (const s of ex.stops) {
      const d = haversine(Geo.pos, s.coords);
      if (d <= s.radius && now - (this.last["s" + s.id] || 0) > 15 * 60000) {
        this.last["s" + s.id] = now; alertUser("Tappa " + s.n, "Sei alla tappa " + s.n + ", " + s.name, "#/" + ex.id + "/tappa/" + s.n);
        toast("Sei alla tappa " + s.n + ", " + s.name, "Apri", () => go("#/" + ex.id + "/tappa/" + s.n), 12000);
      }
    }
    if (store.get("bus", false)) ex.windows.forEach((w, i) => {
      const d = haversine(Geo.pos, w.coords);
      if (d <= w.radius && now - (this.last["w" + i] || 0) > 30 * 60000) {
        this.last["w" + i] = now; alertUser("Dal finestrino", w.name, "#/" + ex.id + "/finestrino/" + i);
        toast("Dal finestrino: " + w.name, "Leggi", () => go("#/" + ex.id + "/finestrino/" + i), 15000);
      }
    });
  }
};
let wl = null;
async function wakeLock(on) { try { if (on && "wakeLock" in navigator && !wl) { wl = await navigator.wakeLock.request("screen"); wl.addEventListener("release", () => { wl = null; }); } else if (!on && wl) { await wl.release(); wl = null; } } catch (e) {} }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && (MapCtl.follow || busMode()) && !wl) wakeLock(true); });
const vibrate = () => { try { navigator.vibrate && navigator.vibrate([80, 60, 80]); } catch (e) {} };
// segnale acustico generato con Web Audio: il contesto audio si sblocca al primo tocco sullo schermo, come richiesto dai browser.
// Toni fra 1 e 3 kHz, la banda in cui l'altoparlante del telefono rende di più; tre coppie «din-don» passano per un compressore che alza il volume percepito senza distorcere.
const Chime = {
  ctx: null, comp: null,
  unlock() { try { if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; this.ctx = new C(); } if (this.ctx.state !== "running") this.ctx.resume().then(() => SoundBar.check()).catch(() => {}); } catch (e) {} },
  ready() { return !!(this.ctx && this.ctx.state === "running"); },
  play() {
    try {
      this.unlock(); const c = this.ctx; if (!c) return false;
      // su iPhone la categoria «playback» fa suonare l'avviso anche con l'interruttore del silenzioso attivo
      try { if (navigator.audioSession) { navigator.audioSession.type = "playback"; setTimeout(() => { try { navigator.audioSession.type = "auto"; } catch (e) {} }, 3000); } } catch (e) {}
      if (!this.comp) { this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -18; this.comp.knee.value = 6; this.comp.ratio.value = 10; this.comp.attack.value = 0.002; this.comp.release.value = 0.15; const g = c.createGain(); g.gain.value = 1.6; this.comp.connect(g); g.connect(c.destination); }
      const t0 = c.currentTime + 0.05;
      [0, 0.75, 1.5].forEach(rep => [[1318.5, 0], [1046.5, 0.2]].forEach(([f, dt]) => {
        const at = t0 + rep + dt, g = c.createGain();
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.8, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
        [[f, "triangle", 1], [f * 2, "sine", 0.35]].forEach(([fr, ty, lv]) => { const o = c.createOscillator(), og = c.createGain(); o.type = ty; o.frequency.value = fr; og.gain.value = lv; o.connect(og); og.connect(g); o.start(at); o.stop(at + 0.55); });
        g.connect(this.comp);
      }));
      return c.state === "running";
    } catch (e) { return false; }
  }
};
// notifica di sistema: suona con il volume delle notifiche, quindi si sente anche se il volume multimediale è basso
const Notify = {
  can() { return "Notification" in window && "serviceWorker" in navigator; },
  ask() { try { if (this.can() && Notification.permission === "default") return Notification.requestPermission().then(() => SoundBar.check()); } catch (e) {} return Promise.resolve(); },
  show(title, body, hash) {
    try { if (!this.can() || Notification.permission !== "granted") return; navigator.serviceWorker.ready.then(reg => reg.showNotification(title, { body, tag: "pic-avviso", renotify: true, icon: "icons/icon-192.png", badge: "icons/icon-192.png", vibrate: [200, 100, 200, 100, 200], data: { hash } })).catch(() => {}); } catch (e) {}
  }
};
// barra in alto: compare in modalità pullman quando il browser tiene ancora spento l'audio, e un tocco lo attiva
const SoundBar = {
  bar: null,
  check() {
    const need = busMode() && !Chime.ready();
    if (need && !this.bar) { this.bar = el("button", { id: "sndbar", on: { click: () => { Chime.unlock(); Notify.ask(); setTimeout(() => { if (Chime.ready()) Chime.play(); this.check(); }, 250); } } }, "Tocca qui per attivare il suono degli avvisi del pullman"); document.body.append(this.bar); }
    else if (!need && this.bar) { this.bar.remove(); this.bar = null; }
  }
};
["visibilitychange", "focus", "pageshow"].forEach(ev => window.addEventListener(ev, () => { if (document.visibilityState === "visible" && Geo.compassOn) Geo.restartCompass(); }));
setInterval(() => { if (Geo.compassOn && Geo.headFns.size && document.visibilityState === "visible" && performance.now() - (Geo._rawT || 0) > 4000) { Geo._rawT = performance.now(); Geo.restartCompass(); } }, 2000);
const busMode = () => store.get("bus", false);
const alertUser = (title, body, hash) => { vibrate(); if (busMode()) { Chime.play(); Notify.show(title, body, hash); SoundBar.check(); } };
["pointerdown", "touchend", "keydown"].forEach(ev => document.addEventListener(ev, () => { if (busMode() && !Chime.ready()) Chime.unlock(); }, true));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && busMode()) { Chime.unlock(); setTimeout(() => SoundBar.check(), 600); } });

/* ------------------------------------------------------------------ router */
const cur = { ex: null, page: "home", arg: null, exId: store.get("lastEx", null) };
const go = h => { location.hash = h; };
window.addEventListener("hashchange", render);
$("#btnBack").addEventListener("click", () => { if (history.length > 1) history.back(); else go("#/"); });
$("#btnGps").addEventListener("click", () => { if (Geo.active()) { Geo.stop(); toast("Posizione disattivata"); } else { Geo.start(); toast("Posizione attiva"); } });

function setNav(exId, page) {
  document.querySelectorAll("#nav a").forEach(a => {
    const t = a.dataset.tab; a.classList.toggle("on", t === page || (t === "home" && page === "home" && !exId) || (t === "tappe" && (page === "tappa" || page === "finestrino")) || (t === "guida" && ["figure", "glossario", "domande", "testi", "cronologia"].includes(page)) || (t === "altro" && ["taccuino", "docente", "info", "controllo", "installa"].includes(page)));
    if (t !== "home") a.href = exId ? "#/" + exId + "/" + t : (t === "altro" ? "#/altro" : "#/");
  });
}
function setTitle(t, s) { $("#ttl").textContent = t; $("#sub").textContent = s || ""; }

function render() {
  while (leaveFns.length) { try { leaveFns.pop()(); } catch (e) {} }
  const parts = (location.hash || "#/").slice(2).split("/").filter(Boolean);
  let exId = null, page = "home", arg = null;
  if (EX[parts[0]]) { exId = parts[0]; page = parts[1] || "home"; arg = parts[2]; } else { page = parts[0] || "home"; arg = parts[1]; }
  cur.ex = exId ? EX[exId] : null; cur.page = page; cur.arg = arg; if (exId) { cur.exId = exId; store.set("lastEx", exId); }
  const v = $("#view"); v.classList.remove("full"); v.scrollTop = 0;
  if (page !== "mappa" && MapCtl.map) MapCtl.detach();
  v.innerHTML = "";
  setNav(exId || cur.exId, page);
  $("#btnBack").style.visibility = (page === "home" && !exId) ? "hidden" : "visible";
  const ex = cur.ex;
  const views = {
    home: () => ex ? exHome(ex) : home(),
    mappa: () => ex ? MapCtl.show(ex, arg) : home(),
    tappe: () => ex ? stopsView(ex) : home(),
    tappa: () => ex ? stopView(ex, +arg) : home(),
    finestrino: () => ex ? windowView(ex, +arg) : home(),
    guida: () => ex ? guideView(ex) : home(),
    testi: () => ex ? guideView(ex) : home(),
    figure: () => ex ? figuresView(ex, arg) : home(),
    glossario: () => ex ? glossaryView(ex) : home(),
    domande: () => ex ? questionsView(ex) : home(),
    cronologia: () => ex ? timelineView(ex) : home(),
    strumenti: () => ex ? toolsView(ex, arg) : home(),
    taccuino: () => notebookView(ex),
    docente: () => ex ? teacherView(ex) : home(),
    altro: () => moreView(ex),
    info: () => controlloView(),
    controllo: () => controlloView(),
    installa: () => installView()
  };
  (views[page] || views.home)();
}

/* ------------------------------------------------------------------ pagine */
function page(...kids) { const p = el("div", { cls: "page" }, ...kids); $("#view").append(p); return p; }

function home() {
  setTitle("Paesaggi in campo", "Analisi e interpretazione dei paesaggi naturali");
  const p = page(
    el("div", { cls: "brand" }, el("div", { cls: "logo", html: '<svg viewBox="0 0 24 24"><path d="M3 17l5-8 4 6 3-4 6 6"/><path d="M3 21c3-2 6-2 9 0s6 2 9 0"/></svg>' }), el("div", null, el("h1", null, "Paesaggi in campo"), el("p", null, "Guide di campo del corso, DiSSGeA, Università di Padova"))),
    el("p", { cls: "lead" }, "Scegli l'escursione. La carta segue la tua posizione, le schede delle tappe si aprono da sole quando arrivi e tutto resta disponibile anche senza rete, se prima prepari l'uso offline.")
  );
  for (const k of ["vajont", "carso"]) {
    const ex = EX[k];
    p.append(el("a", { cls: "hero", href: "#/" + k, style: "display:block;text-decoration:none" }, el("img", { src: ex.cover, alt: "" }), el("div", { cls: "txt" }, el("b", null, ex.title), el("span", null, ex.subtitle))));
  }
  p.append(el("div", { cls: "card" }, el("h3", null, "Prima di partire"),
    el("ol", { cls: "small", style: "padding-left:1.2em;margin:0 0 10px" }, el("li", null, "Installa l'app sul telefono o sul tablet seguendo le istruzioni per il tuo browser."), el("li", null, "Aprila dall'icona e fai il «Controllo di partenza»: consenti la posizione e scarica carte, figure e audio per l'uso senza rete."), el("li", null, "Quando il riquadro in fondo al controllo è verde, il telefono è pronto per l'escursione.")),
    el("div", { cls: "row wrap" }, el("a", { cls: "btn sm primary", href: "#/installa" }, "Come si installa"), el("a", { cls: "btn sm", href: "#/controllo" }, "Controllo di partenza"))));
  p.append(el("p", { cls: "small muted" }, "Testi e figure dalle guide dell'escursione (A. Bondesan). Le fonti sono indicate in ogni didascalia. Cartografia di base © OpenStreetMap contributors, © OpenTopoMap (CC-BY-SA)."));
}

function nextStop(ex) {
  const done = store.get("done." + ex.id, []);
  const pend = ex.stops.filter(s => !done.includes(s.n));
  if (!pend.length) return null;
  if (!Geo.pos) return pend[0];
  return pend.slice().sort((a, b) => haversine(Geo.pos, a.coords) - haversine(Geo.pos, b.coords))[0];
}

function exHome(ex) {
  setTitle(ex.title, ex.subtitle);
  const p = page(el("div", { cls: "hero" }, el("img", { src: ex.cover, alt: "" }), el("div", { cls: "txt" }, el("b", null, ex.title), el("span", null, ex.subtitle))));
  const nx = el("div", { cls: "card" }); p.append(nx);
  const upd = () => {
    const s = nextStop(ex); nx.innerHTML = "";
    if (!s) { nx.append(el("h3", null, "Tutte le tappe segnate come fatte"), el("p", { cls: "small" }, "Puoi riaprirle dall'elenco delle tappe o azzerare lo stato in «Altro».")); return; }
    nx.append(el("h3", null, "Prossima tappa"), el("div", { cls: "stop" }, el("div", { cls: "n" }, s.n), el("div", { cls: "grow" }, el("b", null, s.name), el("div", { cls: "meta" }, "ore " + s.time + (s.dur ? ", " + s.dur : "")), Geo.pos ? el("div", { cls: "meta num" }, fmtDist(haversine(Geo.pos, s.coords)) + " in linea d'aria, azimut " + fmtAz(bearing(Geo.pos, s.coords)) + " " + cardinal(bearing(Geo.pos, s.coords))) : el("div", { cls: "meta" }, "Attiva la posizione per distanza e direzione"))),
      el("div", { cls: "row wrap", style: "margin-top:10px" }, el("a", { cls: "btn sm primary", href: "#/" + ex.id + "/tappa/" + s.n }, "Apri la scheda"), el("a", { cls: "btn sm", href: "#/" + ex.id + "/mappa/" + s.id }, "Vedi sulla carta")));
  };
  upd(); const off = Geo.on(upd); onLeave(off);
  const grid = el("div", { cls: "grid", style: "grid-template-columns:repeat(2,1fr)" });
  const tiles = [["mappa", "Carta e posizione", SVG.gps], ["tappe", "Tappe e finestrino", SVG.bus], ["guida", "Guida e figure", SVG.pdf], ["strumenti", "Mirino, clinometro, cronologie", SVG.target], ["domande", "Domande", SVG.check], ["taccuino", "Taccuino di campo", SVG.cam]];
  for (const [h, t, ic] of tiles) grid.append(el("a", { cls: "card tap", href: "#/" + ex.id + "/" + h, style: "text-decoration:none;color:inherit;margin:0", html: '<div style="color:var(--red);width:26px;height:26px">' + ic.replace("<svg", '<svg style="width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"') + "</div><b style='display:block;margin-top:6px;font-size:.92em'>" + esc(t) + "</b>" }));
  p.append(grid);
  const prog = el("div", { cls: "card", style: "margin-top:14px" }, el("h3", null, "Programma della giornata"), el("table", { cls: "t" }, el("tbody", null, ...ex.programme.map(r => el("tr", null, el("td", { cls: "num", style: "white-space:nowrap;font-weight:600" }, r[0]), el("td", null, r[1], r[2] ? el("div", { cls: "small muted" }, r[2]) : null))))));
  p.append(prog);
  p.append(el("div", { cls: "card" }, el("h3", null, "Punto di ritrovo"), el("p", { cls: "small" }, ex.meeting.text), el("div", { cls: "row" }, el("img", { src: "img/ritrovo1.jpg", style: "width:50%;border-radius:8px", on: { click: () => Viewer.open("img/ritrovo1.jpg", "Il punto di ritrovo a Padova", "Google Earth, elaborazione del docente") } }), el("img", { src: "img/ritrovo2.jpg", style: "width:50%;border-radius:8px", on: { click: () => Viewer.open("img/ritrovo2.jpg", "Il punto di ritrovo a Padova", "Google Earth, elaborazione del docente") } })),
    el("a", { cls: "btn sm", style: "margin-top:10px", href: "https://www.google.com/maps/search/?api=1&query=" + ex.meeting.coords.join(","), target: "_blank", rel: "noopener" }, "Apri in Google Maps")));
  p.append(el("div", { cls: "box" }, el("h4", null, "Informazioni pratiche"), el("ul", { cls: "dots small" }, ...ex.practical.map(t => el("li", null, t)))));
  p.append(el("a", { cls: "btn block", href: ex.pdf, target: "_blank", rel: "noopener", html: SVG.pdf + " Guida completa in PDF" }));
}

const leaveFns = [];
function onLeave(fn) { leaveFns.push(fn); }
// le funzioni di uscita della vista precedente si eseguono all'inizio di render(), prima che la nuova vista registri le sue

/* ------------------------------------------------------------------ tappe */
function stopsView(ex) {
  setTitle("Tappe", ex.title);
  const p = page(el("p", { cls: "lead" }, "Le soste della giornata e, in blu, le letture dal finestrino: brevi testi da leggere in pullman quando si attraversano i luoghi che descrivono."));
  const busTxt = el("div", { cls: "small muted" });
  const busBtn = el("button", { cls: "btn sm" });
  const busTest = el("button", { cls: "btn sm", on: { click: () => { const ok = Chime.play(); vibrate(); Notify.ask().then(() => Notify.show("Prova dell'avviso", "Così suona l'avviso del pullman.", "#/" + ex.id + "/tappe")); if (!ok) setTimeout(() => { if (!Chime.ready()) toast("Il browser non ha ancora attivato l'audio, tocca di nuovo «Prova l'avviso»"); }, 400); } } }, "Prova l'avviso");
  const busPaint = () => { const v = busMode(); busBtn.className = "btn sm " + (v ? "navy" : "primary"); busBtn.textContent = v ? "Disattiva" : "Attiva"; busTxt.textContent = v ? "Attiva. All'ingresso in un tratto con una lettura dal finestrino e all'arrivo a una tappa il telefono suona, vibra e mostra una notifica. Tieni l'app aperta in primo piano, perché con lo schermo spento o con un'altra app davanti il telefono smette di seguire la posizione; lo schermo resta acceso da solo. Il segnale suona due volte, con il volume dei contenuti multimediali e con quello delle notifiche: prova l'avviso e, se è debole, alza il volume con i tasti laterali mentre suona." : "Con la posizione attiva l'app avvisa con un suono e una vibrazione quando si entra in un tratto con una lettura dal finestrino o si arriva a una tappa."; busTest.style.display = v ? "" : "none"; };
  busBtn.addEventListener("click", () => { const v = !busMode(); store.set("bus", v); if (v) { Chime.unlock(); Chime.play(); vibrate(); Notify.ask(); Geo.start(); wakeLock(true); } else if (!MapCtl.follow) wakeLock(false); busPaint(); SoundBar.check(); });
  busPaint();
  const busRow = el("div", { cls: "card" }, el("div", { cls: "row" }, el("div", { cls: "grow" }, el("b", null, "Modalità pullman")), busBtn), busTxt, el("div", { style: "margin-top:8px" }, busTest));
  p.append(busRow);
  const done = store.get("done." + ex.id, []);
  const list = el("div"); p.append(list);
  const draw = () => {
    list.innerHTML = "";
    for (const s of ex.stops) {
      const d = Geo.pos ? haversine(Geo.pos, s.coords) : null;
      list.append(el("a", { cls: "card tap stop", href: "#/" + ex.id + "/tappa/" + s.n, style: "text-decoration:none;color:inherit" }, el("div", { cls: "n" + (done.includes(s.n) ? " done" : ""), style: done.includes(s.n) ? "background:#8a8f95" : "" }, s.n), el("div", { cls: "grow" }, el("b", null, s.name), el("div", { cls: "meta" }, "ore " + s.time + (s.dur ? ", " + s.dur : "")), el("div", { cls: "small", style: "margin-top:4px;color:var(--ink-2)" }, s.summary.split(". ")[0] + ".")), d != null ? el("div", { cls: "dist num" }, fmtDist(d), el("br"), fmtAz(bearing(Geo.pos, s.coords))) : null));
    }
    list.append(el("h3", { style: "margin-top:16px" }, "Letture dal finestrino"));
    ex.windows.forEach((w, i) => {
      const d = Geo.pos ? haversine(Geo.pos, w.coords) : null;
      list.append(el("a", { cls: "card tap stop win", href: "#/" + ex.id + "/finestrino/" + i, style: "text-decoration:none;color:inherit" }, el("div", { cls: "n", html: SVG.bus.replace("<svg", '<svg style="width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2"') }), el("div", { cls: "grow" }, el("b", null, w.name), el("div", { cls: "small", style: "color:var(--ink-2)" }, w.text.slice(0, 90) + "…")), d != null ? el("div", { cls: "dist num" }, fmtDist(d)) : null));
    });
  };
  draw(); onLeave(Geo.on(draw));
}

function figInline(ex, id, opts) {
  const f = figById(ex, id); if (!f) return null;
  const n = figNum(ex, id);
  return el("div", { cls: "figinline" }, el("img", { src: (opts && opts.thumb ? "img/thumb/" : "img/") + id + ".jpg", loading: "lazy", alt: f.cap, on: { click: () => Viewer.open("img/" + id + ".jpg", "Figura " + n + ". " + f.cap, f.src) } }), el("div", { cls: "cap" }, el("span", { cls: "fn" }, "Figura " + n + ". "), f.cap, " ", el("span", { cls: "src" }, "Fonte: " + f.src + ".")));
}

function stopView(ex, n) {
  const s = ex.stops.find(x => x.n === n); if (!s) return stopsView(ex);
  setTitle("Tappa " + s.n + ". " + s.name, ex.title);
  const done = store.get("done." + ex.id, []);
  const p = page();
  const hud = el("div", { cls: "card row" }); p.append(hud);
  const upd = () => {
    hud.innerHTML = "";
    hud.append(el("div", { cls: "n", style: "width:40px;height:40px;border-radius:50%;background:var(--red);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none" }, s.n), el("div", { cls: "grow" }, el("div", { cls: "small muted" }, "ore " + s.time + (s.dur ? ", " + s.dur : "")), Geo.pos ? el("div", { cls: "num" }, el("b", null, fmtDist(haversine(Geo.pos, s.coords))), " in linea d'aria, azimut " + fmtAz(bearing(Geo.pos, s.coords)) + " (" + cardinal(bearing(Geo.pos, s.coords)) + ")" + (Geo.acc ? ", ± " + Math.round(Geo.acc) + " m" : "")) : el("div", { cls: "small" }, "Posizione non attiva")),
      el("a", { cls: "iconbtn", href: "#/" + ex.id + "/mappa/" + s.id, title: "Carta", html: SVG.gps }));
  };
  upd(); onLeave(Geo.on(upd));
  p.append(el("p", { cls: "lead" }, s.summary));
  p.append(el("div", { cls: "box" }, el("h4", null, "Che cosa osservare"), el("ul", { cls: "dots" }, ...s.see.map(t => el("li", null, t)))));
  p.append(el("div", { cls: "card" }, el("h3", null, "I numeri"), el("ul", { cls: "clean small" }, ...s.numbers.map(t => el("li", null, t)))));
  if (s.targets && s.targets.length) {
    const tl = el("ul", { cls: "clean tlist small" });
    const draw = () => { tl.innerHTML = ""; const from = Geo.pos || s.coords; s.targets.forEach((k, i) => { const t = ex.targets[k]; if (!t) return; const az = bearing(from, t.coords), d = haversine(from, t.coords); tl.append(el("li", null, el("span", { cls: "sw", style: "background:" + TCOL[i % TCOL.length] }), el("span", { cls: "grow" }, el("b", null, t.name), t.note ? el("div", { cls: "muted" }, t.note) : null), el("span", { cls: "az" }, fmtAz(az) + " " + cardinal(az)), el("span", { cls: "muted num", style: "min-width:4em;text-align:right" }, fmtDist(d)))); }); };
    draw(); onLeave(Geo.on(draw));
    p.append(el("div", { cls: "card" }, el("h3", null, "Dove guardare"), el("p", { cls: "small muted" }, Geo.pos ? "Azimut e distanze dalla tua posizione." : "Azimut e distanze calcolati dal punto di sosta; con la posizione attiva si aggiornano."), tl, el("a", { cls: "btn sm", style: "margin-top:8px", href: "#/" + ex.id + "/strumenti/mirino/" + s.n, html: SVG.target + " Apri il mirino del paesaggio" })));
  }
  // introduzione audio della tappa (voce sintetica; il testo letto è sotto il lettore)
  const AT = ((window.DATA.audio || {})[ex.id] || {})[s.n];
  const au = el("div", { cls: "card" }, el("h3", null, "Introduzione audio"), el("p", { cls: "small muted" }, "Presentazione della tappa letta da una voce sintetica" + (AT && AT.d ? ", circa " + Math.max(1, Math.round(AT.d / 60)) + " minuti" : "") + ". Si ascolta meglio con gli auricolari, prima di scendere dal pullman."));
  const audio = el("audio", { controls: "", preload: "none", style: "width:100%" }); const src = "audio/" + ex.id + "_" + s.n + ".m4a";
  audio.src = src; audio.addEventListener("error", () => { audio.replaceWith(el("p", { cls: "small", style: "color:var(--warn)" }, "Audio non disponibile per questa tappa.")); }, { once: true });
  au.append(audio);
  if (AT && AT.t) au.append(el("details", { cls: "small", style: "margin-top:8px" }, el("summary", null, "Testo dell'audio"), ...AT.t.split("\n").filter(Boolean).map(x => el("p", null, x))));
  p.append(au);
  if (s.figures && s.figures.length) { p.append(el("h3", null, "Figure della tappa")); s.figures.forEach(id => p.append(figInline(ex, id))); }
  if (s.links && s.links.length) p.append(el("div", { cls: "card" }, el("h3", null, "Per approfondire"), el("ul", { cls: "clean small" }, ...s.links.map(l => el("li", null, el("a", { href: l.u, target: "_blank", rel: "noopener" }, l.t))))));
  if (s.questions) p.append(el("div", { cls: "dash" }, el("b", { style: "color:var(--red)" }, "Da chiedersi qui"), el("ul", { cls: "dots", style: "margin-top:6px" }, ...s.questions.map(q => el("li", null, q)))));
  if (store.get("docente", false)) { const blk = ex.teacher.find(b => { const m = b.h.match(/tapp[ae] (\d+)(?:-(\d+))?/i); if (!m) return false; const a = +m[1], z = m[2] ? +m[2] : a; return s.n >= a && s.n <= z; }); if (blk) p.append(el("div", { cls: "card", style: "border:1px dashed var(--red)" }, el("h3", null, "Note del docente, " + blk.h), el("ul", { cls: "dots small" }, ...blk.items.map(t => el("li", null, t))))); }
  const isDone = done.includes(s.n);
  p.append(el("div", { cls: "row wrap", style: "margin-top:8px" },
    el("button", { cls: "btn " + (isDone ? "" : "primary"), on: { click: e => { let d = store.get("done." + ex.id, []); if (d.includes(s.n)) d = d.filter(x => x !== s.n); else d.push(s.n); store.set("done." + ex.id, d); e.currentTarget.textContent = d.includes(s.n) ? "Segnata come fatta" : "Segna come fatta"; e.currentTarget.className = "btn " + (d.includes(s.n) ? "" : "primary"); } } }, isDone ? "Segnata come fatta" : "Segna come fatta"),
    el("a", { cls: "btn", href: "#/" + ex.id + "/taccuino/" + s.n, html: SVG.cam + " Annota nel taccuino" })));
}

function windowView(ex, i) {
  const w = ex.windows[i]; if (!w) return stopsView(ex);
  setTitle("Dal finestrino", w.name);
  const p = page(el("h1", null, w.name), el("p", { cls: "lead" }, w.text));
  (w.figures || []).forEach(id => p.append(figInline(ex, id)));
  p.append(el("a", { cls: "btn", href: "#/" + ex.id + "/mappa/w" + i, html: SVG.gps + " Vedi sulla carta" }));
}

/* ------------------------------------------------------------------ guida, figure, glossario, domande, cronologia */
function guideView(ex) {
  setTitle("Guida", ex.title);
  const p = page(el("div", { cls: "tabs" }, ...[["testi", "Testi"], ["figure", "Figure"], ["glossario", "Glossario"], ["domande", "Domande"], ["cronologia", "Cronologia"]].map(([h, t]) => el("button", { cls: h === "testi" ? "on" : "", on: { click: () => go("#/" + ex.id + "/" + h) } }, t))));
  p.append(el("p", { cls: "lead" }, "I capitoli di inquadramento della guida, in forma breve. La versione completa, con tutte le figure e i riferimenti, è nel PDF."));
  ex.intro.forEach((sec, i) => {
    const d = el("details", i === 0 ? { open: "" } : null, el("summary", null, (i + 1) + ". " + sec.h), el("div", { cls: "body" }, ...sec.p.map(t => el("p", { html: md(t) }))));
    p.append(d);
  });
  p.append(el("div", { style: "margin-top:14px" }, el("a", { cls: "btn block", href: ex.pdf, target: "_blank", rel: "noopener", html: SVG.pdf + " Apri la guida completa (PDF)" })));
}

function figuresView(ex, tag) {
  setTitle("Figure", ex.title);
  const tags = [...new Set(ex.figures.flatMap(f => f.tags || []))];
  const p = page(el("div", { cls: "tabs" }, ...[["testi", "Testi"], ["figure", "Figure"], ["glossario", "Glossario"], ["domande", "Domande"], ["cronologia", "Cronologia"]].map(([h, t]) => el("button", { cls: h === "figure" ? "on" : "", on: { click: () => go("#/" + ex.id + "/" + h) } }, t))));
  const chips = el("div", null, el("span", { cls: "chip" + (!tag ? " on" : ""), on: { click: () => go("#/" + ex.id + "/figure") } }, "tutte"), ...tags.map(t => el("span", { cls: "chip" + (t === tag ? " on" : ""), on: { click: () => go("#/" + ex.id + "/figure/" + t) } }, t)));
  p.append(chips);
  const grid = el("div", { cls: "grid" });
  ex.figures.forEach((f, i) => { if (tag && !(f.tags || []).includes(tag)) return; grid.append(el("div", { cls: "fig", on: { click: () => Viewer.open("img/" + f.id + ".jpg", "Figura " + (i + 1) + ". " + f.cap, f.src) } }, el("div", { cls: "im" }, el("img", { src: "img/thumb/" + f.id + ".jpg", loading: "lazy", alt: "" })), el("div", { cls: "cap" }, el("span", { cls: "fn" }, (i + 1) + ". "), f.cap))); });
  p.append(grid);
  p.append(el("p", { cls: "small muted", style: "margin-top:12px" }, "Tocca una figura per aprirla a schermo intero; con due dita si ingrandisce. La didascalia riporta la legenda e la fonte."));
}

function glossaryView(ex) {
  setTitle("Glossario", ex.title);
  const p = page(el("div", { cls: "tabs" }, ...[["testi", "Testi"], ["figure", "Figure"], ["glossario", "Glossario"], ["domande", "Domande"], ["cronologia", "Cronologia"]].map(([h, t]) => el("button", { cls: h === "glossario" ? "on" : "", on: { click: () => go("#/" + ex.id + "/" + h) } }, t))));
  const inp = el("input", { cls: "search", type: "search", placeholder: "Cerca un termine…" }); p.append(inp);
  const list = el("div"); p.append(list);
  const all = [...ex.glossary, ...(ex === EX.vajont ? EX.carso : EX.vajont).glossary.filter(g => !ex.glossary.some(x => x[0] === g[0])).map(g => [g[0], g[1], true])].sort((a, b) => a[0].localeCompare(b[0], "it"));
  const draw = () => { const q = inp.value.trim().toLowerCase(); list.innerHTML = ""; all.filter(g => !q || g[0].toLowerCase().includes(q) || g[1].toLowerCase().includes(q)).forEach(g => list.append(el("div", { style: "padding:8px 0;border-bottom:1px solid var(--line)" }, el("b", null, g[0]), g[2] ? el("span", { cls: "chip", style: "margin-left:6px" }, "altra escursione") : null, el("div", { cls: "small", style: "color:var(--ink-2)" }, g[1])))); };
  inp.addEventListener("input", draw); draw();
}

function questionsView(ex) {
  setTitle("Domande di approfondimento", ex.title);
  const p = page(el("div", { cls: "tabs" }, ...[["testi", "Testi"], ["figure", "Figure"], ["glossario", "Glossario"], ["domande", "Domande"], ["cronologia", "Cronologia"]].map(([h, t]) => el("button", { cls: h === "domande" ? "on" : "", on: { click: () => go("#/" + ex.id + "/" + h) } }, t))));
  p.append(el("p", { cls: "lead" }, "Servono a guardare meglio sul terreno e a riprendere la guida dopo l'escursione. Le risposte si trovano in parte nei testi e in parte soltanto sul posto. Tocca una domanda per annotare la tua risposta nel taccuino."));
  ex.questions.forEach((q, i) => p.append(el("div", { cls: "q", on: { click: () => go("#/" + ex.id + "/taccuino/q" + (i + 1)) } }, el("b", { style: "color:var(--red)" }, (i + 1) + ". "), q)));
}

function timelineView(ex) {
  setTitle("Cronologia", ex.title);
  const p = page(el("div", { cls: "tabs" }, ...[["testi", "Testi"], ["figure", "Figure"], ["glossario", "Glossario"], ["domande", "Domande"], ["cronologia", "Cronologia"]].map(([h, t]) => el("button", { cls: h === "cronologia" ? "on" : "", on: { click: () => go("#/" + ex.id + "/" + h) } }, t))));
  if (ex.reservoir) { p.append(el("h3", null, "Il serbatoio e la frana, 1960-1963")); p.append(reservoirChart(ex)); }
  p.append(el("h3", { style: "margin-top:16px" }, ex.reservoir ? "Le date" : "Le date della speleologia e della tutela"));
  const tl = el("div", { cls: "tl" }); ex.timeline.forEach(t => tl.append(el("div", { cls: "it" }, el("b", null, t.d), t.t))); p.append(tl);
  p.append(el("h3", { style: "margin-top:16px" }, "Tre scale di tempo in una"));
  p.append(el("p", { cls: "small muted" }, "Le durate su scala logaritmica: ogni tacca è un fattore dieci. Dalla deposizione delle rocce al collasso di un versante in meno di un minuto."));
  p.append(scalesChart(ex));
}

function reservoirChart(ex) {
  const W = 360, H = 210, L = 38, Rm = 10, T = 14, B = 34, x0 = new Date("1960-01-01").getTime(), x1 = new Date("1963-12-31").getTime();
  const X = d => L + (new Date(d).getTime() - x0) / (x1 - x0) * (W - L - Rm), Y = v => T + (730 - v) / (730 - 570) * (H - T - B);
  let s = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '">';
  for (let v = 580; v <= 720; v += 20) s += '<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="var(--line)"/><text x="' + (L - 4) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + "</text>";
  for (let y = 1960; y <= 1963; y++) s += '<text x="' + X(y + "-07-01") + '" y="' + (H - B + 14) + '" text-anchor="middle">' + y + "</text>";
  s += '<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + Y(700) + '" y2="' + Y(700) + '" stroke="var(--red)" stroke-dasharray="3 3"/><text x="' + (W - Rm) + '" y="' + (Y(700) - 3) + '" text-anchor="end" fill="var(--red)">quota di sicurezza di Ghetti, 700 m</text>';
  s += '<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + Y(722.5) + '" y2="' + Y(722.5) + '" stroke="var(--ink-3)" stroke-dasharray="2 3"/><text x="' + (L + 3) + '" y="' + (Y(722.5) - 3) + '">massimo invaso 722,5 m</text>';
  s += '<path d="' + ex.reservoir.map((pt, i) => (i ? "L" : "M") + X(pt[0]).toFixed(1) + " " + Y(pt[1]).toFixed(1)).join(" ") + '" fill="none" stroke="var(--blue)" stroke-width="2.2"/>';
  s += '<text x="' + L + '" y="' + (H - 4) + '">livello del lago (m s.l.m.), ricostruzione semplificata da Hendron & Patton 1985</text>';
  const months = { gen: "01", feb: "02", mar: "03", apr: "04", mag: "05", giu: "06", lug: "07", ago: "08", set: "09", ott: "10", nov: "11", dic: "12" };
  const evs = ex.timeline.filter(t => t.lvl != null).map((t, i) => { const m = t.d.match(/(\d+)?\s*(\w{3})\s+(\d{4})/); const iso = m ? m[3] + "-" + months[m[2]] + "-" + String(m[1] || 15).padStart(2, "0") : null; return { ...t, iso, i }; }).filter(e => e.iso);
  evs.forEach((e, i) => { s += '<g class="ev" data-i="' + i + '"><circle cx="' + X(e.iso) + '" cy="' + Y(e.lvl) + '" r="6" fill="var(--red)" stroke="#fff" stroke-width="1.5"/></g>'; });
  s += "</svg>";
  const wrap = el("div", { cls: "card" }); wrap.innerHTML = s;
  const info = el("div", { cls: "small", style: "margin-top:6px;min-height:2.6em" }, "Tocca un punto rosso per leggere l'evento.");
  wrap.append(info);
  wrap.querySelectorAll(".ev").forEach(g => g.addEventListener("click", () => { const e = evs[+g.dataset.i]; info.innerHTML = "<b style='color:var(--red)'>" + esc(e.d) + "</b>, " + esc(e.t) + (e.lvl ? " (lago a " + e.lvl + " m)" : ""); }));
  return wrap;
}

function scalesChart(ex) {
  const toS = y => y * 365.25 * 86400;
  const min = Math.log10(toS(Math.min(...ex.scales.map(s => s.years)))) - 0.5, max = Math.log10(toS(Math.max(...ex.scales.map(s => s.years))));
  const human = y => { if (y >= 1e6) return (y / 1e6).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " milioni di anni"; if (y >= 1000) return Math.round(y).toLocaleString("it-IT") + " anni"; if (y >= 1) return Math.round(y) + " anni"; const d = y * 365.25; if (d >= 1) return Math.round(d) + " giorni"; const h = d * 24; if (h >= 1) return Math.round(h) + " ore"; const m = h * 60; if (m >= 1) return Math.round(m) + " minuti"; return Math.round(m * 60) + " secondi"; };
  const w = el("div", { cls: "card scales" });
  ex.scales.forEach(s => { const pct = Math.max(2, (Math.log10(toS(s.years)) - min) / (max - min) * 100); w.append(el("div", { cls: "bar" }, el("div", { cls: "lab" }, el("span", null, s.label), el("b", { cls: "num" }, human(s.years))), el("div", { cls: "tr" }, el("i", { style: "width:" + pct.toFixed(1) + "%" })))); });
  return w;
}

/* ------------------------------------------------------------------ strumenti */
const TCOL = ["#c00000", "#1f78b4", "#2e7d32", "#d4b44a", "#6a3d9a", "#ff7f00", "#17becf"];
function toolsView(ex, arg) {
  const tool = (arg || "").split("/")[0] || "indice";
  const sub = (location.hash.split("/")[4]);
  setTitle("Strumenti", ex.title);
  if (tool === "indice") {
    const p = page(el("p", { cls: "lead" }, "Strumenti di campo per leggere il paesaggio con il telefono: dove guardare, quanto inclinano gli strati, che cosa è cambiato."));
    const items = [["mirino", "Mirino del paesaggio", "La bussola indica gli elementi da riconoscere dalla tappa: parete, faglie, Colle Isolato, doline. Ruota il telefono finché il bersaglio è in alto.", SVG.target],
      ["clinometro", "Clinometro", "Appoggia il lato lungo del telefono a una superficie di strato: legge l'inclinazione. Gli strati del Toc immergono a 30-50°.", SVG.fit],
      ["confronti", "Prima e dopo", ex.id === "vajont" ? "Sezioni della valle prima e dopo il 1963, Longarone a confronto, la parete di scivolamento dal 1964 al 2011." : "Due grotte a confronto e le carte storiche della Val Rosandra.", SVG.layers],
      ["cronologia", "Cronologie e scale di tempo", ex.id === "vajont" ? "Il livello del serbatoio dal 1960 al 1963 con gli eventi, e tre scale di tempo in una." : "Dalla speleologia del 1599 alla tutela UNESCO, e le scale di tempo del carsismo.", SVG.pdf],
      ["schizzo", "Schizzo panoramico", "Fotografa il versante e disegna sopra la traccia degli strati, le faglie e i limiti della frana; lo schizzo finisce nel taccuino.", SVG.cam]];
    for (const [h, t, d, ic] of items) p.append(el("a", { cls: "card tap row", href: h === "cronologia" ? "#/" + ex.id + "/cronologia" : "#/" + ex.id + "/strumenti/" + h, style: "text-decoration:none;color:inherit" }, el("div", { style: "color:var(--red);width:30px;flex:none", html: ic.replace("<svg", '<svg style="width:28px;height:28px;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round"') }), el("div", { cls: "grow" }, el("b", null, t), el("div", { cls: "small muted" }, d))));
    return;
  }
  if (tool === "mirino") return compassView(ex, sub ? +sub : null);
  if (tool === "clinometro") return clinoView(ex);
  if (tool === "confronti") return compareView(ex);
  if (tool === "schizzo") return sketchView(ex);
  return toolsView(ex, null);
}

function compassView(ex, stopN) {
  setTitle("Mirino del paesaggio", ex.title);
  const stop = ex.stops.find(s => s.n === stopN) || ex.stops.find(s => s.targets && s.targets.length) || ex.stops[0];
  const p = page(el("div", { cls: "tabs" }, ...ex.stops.filter(s => s.targets && s.targets.length).map(s => el("button", { cls: s === stop ? "on" : "", on: { click: () => go("#/" + ex.id + "/strumenti/mirino/" + s.n) } }, "Tappa " + s.n))));
  const note = el("p", { cls: "small muted" }), state = el("div"); p.append(note, state);
  const cw = el("div", { cls: "compass" }); p.append(cw);
  const read = el("div", { style: "text-align:center;margin:-4px 0 10px" }); p.append(read);
  const tl = el("ul", { cls: "clean tlist" }); p.append(el("div", { cls: "card" }, tl));
  p.append(el("div", { cls: "box small" }, el("h4", null, "Come si usa"), "Tieni il telefono piatto davanti a te, oppure in piedi con la fotocamera rivolta al paesaggio. La rosa ruota con la bussola e, quando il punto colorato di un bersaglio arriva sotto il triangolo rosso, il bersaglio è davanti a te. Se sei a più di tre chilometri dalla tappa gli azimut sono calcolati dal punto di sosta. Vicino a metalli e magneti, compreso l'interno del pullman, la bussola del telefono può sbagliare di parecchi gradi; per ricalibrarla muovi il telefono disegnando un otto."));
  Geo.start(); Geo.startCompass();
  const targets = stop.targets.map(k => ex.targets[k]).filter(Boolean);
  const NEAR = 3000, warn = { cls: "small", style: "color:var(--warn);margin:0 0 8px" };
  let from = stop.coords, key = "", rose = null, labels = [], rels = [], raf = 0, lastList = 0, shown = "";
  // parte fissa: rosa, bersagli e lista; si ricostruisce solo quando cambia il punto da cui si calcolano gli azimut
  const build = () => {
    const dStop = Geo.pos ? haversine(Geo.pos, stop.coords) : null, near = dStop != null && dStop <= NEAR;
    from = near ? Geo.pos : stop.coords;
    note.textContent = near ? "Azimut calcolati dalla tua posizione." : dStop != null ? "Sei a " + fmtDist(dStop) + " dalla tappa " + stop.n + ", quindi gli azimut sono calcolati dal punto di sosta; la rosa ruota comunque con la bussola." : "Posizione non disponibile, azimut calcolati dal punto della tappa " + stop.n + ".";
    const k = from[0].toFixed(4) + "," + from[1].toFixed(4); if (k === key) return; key = k;
    let s = '<svg viewBox="-110 -110 220 220"><g class="rose">';
    s += '<circle r="100" fill="var(--card)" stroke="var(--line)" stroke-width="2"/>';
    for (let a = 0; a < 360; a += 10) { const long = a % 30 === 0; s += '<line x1="0" y1="-100" x2="0" y2="' + (long ? -90 : -95) + '" stroke="var(--ink-3)" stroke-width="' + (long ? 2 : 1) + '" transform="rotate(' + a + ')"/>'; }
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([l, a]) => { s += '<text class="lb" data-k="c" data-a="' + a + '" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="' + (a === 0 ? "var(--red)" : "var(--ink-2)") + '">' + l + "</text>"; });
    targets.forEach((t, i) => { const az = bearing(from, t.coords); s += '<g transform="rotate(' + az.toFixed(1) + ')"><line x1="0" y1="0" x2="0" y2="-82" stroke="' + TCOL[i % TCOL.length] + '" stroke-width="1.5" stroke-dasharray="3 3"/><circle cy="-84" r="9" fill="' + TCOL[i % TCOL.length] + '" stroke="#fff" stroke-width="2"/><text class="lb" data-k="t" data-a="' + az.toFixed(1) + '" y="-84" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="700" fill="#fff">' + (i + 1) + "</text></g>"; });
    s += '</g><path d="M0 -108 l-8 14 h16z" fill="var(--red)"/><circle r="4" fill="var(--ink)"/></svg>';
    cw.innerHTML = s; rose = cw.querySelector(".rose"); labels = [...cw.querySelectorAll(".lb")].map(x => [x, x.dataset.k, +x.dataset.a]);
    tl.innerHTML = ""; rels = [];
    targets.forEach((t, i) => { const az = bearing(from, t.coords), d = haversine(from, t.coords); const rel = el("span"); rels.push([az, rel]); tl.append(el("li", null, el("span", { cls: "sw", style: "background:" + TCOL[i % TCOL.length] }), el("span", { cls: "grow" }, el("b", null, (i + 1) + ". " + t.name), t.note ? el("div", { cls: "small muted" }, t.note) : null), el("span", { cls: "az" }, fmtAz(az)), el("span", { cls: "small muted num", style: "min-width:5em;text-align:right" }, fmtDist(d), el("br"), rel))); });
    lastList = 0; paint();
  };
  // parte mobile: ruota la rosa a ogni lettura della bussola, al ritmo dello schermo
  const paint = () => {
    raf = 0; const hd = Geo.bestHeading();
    const h0 = hd || 0;
    if (rose) rose.setAttribute("transform", "rotate(" + (-h0).toFixed(1) + ")");
    // lettere e numeri restano sempre diritti mentre la rosa gira
    labels.forEach(([x, k, a]) => x.setAttribute("transform", k === "c" ? "rotate(" + a + ") translate(0,-74) rotate(" + (h0 - a).toFixed(1) + ")" : "rotate(" + (h0 - a).toFixed(1) + " 0 -84)"));
    read.innerHTML = hd != null ? "<span class='big num'>" + fmtAz(hd) + "</span> <span class='muted'>" + cardinal(hd) + "</span>" : "<span class='muted'>direzione sconosciuta</span>";
    const now = Date.now(); if (now - lastList > 250) { lastList = now; rels.forEach(([az, sp]) => { if (hd == null) { sp.textContent = ""; return; } const r = ((az - hd + 540) % 360) - 180; sp.textContent = Math.abs(r) < 8 ? "davanti" : (r > 0 ? "→ " : "← ") + Math.abs(Math.round(r)) + "°"; }); }
    showState();
  };
  const showState = () => {
    const st = Geo.compassState; if (st === shown) return; shown = st; state.innerHTML = "";
    if (st === "wait" || st === "off") state.append(el("p", { cls: "small muted", style: "margin:0 0 8px" }, "In attesa della bussola del telefono…"));
    else if (st === "perm") state.append(el("button", { cls: "btn primary block", style: "margin-bottom:8px", on: { click: () => Geo.startCompass(true) } }, "Attiva la bussola"));
    else if (st === "denied") state.append(el("p", warn, "Il permesso ai sensori di movimento è stato negato. Va concesso di nuovo nelle impostazioni del browser per questo sito; poi chiudi e riapri l'app."));
    else if (st === "rel") state.append(el("p", warn, "Il telefono segnala come ruota ma non ancora dove sta il nord. Tocca «Attiva la bussola» e consenti i sensori; poi muovi il telefono disegnando un otto per calibrare la bussola."), el("button", { cls: "btn primary block", style: "margin-bottom:8px", on: { click: () => Geo.startCompass(true) } }, "Attiva la bussola"));
    else if (st === "none") state.append(el("p", warn, "Nessun segnale dalla bussola. Tocca «Attiva la bussola», poi muovi il telefono disegnando un otto; se la rosa resta ferma, controlla nelle impostazioni del sito in Chrome che i sensori di movimento siano consentiti, poi chiudi e riapri l'app. Alcuni tablet non hanno il sensore."), el("button", { cls: "btn primary block", style: "margin-bottom:8px", on: { click: () => Geo.startCompass(true) } }, "Attiva la bussola"));
  };
  const onHead = () => { if (!raf) raf = requestAnimationFrame(paint); };
  // dati grezzi dei sensori: servono a capire, da una schermata, perché su un telefono la rosa resta ferma.
  // Con il riquadro aperto si accendono anche accelerometro, giroscopio e orientamento relativo, per vedere quale sensore non si aggiorna.
  const dg = el("pre", { cls: "small", style: "white-space:pre-wrap;margin:6px 0 0;font-size:.78em" });
  const det = el("details", { cls: "card small" }, el("summary", null, "Dati dei sensori"), dg); p.append(det);
  const fmt = v => v == null || isNaN(v) ? "–" : Math.round(v);
  const extra = { acc: 0, accV: null, gyr: 0, gyrV: null, ros: 0, rosHd: null, err: {} }, sens = [];
  const probe = (name, make, onRead) => { try { if (typeof window[name] !== "function") { extra.err[name] = "assente"; return; } const s = make(); s.addEventListener("reading", () => onRead(s)); s.addEventListener("error", e => { extra.err[name] = (e.error && e.error.name) || "errore"; }); s.start(); sens.push(s); } catch (e) { extra.err[name] = e.name || "errore"; } };
  det.addEventListener("toggle", () => {
    if (det.open && !sens.length) {
      probe("Accelerometer", () => new Accelerometer({ frequency: 10 }), s => { extra.acc++; extra.accV = [s.x, s.y, s.z]; });
      probe("Gyroscope", () => new Gyroscope({ frequency: 10 }), s => { extra.gyr++; extra.gyrV = Math.hypot(s.x, s.y, s.z) * 180 / Math.PI; });
      probe("RelativeOrientationSensor", () => new RelativeOrientationSensor({ frequency: 10, referenceFrame: "device" }), s => { extra.ros++; if (s.quaternion) extra.rosHd = Geo.headingFromQuat(s.quaternion); });
    }
  });
  onLeave(() => sens.forEach(s => { try { s.stop(); } catch (e) {} }));
  // Chrome consegna le letture dei sensori solo alla pagina che ha il focus: se una finestra sovrapposta lo prende, la rosa si ferma
  let blurs = 0; const onBlur = () => { blurs++; }; window.addEventListener("blur", onBlur); onLeave(() => window.removeEventListener("blur", onBlur));
  let prev = null, rate = { abs: 0, rel: 0, aos: 0, acc: 0, gyr: 0, ros: 0 };
  const fw = el("p", { cls: "small", style: "color:var(--warn);margin:0 0 8px;display:none" }, "Il telefono ha sospeso i sensori perché un'altra finestra ha preso il controllo dello schermo. Tocca la rosa per riattivarli.");
  state.after(fw);
  const dpaint = () => {
    fw.style.display = document.visibilityState === "visible" && !document.hasFocus() && performance.now() - (Geo._ht || 0) > 2500 ? "" : "none";
    const D = Geo.diag, cur = { abs: D.abs, rel: D.rel, aos: D.aos, acc: extra.acc, gyr: extra.gyr, ros: extra.ros, t: performance.now() };
    if (prev) { const dt = (cur.t - prev.t) / 1000; for (const k in rate) rate[k] = Math.round((cur[k] - prev[k]) / dt); } prev = cur;
    const st = n => extra.err[n] ? extra.err[n] : null;
    dg.textContent = "Versione " + VERSION + "\nPagina: " + (document.visibilityState === "visible" ? "visibile" : "nascosta") + ", focus " + (document.hasFocus() ? "sì" : "no") + ", perso " + blurs + " volte" + "\nStato bussola: " + Geo.compassState + (D.src ? ", da " + D.src : "") + ", riavvii " + (D.restarts || 0) + "\nDirezione: " + fmt(Geo.compass) + "°, schermo " + ((screen.orientation && screen.orientation.angle) || 0) + "°"
      + "\n\nEventi assoluti: " + D.abs + " (vuoti " + D.absNull + "), " + rate.abs + " al secondo, direzione " + fmt(D.evHd) + "°"
      + "\nEventi relativi: " + D.rel + ", " + rate.rel + " al secondo, alpha " + fmt(D.relLast && D.relLast[0]) + (D.relAbs ? ", con nord " + D.relAbs : "") + (D.wk ? ", Safari " + D.wk : "")
      + "\nSensore assoluto: " + (typeof AbsoluteOrientationSensor === "function" ? D.aos + " letture, " + rate.aos + " al secondo, direzione " + fmt(D.aosHd) + "°" + (D.aosErr ? ", " + D.aosErr : "") : "assente")
      + "\nPermesso: " + (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function" ? (D.perm || "non ancora chiesto") : "non richiesto")
      + "\nUltima lettura assoluta: " + (D.last ? "alpha " + fmt(D.last[0]) + ", beta " + fmt(D.last[1]) + ", gamma " + fmt(D.last[2]) : "nessuna")
      + "\n\nAccelerometro: " + (st("Accelerometer") || rate.acc + " al secondo" + (extra.accV ? ", " + extra.accV.map(v => v.toFixed(1)).join(" / ") : ""))
      + "\nGiroscopio: " + (st("Gyroscope") || rate.gyr + " al secondo" + (extra.gyrV != null ? ", rotazione " + fmt(extra.gyrV) + "°/s" : ""))
      + "\nOrientamento relativo: " + (st("RelativeOrientationSensor") || rate.ros + " al secondo, direzione " + fmt(extra.rosHd) + "°")
      + "\n\n" + navigator.userAgent;
  };
  dpaint(); const dT = setInterval(dpaint, 1000); onLeave(() => clearInterval(dT));
  build(); onLeave(Geo.on(build)); onLeave(Geo.onHeading(onHead)); onLeave(() => { if (raf) cancelAnimationFrame(raf); });
}

function clinoView(ex) {
  setTitle("Clinometro", ex.title);
  const p = page(el("p", { cls: "lead" }, "Misura l'inclinazione di una superficie di strato o di un pendio."));
  const c = el("div", { cls: "clino" }, el("div", { cls: "horizon" }), el("div", { cls: "level", id: "lvl" }), el("div", { cls: "val", id: "clv" }, "—")); p.append(c);
  const msg = el("p", { cls: "small muted", style: "text-align:center" }, "In attesa dei sensori…"); p.append(msg);
  const hold = el("div", { cls: "card row" }, el("div", { cls: "grow" }, el("b", null, "Lettura bloccata"), el("div", { cls: "small muted", id: "held" }, "nessuna")), el("button", { cls: "btn sm primary", on: { click: () => { if (last != null) { $("#held").textContent = last.toFixed(0) + "°, " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); heldVal = last; } } } }, "Blocca"), el("a", { cls: "btn sm", href: "#", on: { click: e => { e.preventDefault(); if (heldVal != null) go("#/" + ex.id + "/taccuino/clino" + Math.round(heldVal)); } } }, "Annota"));
  p.append(hold);
  p.append(el("div", { cls: "box small" }, el("h4", null, "Come si usa"), el("p", null, "Tieni il telefono di taglio, con lo schermo verso di te, e appoggia il lato lungo alla superficie dello strato (o allinealo a vista con la traccia degli strati sulla parete). Il numero è l'inclinazione di quel lato rispetto all'orizzontale: 0° orizzontale, 90° verticale."), el("p", { style: "margin:0" }, ex.id === "vajont" ? "Per confronto: gli strati sulla parete di scivolamento del Toc immergono verso nord a 30-50°; la «seduta» del sedile sta a 20-30° e lo «schienale» a 50-60° (Wolter et al. 2014); l'attrito residuo delle argille di Fonzaso è di 8-10°." : "Per confronto: sul Carso triestino gli strati immergono verso sud-ovest a 10-30°, e diventano subverticali lungo il margine costiero a Duino e al Monte Grisa.")));
  let last = null, heldVal = null, raf = false;
  const h = e => {
    const g = e.accelerationIncludingGravity; if (!g || g.x == null) return;
    const ax = g.x, ay = g.y, az = g.z;
    if (Math.abs(az) > 7.5) { msg.textContent = "Tieni il telefono di taglio, con lo schermo verso di te."; return; }
    const theta = Math.atan2(Math.abs(ax), Math.abs(ay)) * 180 / Math.PI; // inclinazione del lato lungo dalla verticale
    const dip = 90 - theta; last = dip;
    if (!raf) { raf = true; requestAnimationFrame(() => { raf = false; $("#clv").textContent = dip.toFixed(0) + "°"; const roll = Math.atan2(ax, -ay) * 180 / Math.PI; $("#lvl").style.transform = "rotate(" + (-roll).toFixed(1) + "deg)"; msg.textContent = "Inclinazione del lato lungo rispetto all'orizzontale."; }); }
  };
  // il ricevitore si attacca subito; dove esiste la richiesta di permesso (iPhone e Chrome recenti) si prova senza tocco e, se serve, compare il pulsante
  let got = false; const h0 = e => { got = true; h(e); };
  window.addEventListener("devicemotion", h0, true);
  if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
    const ask = () => DeviceMotionEvent.requestPermission().then(s => { if (s === "granted") { if (b.isConnected) b.remove(); } else if (!got) msg.textContent = "Permesso ai sensori negato."; }).catch(() => {});
    const b = el("button", { cls: "btn primary block", on: { click: ask } }, "Attiva i sensori di movimento");
    ask(); setTimeout(() => { if (!got && !b.isConnected) p.insertBefore(b, c); }, 1500);
  }
  onLeave(() => window.removeEventListener("devicemotion", h0, true));
}

function compareView(ex) {
  setTitle("Prima e dopo", ex.title);
  const p = page();
  if (ex.id === "vajont") {
    p.append(el("h3", null, "La valle in sezione, prima e dopo la frana"));
    p.append(el("p", { cls: "small muted" }, "Sezione N-S attraverso la valle fra il monte Salta e il monte Toc. Trascina il cursore: a sinistra la situazione prima del 1963, a destra quella dopo. Si vede la massa che ha riempito la valle e la superficie di scivolamento rimasta scoperta. Fonte: Hendron & Patton 1985."));
    p.append(beforeAfter("img/ba_sezione_prima.jpg", "img/ba_sezione_dopo.jpg", "prima", "dopo"));
    p.append(el("h3", { style: "margin-top:18px" }, "Longarone"));
    p.append(el("p", { cls: "small muted" }, "Due riprese aeree, prima della catastrofe e dopo il passaggio dell'onda; i punti di vista sono diversi, per cui le due immagini si alternano. Fonte: Genevois & Tecca 2013."));
    const tog = el("div", { cls: "seq" }); const im = el("img", { src: "img/cmp_longarone_prima.jpg", alt: "" }); const yrs = el("div", { cls: "yrs" });
    [["prima", "img/cmp_longarone_prima.jpg"], ["dopo", "img/cmp_longarone_dopo.jpg"]].forEach(([l, s], i) => yrs.append(el("button", { cls: i ? "" : "on", on: { click: e => { im.src = s; yrs.querySelectorAll("button").forEach(b => b.classList.remove("on")); e.currentTarget.classList.add("on"); } } }, l)));
    tog.append(im, yrs); p.append(tog);
    p.append(el("h3", { style: "margin-top:18px" }, "La parete di scivolamento, dal 1964 al 2011"));
    p.append(el("p", { cls: "small muted" }, "Cinque riprese della superficie di scivolamento; le aree evidenziate sono i lembi di roccia rimossi o instabili in ciascun periodo. La nicchia è ancora attiva. Fonte: Wolter et al. 2014, fig. 15."));
    const seq = el("div", { cls: "seq" }); const im2 = el("img", { src: "img/seq_toc_1964.jpg", alt: "" }); const y2 = el("div", { cls: "yrs" });
    ["1964", "1985", "1993", "2002", "2011"].forEach((y, i) => y2.append(el("button", { cls: i ? "" : "on", on: { click: e => { im2.src = "img/seq_toc_" + y + ".jpg"; y2.querySelectorAll("button").forEach(b => b.classList.remove("on")); e.currentTarget.classList.add("on"); } } }, y)));
    seq.append(im2, y2); p.append(seq);
    p.append(el("p", { cls: "small muted", style: "margin-top:8px" }, "Un'animazione automatica: "), el("button", { cls: "btn sm", on: { click: e => { let i = 0; const ys = ["1964", "1985", "1993", "2002", "2011"]; const t = setInterval(() => { i = (i + 1) % ys.length; im2.src = "img/seq_toc_" + ys[i] + ".jpg"; y2.querySelectorAll("button").forEach((b, j) => b.classList.toggle("on", j === i)); if (i === ys.length - 1) clearInterval(t); }, 1400); } } }, "Riproduci"));
  } else {
    p.append(el("h3", null, "La Val Rosandra in due carte"));
    p.append(el("p", { cls: "small muted" }, "La Carta d'Italia attuale al 25.000 e la levata storica a tratteggio dello stesso territorio: due soluzioni grafiche per un paesaggio di forme fitte. Fonte: Cucchi, scheda 58 dell'Atlante IGM."));
    const tog = el("div", { cls: "seq" }); const im = el("img", { src: "img/c_igmi_q2.jpg", alt: "" }); const yrs = el("div", { cls: "yrs" });
    [["carta attuale", "img/c_igmi_q2.jpg"], ["levata storica", "img/c_igmi_q3.jpg"]].forEach(([l, s], i) => yrs.append(el("button", { cls: i ? "" : "on", on: { click: e => { im.src = s; yrs.querySelectorAll("button").forEach(b => b.classList.remove("on")); e.currentTarget.classList.add("on"); } } }, l)));
    tog.append(im, yrs); p.append(tog);
    p.append(el("h3", { style: "margin-top:18px" }, "Due grotte a confronto"));
    p.append(el("table", { cls: "t" }, el("thead", null, el("tr", null, el("th", null, ""), el("th", null, "San Canziano"), el("th", null, "Grotta Gigante"))), el("tbody", null, ...[["Tipo", "grotta di attraversamento", "caverna di dissoluzione e crollo"], ["Acqua", "fiume attivo, cascate, laghi", "nessun corso d'acqua"], ["Forma", "canyon sotterraneo, 2.600 m, alto 146 m", "una sala, 167,6 × 76,3 × 98,5 m"], ["Dove si legge il tempo", "livelli abbandonati dal fiume, concrezionati", "stalagmiti sui blocchi di crollo"], ["Temperatura", "10-11 °C medie, escursioni di 15 °C", "11 °C costanti"], ["Destino", "doline di crollo già aperte", "dolina di crollo fra centinaia di migliaia di anni"]].map(r => el("tr", null, el("td", { style: "font-weight:600" }, r[0]), el("td", null, r[1]), el("td", null, r[2]))))));
  }
}

function beforeAfter(a, b, la, lb) {
  const w = el("div", { cls: "ba" }, el("img", { src: a, alt: "" }), el("div", { cls: "after" }, el("img", { src: b, alt: "" })), el("div", { cls: "handle" }), el("span", { cls: "lab l" }, la), el("span", { cls: "lab r" }, lb));
  const set = x => { const r = w.getBoundingClientRect(); const pct = Math.max(0, Math.min(100, (x - r.left) / r.width * 100)); w.querySelector(".after").style.clipPath = "inset(0 0 0 " + pct + "%)"; w.querySelector(".handle").style.left = pct + "%"; };
  let down = false; w.addEventListener("pointerdown", e => { down = true; w.setPointerCapture(e.pointerId); set(e.clientX); }); w.addEventListener("pointermove", e => { if (down) set(e.clientX); }); w.addEventListener("pointerup", () => down = false); w.addEventListener("pointercancel", () => down = false);
  return w;
}

function sketchView(ex) {
  setTitle("Schizzo panoramico", ex.title);
  const p = page(el("p", { cls: "lead" }, "Scatta o scegli una foto del versante, poi disegna sopra con il dito la traccia degli strati, le faglie, il limite della frana e le forme. Ruotando il telefono in orizzontale la lavagna occupa tutto lo schermo; lo schizzo resta salvo anche se l'app si chiude e con «Salva nel taccuino» lo archivi."));
  const KEY = "sketch." + ex.id, MAXS = 1600;
  const canvas = el("canvas", { cls: "sk-canvas" }); const ctx = canvas.getContext("2d");
  let bg = null, strokes = [], cur = null, drawing = false, color = "#c00000", thick = 0.005, full = false, autoFull = false, stream = null, camEl = null, suppress = false;
  const toWork = (src, sw, sh) => { const k = Math.min(1, MAXS / Math.max(sw, sh)); const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(sw * k)); c.height = Math.max(1, Math.round(sh * k)); c.getContext("2d").drawImage(src, 0, 0, c.width, c.height); return c; };
  const setSize = () => { if (bg) { canvas.width = bg.width; canvas.height = bg.height; } else { canvas.width = MAXS; canvas.height = Math.round(MAXS * 0.66); } };
  const paintStroke = s => { if (!s.p.length) return; ctx.strokeStyle = s.c; ctx.lineWidth = s.w * canvas.width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); s.p.forEach((pt, i) => { const x = pt[0] * canvas.width, y = pt[1] * canvas.height; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); if (s.p.length === 1) ctx.lineTo(s.p[0][0] * canvas.width + 0.1, s.p[0][1] * canvas.height); ctx.stroke(); };
  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bg) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = "#e8e4dc"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#777"; ctx.font = Math.round(canvas.width / 34) + "px sans-serif"; ctx.textAlign = "center"; ctx.fillText("Scatta una foto o disegna su sfondo neutro", canvas.width / 2, canvas.height / 2); }
    strokes.forEach(paintStroke);
  };
  let saveT = 0; const saveDraft = (withImg) => { clearTimeout(saveT); saveT = setTimeout(() => { const d = store.get(KEY, {}) || {}; if (withImg) d.img = bg ? bg.toDataURL("image/jpeg", 0.8) : null; d.strokes = strokes; store.set(KEY, d); }, 250); };
  const setBg = c => { bg = c; strokes = []; setSize(); redraw(); fit(); saveDraft(true); };
  // dimensionamento a proporzioni costanti: la lavagna si adatta allo spazio disponibile senza deformarsi
  const host = el("div", { cls: "sk-host" }), stage = el("div", { cls: "sk-stage" }, canvas);
  const fit = () => {
    const land = matchMedia("(orientation: landscape) and (max-height: 600px)").matches;
    if (!land) suppress = false;
    if (land && !full && !suppress) setFull(true, true); else if (!land && full && autoFull) setFull(false);
    const a = canvas.width / canvas.height; const view = $("#view");
    const aw = Math.max(50, stage.clientWidth - (full ? 12 : 0));
    const ah = full ? Math.max(50, stage.clientHeight - 12) : Math.max(200, view.clientHeight - topBar.offsetHeight - tools.offsetHeight - 48);
    const w = Math.floor(Math.min(aw, ah * a)), h = Math.floor(w / a);
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
  };
  let fitT = 0; const refit = () => { requestAnimationFrame(fit); clearTimeout(fitT); fitT = setTimeout(fit, 350); };
  const setFull = (on, auto) => { full = on; autoFull = !!(on && auto); host.classList.toggle("full", on); document.body.classList.toggle("sk-lock", on); if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {}); refit(); };
  // disegno con coordinate normalizzate, indipendenti dalla dimensione a schermo
  const pos = e => { const r = canvas.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]; };
  canvas.addEventListener("pointerdown", e => { e.preventDefault(); drawing = true; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} cur = { c: color, w: thick, p: [pos(e)] }; strokes.push(cur); paintStroke(cur); });
  canvas.addEventListener("pointermove", e => { if (!drawing) return; const pts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; const last = cur.p[cur.p.length - 1]; ctx.strokeStyle = cur.c; ctx.lineWidth = cur.w * canvas.width; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(last[0] * canvas.width, last[1] * canvas.height); for (const q of (pts.length ? pts : [e])) { const pt = pos(q); cur.p.push(pt); ctx.lineTo(pt[0] * canvas.width, pt[1] * canvas.height); } ctx.stroke(); });
  const end = () => { if (!drawing) return; drawing = false; saveDraft(false); };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
  // fotocamera dentro l'app: il telefono non passa all'app Fotocamera, quindi la pagina non viene ricaricata e la foto arriva sulla lavagna
  const stopCam = () => { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; if (camEl) camEl.remove(); camEl = null; };
  const inpCam = el("input", { type: "file", accept: "image/*", capture: "environment", style: "display:none" });
  const inpGal = el("input", { type: "file", accept: "image/*", style: "display:none" });
  const decode = async f => {
    if (window.createImageBitmap) { try { const b = await createImageBitmap(f, { imageOrientation: "from-image" }); const c = toWork(b, b.width, b.height); if (b.close) b.close(); return c; } catch (err) {} }
    return new Promise((res, rej) => { const u = URL.createObjectURL(f); const im = new Image(); im.onload = () => { URL.revokeObjectURL(u); res(toWork(im, im.naturalWidth, im.naturalHeight)); }; im.onerror = () => { URL.revokeObjectURL(u); rej(new Error("decode")); }; im.src = u; });
  };
  const onFile = async inp => { const f = inp.files && inp.files[0]; inp.value = ""; if (!f) return; try { setBg(await decode(f)); } catch (err) { toast("Questa immagine non si apre, prova con un'altra foto"); } };
  inpCam.addEventListener("change", () => onFile(inpCam)); inpGal.addEventListener("change", () => onFile(inpGal));
  const openCam = async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { inpCam.click(); return; }
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } }); }
    catch (err) { stream = null; toast("Fotocamera non disponibile, si apre la scelta della foto"); inpCam.click(); return; }
    const video = el("video", { playsinline: "", autoplay: "", muted: "" }); video.muted = true; video.srcObject = stream;
    const shoot = () => { if (!video.videoWidth) return; const c = toWork(video, video.videoWidth, video.videoHeight); stopCam(); setBg(c); };
    camEl = el("div", { cls: "sk-cam" }, video, el("div", { cls: "bar" }, el("button", { cls: "btn", on: { click: stopCam } }, "Annulla"), el("button", { cls: "sk-shutter", "aria-label": "Scatta la foto", on: { click: shoot } }), el("button", { cls: "btn", on: { click: () => { stopCam(); inpGal.click(); } } }, "Galleria")));
    document.body.append(camEl); video.play().catch(() => {});
  };
  // strumenti
  const colBtns = [];
  const pal = el("div", { cls: "sk-pal" });
  [["#c00000", "strati"], ["#111111", "faglie"], ["#1f78b4", "acqua"], ["#2e7d32", "forme"], ["#ffffff", "note"]].forEach(([c, l]) => { const b = el("button", { cls: "btn sm sk-col" + (c === color ? " on" : ""), "aria-label": l, on: { click: () => { color = c; colBtns.forEach(x => x.classList.toggle("on", x === b)); } } }, el("span", { cls: "dot", style: "background:" + c + ";border:1px solid #999" }), el("span", { cls: "lab" }, l)); colBtns.push(b); pal.append(b); });
  const thickBtn = el("button", { cls: "btn sm", on: { click: () => { thick = thick > 0.007 ? 0.005 : 0.01; thickBtn.lastChild.textContent = thick > 0.007 ? "Tratto spesso" : "Tratto fine"; } } }, el("span", { cls: "lab" }, "Tratto fine"));
  const save = async () => { const data = canvas.toDataURL("image/jpeg", 0.85); await NB.add({ ex: ex.id, stop: null, text: "Schizzo panoramico", ts: Date.now(), lat: Geo.pos ? Geo.pos[0] : null, lon: Geo.pos ? Geo.pos[1] : null, photo: data }); toast("Schizzo salvato nel taccuino"); };
  const acts = el("div", { cls: "sk-acts" },
    el("button", { cls: "btn sm", on: { click: () => { strokes.pop(); redraw(); saveDraft(false); } } }, "Annulla tratto"),
    el("button", { cls: "btn sm", on: { click: () => { strokes = []; redraw(); saveDraft(false); } } }, "Pulisci"),
    thickBtn,
    el("button", { cls: "btn sm primary", on: { click: save } }, "Salva nel taccuino"),
    el("button", { cls: "btn sm sk-exit", on: { click: () => { suppress = matchMedia("(orientation: landscape)").matches; setFull(false); } } }, "Esci"));
  const tools = el("div", { cls: "sk-tools" }, pal, acts);
  const topBar = el("div", { cls: "row wrap sk-top" },
    el("button", { cls: "btn", on: { click: openCam }, html: SVG.cam + " Scatta foto" }),
    el("button", { cls: "btn", on: { click: () => inpGal.click() } }, "Dalla galleria"),
    el("button", { cls: "btn", on: { click: () => { setFull(true); const d = document.documentElement; if (d.requestFullscreen && !isStandalone()) d.requestFullscreen().catch(() => {}); } }, html: SVG.fit + " Schermo intero" }));
  host.append(topBar, stage, tools, inpCam, inpGal); p.append(host);
  // ripristino della bozza salvata
  const d = store.get(KEY, null);
  if (d && Array.isArray(d.strokes)) strokes = d.strokes.filter(s => s && Array.isArray(s.p) && s.p.length && s.p[0][0] <= 1);
  if (d && d.img) { const im = new Image(); im.onload = () => { bg = toWork(im, im.naturalWidth, im.naturalHeight); setSize(); redraw(); fit(); }; im.src = d.img; }
  setSize(); redraw();
  const ro = window.ResizeObserver ? new ResizeObserver(refit) : null; if (ro) ro.observe(stage);
  window.addEventListener("resize", refit); window.addEventListener("orientationchange", refit);
  setTimeout(fit, 30);
  onLeave(() => { stopCam(); if (ro) ro.disconnect(); window.removeEventListener("resize", refit); window.removeEventListener("orientationchange", refit); document.body.classList.remove("sk-lock"); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); });
}

/* ------------------------------------------------------------------ taccuino (IndexedDB) */
const NB = {
  db: null,
  open() { return new Promise((res, rej) => { if (this.db) return res(this.db); const r = indexedDB.open("paesaggi", 1); r.onupgradeneeded = () => { r.result.createObjectStore("notes", { keyPath: "id", autoIncrement: true }); }; r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async add(n) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction("notes", "readwrite"); t.objectStore("notes").add(n); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  async all() { const db = await this.open(); return new Promise((res, rej) => { const r = db.transaction("notes").objectStore("notes").getAll(); r.onsuccess = () => res(r.result.sort((a, b) => b.ts - a.ts)); r.onerror = () => rej(r.error); }); },
  async del(id) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction("notes", "readwrite"); t.objectStore("notes").delete(id); t.oncomplete = res; t.onerror = () => rej(t.error); }); }
};
function shrink(file, max) { return new Promise(res => { const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", 0.82)); }; im.src = u; }); }

const TRASH = '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
function notebookView(ex) {
  const exId = ex ? ex.id : cur.exId; const E = exId ? EX[exId] : null;
  setTitle("Taccuino di campo", E ? E.title : "");
  const arg = cur.arg || ""; let pre = "", stopN = null;
  if (/^\d+$/.test(arg)) { stopN = +arg; const s = E && E.stops.find(x => x.n === stopN); pre = s ? "Tappa " + s.n + ", " + s.name + ". " : ""; }
  else if (/^q\d+$/.test(arg) && E) { const q = E.questions[+arg.slice(1) - 1]; pre = q ? "Domanda " + arg.slice(1) + ": " + q + "\nRisposta: " : ""; }
  else if (/^clino\d+$/.test(arg)) pre = "Inclinazione misurata: " + arg.slice(5) + "°. Superficie: ";
  const p = page(el("p", { cls: "lead" }, "Appunti, misure e foto, salvati soltanto su questo dispositivo. Ogni nota registra ora e posizione. Alla fine puoi condividere o stampare il taccuino."));
  const ta = el("textarea", { cls: "note", placeholder: "Che cosa vedi, che cosa misuri, che cosa ti chiedi…" }); ta.value = pre;
  const sel = el("select", { cls: "search", style: "margin:8px 0" }, el("option", { value: "" }, "Nessuna tappa"), ...(E ? E.stops.map(s => el("option", { value: s.n }, "Tappa " + s.n + ", " + s.name)) : []));
  if (stopN) sel.value = stopN;
  const file = el("input", { type: "file", accept: "image/*", capture: "environment", style: "display:none" }); let photo = null;
  const prev = el("div", { cls: "small muted" });
  file.addEventListener("change", async () => { if (file.files[0]) { photo = await shrink(file.files[0], 1280); prev.innerHTML = ""; prev.append(el("img", { src: photo, style: "max-height:120px;border-radius:8px" })); } });
  const form = el("div", { cls: "card" }, ta, sel, el("div", { cls: "row wrap" }, el("button", { cls: "btn sm", on: { click: () => file.click() }, html: SVG.cam + " Foto" }), el("button", { cls: "btn sm", on: { click: () => { if (Geo.pos) ta.value += (ta.value && !ta.value.endsWith(" ") ? " " : "") + "[" + Geo.pos[0].toFixed(5) + ", " + Geo.pos[1].toFixed(5) + (Geo.acc ? " ± " + Math.round(Geo.acc) + " m" : "") + "]"; else toast("Posizione non disponibile"); } } }, "Inserisci coordinate"), el("button", { cls: "btn sm primary grow", on: { click: async () => { if (!ta.value.trim() && !photo) return toast("Nota vuota"); await NB.add({ ex: exId, stop: sel.value ? +sel.value : null, text: ta.value.trim(), ts: Date.now(), lat: Geo.pos ? Geo.pos[0] : null, lon: Geo.pos ? Geo.pos[1] : null, acc: Geo.acc, photo }); ta.value = ""; photo = null; prev.innerHTML = ""; toast("Nota salvata"); list(); } } }, "Salva")), prev, file);
  p.append(form);
  const tools = el("div", { cls: "row wrap", style: "margin-bottom:10px" }, el("button", { cls: "btn sm", on: { click: exportText }, html: SVG.share + " Condividi testo" }), el("button", { cls: "btn sm", on: { click: printNotes } }, "Stampa / PDF"), el("button", { cls: "btn sm", on: { click: exportJson } }, "Backup .json"));
  p.append(tools);
  const lst = el("div"); p.append(lst);
  async function list() { const notes = (await NB.all()).filter(n => !exId || n.ex === exId); lst.innerHTML = ""; if (!notes.length) { lst.append(el("p", { cls: "muted small" }, "Nessuna nota ancora.")); return; } for (const n of notes) { const s = n.stop && EX[n.ex] ? EX[n.ex].stops.find(x => x.n === n.stop) : null; lst.append(el("div", { cls: "card noteitem" }, n.photo ? el("img", { src: n.photo, on: { click: () => Viewer.open(n.photo, "Foto del taccuino", new Date(n.ts).toLocaleString("it-IT")) } }) : null, el("div", { cls: "grow" }, el("div", { cls: "when" }, new Date(n.ts).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) + (s ? ", tappa " + s.n : "") + (n.lat ? ", " + n.lat.toFixed(4) + " " + n.lon.toFixed(4) : "")), el("div", { style: "white-space:pre-wrap" }, n.text)), el("button", { cls: "iconbtn", title: "Elimina", on: { click: async e => { const b = e.currentTarget; if (b.dataset.arm) { await NB.del(n.id); list(); } else { b.dataset.arm = "1"; b.innerHTML = "<span style='color:var(--red);font-size:.8em;font-weight:600'>Elimina?</span>"; b.style.width = "auto"; setTimeout(() => { delete b.dataset.arm; b.innerHTML = TRASH; b.style.width = ""; }, 3000); } } }, html: TRASH }))); } }
  list();
  async function exportText() { const notes = (await NB.all()).filter(n => !exId || n.ex === exId); const txt = (E ? E.title + "\n" : "") + "Taccuino di campo\n\n" + notes.map(n => new Date(n.ts).toLocaleString("it-IT") + (n.stop ? ", tappa " + n.stop : "") + (n.lat ? ", " + n.lat.toFixed(5) + " " + n.lon.toFixed(5) : "") + "\n" + n.text).join("\n\n"); if (navigator.share) { try { await navigator.share({ title: "Taccuino di campo", text: txt }); return; } catch (e) {} } const b = new Blob([txt], { type: "text/plain" }); const a = el("a", { href: URL.createObjectURL(b), download: "taccuino_" + (exId || "campo") + ".txt" }); document.body.append(a); a.click(); a.remove(); }
  async function exportJson() { const notes = await NB.all(); const b = new Blob([JSON.stringify(notes)], { type: "application/json" }); const a = el("a", { href: URL.createObjectURL(b), download: "taccuino_backup.json" }); document.body.append(a); a.click(); a.remove(); }
  async function printNotes() { const notes = (await NB.all()).filter(n => !exId || n.ex === exId); const w = window.open("", "_blank"); if (!w) return toast("Consenti le finestre pop-up per stampare"); w.document.write("<html><head><meta charset='utf-8'><title>Taccuino di campo</title><style>body{font:12pt Calibri,Arial,sans-serif;margin:2cm;color:#222}h1{color:#c00000;font-weight:300}.n{border-bottom:1px solid #ddd;padding:8px 0;page-break-inside:avoid}.w{color:#777;font-size:.85em}img{max-width:9cm;max-height:7cm;display:block;margin:6px 0;border-radius:4px}pre{white-space:pre-wrap;font:inherit;margin:4px 0}</style></head><body><h1>Taccuino di campo" + (E ? " — " + esc(E.title) : "") + "</h1>" + notes.map(n => "<div class='n'><div class='w'>" + new Date(n.ts).toLocaleString("it-IT") + (n.stop ? ", tappa " + n.stop : "") + (n.lat ? ", " + n.lat.toFixed(5) + " " + n.lon.toFixed(5) : "") + "</div>" + (n.photo ? "<img src='" + n.photo + "'>" : "") + "<pre>" + esc(n.text) + "</pre></div>").join("") + "<script>setTimeout(function(){window.print()},400)<\/script></body></html>"); w.document.close(); }
}

/* ------------------------------------------------------------------ docente, altro, info */
function teacherView(ex) {
  setTitle("Modalità docente", ex.title);
  const on = store.get("docente", false);
  const p = page();
  if (!on) {
    const inp = el("input", { type: "password", inputmode: "numeric", maxlength: "4", autocomplete: "off" });
    p.append(el("div", { cls: "card pin", style: "text-align:center" }, el("div", { style: "color:var(--red);margin-bottom:8px", html: SVG.lock.replace("<svg", '<svg style="width:36px;height:36px;stroke:currentColor;fill:none;stroke-width:1.6"') }), el("h3", null, "Area riservata al docente"), el("p", { cls: "small muted" }, "Le note per le spiegazioni in pullman e i promemoria per ogni tappa."), inp, el("div", { style: "margin-top:12px" }, el("button", { cls: "btn primary", on: { click: () => { if (inp.value === "2239") { store.set("docente", true); render(); } else { toast("PIN errato"); inp.value = ""; } } } }, "Entra"))));
    inp.addEventListener("keydown", e => { if (e.key === "Enter") p.querySelector(".btn.primary").click(); });
    return;
  }
  p.append(el("div", { cls: "row", style: "margin-bottom:10px" }, el("p", { cls: "lead grow", style: "margin:0" }, "Note per le spiegazioni in pullman, un blocco per ogni sosta."), el("button", { cls: "btn sm", on: { click: () => { store.set("docente", false); render(); } } }, "Esci")));
  ex.teacher.forEach((b, i) => p.append(el("details", i === 0 ? { open: "" } : null, el("summary", null, b.h), el("div", { cls: "body" }, el("ul", { cls: "dots small" }, ...b.items.map(t => el("li", null, t)))))));
  p.append(el("div", { cls: "box small", style: "margin-top:14px" }, el("h4", null, "Audio delle tappe"), "Le introduzioni audio delle tappe sono lette da una voce sintetica a partire dai testi della guida. Per sostituirne una con la propria voce basta caricare nel sito un file audio/" + ex.id + "_N.m4a, dove N è il numero della tappa, al posto di quello esistente; l'app lo usa da sola."));
}

function moreView(ex) {
  setTitle("Altro", ex ? ex.title : "Paesaggi in campo");
  const exId = ex ? ex.id : cur.exId;
  const p = page();
  const items = [[exId ? "#/" + exId + "/taccuino" : "#/taccuino", "Taccuino di campo", "appunti, misure e foto"], ["#/installa", "Come si installa", "istruzioni per ogni browser, con le schermate"], ["#/controllo", "Controllo di partenza", "posizione, bussola, carte, figure e audio senza rete"], [exId ? "#/" + exId + "/docente" : "#/", "Modalità docente", "note per le spiegazioni in pullman (PIN)"], ["#/", "Cambia escursione", "Vajont o Carso Classico"]];
  for (const [h, t, d] of items) p.append(el("a", { cls: "card tap", href: h, style: "display:block;text-decoration:none;color:inherit" }, el("b", null, t), el("div", { cls: "small muted" }, d)));
  const big = store.get("big", false), theme = store.get("theme", "auto");
  p.append(el("div", { cls: "card" }, el("h3", null, "Lettura"),
    el("div", { cls: "row", style: "margin-bottom:8px" }, el("span", { cls: "grow" }, "Testo grande"), el("button", { cls: "btn sm " + (big ? "navy" : ""), on: { click: e => { const v = !store.get("big", false); store.set("big", v); applyPrefs(); e.currentTarget.className = "btn sm " + (v ? "navy" : ""); } } }, big ? "Sì" : "No")),
    el("div", { cls: "row" }, el("span", { cls: "grow" }, "Tema"), ...["auto", "light", "dark"].map(t => el("button", { cls: "btn sm " + (theme === t ? "navy" : ""), on: { click: e => { store.set("theme", t); applyPrefs(); e.currentTarget.parentNode.querySelectorAll("button").forEach(b => b.className = "btn sm"); e.currentTarget.className = "btn sm navy"; } } }, { auto: "automatico", light: "chiaro", dark: "scuro" }[t])))));
  if (exId) p.append(el("div", { cls: "card" }, el("h3", null, "Stato delle tappe"), el("p", { cls: "small muted" }, "Azzera le tappe segnate come fatte, per esempio all'inizio di una nuova giornata."), el("button", { cls: "btn sm", on: { click: () => { store.set("done." + exId, []); toast("Tappe azzerate"); } } }, "Azzera")));
  p.append(el("div", { cls: "card small" }, el("h3", null, "Crediti"), el("p", null, "Testi, figure e strutturazione didattica dalle guide dell'escursione del corso «Analisi e interpretazione dei paesaggi naturali» (A. Bondesan, DiSSGeA, Università di Padova). Le fonti scientifiche sono indicate in ogni didascalia e nei riferimenti bibliografici delle guide in PDF."), el("p", null, "Cartografia di base: © OpenStreetMap contributors (ODbL); rilievo OpenTopoMap (CC-BY-SA). Libreria cartografica Leaflet (BSD). Introduzioni audio sintetizzate con Piper, voce italiana «serena» (dataset CC BY 4.0). Gli overlay geologici e geomorfologici sono schematici, digitalizzati dalle figure citate, con la precisione indicata in ogni elemento; servono all'orientamento sul terreno e sostituiscono le carte originali soltanto per questo scopo."), el("p", { style: "margin:0" }, "Versione " + VERSION + ".")));
}

function applyPrefs() { document.documentElement.dataset.big = store.get("big", false) ? "1" : ""; const t = store.get("theme", "auto"); if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t; }

/* ------------------------------------------------------------------ visualizzatore immagini con zoom */
const Viewer = {
  s: 1, tx: 0, ty: 0, ptrs: new Map(), last: null, img: null,
  init() {
    this.img = $("#vImg"); const st = $("#vStage");
    $("#vClose").addEventListener("click", () => this.close()); $("#vFit").addEventListener("click", () => this.fit());
    st.addEventListener("pointerdown", e => { st.setPointerCapture(e.pointerId); this.ptrs.set(e.pointerId, [e.clientX, e.clientY]); this.last = null; });
    st.addEventListener("pointermove", e => { if (!this.ptrs.has(e.pointerId)) return; const prev = [...this.ptrs.values()]; this.ptrs.set(e.pointerId, [e.clientX, e.clientY]); const now = [...this.ptrs.values()]; if (now.length === 1) { this.tx += now[0][0] - prev[0][0]; this.ty += now[0][1] - prev[0][1]; } else if (now.length >= 2) { const d0 = Math.hypot(prev[0][0] - prev[1][0], prev[0][1] - prev[1][1]), d1 = Math.hypot(now[0][0] - now[1][0], now[0][1] - now[1][1]); const mx = (now[0][0] + now[1][0]) / 2, my = (now[0][1] + now[1][1]) / 2, pmx = (prev[0][0] + prev[1][0]) / 2, pmy = (prev[0][1] + prev[1][1]) / 2; const r = st.getBoundingClientRect(); this.zoomAt(d1 / d0, mx - r.left, my - r.top); this.tx += mx - pmx; this.ty += my - pmy; } this.apply(); });
    const up = e => { this.ptrs.delete(e.pointerId); }; st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up);
    st.addEventListener("wheel", e => { e.preventDefault(); const r = st.getBoundingClientRect(); this.zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); this.apply(); }, { passive: false });
    let lastTap = 0; st.addEventListener("pointerup", e => { const t = Date.now(); if (t - lastTap < 300) { const r = st.getBoundingClientRect(); if (this.s > this.fitScale * 1.5) this.fit(); else { this.zoomAt(2.5, e.clientX - r.left, e.clientY - r.top); this.apply(); } } lastTap = t; });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#viewer").classList.contains("on")) this.close(); });
    // alla rotazione la figura si riadatta allo schermo mantenendo le proporzioni
    let rt = 0; const refit = () => { if (!$("#viewer").classList.contains("on")) return; requestAnimationFrame(() => this.fit()); clearTimeout(rt); rt = setTimeout(() => this.fit(), 350); };
    window.addEventListener("resize", refit); window.addEventListener("orientationchange", refit);
  },
  zoomAt(k, x, y) { const ns = Math.max(this.fitScale * 0.8, Math.min(this.fitScale * 12, this.s * k)); k = ns / this.s; this.tx = x - (x - this.tx) * k; this.ty = y - (y - this.ty) * k; this.s = ns; },
  apply() { this.img.style.transform = "translate(" + this.tx + "px," + this.ty + "px) scale(" + this.s + ")"; },
  fit() { const st = $("#vStage"); const W = st.clientWidth, H = st.clientHeight, w = this.img.naturalWidth || 1, h = this.img.naturalHeight || 1; this.fitScale = Math.min(W / w, H / h); this.s = this.fitScale; this.tx = (W - w * this.s) / 2; this.ty = (H - h * this.s) / 2; this.apply(); },
  open(src, cap, source) { $("#viewer").classList.add("on"); $("#vTitle").textContent = ""; $("#vCap").innerHTML = esc(cap) + (source ? ' <span class="src">Fonte: ' + esc(source) + ".</span>" : ""); this.img.style.transform = "none"; this.img.onload = () => this.fit(); this.img.src = src; if (this.img.complete && this.img.naturalWidth) this.fit(); },
  close() { $("#viewer").classList.remove("on"); this.img.src = ""; }
};

/* ------------------------------------------------------------------ carta */
const MapCtl = {
  map: null, wrap: null, exId: null, layers: {}, overlays: {}, me: null, acc: null, hud: null, legendEl: null, base: null, bases: {},
  init() {
    this.wrap = el("div", { id: "mapwrap" }, el("div", { id: "map", style: "position:absolute;inset:0" }));
    $("#view").append(this.wrap);
    this.map = L.map(this.wrap.firstChild, { zoomControl: false, attributionControl: true, preferCanvas: false });
    L.control.zoom({ position: "topleft" }).addTo(this.map);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(this.map);
    this.bases.topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", { maxZoom: 17, maxNativeZoom: 17, subdomains: "abc", crossOrigin: "anonymous", attribution: "© OpenStreetMap, © OpenTopoMap (CC-BY-SA)" });
    this.bases.osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, crossOrigin: "anonymous", attribution: "© OpenStreetMap contributors" });
    this.base = store.get("base", "topo"); this.bases[this.base].addTo(this.map);
    this.map.on("click", () => this.sheet(null));
  },
  show(ex, arg) {
    setTitle("Carta", ex.title);
    const v = $("#view"); v.classList.add("full");
    if (!this.map) this.init(); else v.append(this.wrap);
    if (this.exId !== ex.id) this.load(ex);
    this.map.invalidateSize();
    if (arg && arg.startsWith("w")) { const w = ex.windows[+arg.slice(1)]; if (w) this.map.setView(w.coords, 13); }
    else if (arg) { const s = ex.stops.find(x => x.id === arg); if (s) { this.map.setView(s.coords, ex.id === "vajont" ? 15 : 14); this.openStop(ex, s); } }
    else if (this.exId !== ex.id || !this.map._loaded) this.map.setView(ex.center, ex.zoom);
    this.exId = ex.id;
    this.hookGoto();
    this.bindGeo();
  },
  hookGoto() { if (this._hk) return; this._hk = true; window.addEventListener("pic-goto", e => { const [la, lo, z] = e.detail; this.map && this.map.setView([la, lo], z); }); },
  detach() { if (this.wrap && this.wrap.parentNode) this.wrap.remove(); if (this.offGeo) { this.offGeo(); this.offGeo = null; } },
  styleFor(ex, k) {
    const lg = ex.legend.find(l => l.k === k); if (!lg) return {}; const [kind, rest] = lg.style.split(":"); const [col, ...mods] = rest.split(";");
    if (kind === "fill") return { color: col, weight: 1.2, fillColor: col, fillOpacity: 0.33, opacity: 0.9 };
    if (kind === "line") return { color: col, weight: mods.includes("thick") ? 3.5 : 2.5, dashArray: mods.includes("dash") ? "8 6" : mods.includes("dashdot") ? "10 5 2 5" : null, opacity: 0.95 };
    return { color: col };
  },
  load(ex) {
    const m = this.map;
    Object.values(this.layers).forEach(l => m.removeLayer(l)); this.layers = {}; this.overlays = {};
    // itinerario
    // itinerario reale, tratto per tratto, sulla geometria stradale completa
    const rt = D.routes && D.routes[ex.id];
    if (rt) {
      const g = L.featureGroup();
      const sty = { andata: { color: "#5b2a86", weight: 4.5, opacity: 0.95 }, rientro: { color: "#5b2a86", weight: 3.5, opacity: 0.75, dashArray: "10 9" }, piedi: { color: "#1b7f3b", weight: 5, opacity: 0.95, dashArray: "1 9", lineCap: "round" } };
      rt.legs.forEach(lg => {
        const st = sty[lg.kind] || sty.andata;
        g.addLayer(L.polyline(lg.coords, { color: "#ffffff", weight: st.weight + 3.5, opacity: 0.85, interactive: false }));
        const h = Math.floor(lg.min / 60), mm = lg.min % 60;
        g.addLayer(L.polyline(lg.coords, st).bindPopup("<b class='ttl'>" + esc(lg.label) + "</b>" + String(lg.km).replace(".", ",") + " km, circa " + (h ? h + " h " : "") + mm + " min" + (lg.roads && lg.roads.length ? "<div class='conf'>" + esc(lg.roads.filter(r => /^(A|SS|SR|SP|RA|E)\d|^\d+$/.test(r)).join(" › ")) + "</div>" : "")));
      });
      this.layers.route = g.addTo(m);
    }
    // overlay geologici
    const hidden = store.get("hide." + ex.id, []);
    ex.legend.forEach(lg => {
      const grp = L.featureGroup();
      ex.geo.features.filter(f => f.properties.k === lg.k).forEach(f => {
        const st = this.styleFor(ex, lg.k); let lyr;
        if (f.geometry.type === "Point") lyr = L.circleMarker([f.geometry.coordinates[1], f.geometry.coordinates[0]], { radius: 7, color: "#fff", weight: 2, fillColor: lg.style.split(":")[1].split(";")[0], fillOpacity: 1 });
        else lyr = L.geoJSON(f, { style: st });
        lyr.bindPopup("<b class='ttl'>" + esc(f.properties.name) + "</b>" + esc(f.properties.desc || "") + (f.properties.conf ? "<div class='conf'>Tracciato: " + esc(f.properties.conf) + "</div>" : ""));
        grp.addLayer(lyr);
      });
      this.overlays[lg.k] = grp; if (!hidden.includes(lg.k)) grp.addTo(m);
    });
    // finestrini
    const wg = L.featureGroup(); ex.windows.forEach((w, i) => { wg.addLayer(L.marker(w.coords, { icon: L.divIcon({ className: "", html: '<div class="marker-stop win">' + SVG.bus.replace("<svg", '<svg style="width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2.2"') + "</div>", iconSize: [26, 26], iconAnchor: [13, 13] }) }).on("click", () => this.sheet(el("div", null, el("b", { style: "color:var(--navy)" }, "Dal finestrino, " + w.name), el("p", { cls: "small", style: "margin:6px 0" }, w.text.length > 260 ? w.text.slice(0, 260) + "…" : w.text), el("a", { cls: "btn sm", href: "#/" + ex.id + "/finestrino/" + i }, "Leggi tutto"))))); }); this.layers.win = wg.addTo(m);
    // tappe
    const sg = L.featureGroup(); const done = store.get("done." + ex.id, []);
    ex.stops.forEach(s => { sg.addLayer(L.marker(s.coords, { icon: L.divIcon({ className: "", html: '<div class="marker-stop' + (done.includes(s.n) ? " done" : "") + '">' + s.n + "</div>", iconSize: [30, 30], iconAnchor: [15, 15] }), zIndexOffset: 500 }).on("click", () => this.openStop(ex, s))); if (ex.id === "vajont" || s.radius > 200) sg.addLayer(L.circle(s.coords, { radius: s.radius, color: "#c00000", weight: 1, dashArray: "3 4", fill: false, opacity: 0.6, interactive: false })); });
    this.layers.stops = sg.addTo(m);
    // bersagli
    const tg = L.featureGroup(); Object.values(ex.targets).forEach(t => tg.addLayer(L.circleMarker(t.coords, { radius: 4, color: "#fff", weight: 1.5, fillColor: "#2b3a4a", fillOpacity: 1 }).bindTooltip(t.name, { direction: "top", offset: [0, -4], className: "small" })));
    this.layers.targets = tg; if (store.get("showTargets", true)) tg.addTo(m);
    this.controls(ex);
  },
  controls(ex) {
    this.wrap.querySelectorAll(".mapctl, .sheet, .legend").forEach(e => e.remove());
    const tr = el("div", { cls: "mapctl tr" });
    const bGps = el("button", { cls: "mbtn" + (this.follow ? " on" : ""), title: "Segui la posizione", html: SVG.gps, on: { click: () => { if (!Geo.active()) Geo.start(); this.follow = !this.follow; bGps.classList.toggle("on", this.follow); if (this.follow && Geo.pos) this.map.setView(Geo.pos, Math.max(this.map.getZoom(), 15)); wakeLock(this.follow || busMode()); } } });
    const bLay = el("button", { cls: "mbtn", title: "Sfondo", html: SVG.layers, on: { click: () => { const nb = this.base === "topo" ? "osm" : "topo"; this.map.removeLayer(this.bases[this.base]); this.bases[nb].addTo(this.map).bringToBack(); this.base = nb; store.set("base", nb); toast(nb === "topo" ? "Sfondo: rilievo (OpenTopoMap)" : "Sfondo: stradale (OpenStreetMap)"); } } });
    const bLeg = el("button", { cls: "mbtn", title: "Legenda", html: SVG.legend, on: { click: () => { this.legendEl.classList.toggle("hidden"); } } });
    const bFit = el("button", { cls: "mbtn", title: "Inquadra l'area", html: SVG.fit, on: { click: () => this.map.setView(ex.center, ex.zoom) } });
    tr.append(bGps, bLay, bLeg, bFit); this.wrap.append(tr);
    // legenda
    const lg = el("div", { cls: "legend hidden" }, el("b", null, "Legenda"));
    const hidden = store.get("hide." + ex.id, []);
    ex.legend.forEach(l => { const [kind, rest] = l.style.split(":"); const [col, ...mods] = rest.split(";"); const sw = el("span", { cls: "sw " + kind + " " + mods.join(" "), style: kind === "fill" ? "background:" + col + "55;border:1.5px solid " + col : kind === "line" ? "border-color:" + col : "background:" + col }); const li = el("div", { cls: "li" + (hidden.includes(l.k) ? " off" : ""), on: { click: () => { const h = store.get("hide." + ex.id, []); const i = h.indexOf(l.k); if (i >= 0) { h.splice(i, 1); this.overlays[l.k].addTo(this.map); } else { h.push(l.k); this.map.removeLayer(this.overlays[l.k]); } store.set("hide." + ex.id, h); li.classList.toggle("off", i < 0); } } }, sw, el("span", null, l.n)); lg.append(li); });
    lg.append(el("div", { cls: "li" + (store.get("showTargets", true) ? "" : " off"), on: { click: e => { const v = !store.get("showTargets", true); store.set("showTargets", v); if (v) this.layers.targets.addTo(this.map); else this.map.removeLayer(this.layers.targets); e.currentTarget.classList.toggle("off", !v); } } }, el("span", { cls: "sw point", style: "background:#2b3a4a" }), el("span", null, "Bersagli del mirino")));
    lg.append(el("div", { cls: "li" }, el("span", { cls: "sw line", style: "border-color:#5b2a86;border-top-width:4px" }), el("span", null, "Itinerario del pullman, andata e trasferimenti")), el("div", { cls: "li" }, el("span", { cls: "sw line dash", style: "border-color:#5b2a86" }), el("span", null, "Rientro a Padova")), ...(ex.id === "vajont" ? [el("div", { cls: "li" }, el("span", { cls: "sw line dashdot", style: "border-color:#1b7f3b;border-top-width:4px" }), el("span", null, "Percorso a piedi, tappe 3-5"))] : []), el("div", { cls: "li" }, el("span", { cls: "marker-stop", style: "width:18px;height:18px;font-size:10px" }, "1"), el("span", null, "Tappe"), el("span", { cls: "marker-stop win", style: "width:18px;height:18px;margin-left:6px" }), el("span", null, "Finestrino")));
    lg.append(el("div", { cls: "muted", style: "margin-top:6px;font-size:.92em" }, "Tocca una voce per nasconderla. Gli overlay sono schematici: tocca un elemento per la precisione."));
    this.legendEl = lg; const bl = el("div", { cls: "mapctl bl" }, lg); this.wrap.append(bl);
    // HUD
    this.hud = el("div", { cls: "hud hidden" }); const br = el("div", { cls: "mapctl br" }, this.hud); this.wrap.append(br);
    // sheet
    this.sheetEl = el("div", { cls: "sheet" }, el("div", { cls: "grip" }), el("div", { cls: "sc" })); this.wrap.append(this.sheetEl);
  },
  sheet(content) { if (!this.sheetEl) return; if (!content) { this.sheetEl.classList.remove("on"); return; } const sc = this.sheetEl.querySelector(".sc"); sc.innerHTML = ""; sc.append(content); this.sheetEl.classList.add("on"); },
  openStop(ex, s) {
    const d = Geo.pos ? haversine(Geo.pos, s.coords) : null;
    this.sheet(el("div", null, el("div", { cls: "stop" }, el("div", { cls: "n" }, s.n), el("div", { cls: "grow" }, el("b", null, s.name), el("div", { cls: "meta" }, "ore " + s.time + (s.dur ? ", " + s.dur : "") + (d != null ? " · " + fmtDist(d) + ", azimut " + fmtAz(bearing(Geo.pos, s.coords)) : "")))), el("p", { cls: "small", style: "margin:8px 0" }, s.summary), el("div", { cls: "row wrap" }, el("a", { cls: "btn sm primary", href: "#/" + ex.id + "/tappa/" + s.n }, "Scheda della tappa"), el("a", { cls: "btn sm", href: "#/" + ex.id + "/strumenti/mirino/" + s.n }, "Mirino"), el("a", { cls: "btn sm", href: "https://www.google.com/maps/dir/?api=1&destination=" + s.coords.join(","), target: "_blank", rel: "noopener" }, "Naviga"))));
  },
  bindGeo() {
    if (this.offGeo) this.offGeo();
    const upd = () => {
      if (!Geo.pos) { this.hud.classList.toggle("hidden", !Geo.err); if (Geo.err) this.hud.innerHTML = "<span style='color:var(--warn)'>Posizione non disponibile: " + esc(Geo.err.message) + "</span>"; return; }
      if (!this.me) {
        this.me = L.marker(Geo.pos, { icon: L.divIcon({ className: "", html: '<div class="marker-me"><div class="arrow" style="display:none"></div></div>', iconSize: [20, 20], iconAnchor: [10, 10] }), zIndexOffset: 1000, interactive: false }).addTo(this.map);
        this.acc = L.circle(Geo.pos, { radius: Geo.acc || 0, color: "#1a73e8", weight: 1, fillOpacity: 0.08, interactive: false }).addTo(this.map);
      }
      this.me.setLatLng(Geo.pos); this.acc.setLatLng(Geo.pos).setRadius(Geo.acc || 0);
      const hd = Geo.bestHeading(); const ar = this.me.getElement() && this.me.getElement().querySelector(".arrow"); if (ar) { ar.style.display = hd != null ? "" : "none"; if (hd != null) ar.style.transform = "translateX(-50%) rotate(" + hd + "deg)"; }
      if (this.follow) this.map.panTo(Geo.pos, { animate: true });
      const ex = cur.ex; const nx = nextStop(ex);
      let h = "<div class='kv'><b>±</b><span class='num'>" + Math.round(Geo.acc || 0) + " m</span>";
      if (Geo.speed != null && Geo.speed > 0.5) h += "<b>v</b><span class='num'>" + Math.round(Geo.speed * 3.6) + " km/h</span>";
      if (hd != null) h += "<b>dir</b><span class='num'>" + fmtAz(hd) + " " + cardinal(hd) + "</span>";
      if (nx) h += "<b>tappa " + nx.n + "</b><span class='num'>" + fmtDist(haversine(Geo.pos, nx.coords)) + ", " + fmtAz(bearing(Geo.pos, nx.coords)) + "</span>";
      h += "</div>"; this.hud.innerHTML = h; this.hud.classList.remove("hidden");
    };
    upd(); this.offGeo = Geo.on(upd);
  }
};

/* ------------------------------------------------------------------ offline */
const Offline = {
  TILES: "pic-tiles-v1", IMGS: "pic-imgs-v1",
  tileKey(u) { return u.replace(/\/\/[abc]\.tile\./, "//tile."); },
  packs: {
    vajont: [{ b: [46.240, 12.280, 46.296, 12.400], z: [12, 16] }, { b: [45.40, 11.85, 46.30, 12.42], z: [9, 11] }, { b: [46.19, 12.27, 46.29, 12.31], z: [12, 14] }],
    carso: [{ b: [45.640, 13.550, 45.820, 14.020], z: [11, 14] }, { b: [45.40, 11.85, 45.90, 14.05], z: [9, 10] }, { b: [45.775, 13.575, 45.800, 13.605], z: [15, 16] }, { b: [45.650, 13.970, 45.675, 14.005], z: [15, 16] }, { b: [45.698, 13.750, 45.718, 13.780], z: [15, 16] }]
  },
  tileUrls(exId) {
    const out = new Set(); const sub = "abc";
    for (const p of this.packs[exId]) for (let z = p.z[0]; z <= p.z[1]; z++) {
      const n = 2 ** z; const x0 = Math.floor((p.b[1] + 180) / 360 * n), x1 = Math.floor((p.b[3] + 180) / 360 * n);
      const ty = lat => Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
      const y0 = ty(p.b[2]), y1 = ty(p.b[0]);
      for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.add("https://" + sub[Math.abs(x + y) % 3] + ".tile.opentopomap.org/" + z + "/" + x + "/" + y + ".png");
    }
    return [...out];
  },
  list(ex) {
    const imgs = [...new Set([...ex.figures.map(f => "img/" + f.id + ".jpg"), ...ex.figures.map(f => "img/thumb/" + f.id + ".jpg"), ex.cover, "img/ritrovo1.jpg", "img/ritrovo2.jpg", ...Object.keys((window.DATA.audio || {})[ex.id] || {}).map(n => "audio/" + ex.id + "_" + n + ".m4a"), ...(ex.id === "vajont" ? ["img/ba_sezione_prima.jpg", "img/ba_sezione_dopo.jpg", "img/cmp_longarone_prima.jpg", "img/cmp_longarone_dopo.jpg", "img/seq_toc_1964.jpg", "img/seq_toc_1985.jpg", "img/seq_toc_1993.jpg", "img/seq_toc_2002.jpg", "img/seq_toc_2011.jpg"] : [])])];
    return [...this.tileUrls(ex.id).map(u => ({ u, c: this.TILES, k: this.tileKey(u) })), ...imgs.map(u => ({ u, c: this.IMGS, k: new URL(u, location.href).href }))];
  },
  async status(ex) {
    if (!("caches" in window)) return { done: 0, total: 1 };
    const jobs = this.list(ex); const ct = await caches.open(this.TILES), ci = await caches.open(this.IMGS);
    const have = new Set([...(await ct.keys()).map(r => r.url), ...(await ci.keys()).map(r => r.url)]);
    return { done: jobs.filter(j => have.has(j.k)).length, total: jobs.length };
  },
  async prefetch(ex, onp) {
    const caches_ = { [this.TILES]: await caches.open(this.TILES), [this.IMGS]: await caches.open(this.IMGS) };
    const jobs = this.list(ex);
    let n = 0, err = 0; const total = jobs.length; onp(0, total, 0);
    const worker = async () => { while (jobs.length) { const j = jobs.shift(); const c = caches_[j.c]; try { if (!(await c.match(j.k))) { const r = await fetch(j.u, { mode: "cors", cache: "force-cache" }); if (r.ok) await c.put(j.k, r); else err++; } } catch (e) { err++; } n++; if (n % 5 === 0 || n === total) onp(n, total, err); } };
    await Promise.all([worker(), worker(), worker(), worker()]);
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) {}
    store.set("offline." + ex.id, Date.now());
  }
};

/* ------------------------------------------------------------------ controllo di partenza */
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: window-controls-overlay)").matches || navigator.standalone === true;
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
function controlloView() {
  setTitle("Controllo di partenza", "Paesaggi in campo");
  const p = page(el("p", { cls: "lead" }, "Cinque verifiche da fare a casa, con il Wi-Fi, il giorno prima dell'escursione. Quando tutte le righe sono verdi, il telefono è pronto e non serve altro."));
  const box = el("div", { cls: "card" }); p.append(box);
  const verdict = el("div", { cls: "card", style: "text-align:center" }); p.append(verdict);
  const exSel = store.get("controlloEx", cur.exId || "vajont");
  const row = (ok, title, detail, action) => el("div", { cls: "row", style: "padding:10px 0;border-bottom:1px solid var(--line);align-items:flex-start" }, el("span", { style: "width:26px;height:26px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;background:" + (ok === true ? "var(--ok)" : ok === false ? "var(--red)" : "var(--warn)") }, ok === true ? "✓" : ok === false ? "!" : "?"), el("div", { cls: "grow" }, el("b", null, title), el("div", { cls: "small muted" }, detail), action || null));
  let drawGen = 0;
  async function draw() {
    const gen = ++drawGen; const out = el("div");
    out.append(el("div", { cls: "tabs" }, ...["vajont", "carso"].map(k => el("button", { cls: k === store.get("controlloEx", exSel) ? "on" : "", on: { click: () => { store.set("controlloEx", k); draw(); } } }, EX[k].title))));
    const exk = EX[store.get("controlloEx", exSel)];
    const res = {};
    // 1. installazione
    res.inst = isStandalone() || !isMobile();
    out.append(row(isStandalone() ? true : (isMobile() ? false : null), "App installata", isStandalone() ? "L'app è aperta dall'icona, a schermo intero." : isMobile() ? "Stai usando il browser. Installa l'app, poi aprila dall'icona e rifai il controllo." : "Su computer l'installazione è facoltativa.", isStandalone() ? null : el("a", { cls: "btn sm primary", href: "#/installa", style: "margin-top:6px" }, "Come si installa")));
    // 2. posizione
    let geo = "prompt"; try { if (navigator.permissions) geo = (await navigator.permissions.query({ name: "geolocation" })).state; } catch (e) {}
    if (gen !== drawGen) return;
    if (Geo.pos) geo = "granted";
    res.geo = geo === "granted";
    out.append(row(geo === "granted" ? true : geo === "denied" ? false : null, "Posizione", geo === "granted" ? (Geo.pos ? "Attiva, precisione ± " + Math.round(Geo.acc) + " m." : "Permesso concesso.") : geo === "denied" ? "Permesso negato: va riattivato nelle impostazioni del telefono (vedi «Come si installa», ultima sezione)." : "Non ancora concessa.", geo === "granted" ? null : el("button", { cls: "btn sm primary", style: "margin-top:6px", on: { click: () => { Geo.start(); const off = Geo.on(() => { if (Geo.pos || Geo.err) { off(); draw(); } }); } } }, "Consenti la posizione")));
    // 3. bussola
    const hasHead = Geo.compass != null;
    out.append(row(hasHead ? true : null, "Bussola", hasHead ? "Funziona: direzione " + fmtAz(Geo.compass) + "." : "Serve al mirino del paesaggio. Tocca il pulsante e ruota il telefono; alcuni tablet non hanno il sensore.", hasHead ? null : el("button", { cls: "btn sm", style: "margin-top:6px", on: { click: () => { Geo.startCompass(true); setTimeout(draw, 2500); } } }, "Prova la bussola")));
    // 4. contenuti offline
    const st = await Offline.status(exk); if (gen !== drawGen) return; const pct = Math.round(st.done / st.total * 100);
    res.off = pct >= 97;
    const bar = el("div", { cls: "progress", style: "margin-top:6px" }, el("i", { style: "width:" + pct + "%" }));
    const btn = el("button", { cls: "btn sm primary", style: "margin-top:6px", on: { click: async () => { btn.disabled = true; btn.textContent = "Scaricamento…"; await Offline.prefetch(exk, (n, t) => { bar.firstChild.style.width = Math.round(n / t * 100) + "%"; btn.textContent = "Scaricamento… " + Math.round(n / t * 100) + "%"; }); draw(); } } }, pct > 0 ? "Completa lo scaricamento" : "Scarica carte, figure e audio");
    out.append(row(res.off, "Carte, figure e audio senza rete, " + exk.title, pct + "% scaricato (" + st.done + " di " + st.total + " elementi, circa 25 MB). Meglio con il Wi-Fi.", el("div", null, bar, res.off ? null : btn)));
    // 5. memoria
    let pers = null; try { if (navigator.storage && navigator.storage.persisted) pers = await navigator.storage.persisted(); } catch (e) {}
    if (gen !== drawGen) return;
    out.append(row(pers === true ? true : null, "Memoria protetta", pers ? "Il telefono non cancellerà i contenuti scaricati." : "Il browser decide da solo; su iPhone la protezione vale per l'app installata.", null));
    box.replaceChildren(...out.childNodes);
    const ready = res.geo && res.off && (isStandalone() || !isMobile());
    verdict.innerHTML = "";
    verdict.style.background = ready ? "var(--ok)" : "var(--card)"; verdict.style.color = ready ? "#fff" : "";
    verdict.append(el("div", { style: "font-size:1.4em;font-weight:600" }, ready ? "Pronto per l'escursione" : "Mancano ancora alcuni passi"), el("div", { cls: "small", style: "opacity:.9" }, ready ? exk.title + ", controllo del " + new Date().toLocaleDateString("it-IT") + ", versione " + VERSION : "Completa le righe gialle o rosse, poi torna qui."));
  }
  draw();
  onLeave(Geo.on(() => {}));
}


/* ------------------------------------------------------------------ istruzioni di installazione per browser */
function detectBrowser() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPod|iPad/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const inapp = /FBAN|FBAV|Instagram|Line\/|LinkedInApp|GSA\/|Telegram|MicroMessenger|Snapchat|WhatsApp|MoodleMobile/i.test(ua);
  if (ios) {
    if (/CriOS/.test(ua)) return "ios-chrome";
    if (/EdgiOS/.test(ua)) return "ios-edge";
    if (/FxiOS/.test(ua)) return "ios-edge";
    if (inapp || !/Safari\//.test(ua)) return "ios-inapp";
    return /iPad/.test(ua) || ua.includes("Macintosh") ? "ipad-safari" : "ios-safari";
  }
  if (/Android/.test(ua)) {
    if (inapp || /; wv\)/.test(ua)) return "android-inapp";
    if (/SamsungBrowser/.test(ua)) return "android-samsung";
    if (/Firefox/.test(ua)) return "android-firefox";
    if (/EdgA/.test(ua)) return "android-edge";
    if (/Chrome/.test(ua)) return "android-chrome";
    return "android-other";
  }
  if (/Edg\//.test(ua)) return "desktop-edge";
  if (/Firefox/.test(ua)) return "desktop-firefox";
  if (/Chrome/.test(ua)) return "desktop-chrome";
  if (/Safari/.test(ua) && /Macintosh/.test(ua)) return "mac-safari";
  return "other";
}
function guideBlock(g, open) {
  const body = el("div", { cls: "body" });
  if (g.lead) body.append(el("p", { cls: "small" }, g.lead));
  const ol = el("ol", { style: "padding-left:1.3em;margin:0" });
  g.steps.forEach(st => {
    const li = el("li", { style: "margin-bottom:12px" }, el("span", { html: md(st.t) }));
    if (st.img) li.append(el("img", { src: st.img, loading: "lazy", alt: "", style: "margin-top:6px;border-radius:10px;border:1px solid var(--line);max-height:420px;width:auto;max-width:100%;cursor:zoom-in", on: { click: () => Viewer.open(st.img, g.name + ". " + st.t.replace(/\*\*/g, ""), st.src || "schermata reale") } }));
    ol.append(li);
  });
  body.append(ol);
  if (g.after) body.append(el("div", { cls: "figinline" }, el("img", { src: g.after.img, loading: "lazy", alt: "", style: "border-radius:10px;border:1px solid var(--line);cursor:zoom-in", on: { click: () => Viewer.open(g.after.img, g.after.cap, "schermata reale") } }), el("div", { cls: "cap" }, g.after.cap)));
  if (g.note) body.append(el("p", { cls: "small muted", style: "margin-top:6px", html: md(g.note) }));
  if (g.src) body.append(el("p", { cls: "small muted", style: "margin:0" }, "Verificato su: " + g.src));
  return el("details", open ? { open: "" } : null, el("summary", null, g.name), body);
}
function installView() {
  setTitle("Come si installa", "Paesaggi in campo");
  const G = (window.DATA && window.DATA.installa) || {};
  const key = detectBrowser();
  const p = page();
  const url = location.origin + location.pathname.replace(/index\.html$/, "");
  if (isStandalone()) p.append(el("div", { cls: "card", style: "background:var(--ok);color:#fff" }, el("b", null, "L'app è già installata su questo dispositivo."), el("div", { cls: "small" }, "Prosegui con il controllo di partenza."), el("a", { cls: "btn sm", href: "#/controllo", style: "margin-top:8px" }, "Controllo di partenza")));
  const mine = G[key];
  if (mine && !isStandalone()) {
    const hd = el("div", { cls: "card" }, el("div", { cls: "small muted" }, "Il tuo dispositivo"), el("h2", { style: "margin:2px 0 8px" }, mine.name));
    if (deferredPrompt && mine.prompt !== false) hd.append(el("p", { cls: "small" }, "Questo browser permette l'installazione con un tocco."), el("button", { cls: "btn primary block", on: { click: async () => { deferredPrompt.prompt(); const r = await deferredPrompt.userChoice; deferredPrompt = null; if (r.outcome === "accepted") { toast("Installata. Aprila dall'icona."); } render(); } } }, "Installa l'app"), el("p", { cls: "small muted", style: "margin:8px 0 0" }, "Se il pulsante non compare o non funziona, segui i passi qui sotto."));
    p.append(hd);
    const blk = guideBlock(mine, true); blk.querySelector("summary").textContent = "Passo per passo"; p.append(blk);
  }
  p.append(el("a", { cls: "btn block", href: "docs/Manuale_installazione.pdf", target: "_blank", rel: "noopener", style: "margin-top:10px", html: SVG.pdf + " Manuale illustrato in PDF" }));
  p.append(el("h3", { style: "margin-top:18px" }, isStandalone() || !mine ? "Istruzioni per ogni browser" : "Altri dispositivi e browser"));
  const order = ["ios-safari", "ipad-safari", "ios-chrome", "ios-edge", "ios-inapp", "android-chrome", "android-samsung", "android-firefox", "android-edge", "android-inapp", "desktop-chrome", "desktop-edge", "mac-safari", "desktop-firefox", "permessi-ios", "permessi-android"];
  order.forEach(k => { if (G[k] && (k !== key || isStandalone())) p.append(guideBlock(G[k], false)); });
  const cp = el("div", { cls: "card small", style: "margin-top:14px" }, el("b", null, "Indirizzo dell'app"), el("div", { style: "font-family:ui-monospace,monospace;word-break:break-all;margin:4px 0 8px" }, url),
    el("button", { cls: "btn sm", on: { click: async e => { const b = e.currentTarget; try { await navigator.clipboard.writeText(url); b.textContent = "Copiato"; } catch (err) { b.textContent = "Copia non riuscita: seleziona il testo"; } } } }, "Copia l'indirizzo"));
  if (/^android/.test(key)) cp.append(el("a", { cls: "btn sm", style: "margin-left:8px", href: "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end" }, "Apri in Chrome"));
  p.append(cp);
}

/* ------------------------------------------------------------------ avvio */
const VERSION = "1.3.5";
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; });
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register("sw.js").then(reg => {
      reg.addEventListener("updatefound", () => { const w = reg.installing; if (!w) return; w.addEventListener("statechange", () => { if (w.state === "activated" && hadController && !/taccuino|schizzo/.test(location.hash)) { location.reload(); return; } if (w.state === "activated" && hadController) toast("È disponibile una versione aggiornata dell'app", "Aggiorna", () => location.reload(), 20000); }); });
      setInterval(() => reg.update().catch(() => {}), 3600000);
    }).catch(() => {});
  });
}
window.addEventListener("online", () => toast("Connessione ripristinata")); window.addEventListener("offline", () => toast("Sei senza rete; carte, figure e audio salvati restano disponibili"));
applyPrefs(); Viewer.init(); render();
if (busMode()) { Geo.start(); wakeLock(true); Chime.unlock(); setTimeout(() => SoundBar.check(), 1200); }
// un tocco sulla notifica porta alla tappa o alla lettura corrispondente
if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.go) go(e.data.go); });
// se il permesso è già stato concesso in una sessione precedente, la posizione riparte da sola
if (navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: "geolocation" }).then(p => { if (p.state === "granted" && store.get("geoAuto", true)) Geo.start(); }).catch(() => {});
})();
