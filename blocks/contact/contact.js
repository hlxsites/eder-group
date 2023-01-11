import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { customDecorateIcons, decorateLinkedPictures } from '../../scripts/scripts.js';

/**
 * loads and decorates the contacts
 * @param {Element} block The contacts block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const profilePath = cfg.footer || '/corporate';
  const resp = await fetch(`${profilePath}.plain.html`);
  const html = await resp.text();

  const profile = document.createElement('div');
  profile.innerHTML = html;

  decorateLinkedPictures(profile);
  await customDecorateIcons(profile);
  block.append(profile);
}
