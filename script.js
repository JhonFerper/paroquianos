/* =====================================================================
   Semana da Família 2026 · Paróquia São Francisco de Assis — script da galeria
   ===================================================================== */
(function () {
  "use strict";

  var dataReady = window.EVENT_DATA_READY || Promise.resolve();
  dataReady.then(function () {

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOCAL_ADMIN = window.location.port === "8000" && ["localhost", "127.0.0.1"].indexOf(window.location.hostname) !== -1;

  function deleteLocalPhoto(file) {
    if (!window.confirm("Excluir esta fotografia definitivamente? Esta ação não pode ser desfeita.")) return Promise.resolve(false);
    return fetch("/api/photos?path=" + encodeURIComponent(file), { method: "DELETE" })
      .then(function (response) { if (!response.ok) throw new Error("Não foi possível excluir a fotografia."); return response.json(); })
      .then(function () { return true; })
      .catch(function (error) { window.alert(error.message); return false; });
  }

  /* ---------- 0 · Identidade e acervo ---------- */
  (function () {
    document.title = EVENT.title + " · Paroquianos do Junco";
    document.querySelector(".hero .eyebrow").textContent = EVENT.kicker;
    document.querySelector(".hero__title span").textContent = EVENT.titlePrimary;
    document.querySelector(".hero__title em").textContent = EVENT.titleAccent;
    document.querySelector(".hero__sub").textContent = EVENT.summary;
    var art = document.querySelector(".hero__title-art");
    var viewport = document.querySelector(".viewport");
    if (EVENT.titleArt) art.querySelector("img").src = EVENT.folder + "/" + EVENT.titleArt;
    else art.hidden = true;
    if (EVENT.hasVideo) { var video = viewport.querySelector("iframe"); video.src = video.dataset.src; } else viewport.hidden = true;

    var list = document.getElementById("eventList");
    if (list) EVENTS.forEach(function (event) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "event-card" + (event.id === EVENT.id ? " is-current" : "");
      a.href = event.id === "semana-da-familia-2026" ? "index.html" : "galeria.html?evento=" + encodeURIComponent(event.id);
      a.innerHTML = "<span class=\"event-card__year\">" + event.year + "</span><span class=\"event-card__title\">" + event.title + "</span><span class=\"event-card__meta\">" + event.photoCount + " fotografias</span>";
      li.appendChild(a);
      list.appendChild(li);
    });
  })();

  function buildSimpleGallery() {
    document.body.classList.add("is-simple-album");
    [".hero__title-art", ".hero__lede", ".hero__scroll", "#indice", ".closing"].forEach(function (selector) {
      var node = document.querySelector(selector);
      if (node) node.hidden = true;
    });

    var lightbox = document.getElementById("lightbox");
    var lightboxImage = document.getElementById("lbImg");
    var lightboxIndex = document.getElementById("lbIndex");
    var lightboxTotal = document.getElementById("lbTotal");
    var lightboxCaption = document.getElementById("lbCaption");
    var lightboxPlay = document.getElementById("lbPlay");
    var lightboxFull = document.getElementById("lbFull");
    var lightboxDelete = document.getElementById("lbDelete");
    var current = 0;
    var trigger = null;

    lightboxPlay.hidden = true;
    lightboxFull.hidden = true;
    lightboxCaption.hidden = true;
    lightboxTotal.textContent = GALLERY.length;
    if (LOCAL_ADMIN) lightboxDelete.hidden = false;

    function show(index) {
      current = (index + GALLERY.length) % GALLERY.length;
      var item = GALLERY[current];
      lightboxImage.src = item.f;
      lightboxImage.alt = EVENT.title + " — fotografia " + (current + 1);
      lightboxIndex.textContent = current + 1;
    }
    function close() {
      lightbox.classList.remove("is-open");
      setTimeout(function () { lightbox.setAttribute("hidden", ""); }, 360);
      document.body.style.overflow = "";
      if (trigger) trigger.focus();
    }
    function open(index, source) {
      trigger = source; show(index); lightbox.removeAttribute("hidden");
      requestAnimationFrame(function () { lightbox.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      document.querySelector(".lightbox__close").focus();
    }
    function step(direction) { show(current + direction); }

    document.querySelectorAll(".lightbox__close, .lightbox__backdrop").forEach(function (button) { button.addEventListener("click", close); });
    document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
    document.getElementById("lbNext").addEventListener("click", function () { step(1); });
    document.addEventListener("keydown", function (event) {
      if (lightbox.hasAttribute("hidden")) return;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
    });
    var touchX = null;
    lightbox.addEventListener("touchstart", function (event) { touchX = event.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (event) {
      if (touchX == null) return;
      var distance = event.changedTouches[0].clientX - touchX;
      if (Math.abs(distance) > 46) step(distance < 0 ? 1 : -1);
      touchX = null;
    }, { passive: true });
    if (LOCAL_ADMIN) lightboxDelete.addEventListener("click", function () { deleteLocalPhoto(GALLERY[current].f).then(function (removed) { if (removed) window.location.reload(); }); });

    var gallery = document.getElementById("gallery");
    gallery.className = "simple-gallery";
    GALLERY.forEach(function (item, index) {
      var link = document.createElement("a");
      link.className = "simple-gallery__item";
      link.href = "#foto-" + (index + 1);
      link.setAttribute("aria-label", "Ampliar fotografia " + (index + 1));
      link.addEventListener("click", function (event) { event.preventDefault(); open(index, link); });
      var image = document.createElement("img");
      image.src = item.f; image.width = item.w; image.height = item.h;
      image.alt = EVENT.title + " — fotografia " + (index + 1); image.decoding = "async";
      if (index > 8) image.loading = "lazy";
      link.appendChild(image);
      if (LOCAL_ADMIN) {
        var cell = document.createElement("div"); cell.className = "simple-gallery__cell";
        var remove = document.createElement("button"); remove.className = "simple-gallery__delete"; remove.type = "button"; remove.textContent = "Excluir";
        remove.addEventListener("click", function () { deleteLocalPhoto(item.f).then(function (removed) { if (removed) window.location.reload(); }); });
        cell.appendChild(link); cell.appendChild(remove); gallery.appendChild(cell);
      } else gallery.appendChild(link);
    });
  }

  if (EVENT.simpleGallery) {
    buildSimpleGallery();
    return;
  }

  var DAYS = EVENT.days;
  var FEATURES = EVENT.features;
  var photos = GALLERY.filter(function (g) { return g.f.indexOf(".jpeg") !== -1; });

  var dayMap = DAYS.reduce(function (m, d) { m[d.iso] = d; return m; }, {});
  var byDay = {};
  photos.forEach(function (p) {
    var k = p.iso.replace(/:/g, "-");
    (byDay[k] = byDay[k] || []).push(p);
  });
  var chapters = DAYS.filter(function (d) { return byDay[d.iso]; });

  function roman(i) { return dayMap[i] ? dayMap[i].numeral : ""; }

  /* ---------- helpers de DOM ---------- */
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------- 1 · Índice (TOC) ---------- */
  (function () {
    var list = document.getElementById("tocList");
    chapters.forEach(function (d, i) {
      var li = el("li");
      var a = el("a", "toc-row");
      a.href = "#c" + (i + 1);
      a.setAttribute("aria-label", d.name + ", " + d.date);
      a.appendChild(el("span", "toc-row__num", d.numeral));
      a.appendChild(el("span", "toc-row__name", d.name));
      a.appendChild(el("span", "toc-row__date", d.date.replace(" de ", " · ")));
      var n = byDay[d.iso].length;
      a.appendChild(el("span", "toc-row__date", n + (n === 1 ? " foto" : " fotos")));
      li.appendChild(a);
      list.appendChild(li);
    });
  })();

  /* ---------- 2 · Galeria por dia ---------- */
  var spanFor = function (item, isLead) {
    var r = item.w / item.h;
    if (isLead) return "lead";
    if (r <= 0.62) return 3;        // muito alto
    if (r <= 0.78) return 4;        // retrato
    if (r <= 1.05) return 5;        // quase quadrado
    if (r <= 1.5)  return 6;        // 4:3 / 3:2
    if (r <= 1.9)  return 7;        // panorâmico
    return 9;                        // ultrawide
  };

  var leadSpan = function (item) {
    var r = item.w / item.h;
    if (r >= 1.7) return 9;   // lead amplo
    if (r >= 1.2) return 8;
    return 5;                  // lead vertical
  };

  var gallery = document.getElementById("gallery");
  var built = [];
  var _created = 0;
  function createdCount() { return _created++; }

  chapters.forEach(function (d, ci) {
    var sec = el("section", "chapter");
    sec.id = "c" + (ci + 1);
    sec.setAttribute("aria-label", d.name + ", " + d.date);

    var head = el("header", "chapter__head reveal");
    head.appendChild(el("span", "chapter__num", d.numeral));
    var t = el("div");
    t.appendChild(el("p", "chapter__name", d.name));
    head.appendChild(t);
    head.appendChild(el("p", "chapter__date", d.date));
    var n = byDay[d.iso].length;
    head.appendChild(el("p", "chapter__count", n + (n === 1 ? " fotografia" : " fotografias")));
    sec.appendChild(head);

    if (d.intro) {
      var intro = el("p", "chapter__intro reveal", d.intro);
      intro.style.setProperty("--i", "1");
      sec.appendChild(intro);
    }

    var grid = el("div", "ed-grid");
    sec.appendChild(grid);
    gallery.appendChild(sec);

    var items = byDay[d.iso];
    items.forEach(function (item, idx) {
      var gi = createdCount();
      var isLead = items[0] === item || FEATURES.indexOf(item.f) !== -1;
      var col = isLead ? leadSpan(item) : spanFor(item, false);

      var tile = el("a", "tile" + (isLead ? " tile--lead" : ""));
      tile.href = "#" + item.f;
      tile.style.aspectRatio = item.w + " / " + item.h;

      var img = document.createElement("img");
      img.src = item.f;
      img.alt = "Semana da Família — " + roman(d.iso) + ", " + d.name + ", fotografia " + (idx + 1);
      img.width = item.w;
      img.height = item.h;
      img.decoding = "async";
      if (ci === 0) img.fetchPriority = "high";
      if (ci > 0 || idx >= 6) img.loading = "lazy";

      tile.appendChild(img);
      tile.appendChild(el("span", "tile__veil"));
      var meta = el("span", "tile__meta");
      meta.appendChild(el("span", "tile__meta-dot"));
      meta.appendChild(document.createTextNode(roman(d.iso) + " · " + d.name.toLowerCase()));
      tile.appendChild(meta);

      tile.dataset.photo = String(gi);
      tile.style.setProperty("--i", (gi % 6));
      tile.setAttribute("aria-label", meta.textContent);

      grid.appendChild(tile);
      built.push({ tile: tile, img: img, item: item, col: col, isLead: isLead });
    });
  });

  /* fotos do lightbox ficam cronologicamente ordenadas */
  var ordered = [];
  chapters.forEach(function (d) {
    byDay[d.iso].forEach(function (p) { ordered.push(p); });
  });

  /* ---------- 3 · Geometria do mosaico ---------- */
  var root = document.documentElement;
  function metrics() {
    var cs = getComputedStyle(root);
    var gap = parseFloat(cs.getPropertyValue("--gap")) || 16;
    var row = parseFloat(cs.getPropertyValue("--auto-row")) || 10;
    return { gap: gap, row: row };
  }

  function place() {
    if (window.innerWidth <= 700) return; // coluna única no mobile
    var m = metrics();
    var grids = [];
    built.forEach(function (b) {
      var g = b.tile.parentElement;
      if (grids.indexOf(g) === -1) grids.push(g);
    });

    grids.forEach(function (g) {
      var w = g.getBoundingClientRect().width;
      var NCOLS = 12;
      var colW = (w - m.gap * (NCOLS - 1)) / NCOLS;
      built.forEach(function (b) {
        if (b.tile.parentElement !== g) return;
        var tileW = b.col * colW + (b.col - 1) * m.gap;
        var h = tileW * (b.item.h / b.item.w);
        var span = Math.max(1, Math.round((h + m.gap) / (m.row + m.gap)));
        b.tile.style.gridColumnEnd = "span " + b.col;
        b.tile.style.gridRowEnd = "span " + span;
      });
    });
  }

  var rT;
  window.addEventListener("resize", function () {
    clearTimeout(rT);
    rT = setTimeout(place, 120);
  });

  /* ---------- 4 · Revelação no scroll ---------- */
  var io;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -4% 0px" });
  }

  function reveal(target) {
    if (!io) { target.classList.add("is-in"); return; }
    io.observe(target);
  }

  [].slice.call(document.querySelectorAll(".reveal")).forEach(function (n, i) {
    if (!n.style.getPropertyValue("--i")) n.style.setProperty("--i", (i % 4));
    if (REDUCED) { n.classList.add("is-in"); return; }
    reveal(n);
  });

  if (REDUCED) {
    built.forEach(function (b) { b.tile.classList.add("is-in"); });
  } else {
    built.forEach(function (b) { reveal(b.tile); });
  }

  place(); // posiciona após primeiros blocos montados
  (window.requestAnimationFrame || setTimeout)(place);

  /* ---------- 5 · Cabeçalho + progresso ---------- */
  var head = document.getElementById("siteHead");
  var bar = document.getElementById("progressBar");
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        head.classList.toggle("is-sunk", y > 30);
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        bar.style.width = (y / max) * 100 + "%";
        ticking = false;
      });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 6 · Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbIndex = document.getElementById("lbIndex");
  var lbTotal = document.getElementById("lbTotal");
  var lbCaption = document.getElementById("lbCaption");
  var lbProgress = document.getElementById("lbProgress");
  var lbPlay = document.getElementById("lbPlay");
  var lbFull = document.getElementById("lbFull");
  var lbDelete = document.getElementById("lbDelete");
  var current = 0;
  var slideTimer = null;
  var isPlaying = false;

  lbTotal.textContent = ordered.length;

  var CAP_ROM = chapters.reduce(function (m, d, i) {
    byDay[d.iso].forEach(function () { m.push(d.numeral + " · " + d.name.toLowerCase()); });
    return m;
  }, []);

  function show(idx) {
    current = (idx + ordered.length) % ordered.length;
    var item = ordered[current];
    lbImg.alt = "Semana da Família — " + CAP_ROM[current];
    lbImg.src = item.f;
    lbIndex.textContent = current + 1;
    lbCaption.textContent = CAP_ROM[current] + " — fotografia " + (current + 1) + " de " + ordered.length;
    loadAdjacent(current);
  }

  function loadAdjacent(idx) {
    [idx + 1, idx - 1].forEach(function (i) {
      var j = (i + ordered.length) % ordered.length;
      var im = new Image();
      im.src = ordered[j].f;
    });
  }

  function open(i) {
    current = i;
    show(i);
    lb.removeAttribute("hidden");
    lb.classList.remove("is-prev");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { lb.classList.add("is-open"); });
    });
    document.body.style.overflow = "hidden";
    document.querySelector(".lightbox__close").focus();
  }

  function close() {
    lb.classList.remove("is-open");
    setTimeout(function () { lb.setAttribute("hidden", ""); }, 360);
    document.body.style.overflow = "";
    stopSlide();
  }

  function step(dir) {
    lb.classList.add(dir > 0 ? "is-next" : "is-prev");
    setTimeout(function () { lb.classList.remove("is-next", "is-prev"); }, 460);
    show(current + dir);
    if (isPlaying) startTimer(); // reinicia o ciclo
  }

  /* navegação */
  document.querySelectorAll(".lightbox__close, .lightbox__backdrop").forEach(function (btn) {
    btn.addEventListener("click", close);
  });
  document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
  document.getElementById("lbNext").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) step(1); });

  /* teclado */
  document.addEventListener("keydown", function (e) {
    if (lb.hasAttribute("hidden")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* toque */
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx == null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 46) step(dx < 0 ? 1 : -1);
    tx = null;
  }, { passive: true });

  /* slideshow */
  function startTimer() {
    stopSlide();
    lbProgress.innerHTML = "";
    var fill = el("span");
    fill.style.transition = "width 5.2s linear";
    lbProgress.appendChild(fill);
    requestAnimationFrame(function () { fill.style.width = "100%"; });
    slideTimer = setTimeout(function () {
      lbProgress.innerHTML = "";
      show(current + 1);
      if (isPlaying) startTimer();
    }, 5200);
  }
  function stopSlide() {
    clearTimeout(slideTimer);
    lbProgress.innerHTML = "";
  }
  lbPlay.addEventListener("click", function () {
    isPlaying = !isPlaying;
    lbPlay.innerHTML = isPlaying
      ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 6h3v12H7V6zm7 0h3v12h-3V6z" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 6l10 6-10 6V6z" fill="currentColor"/></svg>';
    lbPlay.setAttribute("aria-label", isPlaying ? "Pausar apresentação" : "Iniciar apresentação");
    if (isPlaying) { show(current); startTimer(); }
    else stopSlide();
  });

  /* tela cheia */
  lbFull.addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (lb.requestFullscreen) lb.requestFullscreen();
  });

  if (LOCAL_ADMIN) {
    lbDelete.hidden = false;
    lbDelete.addEventListener("click", function () {
      deleteLocalPhoto(ordered[current].f).then(function (removed) { if (removed) window.location.reload(); });
    });
  }

  /* abrir tiles */
  built.forEach(function (b) {
    b.tile.addEventListener("click", function (e) {
      e.preventDefault();
      open(parseInt(b.tile.dataset.photo, 10));
    });
  });

  /* restaura foco ao fechar */
  var lastFocus = null;
  var focusHandler = function (e) { lastFocus = e.target; };
  document.addEventListener("focusin", focusHandler);

  var realClose = close;
  close = function () {
    realClose();
    if (lastFocus) lastFocus.focus();
  };

  /* depois que tudo carrega, refaz a geometria (fontes alteram larguras) */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { place(); });
  }
  window.addEventListener("load", place);
  });
})();
