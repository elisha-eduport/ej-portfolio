(function () {
  const root = document.documentElement;

  // theme
  const isDark = () =>
    root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;

  function toggleTheme() {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  }
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // copy email
  const toast = document.getElementById('toast');
  function showToast(text) {
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => (toast.hidden = true), 1600);
  }
  document.getElementById('copy-email').addEventListener('click', (e) => {
    const email = e.currentTarget.dataset.email;
    navigator.clipboard?.writeText(email).then(
      () => showToast('Email copied'),
      () => (window.location.href = 'mailto:' + email)
    );
  });

  // show all roles
  const more = document.getElementById('more-roles');
  const toggleBtn = document.getElementById('toggle-roles');
  toggleBtn.addEventListener('click', () => {
    more.hidden = !more.hidden;
    toggleBtn.textContent = more.hidden ? 'Show all work experiences' : 'Show less';
  });

  // command palette
  const items = [
    { label: 'Home', hint: 'Section', run: () => go('#top') },
    { label: 'Experience', hint: 'Section', run: () => go('#work') },
    { label: 'Projects', hint: 'Section', run: () => go('#projects') },
    { label: 'Writing', hint: 'Section', run: () => go('#writing') },
    { label: 'Stack', hint: 'Section', run: () => go('#stack') },
    { label: 'Resume (PDF)', hint: 'Open', run: () => window.open('resume.pdf', '_blank') },
    { label: 'LinkedIn', hint: 'Link', run: () => window.open('https://www.linkedin.com/in/elisha-joy-1757861b7/', '_blank') },
    { label: 'GitHub', hint: 'Link', run: () => window.open('https://github.com/elisha-joy22', '_blank') },
    { label: 'Medium', hint: 'Link', run: () => window.open('https://medium.com/@elishagjoy98', '_blank') },
    { label: 'Email me', hint: 'Mail', run: () => (window.location.href = 'mailto:elishagjoy@gmail.com') },
    { label: 'Toggle theme', hint: 'Action', run: toggleTheme },
  ];

  const palette = document.getElementById('palette');
  const input = document.getElementById('palette-input');
  const list = document.getElementById('palette-list');
  let filtered = items;
  let active = 0;

  function go(hash) {
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }

  function render() {
    list.innerHTML = '';
    filtered.forEach((item, i) => {
      const li = document.createElement('li');
      li.className = i === active ? 'active' : '';
      li.innerHTML = '<span></span><small></small>';
      li.firstChild.textContent = item.label;
      li.lastChild.textContent = item.hint;
      li.addEventListener('click', () => choose(i));
      list.appendChild(li);
    });
  }

  function open() {
    palette.hidden = false;
    input.value = '';
    filtered = items;
    active = 0;
    render();
    input.focus();
  }
  function close() { palette.hidden = true; }
  function choose(i) {
    const item = filtered[i];
    close();
    if (item) item.run();
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    filtered = items.filter((it) => it.label.toLowerCase().includes(q));
    active = 0;
    render();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { active = Math.min(active + 1, filtered.length - 1); render(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); render(); e.preventDefault(); }
    if (e.key === 'Enter') choose(active);
  });

  document.getElementById('open-palette').addEventListener('click', open);
  palette.addEventListener('click', (e) => { if (e.target === palette) close(); });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? open() : close();
    }
    if (e.key === 'Escape' && !palette.hidden) close();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
