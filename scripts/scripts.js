import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function detectSidebar(main) {
  const sidebar = main.querySelector('.section.sidebar');
  if (sidebar) {
    main.classList.add('sidebar');
    const sidebarOffset = sidebar.getAttribute('data-start-sidebar-at-section');

    const numSections = main.children.length - 1;
    main.style = `grid-template-rows: repeat(${numSections}, auto);`;

    if (sidebarOffset && Number.parseInt(sidebar.getAttribute('data-start-sidebar-at-section'), 10)) {
      const offset = Number.parseInt(sidebar.getAttribute('data-start-sidebar-at-section'), 10);
      sidebar.style = `grid-row: ${offset} / infinite;`;
    }
  }
}

/**
 * Get the list of pages from the query index
 */
export async function getIndex(index, indexUrl) {
  window.pageIndex = window.pageIndex || {};
  if (!window.pageIndex[index]) {
    const resp = await fetch(indexUrl);
    const json = await resp.json();
    window.window.pageIndex[index] = json.data;
  }
  return window.pageIndex[index];
}

/**
 * Get the list of press release news from the query index.
 *
 * @param {number} limit the number of posts to return, or -1 for no limit
 * @returns the posts as an array
 */
export async function getNews(limit) {
  let indexUrl = '/newstermine/query-index-news.json';
  let index = 'news';
  if (limit) {
    indexUrl = indexUrl.concat(`?limit=${limit}`);
    index = index.concat(`-${limit}`);
  }

  const newsEntries = await getIndex(index, indexUrl);
  return newsEntries;
}

/**
 * Converts an excel date to human readable date
 *
 * @param {excelDate} the Excel style date
 * @returns the converted date
 */
export function convertDate(excelDate) {
  return new Date(Math.round((+excelDate - (1 + 25567 + 1)) * 86400 * 1000)); // excel date
}

function linkPicture(picture) {
  const oldParent = picture.parentNode;
  const nextSib = picture.parentNode.nextElementSibling;
  if (nextSib) {
    const a = nextSib.querySelector('a');
    if (a && a.textContent.trim().startsWith('https://')) {
      a.innerHTML = '';
      a.className = '';
      a.appendChild(picture);
      oldParent.remove();
    }
  }
}

/* used to add links with pictures with word */
export function decorateLinkedPictures(block) {
  block.querySelectorAll('picture').forEach((picture) => {
    if (!picture.closest('div.block')) {
      linkPicture(picture);
    }
  });
}

/*
 * Extends lib-franklin's decorateIcons adding the "eder" and "flaticon" icon sets.
 */
export function customDecorateIcons(element = document) {
  const iconPrefix = 'flaticon';

  element.querySelectorAll('span.icon').forEach(async (span) => {
    if (span.classList.length < 2 || !span.classList[1].startsWith('icon-')) {
      return;
    }

    const icon = span.classList[1].substring(5);
    if (icon.startsWith(iconPrefix)) {
      span.classList.add(`icon-${iconPrefix}`);
      return;
    }

    // eslint-disable-next-line no-use-before-define
    const resp = await fetch(`${window.hlx.codeBasePath}/icons/${icon}.svg`);
    if (resp.ok) {
      const iconHTML = await resp.text();
      if (iconHTML.match(/<style/i)) {
        const img = document.createElement('img');
        img.src = `data:image/svg+xml,${encodeURIComponent(iconHTML)}`;
        span.appendChild(img);
      } else {
        span.innerHTML = iconHTML;
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  customDecorateIcons(main);
  buildAutoBlocks(main);
  decorateLinkedPictures(main);
  decorateSections(main);
  decorateBlocks(main);
  detectSidebar(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
