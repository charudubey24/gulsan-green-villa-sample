document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const pills = document.getElementById("navPills");
  toggle.addEventListener("click", () => {
    const open = pills.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  pills.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => pills.classList.remove("is-open"))
  );

  /* ---------- Tabs ---------- */
  const tabData = {
    story: {
      lead: "When you work with Gulshan Green Villas, you become part of a story that began with a simple belief: a home should feel right the moment you step inside.",
      title: "The Gulshan Green Villas Story",
      b1: "Founded in 2009, we started with a single office and a handful of family-owned listings. Today we represent more than 1,200 properties and have helped over 3,500 families find their place.",
      b2: "Every detail, from the first call to the final key handover, is a bridge between your expectations and reality.",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    },
    areas: {
      lead: "We know every street, school and park, because we live in the neighborhoods we sell.",
      title: "Neighborhoods We Love",
      b1: "From leafy suburbs and vineyard hills to lively city centers, our local advisors map out commute times, schools, green space and future development for every area.",
      b2: "Tell us your lifestyle and we will show you where it fits best.",
      img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
    },
    team: {
      lead: "A small, dedicated team of advisors, architects and legal experts — all under one roof.",
      title: "Meet the Team",
      b1: "Our advisors average 12 years in real estate. Alongside them, in-house mortgage specialists and property lawyers keep every deal smooth and transparent.",
      b2: "One point of contact. Zero surprises. Total peace of mind.",
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    }
  };

  const panel = document.getElementById("panel");
  const els = {
    lead: document.getElementById("panelLead"),
    title: document.getElementById("panelTitle"),
    b1: document.getElementById("panelBody1"),
    b2: document.getElementById("panelBody2"),
    img: document.getElementById("panelImg")
  };

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      const d = tabData[tab.dataset.tab];
      panel.classList.add("is-fading");
      setTimeout(() => {
        els.lead.textContent = d.lead;
        els.title.textContent = d.title;
        els.b1.textContent = d.b1;
        els.b2.textContent = d.b2;
        els.img.src = d.img;
        panel.classList.remove("is-fading");
      }, 250);
    });
  });

  /* ---------- Listing filter ---------- */
  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".card-listing");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      cards.forEach(card => {
        card.classList.toggle("is-hidden", f !== "all" && card.dataset.type !== f);
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".title, .tabs, .panel, .stat, .filters, .card-listing, .tile, .contact"
  );
  revealTargets.forEach(el => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const co = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      co.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => co.observe(c));

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const msg = document.getElementById("formMsg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    msg.classList.remove("is-error");
    if (!name || !okEmail) {
      msg.classList.add("is-error");
      msg.textContent = "Please enter your name and a valid email address.";
      return;
    }
    msg.textContent = `Thank you, ${name}! We will contact you within 24 hours.`;
    form.reset();
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ---------- Hero: 3D carousel, parallax, particles ---------- */
(function () {
  const hero = document.getElementById("top");
  const carousel = document.getElementById("carousel");
  if (!hero || !carousel) return;

  const cards = Array.from(carousel.querySelectorAll(".card3d"));
  const N = cards.length;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let pos = 0;            // current (smoothed) position
  let target = 0;         // where we are heading
  let dragging = false, hovering = false;
  let startX = 0, startTarget = 0, moved = 0;
  let lastInteract = 0, acc = 0, last = performance.now();

  const cardWidth = () => cards[0].offsetWidth || 180;
  const stepPx = () => cardWidth() * 0.96;

  function offsetOf(i) {
    let o = (((i - pos) % N) + N) % N;
    if (o > N / 2) o -= N;
    return o;
  }

  function render() {
    const step = stepPx();
    cards.forEach((card, i) => {
      const o = offsetOf(i);
      const a = Math.abs(o);
      const x = o * step;
      const rot = Math.max(-58, Math.min(58, -o * 19));   // outer cards turn toward the centre
      const z = -80 + Math.min(a, 3.5) * 45;               // curved wall: centre sits furthest back
      const s = 0.78 + Math.min(a, 3) * 0.1;               // centre smaller, edges larger
      const blur = a > 2.6 ? (a - 2.6) * 5 : 0;
      const opacity = a > 3.2 ? Math.max(0, 1 - (a - 3.2) * 1.3) : 1;

      card.style.transform =
        `translate3d(calc(-50% + ${x.toFixed(1)}px), -50%, ${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      card.style.filter = blur ? `blur(${blur.toFixed(1)}px)` : "none";
      card.style.opacity = opacity.toFixed(2);
      card.style.zIndex = Math.round(a * 10);
      card.classList.toggle("is-active", a < 0.5);
    });
  }

  function frame(now) {
    const dt = Math.min(now - last, 100);
    last = now;

    if (!reduce && !dragging && !hovering && now - lastInteract > 1800) {
      acc += dt;
      if (acc > 3400) { acc = 0; target = Math.round(target) + 1; }
    }

    const diff = target - pos;
    if (Math.abs(diff) > 0.0004) {
      pos += diff * (1 - Math.exp(-dt / 140));
      render();
    }
    requestAnimationFrame(frame);
  }

  /* drag / swipe */
  carousel.addEventListener("pointerdown", (e) => {
    dragging = true; moved = 0;
    startX = e.clientX; startTarget = target;
    carousel.classList.add("is-dragging");
    try { carousel.setPointerCapture(e.pointerId); } catch (_) {}
  });
  carousel.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    target = startTarget - dx / stepPx();
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    carousel.classList.remove("is-dragging");
    lastInteract = performance.now(); acc = 0;

    if (moved < 6) {
      // treat as a click: bring a side card to the centre, or open listings
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const card = el && el.closest(".card3d");
      if (card) {
        const o = offsetOf(cards.indexOf(card));
        if (Math.abs(o) > 0.4) { target = Math.round(pos + o); return; }
        const listings = document.getElementById("listings");
        if (listings) listings.scrollIntoView({ behavior: "smooth" });
      }
    }
    target = Math.round(target);
  }
  carousel.addEventListener("pointerup", endDrag);
  carousel.addEventListener("pointercancel", endDrag);
  carousel.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovering = true; });
  carousel.addEventListener("pointerleave", () => { hovering = false; });
  window.addEventListener("resize", render);

  render();
  requestAnimationFrame(frame);

  /* mouse parallax */
  if (!reduce) {
    hero.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (((e.clientX - r.left) / r.width) - 0.5) * 2);
      hero.style.setProperty("--my", (((e.clientY - r.top) / r.height) - 0.5) * 2);
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--mx", 0);
      hero.style.setProperty("--my", 0);
    });
  }

  /* floating gold particles */
  const box = hero.querySelector(".hero__particles");
  if (box && !reduce) {
    for (let i = 0; i < 26; i++) {
      const s = document.createElement("span");
      const size = 2 + Math.random() * 4;
      s.style.cssText =
        `left:${(Math.random() * 100).toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `animation-duration:${(9 + Math.random() * 10).toFixed(1)}s;animation-delay:${(-Math.random() * 18).toFixed(1)}s`;
      box.appendChild(s);
    }
  }
})();