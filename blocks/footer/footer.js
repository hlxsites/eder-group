import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { customDecorateIcons, decorateLinkedPictures } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();

  const footer = document.createElement('div');
  footer.innerHTML = html;

  decorateLinkedPictures(footer);
  await customDecorateIcons(footer);
  block.append(footer);
}
