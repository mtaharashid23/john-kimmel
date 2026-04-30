/* =========================================================
   John Kimmel — Dust and Devotion
   Smooth scrolling (Lenis), scroll animations (GSAP),
   text reveals (SplitType).
   ========================================================= */

(function () {
  'use strict';

  /* -------- Lenis smooth scroll -------- */
  let lenis = null;
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof gsap !== 'undefined' && gsap.ticker) {
      lenis.on('scroll', function () {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
      });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* -------- Navbar scroll state -------- */
  function initNav() {
    const nav = document.querySelector('[data-testid="site-nav"]');
    if (!nav) return;
    const onScroll = function () {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------- Mobile menu -------- */
  function initMobileMenu() {
    const toggle = document.querySelector('[data-testid="nav-toggle"]');
    const menu = document.querySelector('[data-testid="mobile-menu"]');
    const close = document.querySelector('[data-testid="mobile-close"]');
    if (!toggle || !menu) return;
    const open = function () {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    };
    const shut = function () {
      menu.classList.remove('open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };
    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', shut);
    });
  }

  /* -------- SplitType text reveal on headings with [data-split] -------- */
  function initSplit() {
    if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') return;

    const splitTargets = document.querySelectorAll('[data-split]');
    splitTargets.forEach(function (el) {
      const mode = el.getAttribute('data-split') || 'words';
      const split = new SplitType(el, { types: mode });
      el.style.opacity = '1';

      let targets = [];
      if (mode.indexOf('chars') > -1) targets = split.chars || [];
      else if (mode.indexOf('lines') > -1) targets = split.lines || [];
      else targets = split.words || [];

      if (!targets.length) return;

      gsap.from(targets, {
        yPercent: 110,
        opacity: 0,
        stagger: 0.018,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    });
  }

  /* -------- Fade-up reveals on [data-fade] -------- */
  function initFades() {
    if (typeof gsap === 'undefined') return;
    const els = document.querySelectorAll('[data-fade]');
    els.forEach(function (el, i) {
      const delay = parseFloat(el.getAttribute('data-fade-delay') || '0');
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 1.1,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
      });
    });
  }

  /* -------- Parallax images via [data-parallax] -------- */
  function initParallax() {
    if (typeof gsap === 'undefined') return;
    const els = document.querySelectorAll('[data-parallax]');
    els.forEach(function (el) {
      const amount = parseFloat(el.getAttribute('data-parallax') || '60');
      gsap.to(el, {
        y: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* -------- Hero cover intro animation -------- */
  function initHeroIntro() {
    if (typeof gsap === 'undefined') return;
    const cover = document.querySelector('[data-hero-cover]');
    const cta = document.querySelectorAll('[data-hero-cta]');
    const eyebrow = document.querySelector('[data-hero-eyebrow]');
    const lead = document.querySelector('[data-hero-lead]');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (eyebrow) tl.from(eyebrow, { y: 30, opacity: 0, duration: 1 }, 0);
    if (lead) tl.from(lead, { y: 30, opacity: 0, duration: 1 }, 0.4);
    cta.forEach(function (b, i) {
      tl.from(b, { opacity: 0, duration: 0.8 }, 0.6 + i * 0.1);
    });
    if (cover) tl.from(cover, { y: 60, opacity: 0, scale: 0.92, duration: 1.4, ease: 'power4.out' }, 0.2);
  }

  /* -------- Blog filter (simple) -------- */
  function initBlogFilter() {
    const buttons = document.querySelectorAll('[data-filter]');
    const cards = document.querySelectorAll('[data-category]');
    if (!buttons.length || !cards.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.getAttribute('data-filter');
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        cards.forEach(function (c) {
          const cat = c.getAttribute('data-category');
          const parent = c.closest('[data-filter-item]') || c;
          if (filter === 'all' || cat === filter) {
            parent.style.display = '';
          } else {
            parent.style.display = 'none';
          }
        });
      });
    });
  }

  /* -------- Contact form (no backend; local confirmation) -------- */
  function initContactForm() {
    const form = document.querySelector('[data-testid="contact-form"]');
    if (!form) return;
    const note = form.querySelector('[data-form-note]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(form);
      if (!data.get('name') || !data.get('email') || !data.get('message')) {
        if (note) { note.textContent = 'Please fill in your name, email, and message.'; note.style.color = '#9e4a10'; }
        return;
      }
      form.reset();
      if (note) { note.textContent = 'Thank you — your message has been received. The author will respond personally.'; note.style.color = '#3a2a1c'; }
    });
  }

  /* -------- Newsletter form -------- */
  function initNewsletter() {
    const form = document.querySelector('[data-testid="newsletter-form"]');
    if (!form) return;
    const note = form.parentElement.querySelector('[data-newsletter-note]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email || email.indexOf('@') === -1) {
        if (note) { note.textContent = 'Please enter a valid email address.'; note.style.color = 'rgba(226,122,26,0.9)'; }
        return;
      }
      form.reset();
      if (note) { note.textContent = 'You\u2019re in. Look for the next letter from the dust road.'; note.style.color = 'rgba(242,199,92,0.95)'; }
    });
  }

  /* -------- Footer year -------- */
  function initYear() {
    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* -------- Register ScrollTrigger and kickoff -------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initYear();
    initLenis();
    initNav();
    initMobileMenu();
    initHeroIntro();
    initSplit();
    initFades();
    initParallax();
    initBlogFilter();
    initContactForm();
    initNewsletter();

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
})();
