(function () {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Michroma&family=Orbitron:wght@500;700&family=Press+Start+2P&display=swap');
    body {
      position: relative;
      font-family: var(--ui-font, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif) !important;
      font-size: calc(16px * var(--ui-text-scale, 1));
      background-size: 160% 160%, 180% 180%, 180% 180%;
      animation: rtBgFlow var(--theme-motion-speed, 24s) ease-in-out infinite alternate;
    }
    html[data-ui-font="arcade"] body {
      line-height: 1.45;
    }
    html[data-ui-font="arcade"] p,
    html[data-ui-font="arcade"] .theme-name,
    html[data-ui-font="arcade"] .settings-subtitle {
      line-height: 1.55;
    }
    body::before {
      content: "";
      position: fixed;
      inset: -18%;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(600px 420px at 18% 12%, var(--accent-2), transparent 70%),
        radial-gradient(720px 520px at 86% 22%, var(--accent-4), transparent 72%),
        radial-gradient(680px 460px at 48% 90%, var(--accent-3), transparent 72%);
      opacity: calc(0.12 + (var(--theme-glow-strength, 1) * 0.22));
      filter: blur(calc(28px + (var(--theme-glow-strength, 1) * 42px))) saturate(1.08);
      animation: rtGlowDrift var(--theme-motion-speed, 24s) ease-in-out infinite alternate;
      transform: translateZ(0);
    }
    body > * {
      position: relative;
      z-index: 1;
    }
    .settings-subtitle {
      margin: 14px 0 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 800;
    }
    .font-btn {
      border: 1px solid var(--border);
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      color: var(--text);
      cursor: pointer;
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
    }
    .font-btn.active {
      border-color: rgba(255,214,92,0.65);
      box-shadow: 0 0 0 2px rgba(255,214,92,0.16) inset;
    }
    .nav {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-wrap: nowrap !important;
      gap: 8px !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }
    .nav-left,
    .nav-right {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex-wrap: nowrap;
      white-space: nowrap;
    }
    .nav-left {
      flex: 1 1 auto;
      overflow: hidden;
    }
    .nav-right {
      flex: 1 1 auto;
      min-width: 0;
      justify-content: flex-end;
      overflow: hidden;
    }
    .nav .spacer {
      display: none !important;
    }
    .nav a {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      height: 2.5rem !important;
      min-width: fit-content !important;
      max-width: 100%;
      width: auto !important;
      padding: 6px 10px !important;
      border-radius: 999px !important;
      white-space: nowrap;
      background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.14) !important;
      color: var(--text) !important;
      font-size: 0.85rem !important;
      line-height: 1.1;
      flex: 1 1 auto;
      flex-shrink: 1 !important;
      overflow: hidden;
    }
    .nav a .icon {
      flex: 0 0 auto;
      font-size: 14px;
      line-height: 1;
    }
    .nav a .label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @keyframes rtBgFlow {
      0% { background-position: 0% 0%, 100% 0%, 0% 50%; }
      50% { background-position: 60% 35%, 20% 95%, 70% 38%; }
      100% { background-position: 100% 20%, 0% 100%, 100% 65%; }
    }
    @keyframes rtGlowDrift {
      0% { transform: translate3d(-1.5%, -1%, 0) scale(1); }
      50% { transform: translate3d(1.2%, 1.6%, 0) scale(1.05); }
      100% { transform: translate3d(2%, -0.8%, 0) scale(1.08); }
    }
    .nav a.active {
      animation: rtActivePulse var(--theme-pulse-speed, 2.8s) ease-in-out infinite;
    }
    @keyframes rtActivePulse {
      0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.22) inset, 0 0 0 rgba(0,0,0,0); }
      50% { box-shadow: 0 0 0 1px rgba(255,255,255,0.3) inset, 0 0 18px rgba(126,245,255,0.26); }
    }
    .rt-reveal {
      opacity: 0;
      transform: translateY(10px);
      animation: rtReveal .45s ease forwards;
    }
    @keyframes rtReveal {
      to { opacity: 1; transform: translateY(0); }
    }
    body.page-leaving main {
      opacity: 0;
      transform: translateY(8px);
      transition: opacity .16s ease, transform .16s ease;
    }
    .theme-glow-wrap .volume-slider { accent-color: var(--accent-4); }
    .tab-shop {
      background: linear-gradient(135deg, rgba(80, 226, 255, 0.36), rgba(88, 255, 170, 0.34)) !important;
      border: 1px solid rgba(160, 245, 255, 0.55) !important;
      color: #e8fbff !important;
      box-shadow: 0 0 0 1px rgba(160, 245, 255, 0.18) inset, 0 0 18px rgba(68, 206, 255, 0.24);
      font-weight: 700 !important;
    }
    .tab-shop:hover {
      background: linear-gradient(135deg, rgba(95, 236, 255, 0.42), rgba(102, 255, 182, 0.4)) !important;
      box-shadow: 0 0 0 1px rgba(186, 249, 255, 0.35) inset, 0 0 24px rgba(68, 206, 255, 0.3);
    }
    .store-nudge {
      position: fixed;
      z-index: 130;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid rgba(132, 255, 186, 0.62);
      background:
        linear-gradient(145deg, rgba(8, 24, 30, 0.95), rgba(9, 20, 36, 0.94));
      color: #ffffff;
      font-size: 12px;
      font-weight: 800;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      pointer-events: none;
      opacity: 0;
      transform: translateY(8px) scale(0.98);
      box-shadow:
        0 10px 28px rgba(0, 0, 0, 0.42),
        0 0 0 1px rgba(140, 255, 190, 0.16) inset,
        0 0 26px rgba(72, 255, 168, 0.28);
      transition: opacity 0.22s ease, transform 0.22s ease;
      white-space: nowrap;
      backdrop-filter: blur(8px);
    }
    .store-nudge.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .store-nudge::after {
      content: "";
      position: absolute;
      right: 18px;
      top: 100%;
      border: 7px solid transparent;
      border-top-color: rgba(9, 20, 36, 0.94);
    }
    .settings-modal {
      align-items: flex-start !important;
      overflow: hidden !important;
      padding-top: 14px !important;
      padding-bottom: 14px !important;
    }
    .settings-panel {
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 28px) !important;
      overflow: hidden !important;
      margin: 0 auto !important;
      scrollbar-width: thin;
      scroll-padding-top: 64px;
      position: relative;
    }
    .settings-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 2px;
    }
    .settings-head {
      position: relative;
      z-index: 12;
      background: var(--card);
      padding-top: 2px;
      padding-bottom: 8px;
      margin-bottom: 12px !important;
      border-bottom: 1px solid var(--border);
    }
    .settings-head h2 {
      margin: 0 !important;
      line-height: 1.2;
    }
    @media (max-width: 760px) {
      .nav {
        padding-left: 10px !important;
        padding-right: 10px !important;
        gap: 6px !important;
      }
      .nav-left,
      .nav-right {
        gap: 6px !important;
      }
      .nav a {
        min-width: 0 !important;
        width: auto !important;
        padding: 6px 10px !important;
        height: 2.25rem !important;
        font-size: 0.85rem !important;
        flex-shrink: 1 !important;
      }
      .settings-modal {
        padding: 8px !important;
      }
      .settings-panel {
        max-height: calc(100vh - 16px) !important;
        border-radius: 14px !important;
      }
    }
  `;
  document.head.appendChild(style);

  function normalizeActiveNav() {
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (href === page) a.classList.add("active");
      else if (a.id !== "open-settings" && a.id !== "open-help") a.classList.remove("active");
    });
    const storeBtn = document.querySelector(".nav a.tab-shop");
    if (storeBtn) storeBtn.textContent = "🛒 Store";
  }

  function splitIconLabel(a) {
    if (!a || a.querySelector(".icon")) return;
    const raw = (a.textContent || "").trim().replace(/\s+/g, " ");
    if (!raw) return;
    const parts = raw.split(" ");
    const first = parts[0] || "";
    const hasEmoji = /[\u2190-\u2BFF\u{1F000}-\u{1FAFF}]/u.test(first);
    const icon = hasEmoji ? first : "";
    let label = hasEmoji ? parts.slice(1).join(" ") : raw;
    if (label === "Roblox Scripts") label = "Scripts";
    if (label === "Roblox Studio") label = "Studio";
    a.textContent = "";
    const i = document.createElement("span");
    i.className = "icon";
    i.textContent = icon || "•";
    const l = document.createElement("span");
    l.className = "label";
    l.textContent = label;
    a.appendChild(i);
    a.appendChild(l);
  }

  function enhanceNavLayout() {
    const nav = document.querySelector("header .nav");
    if (!nav) return;

    if (!nav.querySelector(".nav-left") || !nav.querySelector(".nav-right")) {
      const left = document.createElement("div");
      left.className = "nav-left";
      const right = document.createElement("div");
      right.className = "nav-right";

      const brand = nav.querySelector(".brand");
      if (brand) left.appendChild(brand);

      const anchors = Array.from(nav.querySelectorAll("a"));
      anchors.forEach((a) => {
        const cls = a.className || "";
        if (cls.includes("tab-settings") || cls.includes("tab-help") || cls.includes("tab-shop")) {
          right.appendChild(a);
        } else {
          left.appendChild(a);
        }
      });

      nav.innerHTML = "";
      nav.appendChild(left);
      nav.appendChild(right);
    }

    nav.querySelectorAll("a").forEach(splitIconLabel);
  }

  function staggerReveal() {
    const items = Array.from(document.querySelectorAll(".hero, .card, .card-link"));
    items.forEach((el, idx) => {
      if (el.classList.contains("rt-reveal")) return;
      el.classList.add("rt-reveal");
      el.style.animationDelay = Math.min(idx * 0.045, 0.65) + "s";
    });
  }

  function wirePageTransition() {
    document.addEventListener("click", function (e) {
      const a = e.target.closest("a[href]");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const raw = a.getAttribute("href") || "";
      if (!raw || raw.startsWith("#") || raw.startsWith("http") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      if (raw.includes(".gg/@")) return;
      const to = new URL(raw, location.href);
      if (to.origin !== location.origin) return;
      e.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(function () { location.href = to.href; }, 140);
    }, true);
  }

  function enhanceHomeCarousel() {
    const slides = Array.from(document.querySelectorAll("#slides .slide"));
    const prev = document.getElementById("slide-prev");
    const next = document.getElementById("slide-next");
    if (!slides.length || !prev || !next) return;

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") prev.click();
      else if (e.key === "ArrowRight") next.click();
    });

    let touchStartX = 0;
    let touchStartY = 0;
    const zone = document.getElementById("slides");
    zone.addEventListener("touchstart", function (e) {
      const t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    }, { passive: true });
    zone.addEventListener("touchend", function (e) {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) prev.click(); else next.click();
      }
    }, { passive: true });
  }

  function enhanceStoreNudge() {
    const storeBtn = document.querySelector(".nav a.tab-shop");
    if (!storeBtn) return;
    storeBtn.textContent = "🛒 Store";
    if (document.getElementById("store-nudge")) return;

    const nudge = document.createElement("div");
    nudge.id = "store-nudge";
    nudge.className = "store-nudge";
    const nudgePhrases = [
      "↗ Check out the store",
      "↗ New drops in the store",
      "↗ Browse the store deals",
      "↗ Open the store",
      "↗ See what's new in the store"
    ];
    let lastNudgeIndex = -1;
    document.body.appendChild(nudge);

    function positionNudge() {
      const r = storeBtn.getBoundingClientRect();
      const top = Math.max(8, r.bottom + 8);
      const left = Math.max(8, r.right - 190);
      nudge.style.top = top + "px";
      nudge.style.left = left + "px";
    }

    function showNudge() {
      if (nudgePhrases.length > 0) {
        let idx = Math.floor(Math.random() * nudgePhrases.length);
        if (nudgePhrases.length > 1 && idx === lastNudgeIndex) {
          idx = (idx + 1) % nudgePhrases.length;
        }
        lastNudgeIndex = idx;
        nudge.textContent = nudgePhrases[idx];
      }
      positionNudge();
      nudge.classList.add("show");
      try {
        localStorage.setItem("webpage_store_nudge_last_ms", String(Date.now()));
      } catch (_) {}
      setTimeout(function () {
        nudge.classList.remove("show");
      }, 5000);
    }
    const nudgeIntervalMs = 30000;
    const firstShowDelayMs = 1800;
    const maxInitialWaitMs = 5000;
    let initialDelay = 0;
    try {
      const lastMs = parseInt(localStorage.getItem("webpage_store_nudge_last_ms") || "0", 10);
      if (Number.isFinite(lastMs) && lastMs > 0) {
        const elapsed = Date.now() - lastMs;
        if (elapsed < 0) {
          initialDelay = firstShowDelayMs;
        } else if (elapsed < nudgeIntervalMs) {
          // Keep cross-tab cooldown, but never make users wait too long on a fresh load.
          initialDelay = Math.min(nudgeIntervalMs - elapsed, maxInitialWaitMs);
        }
      }
    } catch (_) {}
    if (initialDelay <= 0) {
      initialDelay = firstShowDelayMs;
    }
    setTimeout(function () {
      showNudge();
      setInterval(showNudge, nudgeIntervalMs);
    }, initialDelay);
    window.addEventListener("resize", positionNudge, { passive: true });
    window.addEventListener("scroll", positionNudge, { passive: true });
  }

  function enhanceSettings() {
    const panel = document.querySelector("#settings-modal .settings-panel");
    if (!panel || panel.querySelector("#theme-glow")) return;
    const tm = window.ThemeManager;
    if (!tm || typeof tm.getGlowIntensity !== "function") return;
    const title = panel.querySelector(".settings-head h2");
    if (title) title.textContent = "🎛️ Theme Studio";
    const head = panel.querySelector(".settings-head");
    let body = panel.querySelector(".settings-body");
    if (!body) {
      body = document.createElement("div");
      body.className = "settings-body";
      if (head) {
        while (head.nextSibling) body.appendChild(head.nextSibling);
      } else {
        while (panel.firstChild) body.appendChild(panel.firstChild);
      }
      panel.appendChild(body);
    }
    const soundTitle = Array.from(body.querySelectorAll("h3")).find((h) => /sound preset/i.test(h.textContent || ""));
    if (soundTitle) soundTitle.innerHTML = "🎵 Sound Preset";

    const wrap = document.createElement("div");
    wrap.className = "volume-wrap theme-glow-wrap";
    wrap.innerHTML = '<div class="volume-head"><span>✨ Theme Glow</span><span id="theme-glow-value">100%</span></div><input id="theme-glow" class="volume-slider" type="range" min="30" max="200" step="1" value="100" aria-label="Theme Glow Intensity">';
    body.appendChild(wrap);

    const slider = wrap.querySelector("#theme-glow");
    const out = wrap.querySelector("#theme-glow-value");
    const current = Math.round((tm.getGlowIntensity ? tm.getGlowIntensity() : 1) * 100);
    slider.value = String(current);
    out.textContent = current + "%";

    slider.addEventListener("input", function () {
      const next = Math.max(30, Math.min(200, parseInt(slider.value || "100", 10)));
      out.textContent = next + "%";
      if (tm.setGlowIntensity) tm.setGlowIntensity(next / 100);
    });

    if (!body.querySelector("#font-grid") && tm.fonts) {
      const fontHead = document.createElement("h3");
      fontHead.className = "settings-subtitle";
      fontHead.textContent = "🅰️ Text Font";
      body.appendChild(fontHead);

      const fontGrid = document.createElement("div");
      fontGrid.id = "font-grid";
      fontGrid.className = "settings-grid";
      body.appendChild(fontGrid);

      function setFontActive(id) {
        fontGrid.querySelectorAll(".font-btn").forEach((el) => {
          el.classList.toggle("active", el.getAttribute("data-font-id") === id);
        });
      }

      Object.keys(tm.fonts).forEach((id) => {
        const f = tm.fonts[id];
        const b = document.createElement("button");
        b.type = "button";
        b.className = "font-btn";
        b.setAttribute("data-font-id", id);
        b.textContent = f.label;
        b.style.fontFamily = f.stack;
        b.addEventListener("click", function () {
          if (tm.setFont) tm.setFont(id);
          setFontActive(id);
        });
        fontGrid.appendChild(b);
      });
      setFontActive(tm.getCurrentFont ? tm.getCurrentFont() : "modern");
    }

    if (!body.querySelector("#text-scale")) {
      const scaleWrap = document.createElement("div");
      scaleWrap.className = "volume-wrap";
      scaleWrap.innerHTML = '<div class="volume-head"><span>🔎 Text Scale</span><span id="text-scale-value">85%</span></div><input id="text-scale" class="volume-slider" type="range" min="75" max="105" step="1" value="85" aria-label="Text Scale">';
      body.appendChild(scaleWrap);

      const scaleSlider = scaleWrap.querySelector("#text-scale");
      const scaleValue = scaleWrap.querySelector("#text-scale-value");
      const startScale = Math.round((tm.getTextScale ? tm.getTextScale() : 0.85) * 100);
      scaleSlider.value = String(startScale);
      scaleValue.textContent = startScale + "%";
      scaleSlider.addEventListener("input", function () {
        const next = Math.max(75, Math.min(105, parseInt(scaleSlider.value || "85", 10)));
        scaleValue.textContent = next + "%";
        if (tm.setTextScale) tm.setTextScale(next / 100);
      });
    }
  }

  function run() {
    enhanceNavLayout();
    normalizeActiveNav();
    staggerReveal();
    wirePageTransition();
    enhanceHomeCarousel();
    enhanceSettings();
    enhanceStoreNudge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();

