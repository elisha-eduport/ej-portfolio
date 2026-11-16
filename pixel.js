// Pixel avatar that looks toward the cursor.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const KEYS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // =====================================================================
  // Avatar
  // =====================================================================
  const canvas = document.getElementById('avatar');
  const data = window.AVATAR;

  if (canvas && data) {
    const n = data.size;
    const cell = canvas.width / n;
    const ctx = canvas.getContext('2d');

    const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const lum = (c) => { const [r, g, b] = hex(c); return 0.299 * r + 0.587 * g + 0.114 * b; };

    const all = [];
    data.rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch !== '.') all.push({ x, y, c: data.palette[KEYS.indexOf(ch)] });
      });
    });

    // Split the portrait into layers: shoulders stay put, the head moves a little,
    // and the face details (glasses, eyes, beard) move a little more. That parallax
    // is what makes it read as the head turning.
    const isBlue = (c) => { const [r, , b] = hex(c); return b > r + 10; };
    const body = [], head = [], features = [];
    for (const p of all) {
      if (p.y >= 27 || (p.y >= 24 && isBlue(p.c))) body.push(p);
      else if (p.y >= 10 && p.y <= 26 && p.x >= 9 && p.x <= 29 && lum(p.c) < 70) features.push(p);
      else head.push(p);
    }

    // most common warm mid-tone in the face = skin, used to fill behind moved features
    const counts = {};
    for (const p of head) {
      const [r, g, b] = hex(p.c);
      const l = lum(p.c);
      if (p.y >= 10 && p.y <= 24 && l > 70 && l < 170 && r > g && g >= b) counts[p.c] = (counts[p.c] || 0) + 1;
    }
    const skin = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || '#a0644a';

    let pose = { dx: 0, dy: 0 };

    function draw(rowShift) {
      const { dx, dy } = pose;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const put = (x, y, c) => {
        const s = rowShift ? rowShift[y] || 0 : 0;
        ctx.fillStyle = c;
        ctx.fillRect((x + s) * cell, y * cell, cell, cell);
      };
      for (const p of body) put(p.x, p.y, p.c);
      for (const p of head) put(p.x + dx, p.y + dy, p.c);
      for (const p of features) put(p.x + dx, p.y + dy, skin);
      for (const p of features) put(p.x + dx * 2, p.y + dy, p.c);
    }

    // pixels drop in at random on first load
    function assemble() {
      const order = all.slice().sort(() => Math.random() - 0.5);
      const duration = 900;
      const start = performance.now();
      let drawn = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      (function frame(now) {
        const target = Math.min(order.length, Math.floor(((now - start) / duration) * order.length));
        for (; drawn < target; drawn++) {
          const p = order[drawn];
          ctx.fillStyle = p.c;
          ctx.fillRect(p.x * cell, p.y * cell, cell, cell);
        }
        if (drawn < order.length) requestAnimationFrame(frame);
        else { draw(); canvas.classList.add('alive'); ready = true; }
      })(start);
    }

    let ready = reduceMotion;
    if (reduceMotion) draw(); else assemble();

    // look toward the cursor
    function look(clientX, clientY) {
      if (!ready) return;
      const r = canvas.getBoundingClientRect();
      const ox = clientX - (r.left + r.width / 2);
      const oy = clientY - (r.top + r.height / 2);
      const dead = r.width * 0.45;
      const next = {
        dx: ox < -dead ? -1 : ox > dead ? 1 : 0,
        dy: oy < -dead ? -1 : oy > dead ? 1 : 0,
      };
      if (next.dx !== pose.dx || next.dy !== pose.dy) { pose = next; draw(); }
    }
    if (finePointer) window.addEventListener('mousemove', (e) => look(e.clientX, e.clientY), { passive: true });
    document.addEventListener('mouseleave', () => { pose = { dx: 0, dy: 0 }; if (ready) draw(); });

    // click the avatar for a quick glitch
    let glitching = false;
    canvas.addEventListener('click', () => {
      if (glitching || reduceMotion || !ready) return;
      glitching = true;
      let frames = 0;
      const id = setInterval(() => {
        const shift = {};
        for (let i = 0; i < 6; i++) {
          const row = Math.floor(Math.random() * n);
          const band = 1 + Math.floor(Math.random() * 3);
          const off = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));
          for (let r = row; r < row + band; r++) shift[r] = off;
        }
        draw(shift);
        if (++frames > 6) { clearInterval(id); draw(); glitching = false; }
      }, 60);
    });
  }

})();
