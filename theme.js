(function () {
  const THEMES = {
    oceancore: { label: "Ocean Core", motionSeconds: 26, vars: { "--bg1": "#0b1f3a", "--bg2": "#0f3b5f", "--accent": "#ff7a00", "--accent-2": "#21d4fd", "--accent-3": "#7cff6b", "--accent-4": "#ff5ea8", "--glow1": "rgba(22, 58, 99, 0.9)", "--glow2": "rgba(29, 75, 122, 0.9)", "--text": "#f5f7fb", "--muted": "#c7d2e0", "--card": "rgba(8, 18, 32, 0.7)", "--border": "rgba(255, 255, 255, 0.08)" } },
    neongrid: { label: "Neon Grid", motionSeconds: 18, vars: { "--bg1": "#08161a", "--bg2": "#123640", "--accent": "#19f5c1", "--accent-2": "#00d1ff", "--accent-3": "#f6ff5f", "--accent-4": "#ff4d9a", "--glow1": "rgba(6, 58, 63, 0.92)", "--glow2": "rgba(15, 88, 98, 0.9)", "--text": "#eafcff", "--muted": "#a9ced6", "--card": "rgba(6, 22, 28, 0.72)", "--border": "rgba(25, 245, 193, 0.2)" } },
    steelstorm: { label: "Steel Storm", motionSeconds: 30, vars: { "--bg1": "#151a22", "--bg2": "#273545", "--accent": "#ffb347", "--accent-2": "#83d3ff", "--accent-3": "#c4ff6b", "--accent-4": "#ff7f9f", "--glow1": "rgba(36, 47, 64, 0.92)", "--glow2": "rgba(63, 80, 104, 0.88)", "--text": "#eef3fb", "--muted": "#b8c3d4", "--card": "rgba(17, 24, 34, 0.76)", "--border": "rgba(146, 170, 199, 0.2)" } },
    lavawave: { label: "Lava Wave", motionSeconds: 22, vars: { "--bg1": "#2b100d", "--bg2": "#55261f", "--accent": "#ff5e2f", "--accent-2": "#ff9f43", "--accent-3": "#ffe45e", "--accent-4": "#ff7b54", "--glow1": "rgba(94, 32, 22, 0.9)", "--glow2": "rgba(132, 55, 35, 0.9)", "--text": "#fff3ec", "--muted": "#e5c7b8", "--card": "rgba(35, 14, 12, 0.74)", "--border": "rgba(255, 153, 102, 0.24)" } },
    mintnoir: { label: "Mint Noir", motionSeconds: 24, vars: { "--bg1": "#0a1c18", "--bg2": "#183730", "--accent": "#85ffcf", "--accent-2": "#53f2d3", "--accent-3": "#b8ff8a", "--accent-4": "#64ffc8", "--glow1": "rgba(17, 73, 60, 0.9)", "--glow2": "rgba(30, 107, 88, 0.9)", "--text": "#edfff8", "--muted": "#b9e0d2", "--card": "rgba(8, 24, 21, 0.76)", "--border": "rgba(133, 255, 207, 0.22)" } },
    neoncity: { label: "Neon City", motionSeconds: 17, vars: { "--bg1": "#120822", "--bg2": "#1c0f3f", "--accent": "#ff4da1", "--accent-2": "#4de3ff", "--accent-3": "#b0ff66", "--accent-4": "#ff9f4d", "--glow1": "rgba(121, 52, 171, 0.78)", "--glow2": "rgba(52, 152, 219, 0.72)", "--text": "#f6f1ff", "--muted": "#d6c9f6", "--card": "rgba(20, 10, 34, 0.74)", "--border": "rgba(180, 130, 255, 0.24)" } },
    iceglass: { label: "Ice Glass", motionSeconds: 34, vars: { "--bg1": "#0f1f2b", "--bg2": "#27485d", "--accent": "#8ae3ff", "--accent-2": "#d8f5ff", "--accent-3": "#9effe0", "--accent-4": "#8ac6ff", "--glow1": "rgba(97, 169, 207, 0.52)", "--glow2": "rgba(183, 228, 249, 0.48)", "--text": "#effbff", "--muted": "#bedae7", "--card": "rgba(11, 26, 35, 0.72)", "--border": "rgba(180, 230, 255, 0.24)" } },
    sunsetgrid: { label: "Sunset Grid", motionSeconds: 20, vars: { "--bg1": "#3a1230", "--bg2": "#8b3b3b", "--accent": "#ffd166", "--accent-2": "#ff7b7b", "--accent-3": "#ffe9a3", "--accent-4": "#ffb86b", "--glow1": "rgba(255, 126, 95, 0.62)", "--glow2": "rgba(254, 180, 123, 0.58)", "--text": "#fff5ec", "--muted": "#f2d4be", "--card": "rgba(46, 16, 32, 0.74)", "--border": "rgba(255, 188, 133, 0.26)" } },
    cyberlime: { label: "Cyber Lime", motionSeconds: 19, vars: { "--bg1": "#101d0f", "--bg2": "#1e3d1f", "--accent": "#c8ff3d", "--accent-2": "#76ff9e", "--accent-3": "#f5ff7a", "--accent-4": "#8dff66", "--glow1": "rgba(115, 255, 130, 0.48)", "--glow2": "rgba(202, 255, 114, 0.42)", "--text": "#f7ffef", "--muted": "#d1e7bf", "--card": "rgba(13, 28, 12, 0.74)", "--border": "rgba(162, 255, 127, 0.25)" } },
    royalflux: { label: "Royal Flux", motionSeconds: 21, vars: { "--bg1": "#120f2e", "--bg2": "#2f2b73", "--accent": "#b78dff", "--accent-2": "#78c0ff", "--accent-3": "#d9b3ff", "--accent-4": "#9f7bff", "--glow1": "rgba(104, 86, 255, 0.58)", "--glow2": "rgba(75, 161, 255, 0.5)", "--text": "#f2f2ff", "--muted": "#c6c7f0", "--card": "rgba(16, 15, 46, 0.74)", "--border": "rgba(151, 155, 255, 0.24)" } },
    darkmode: { label: "Dark Mode", motionSeconds: 26, vars: { "--bg1": "#050608", "--bg2": "#101217", "--accent": "#5fd0ff", "--accent-2": "#8edbff", "--accent-3": "#95ffa8", "--accent-4": "#9fbcff", "--glow1": "rgba(48, 66, 89, 0.35)", "--glow2": "rgba(80, 101, 133, 0.28)", "--text": "#eef2f7", "--muted": "#a6b2c2", "--card": "rgba(9, 11, 15, 0.82)", "--border": "rgba(199, 212, 227, 0.14)" } },
    crimsonnight: { label: "Crimson Night", motionSeconds: 22, vars: { "--bg1": "#17070d", "--bg2": "#2f0d1a", "--accent": "#ff5e7a", "--accent-2": "#ff9fb6", "--accent-3": "#ffd48a", "--accent-4": "#ff708f", "--glow1": "rgba(150, 45, 67, 0.5)", "--glow2": "rgba(214, 88, 117, 0.44)", "--text": "#fff0f3", "--muted": "#ebbdc7", "--card": "rgba(27, 10, 16, 0.78)", "--border": "rgba(255, 166, 186, 0.2)" } }
  };

  const STORAGE_KEY = "webpage_theme";
  const GLOW_KEY = "webpage_theme_glow";
  const FONT_KEY = "webpage_font";
  const SCALE_KEY = "webpage_text_scale";
  const FONTS = {
    modern: { label: "Clean Modern", stack: "\"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif" },
    arcade: { label: "Arcade Pixel", stack: "\"Press Start 2P\", \"Lucida Console\", \"Courier New\", monospace" },
    michroma: { label: "Michroma", stack: "\"Michroma\", \"Trebuchet MS\", \"Segoe UI\", sans-serif" },
    orbitron: { label: "Orbitron", stack: "\"Orbitron\", \"Segoe UI\", Tahoma, sans-serif" }
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function getCurrentTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES[stored]) return stored;
    } catch (_) {}
    return "oceancore";
  }

  function getGlowIntensity() {
    try {
      const raw = parseFloat(localStorage.getItem(GLOW_KEY) || "");
      if (!Number.isNaN(raw)) return clamp(raw, 0.3, 2);
    } catch (_) {}
    return 1;
  }

  function applyGlowIntensity(scale) {
    const safe = clamp(Number(scale) || 1, 0.3, 2);
    try {
      localStorage.setItem(GLOW_KEY, String(safe));
    } catch (_) {}
    document.documentElement.style.setProperty("--theme-glow-strength", safe.toFixed(2));
    return safe;
  }

  function getCurrentFont() {
    try {
      const stored = localStorage.getItem(FONT_KEY);
      if (stored && FONTS[stored]) return stored;
    } catch (_) {}
    return "modern";
  }

  function setFont(fontId) {
    const id = FONTS[fontId] ? fontId : "modern";
    try {
      localStorage.setItem(FONT_KEY, id);
    } catch (_) {}
    document.documentElement.style.setProperty("--ui-font", FONTS[id].stack);
    document.documentElement.setAttribute("data-ui-font", id);
    return id;
  }

  function getTextScale() {
    try {
      const raw = parseFloat(localStorage.getItem(SCALE_KEY) || "");
      if (!Number.isNaN(raw)) return clamp(raw, 0.75, 1.05);
    } catch (_) {}
    return 0.85;
  }

  function setTextScale(scale) {
    const safe = clamp(Number(scale) || 0.85, 0.75, 1.05);
    try {
      localStorage.setItem(SCALE_KEY, String(safe));
    } catch (_) {}
    document.documentElement.style.setProperty("--ui-text-scale", safe.toFixed(2));
    return safe;
  }

  function applyTheme(themeId) {
    const id = THEMES[themeId] ? themeId : "oceancore";
    const theme = THEMES[id];
    const root = document.documentElement;
    Object.keys(theme.vars).forEach((k) => root.style.setProperty(k, theme.vars[k]));
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (_) {}
    root.style.setProperty("--theme-motion-speed", (theme.motionSeconds || 24) + "s");
    root.style.setProperty("--theme-pulse-speed", "2.8s");
    applyGlowIntensity(getGlowIntensity());
    setFont(getCurrentFont());
    setTextScale(getTextScale());
    return id;
  }

  applyTheme(getCurrentTheme());

  window.ThemeManager = {
    themes: THEMES,
    fonts: FONTS,
    applyTheme,
    getCurrentTheme,
    getGlowIntensity,
    setGlowIntensity: applyGlowIntensity,
    getCurrentFont,
    setFont,
    getTextScale,
    setTextScale,
    storageKey: STORAGE_KEY,
    glowKey: GLOW_KEY,
    fontKey: FONT_KEY,
    textScaleKey: SCALE_KEY
  };
})();
