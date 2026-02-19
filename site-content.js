(function () {
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const map = {
    "index.html": "content/home.json",
    "roblox-scripts.html": "content/roblox-scripts.json",
    "roblox-studio.html": "content/roblox-studio.json",
    "programs.html": "content/programs.json",
    "socials.html": "content/socials.json"
  };

  const source = map[page];
  if (!source) return;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async function getJson(url) {
    const r = await fetch(url + "?v=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  function renderHome(data) {
    const slidesWrap = document.getElementById("slides");
    if (!slidesWrap || !Array.isArray(data.slides) || !data.slides.length) return;
    const existingSlides = Array.from(slidesWrap.querySelectorAll(".slide"));
    if (existingSlides.length === data.slides.length) {
      data.slides.forEach(function (s, i) {
        const slide = existingSlides[i];
        if (!slide) return;
        const href = esc(s.href || "#");
        const title = esc(s.title || "Featured");
        const kicker = esc(s.kicker || "FEATURED");
        const text = esc(s.text || "");
        const cta = esc(s.cta || "Open");
        const img = esc(s.image || "");
        const label = esc(s.imageLabel || title);

        slide.setAttribute("href", href);
        slide.setAttribute("data-index", String(i));
        if (i === 0) slide.classList.add("active");

        const imageEl = slide.querySelector(".slide-image");
        if (imageEl) {
          imageEl.textContent = label;
          if (img) {
            imageEl.style.backgroundImage = "url('" + img + "')";
            imageEl.style.backgroundSize = "cover";
            imageEl.style.backgroundPosition = "center";
            imageEl.style.border = "1px solid var(--border)";
          }
        }

        const kickerEl = slide.querySelector(".slide-kicker");
        const titleEl = slide.querySelector("h2");
        const textEl = slide.querySelector("p");
        const ctaEl = slide.querySelector(".slide-cta");
        if (kickerEl) kickerEl.textContent = kicker;
        if (titleEl) titleEl.textContent = title;
        if (textEl) textEl.textContent = text;
        if (ctaEl) ctaEl.textContent = cta;
      });
      return;
    }

    slidesWrap.innerHTML = data.slides.map(function (s, i) {
      const cls = i === 0 ? "slide active" : "slide";
      const href = esc(s.href || "#");
      const title = esc(s.title || "Featured");
      const kicker = esc(s.kicker || "FEATURED");
      const text = esc(s.text || "");
      const cta = esc(s.cta || "Open");
      const img = esc(s.image || "");
      const label = esc(s.imageLabel || title);
      const imagePart = img
        ? '<div class="slide-image" style="background-image:url(\'' + img + '\');background-size:cover;background-position:center;border:1px solid var(--border)">' + label + "</div>"
        : '<div class="slide-image">' + label + "</div>";
      return '<a class="' + cls + '" data-index="' + i + '" href="' + href + '">' + imagePart + '<div class="slide-copy"><span class="slide-kicker">' + kicker + '</span><h2>' + title + '</h2><p>' + text + '</p><span class="slide-cta">' + cta + '</span></div></a>';
    }).join("");
  }

  function renderGridPage(data) {
    const heroText = document.querySelector(".hero p");
    if (heroText && data.heroDescription) heroText.textContent = data.heroDescription;

    const grid = document.querySelector("main .grid");
    if (!grid || !Array.isArray(data.items) || !data.items.length) return;

    grid.innerHTML = data.items.map(function (it) {
      const title = esc(it.title || "Item");
      const desc = esc(it.description || "");
      const img = esc(it.image || "");
      const link = esc(it.link || "#");
      return '<article class="card"><div class="thumb"><img src="' + img + '" alt="' + title + '" loading="lazy"></div><h3>' + title + '</h3><p>' + desc + '</p><a class="btn" href="' + link + '">Open</a></article>';
    }).join("");
  }

  function run() {
    getJson(source)
      .then(function (data) {
        if (page === "index.html") renderHome(data);
        else renderGridPage(data);
      })
      .catch(function () {
        // Keep fallback HTML if JSON is unavailable.
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
