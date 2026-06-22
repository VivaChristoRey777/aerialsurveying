/* Aerial Surveying — site interactions */
(function () {
  'use strict';

  // ---- Mobile nav ----
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !open);
      a.style.maxHeight = open ? null : a.scrollHeight + 'px';
    });
  });

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Booking / contact forms ----
  // Submits to Netlify Forms when live; falls back to an inline success
  // message anywhere else (e.g. opening the file locally).
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var showSuccess = function () {
        var success = form.parentElement.querySelector('.form-success');
        if (success) {
          form.style.display = 'none';
          success.classList.add('show');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      if (form.getAttribute('data-netlify') === 'true') {
        var body = new URLSearchParams(new FormData(form)).toString();
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        }).then(showSuccess).catch(showSuccess);
      } else {
        showSuccess();
      }
    });
  });

  // ---- Gallery lightbox (single image or browsable group) ----
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('figcaption');
    var lbClose = lightbox.querySelector('.lb-close');
    var lbPrev = lightbox.querySelector('.lb-prev');
    var lbNext = lightbox.querySelector('.lb-next');
    var lbCount = lightbox.querySelector('.lb-count');
    var lastFocused = null;
    var group = [];
    var gi = 0;

    var decode = function (s) {
      var t = document.createElement('textarea');
      t.innerHTML = s || '';
      return t.value;
    };

    var itemsFor = function (tile) {
      var tpl = tile.querySelector('template.group-items');
      if (tpl) {
        return [].slice.call(tpl.content.querySelectorAll('span')).map(function (sp) {
          return {
            src: sp.getAttribute('data-src'),
            title: decode(sp.getAttribute('data-title')),
            sub: decode(sp.getAttribute('data-sub')),
            alt: sp.getAttribute('data-alt') || ''
          };
        });
      }
      var full = tile.getAttribute('data-full');
      if (!full) return [];
      var cap = tile.querySelector('.cap');
      var img = tile.querySelector('img');
      return [{
        src: full,
        title: cap && cap.querySelector('b') ? cap.querySelector('b').textContent : '',
        sub: cap && cap.querySelector('span') ? cap.querySelector('span').textContent : '',
        alt: img ? img.alt : ''
      }];
    };

    var renderItem = function () {
      var it = group[gi];
      if (!it) return;
      lbImg.src = it.src;
      lbImg.alt = it.alt;
      lbCap.textContent = it.title || '';
      if (it.sub) {
        var s = document.createElement('span');
        s.textContent = it.sub;
        lbCap.appendChild(s);
      }
      if (lbCount) lbCount.textContent = (gi + 1) + ' / ' + group.length;
    };

    var step = function (n) {
      if (!group.length) return;
      gi = (n + group.length) % group.length;
      renderItem();
    };

    var openTile = function (tile) {
      group = itemsFor(tile);
      if (!group.length) return;
      gi = 0;
      lightbox.classList.toggle('single', group.length < 2);
      renderItem();
      lastFocused = tile;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.remove('open');
      lbImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll('.gtile[data-full], .gtile[data-group]').forEach(function (tile) {
      tile.addEventListener('click', function () { openTile(tile); });
    });
    if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); step(gi - 1); });
    if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); step(gi + 1); });
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(gi - 1);
      else if (e.key === 'ArrowRight') step(gi + 1);
    });
  }

  // ---- Progress slideshow ----
  document.querySelectorAll('.slideshow').forEach(function (sw) {
    var slides = [].slice.call(sw.querySelectorAll('.slide'));
    var dots = [].slice.call(sw.querySelectorAll('.slide-dots button'));
    var prev = sw.querySelector('.slide-nav.prev');
    var next = sw.querySelector('.slide-nav.next');
    var counter = sw.querySelector('.slide-count');
    if (slides.length < 2) return;
    var i = 0, timer = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render() {
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('active', k === i); });
      if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
    }
    function show(n) { i = (n + slides.length) % slides.length; render(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() { if (reduce) return; stop(); timer = setInterval(function () { show(i + 1); }, 6000); }
    function go(n) { show(n); play(); }

    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
    sw.addEventListener('mouseenter', stop);
    sw.addEventListener('mouseleave', play);
    sw.addEventListener('focusin', stop);
    sw.addEventListener('focusout', play);
    sw.setAttribute('tabindex', '0');
    sw.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    });
    render();
    play();
  });

  // ---- Showreel (Vimeo click-to-load facade, or self-hosted <video>) ----
  document.querySelectorAll('.video-frame').forEach(function (frame) {
    var btn = frame.querySelector('.video-play');
    if (!btn) return;
    var embed = frame.getAttribute('data-vimeo');
    if (embed) {
      btn.addEventListener('click', function () {
        if (frame.classList.contains('playing')) return;
        var ifr = document.createElement('iframe');
        ifr.src = embed;
        ifr.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
        ifr.setAttribute('allowfullscreen', '');
        ifr.setAttribute('title', 'Drone roof survey 3D model');
        frame.appendChild(ifr);
        frame.classList.add('playing');
      });
      return;
    }
    var v = frame.querySelector('video');
    if (!v) return;
    btn.addEventListener('click', function () { frame.classList.add('playing'); v.play(); });
    v.addEventListener('play', function () { frame.classList.add('playing'); });
    v.addEventListener('pause', function () { if (!v.ended) frame.classList.remove('playing'); });
    v.addEventListener('ended', function () { frame.classList.remove('playing'); });
  });

  // ---- Footer year ----
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
