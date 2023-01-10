import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { customDecorateIcons } from '../../scripts/scripts.js';

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */

function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;
    customDecorateIcons(nav);

    const classes = ['brand', 'sections', 'tools', 'brand-logo'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    if (navSections) {
      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    customDecorateIcons(nav);
    block.append(nav);

    // searchbox
    const search = document.createElement('div');
    search.classList.add('nav-search');
    search.innerHTML = `<div class="search-box"><input id="search-box" type="text" placeholder=""><button type="submit">SUCHEN</button></div>
    <div class="search-results"></div>`;
    nav.prepend(search);
    block.append(nav);

    // flaticon dots
    const dots = document.createElement('div');
    dots.classList.add('nav-flaticon-dots');
    Array.prototype.forEach.call(document.querySelectorAll('.icon-flaticon-dots'), (c) => dots.appendChild(c));
    nav.prepend(dots);
    block.append(nav);
  }
}
