(function() {
  const { SENTENCES } = window.SITE_CONFIG || {};

  const list = document.getElementById('sentences');
  let scrollDirection = 0;  // Track scroll direction (up or down)

  // Build sentence nodes
  const nodes = SENTENCES.map((text, idx) => {
    const p = document.createElement('p');
    p.className = 'sentence';
    p.textContent = text;
    p.setAttribute('role', 'listitem');
    p.setAttribute('aria-setsize', SENTENCES.length);
    p.setAttribute('aria-posinset', String(idx + 1));
    list.appendChild(p);
    return p;
  });

  // IntersectionObserver for sentence visibility based on scrolling
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('visible');
        // Dim previous sentences one by one
        const idx = nodes.indexOf(el);
        nodes.forEach((node, i) => {
          if (i < idx) node.classList.add('dimmed');
        });
      }
    });
  }, { root: null, rootMargin: '0px 0px -45% 0px', threshold: 0.4 });

  nodes.forEach(n => io.observe(n));

  // Scroll direction tracking (up or down) and text fade out
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (window.scrollY > lastScrollY) {
      // Scrolling down: text becomes brighter
      scrollDirection = 1;
    } else {
      // Scrolling up: text disappears one by one
      scrollDirection = -1;
    }
    lastScrollY = window.scrollY;
    // Apply fade effects
    nodes.forEach((node, i) => {
      if (scrollDirection === -1) {
        node.style.opacity = 0;
        node.style.transform = 'translateY(12px)';
      } else {
        node.style.opacity = 1;
        node.style.transform = 'translateY(0)';
      }
    });
  });
})();