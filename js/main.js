/* Sobha One World – UI interactions (vanilla JS, no dependencies). */
(function () {
    'use strict';

    var body = document.body;
    var header = document.getElementById('siteHeader');

    /* ---------- Sticky header ---------- */
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 40); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ---------- Hero banner slider ---------- */
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dots button');
    var current = 0, timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Slides 2+ carry data-src/data-srcset so they don't compete with the LCP image.
    function loadSlide(slide) {
        slide.querySelectorAll('[data-srcset]').forEach(function (el) {
            el.setAttribute('srcset', el.getAttribute('data-srcset'));
            el.removeAttribute('data-srcset');
        });
        var img = slide.querySelector('img[data-src]');
        if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
    }
    function showSlide(i) {
        current = (i + slides.length) % slides.length;
        loadSlide(slides[current]);
        loadSlide(slides[(current + 1) % slides.length]);
        slides.forEach(function (s, n) { s.classList.toggle('active', n === current); });
        dots.forEach(function (d, n) {
            d.classList.toggle('active', n === current);
            if (n === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
    }
    function play() {
        if (reduceMotion || slides.length < 2) return;
        clearInterval(timer);
        timer = setInterval(function () { showSlide(current + 1); }, 6000);
    }
    dots.forEach(function (d, n) { d.addEventListener('click', function () { showSlide(n); play(); }); });
    window.addEventListener('load', function () {
        if (slides.length > 1) loadSlide(slides[1]);
        play();
    });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) clearInterval(timer); else play();
    });

    /* ---------- Mobile nav ---------- */
    var toggle = document.getElementById('navToggle');
    function setNav(open) {
        body.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', function () { setNav(!body.classList.contains('nav-open')); });
    document.querySelectorAll('#mainNav a').forEach(function (a) {
        a.addEventListener('click', function () { setNav(false); });
    });

    /* ---------- Active nav link ---------- */
    var links = {};
    document.querySelectorAll('#mainNav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting || !links[e.target.id]) return;
                Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
                links[e.target.id].classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(links).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) spy.observe(el);
        });

        /* Reveal on scroll */
        var revealEls = document.querySelectorAll('.slide, .faq details, .facts');
        var rev = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(function (el) {
            if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('reveal'); rev.observe(el); }
        });
    }

    /* ---------- Tabs (floor plans) ---------- */
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    function selectTab(tab) {
        tabs.forEach(function (t) {
            var on = t === tab;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on);
            t.tabIndex = on ? 0 : -1;
            document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
    }
    tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { selectTab(tab); });
        tab.addEventListener('keydown', function (e) {
            var dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
            if (!dir) return;
            e.preventDefault();
            var next = tabs[(i + dir + tabs.length) % tabs.length];
            next.focus();
            selectTab(next);
        });
    });

    /* ---------- Enquiry popup ---------- */
    var modal = document.getElementById('enquiryModal');
    var modalTitle = document.getElementById('modalTitle');
    var lastFocus = null;

    function openModal(title) {
        lastFocus = document.activeElement;
        modalTitle.textContent = title || 'Book a Free Site Visit';
        modal.hidden = false;
        body.classList.add('modal-open');
        setTimeout(function () { document.getElementById('qSenderNamepopup').focus(); }, 50);
    }
    function closeModal() {
        modal.hidden = true;
        body.classList.remove('modal-open');
        if (lastFocus) lastFocus.focus();
    }
    window.openEnquiry = openModal;

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-enquire]');
        if (trigger) {
            e.preventDefault();
            openModal(trigger.getAttribute('data-title'));
        }
    });
    modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closeModal); });

    // Auto popup once per session after 15s (storage may be blocked; fail quietly).
    var shown = false;
    try { shown = sessionStorage.getItem('enqShown') === '1'; } catch (err) { }
    if (!shown) {
        setTimeout(function () {
            if (modal.hidden && document.getElementById('lightbox').hidden) {
                openModal('Get Exclusive Launch Offers');
            }
            try { sessionStorage.setItem('enqShown', '1'); } catch (err) { }
        }, 15000);
    }

    /* ---------- Gallery lightbox ---------- */
    var lightbox = document.getElementById('lightbox');
    var lightImg = document.getElementById('lightboxImg');
    document.querySelectorAll('.arch').forEach(function (btn) {
        btn.addEventListener('click', function () {
            lastFocus = btn;
            lightImg.src = btn.getAttribute('data-full');
            lightImg.alt = btn.querySelector('img').alt;
            lightbox.hidden = false;
            body.classList.add('modal-open');
            lightbox.querySelector('.modal-close').focus();
        });
    });
    function closeLightbox() {
        lightbox.hidden = true;
        body.classList.remove('modal-open');
        if (lastFocus) lastFocus.focus();
    }
    lightbox.addEventListener('click', function (e) { if (e.target !== lightImg) closeLightbox(); });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!modal.hidden) closeModal();
        if (!lightbox.hidden) closeLightbox();
        if (body.classList.contains('nav-open')) setNav(false);
    });

    /* ---------- Footer year ---------- */
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
})();
