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

(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const overlay = document.querySelector('[data-menu-overlay]');
  if (!toggle || !overlay) return;

  const toggleLabel = toggle.querySelector('[data-menu-toggle-label]');
  const closeButtons = overlay.querySelectorAll('[data-menu-close]');
  const menuLinks = overlay.querySelectorAll('[data-menu-link]');
  const initialFocusTarget = overlay.querySelector('[data-menu-initial-focus]');
  const focusableSelector = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let lastFocusedElement = null;

  function setToggleLabel(isOpen) {
    const label = isOpen ? 'Закрыть меню' : 'Открыть меню';
    if (toggleLabel) toggleLabel.textContent = label;
    toggle.setAttribute('aria-label', label);
  }

  function lockScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.dataset.menuScrollPosition = String(scrollY);
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.classList.add('menu-open');
  }

  function unlockScroll() {
    const stored = document.body.dataset.menuScrollPosition;
    document.body.classList.remove('menu-open');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('left');
    document.body.style.removeProperty('right');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('width');

    if (stored) {
      const value = parseInt(stored, 10) || 0;
      delete document.body.dataset.menuScrollPosition;
      window.scrollTo(0, value);
    }
  }

  function getFocusableElements() {
    const elements = Array.from(overlay.querySelectorAll(focusableSelector));
    return elements.filter(el => {
      if (el.hasAttribute('disabled')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      return el.offsetParent !== null || el instanceof SVGElement;
    });
  }

  function handleKeydown(event) {
    if (!overlay.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || active === overlay) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openMenu() {
    if (overlay.classList.contains('is-open')) return;

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    toggle.classList.add('is-active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('tabindex', '-1');
    setToggleLabel(true);
    lockScroll();

    document.addEventListener('keydown', handleKeydown);

    requestAnimationFrame(() => {
      const fallback = getFocusableElements()[0];
      const target = initialFocusTarget instanceof HTMLElement ? initialFocusTarget : fallback;
      if (target) target.focus();
    });
  }

  function closeMenu() {
    if (!overlay.classList.contains('is-open')) return;

    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.removeAttribute('tabindex');
    setToggleLabel(false);
    document.removeEventListener('keydown', handleKeydown);
    unlockScroll();

    const returnFocusTarget = lastFocusedElement && typeof lastFocusedElement.focus === 'function'
      ? lastFocusedElement
      : toggle;

    requestAnimationFrame(() => {
      returnFocusTarget.focus();
    });
  }

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeMenu();
    }
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeMenu);
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  setToggleLabel(false);
})();
