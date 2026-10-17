/* Homepage behaviour — hand-written, no dependencies.
   Everything here is an enhancement: with JS off the page is a long, readable
   document; with reduced motion on, nothing moves on its own. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(pointer: fine)') && mq('(hover: hover)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     1. Per-word reveal + rise-in (unchanged behaviour from v1)
     ------------------------------------------------------------------ */
  $$('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (word, i) {
      var outer = document.createElement('span');
      outer.className = 'reveal-word';
      var inner = document.createElement('span');
      inner.textContent = word;
      inner.style.setProperty('--d', (i * 55) + 'ms');
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) { el.appendChild(document.createTextNode(' ')); }
    });
  });

  (function reveal() {
    var targets = $$('[data-split], .rise');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    /* Position sweep rather than observer events: a fast scroll or a jump to
       #hash can skip a short element between samples and strand it hidden. */
    var pending = targets.slice(), queued = false;
    function sweep() {
      queued = false;
      var line = window.innerHeight * 0.9;
      for (var i = pending.length - 1; i >= 0; i--) {
        if (pending[i].getBoundingClientRect().top < line) {
          pending[i].classList.add('is-in');
          pending.splice(i, 1);
        }
      }
      if (!pending.length) {
        window.removeEventListener('scroll', queue);
        window.removeEventListener('resize', queue);
      }
    }
    function queue() { if (!queued) { queued = true; window.requestAnimationFrame(sweep); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('load', queue);
    sweep();
  })();

  /* ------------------------------------------------------------------
     2. Scroll progress + active nav (colour AND underline)
     ------------------------------------------------------------------ */
  (function () {
    var bar = $('.progress span');
    if (bar) {
      var queued = false;
      var draw = function () {
        queued = false;
        var max = doc.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      };
      window.addEventListener('scroll', function () {
        if (!queued) { queued = true; window.requestAnimationFrame(draw); }
      }, { passive: true });
      draw();
    }
    var links = $$('.nav-links a[href^="#"]');
    var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) { return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) { a.setAttribute('aria-current', 'true'); }
          else { a.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { obs.observe(s); });
  })();

  /* ------------------------------------------------------------------
     3. Local clock — Huntingdon runs on UK time
     ------------------------------------------------------------------ */
  (function () {
    var el = $('.clock-time');
    if (!el || !window.Intl) { return; }
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    } catch (e) { return; }
    var tick = function () {
      var now = new Date();
      el.textContent = fmt.format(now);
      el.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 30000);
  })();

  /* ------------------------------------------------------------------
     4. Draggable stickers + portrait tilt (desktop pointers only)
     ------------------------------------------------------------------ */
  (function () {
    if (!finePointer || mq('(max-width: 720px)')) { return; }
    $$('.sticker').forEach(function (s) {
      var x = 0, y = 0, sx = 0, sy = 0, dragging = false;
      s.addEventListener('pointerdown', function (e) {
        dragging = true; sx = e.clientX - x; sy = e.clientY - y;
        s.setPointerCapture(e.pointerId);
        s.classList.add('is-dragging');
      });
      s.addEventListener('pointermove', function (e) {
        if (!dragging) { return; }
        x = e.clientX - sx; y = e.clientY - sy;
        s.style.translate = x + 'px ' + y + 'px';
      });
      var end = function () { dragging = false; s.classList.remove('is-dragging'); };
      s.addEventListener('pointerup', end);
      s.addEventListener('pointercancel', end);
      s.addEventListener('dblclick', function () { x = 0; y = 0; s.style.translate = ''; });
    });

    if (reduce) { return; }
    var p = $('.portrait.tilt');
    var wrap = $('.portrait-wrap');
    if (!p || !wrap) { return; }
    wrap.addEventListener('pointermove', function (e) {
      if (e.target.closest('.sticker')) { return; }
      var r = p.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      p.style.transform = 'perspective(900px) rotateY(' + (dx * 7) + 'deg) rotateX(' + (-dy * 7) + 'deg)';
    });
    wrap.addEventListener('pointerleave', function () { p.style.transform = ''; });
  })();

  /* ------------------------------------------------------------------
     5. Magnetic buttons
     ------------------------------------------------------------------ */
  (function () {
    if (!finePointer || reduce) { return; }
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate(' + dx * 0.25 + 'px,' + dy * 0.35 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------------------
     6. Project slideshow
     ------------------------------------------------------------------ */
  (function () {
    var track = $('.slider-track');
    if (!track) { return; }
    var slides = $$('.slide', track);
    var prev = $('.round-btn[data-dir="-1"]');
    var next = $('.round-btn[data-dir="1"]');
    var nowEl = $('.sc-now');
    var allEl = $('.sc-all');
    var ticks = $('.ticks');
    var chips = $$('.chip[data-filter]');
    var active = 0;
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var visible = function () { return slides.filter(function (s) { return !s.hidden; }); };
    var edge = function () { return parseFloat(getComputedStyle(track).paddingLeft) || 0; };

    function goTo(i, instant) {
      var v = visible();
      if (!v.length) { return; }
      i = Math.max(0, Math.min(v.length - 1, i));
      track.scrollTo({ left: v[i].offsetLeft - edge(), behavior: (reduce || instant) ? 'auto' : 'smooth' });
    }

    function measure() {
      var v = visible();
      var target = track.scrollLeft + edge();
      var best = 0, bestD = Infinity;
      v.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft - target);
        if (d < bestD) { bestD = d; best = i; }
      });
      /* At the far end the last slides can't reach the left edge — treat
         "scrolled to the end" as the last slide. */
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) { best = v.length - 1; }
      active = best;
      v.forEach(function (s, i) { s.classList.toggle('is-active', i === best); });
      if (nowEl) { nowEl.textContent = pad2(best + 1); }
      if (prev) { prev.disabled = best === 0; }
      if (next) { next.disabled = best === v.length - 1; }
      $$('button', ticks).forEach(function (t, i) {
        if (i === best) { t.setAttribute('aria-current', 'true'); } else { t.removeAttribute('aria-current'); }
      });
    }

    function buildTicks() {
      if (!ticks) { return; }
      ticks.innerHTML = '';
      visible().forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        b.setAttribute('aria-label', 'Go to project ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); });
        ticks.appendChild(b);
      });
      if (allEl) { allEl.textContent = pad2(visible().length); }
    }

    var queued = false;
    track.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; measure(); }); }
    }, { passive: true });
    window.addEventListener('resize', measure);

    if (prev) { prev.addEventListener('click', function () { goTo(active - 1); }); }
    if (next) { next.addEventListener('click', function () { goTo(active + 1); }); }

    track.addEventListener('keydown', function (e) {
      if (e.target !== track) { return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
      if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      if (e.key === 'End') { e.preventDefault(); goTo(visible().length - 1); }
    });

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-filter');
        chips.forEach(function (o) {
          var on = o === c;
          o.classList.toggle('is-on', on);
          o.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        slides.forEach(function (s) {
          s.hidden = !(f === 'all' || (' ' + s.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1);
        });
        buildTicks();
        goTo(0, true);
        measure();
      });
    });

    /* Mouse drag-to-scroll. Touch already swipes natively. */
    (function () {
      var down = false, moved = false, startX = 0, startLeft = 0;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) { return; }
        if (e.target.closest('a, button, video[controls]')) { return; }
        down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) { return; }
        var dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-grabbing'); }
        if (moved) { track.scrollLeft = startLeft - dx; }
      });
      window.addEventListener('pointerup', function () {
        if (!down) { return; }
        down = false;
        if (moved) {
          track.classList.remove('is-grabbing');
          measure();
          goTo(active);
        }
      });
      track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    })();

    /* Videos in slides: fetched only when their slide is on screen, played
       muted while visible, paused otherwise. Reduced motion: never autoplay —
       the poster stays and native controls appear instead. */
    var vids = $$('video.lazy-video', track);
    var load = function (v) { if (!v.getAttribute('src')) { v.src = v.getAttribute('data-src'); } };
    if (reduce || !('IntersectionObserver' in window)) {
      vids.forEach(function (v) { v.controls = true; v.preload = 'none'; v.addEventListener('play', function () { load(v); }, { once: true }); load(v); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting && en.intersectionRatio >= 0.55) {
            load(v);
            var p = v.play(); if (p && p.catch) { p.catch(function () {}); }
          } else { v.pause(); }
        });
      }, { threshold: [0, 0.55, 1] });
      vids.forEach(function (v) { io.observe(v); });
    }

    buildTicks();
    measure();
  })();

  /* ------------------------------------------------------------------
     7. Reel player
     ------------------------------------------------------------------ */
  (function () {
    var video = $('.reel-video');
    if (!video) { return; }
    var frame = $('.reel-frame');
    var title = $('.reel-title'), meta = $('.reel-meta'), desc = $('.reel-desc');
    var picks = $$('.pick');
    var started = false;

    function startMuted() {
      if (started) { return; }
      started = true;
      video.src = video.getAttribute('data-autoload');
      if (!reduce) { var p = video.play(); if (p && p.catch) { p.catch(function () {}); } }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (!started) { startMuted(); }
            else if (video.muted && !reduce) { video.play().catch(function () {}); }
          } else if (started) { video.pause(); }
        });
      }, { threshold: 0.35 }).observe(frame);
    } else { video.src = video.getAttribute('data-autoload'); started = true; }

    picks.forEach(function (b) {
      b.addEventListener('click', function () {
        picks.forEach(function (o) { o.classList.toggle('is-on', o === b); o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        started = true;
        video.pause();
        video.poster = b.getAttribute('data-poster');
        frame.style.setProperty('--poster', 'url("' + new URL(b.getAttribute('data-poster'), document.baseURI).href + '")');
        video.src = b.getAttribute('data-src');
        frame.classList.toggle('is-tall', b.getAttribute('data-shape') === 'tall');
        frame.classList.toggle('is-wide', b.getAttribute('data-shape') !== 'tall');
        title.textContent = b.getAttribute('data-title');
        meta.textContent = b.getAttribute('data-meta');
        desc.textContent = b.getAttribute('data-desc');
        /* A click is a user gesture, so this one plays with sound. */
        video.muted = false;
        var p = video.play(); if (p && p.catch) { p.catch(function () { video.muted = true; video.play().catch(function () {}); }); }
        if (mq('(max-width: 1000px)')) { frame.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
      });
    });
  })();

  /* ------------------------------------------------------------------
     8. Lightbox for design boards
     ------------------------------------------------------------------ */
  (function () {
    var dlg = $('.lightbox');
    if (!dlg || typeof dlg.showModal !== 'function') {
      $$('.zoom').forEach(function (z) { z.addEventListener('click', function () { window.open(z.getAttribute('data-zoom'), '_blank', 'noopener'); }); });
      return;
    }
    var img = $('img', dlg);
    var opener = null;
    $$('.zoom').forEach(function (z) {
      z.addEventListener('click', function () {
        opener = z;
        img.src = z.getAttribute('data-zoom');
        img.alt = z.getAttribute('data-alt') || '';
        dlg.showModal();
      });
    });
    $('.lightbox-close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.close(); } });
    dlg.addEventListener('close', function () { if (opener) { opener.focus(); } });
  })();

  /* ------------------------------------------------------------------
     9. Copy email — with a small celebration
     ------------------------------------------------------------------ */
  (function () {
    var btn = $('.copy-email');
    var status = $('.copy-status');
    if (!btn) { return; }
    var colours = ['#FFD84A', '#B9A8FF', '#D9F0E4', '#FADAD3', '#D8E8F7', '#F1EFF7'];
    function confetti(x, y) {
      if (reduce || !document.body.animate) { return; }
      for (var i = 0; i < 36; i++) {
        var c = document.createElement('span');
        c.className = 'confetti';
        c.style.background = colours[i % colours.length];
        document.body.appendChild(c);
        var ang = Math.random() * Math.PI - Math.PI;     /* upward fan */
        var dist = 90 + Math.random() * 170;
        var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
        var anim = c.animate([
          { transform: 'translate(' + x + 'px,' + y + 'px) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + (x + dx) + 'px,' + (y + dy) + 'px) rotate(' + (Math.random() * 540) + 'deg)', opacity: 1, offset: 0.55 },
          { transform: 'translate(' + (x + dx * 1.2) + 'px,' + (y + dy + 260) + 'px) rotate(' + (Math.random() * 900) + 'deg)', opacity: 0 }
        ], { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        anim.onfinish = (function (el) { return function () { el.remove(); }; })(c);
      }
    }
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      var r = btn.getBoundingClientRect();
      var done = function () {
        status.textContent = 'Copied — speak soon!';
        btn.textContent = 'Copied ✓';
        confetti(r.left + r.width / 2, r.top + r.height / 2);
        setTimeout(function () { btn.textContent = 'Copy email'; }, 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { status.textContent = 'It’s ' + email; });
      } else { status.textContent = 'It’s ' + email; }
    });
  })();

  /* ------------------------------------------------------------------
     10. Cursor companion — an extra dot, never a replacement cursor
     ------------------------------------------------------------------ */
  (function () {
    var c = $('.cursor');
    if (!c || !finePointer || reduce) { return; }
    doc.classList.add('has-cursor');
    var label = $('.cursor-label', c);
    var x = -100, y = -100, tx = -100, ty = -100;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') { return; }
      tx = e.clientX; ty = e.clientY;
      c.classList.remove('is-hidden');
    }, { passive: true });
    document.addEventListener('pointerleave', function () { c.classList.add('is-hidden'); });
    document.addEventListener('mouseover', function (e) {
      var big = e.target.closest('[data-cursor]');
      var link = e.target.closest('a, button, .sticker, .chip');
      if (big && !(link && big.contains(link) && link !== big && !link.classList.contains('zoom'))) {
        c.classList.add('is-big'); c.classList.remove('is-link');
        label.textContent = big.getAttribute('data-cursor');
      } else if (link) {
        c.classList.add('is-link'); c.classList.remove('is-big'); label.textContent = '';
      } else {
        c.classList.remove('is-big', 'is-link'); label.textContent = '';
      }
    });
    (function loop() {
      x += (tx - x) * 0.22; y += (ty - y) * 0.22;
      c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      requestAnimationFrame(loop);
    })();
  })();
})();
