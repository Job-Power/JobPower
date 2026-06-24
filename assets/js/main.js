/* ==========================================================================
   JOB POWER HR — v2 interactions & motion
   ========================================================================== */
(() => {
  'use strict';
  const doc = document;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  doc.documentElement.classList.remove('no-js');

  const VIDEO_SRC = 'https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8';

  /* ===============================================================
     1. FIXED VIDEO BACKGROUND (HLS via hls.js; gradient fallback)
     =============================================================== */
  function initVideoBg() {
    const v = doc.getElementById('bgv');
    if (!v || reduceMotion) return;            // gradient tint stays as the bg
    const ready = () => { v.classList.add('ready'); v.play().catch(() => {}); };

    if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = VIDEO_SRC;                        // Safari / iOS native HLS
      v.addEventListener('loadeddata', ready, { once: true });
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 18, startLevel: -1 });
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, ready);
      hls.on(Hls.Events.ERROR, (_e, d) => {     // on fatal error just keep the gradient
        if (d && d.fatal && d.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      });
    }
    // save resources when the tab is hidden
    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) v.pause(); else v.play().catch(() => {});
    });
  }

  /* ===============================================================
     2. CUSTOM CURSOR + MAGNETIC
     =============================================================== */
  function initCursor() {
    if (isTouch || innerWidth <= 768) return;
    const dot = doc.querySelector('.cursor-dot');
    const ring = doc.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      requestAnimationFrame(loop);
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    })();
    addEventListener('mousedown', () => ring.classList.add('down'));
    addEventListener('mouseup', () => ring.classList.remove('down'));
    doc.querySelectorAll('a,button,.btn,.svc,.wcard,.crow,.stat,.nav-cta').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    doc.querySelectorAll('[data-magnetic]').forEach(el => {
      const s = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px,${(e.clientY - r.top - r.height / 2) * s}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ===============================================================
     3. PRELOADER (robust against background-tab hangs)
     =============================================================== */
  function initPreloader(done) {
    const pre = doc.querySelector('.preloader');
    if (!pre) { done(); return; }
    const bar = pre.querySelector('.pre-bar span');
    const count = pre.querySelector('.pre-count');
    const logo = pre.querySelector('.pre-mark img');
    if (window.gsap) gsap.to(logo, { opacity: 1, duration: .8, ease: 'power2.out' });

    let settled = false;
    function reveal() {
      if (settled) return;
      settled = true;
      clearInterval(tick); clearTimeout(failsafe);
      done();
    }
    function close() {
      if (window.gsap && !doc.hidden) {
        gsap.to(pre, { yPercent: -100, duration: 1, ease: 'power4.inOut',
          onComplete: () => { pre.remove(); reveal(); } });
      } else { pre.remove(); reveal(); }
    }
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 14 + 7;
      if (p >= 100) { p = 100; clearInterval(tick); setTimeout(close, 300); }
      if (bar) bar.style.width = Math.min(p, 100) + '%';
      if (count) count.textContent = String(Math.min(Math.floor(p), 100)).padStart(3, '0');
    }, 120);
    const failsafe = setTimeout(() => { if (pre.isConnected) pre.remove(); reveal(); }, 7000);
  }

  /* ===============================================================
     4. NAV / MENU / TO-TOP
     =============================================================== */
  function initNav() {
    const nav = doc.querySelector('nav');
    const burger = doc.querySelector('.nav-burger');
    const totop = doc.querySelector('.totop');
    const onScroll = () => {
      const y = window.scrollY;
      nav && nav.classList.toggle('scrolled', y > 40);
      totop && totop.classList.toggle('show', y > 720);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    if (burger) burger.addEventListener('click', () => doc.body.classList.toggle('menu-open'));
    doc.querySelectorAll('.mobile-menu a, .totop').forEach(a =>
      a.addEventListener('click', () => doc.body.classList.remove('menu-open')));

    // active link highlight
    const links = [...doc.querySelectorAll('.nav-links a')];
    const map = links.map(a => ({ a, sec: doc.querySelector(a.getAttribute('href')) })).filter(x => x.sec);
    addEventListener('scroll', () => {
      let cur = null;
      map.forEach(({ sec }) => { if (window.scrollY >= sec.offsetTop - 140) cur = sec.id; });
      map.forEach(({ a, sec }) => a.classList.toggle('active', sec.id === cur));
    }, { passive: true });
  }

  /* ===============================================================
     5. SMOOTH SCROLL (snappier Lenis) + anchors
     =============================================================== */
  let lenis = null;
  function initSmooth() {
    const anchors = () => doc.querySelectorAll('a[href^="#"]');
    if (reduceMotion || typeof Lenis === 'undefined') {
      anchors().forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href'); if (id.length < 2) return;
        const t = doc.querySelector(id); if (!t) return;
        e.preventDefault(); t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }));
      return;
    }
    lenis = new Lenis({
      duration: 0.85,
      easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),  // expo-out: quick, settles fast
      smoothWheel: true, wheelMultiplier: 1.05, touchMultiplier: 1.6
    });
    window.lenis = lenis;
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })();
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    anchors().forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = doc.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -64, duration: 1.05 });
    }));
  }

  /* ===============================================================
     6. GSAP MOTION
     =============================================================== */
  function initMotion() {
    if (reduceMotion || !window.gsap) {
      doc.querySelectorAll('[data-reveal],[data-reveal-stagger]>*').forEach(el => {
        el.style.opacity = 1; el.style.transform = 'none'; el.style.clipPath = 'none';
      });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // split the Hebrew wordmark into chars (solid colour)
    const brand = doc.querySelector('.hero-brand .split');
    if (brand) {
      const txt = brand.textContent; brand.innerHTML = '';
      [...txt].forEach(ch => {
        const s = doc.createElement('span'); s.className = 'char';
        s.textContent = ch === ' ' ? ' ' : ch; brand.appendChild(s);
      });
      gsap.set('.hero-brand .char', { yPercent: 120, opacity: 0 });
    }

    // intro timeline (hero owns its own reveals)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: .7 })
      .to('.hero-logo', { opacity: 1, y: 0, duration: .8 }, '-=.4')
      .to('.hero-brand .char', { yPercent: 0, opacity: 1, stagger: .05, duration: .85, ease: 'power4.out' }, '-=.4')
      .to('.hero-tagline', { opacity: 1, y: 0, duration: .8, ease: 'power4.out' }, '-=.4')
      .to('.hero-sub', { opacity: 1, y: 0, duration: .7 }, '-=.5')
      .to('.hero-btns', { opacity: 1, y: 0, duration: .6 }, '-=.45')
      .from('.scroll-ind', { opacity: 0, duration: .8 }, '-=.2');

    // generic reveals (everything outside the hero)
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      if (el.closest('.hero')) return;
      const st = { trigger: el, start: 'top 85%' };
      if (el.dataset.reveal === 'mask') {
        gsap.to(el, { clipPath: 'inset(0 -.14em -.14em -.14em)', duration: 1.05, ease: 'power3.out', scrollTrigger: st });
      } else {
        gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: st });
      }
    });
    gsap.utils.toArray('[data-reveal-stagger]').forEach(g => {
      gsap.to(g.children, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .07,
        scrollTrigger: { trigger: g, start: 'top 84%' } });
    });

    // cinematic slow zoom on the background video as you scroll
    const bgv = doc.querySelector('.bg-video');
    if (bgv) gsap.to(bgv, { scale: 1.16, ease: 'none',
      scrollTrigger: { trigger: doc.body, start: 'top top', end: 'bottom bottom', scrub: true } });

    // hero parallax
    gsap.to('.hero-inner', { yPercent: 12, opacity: .35, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // process timeline progress + active steps
    const fill = doc.querySelector('.proc-line .fill');
    const steps = gsap.utils.toArray('.proc-step');
    if (fill && steps.length) {
      gsap.to(fill, { height: '100%', ease: 'none',
        scrollTrigger: { trigger: '.proc-wrap', start: 'top 58%', end: 'bottom 72%', scrub: .5 } });
      steps.forEach(step => ScrollTrigger.create({
        trigger: step, start: 'top 64%',
        onEnter: () => step.classList.add('on'),
        onEnterBack: () => step.classList.add('on'),
      }));
    }

    ScrollTrigger.refresh();
  }

  /* ===============================================================
     7. COUNTERS
     =============================================================== */
  function initCounters() {
    doc.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const from = target === 2010 ? 1995 : 0;
      const run = () => {
        const dur = 1700; let t0 = null;
        const step = ts => {
          if (!t0) t0 = ts;
          const p = Math.min((ts - t0) / dur, 1);
          el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const obs = new IntersectionObserver((en, o) => {
        en.forEach(x => { if (x.isIntersecting) { run(); o.disconnect(); } });
      }, { threshold: .4 });
      obs.observe(el);
    });
  }

  /* ===============================================================
     BOOT
     =============================================================== */
  function boot() {
    initVideoBg();
    initCursor();
    initNav();
    initCounters();
    initSmooth();
    initPreloader(() => initMotion());
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
