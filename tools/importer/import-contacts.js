/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

// Sanitizes a name for use as file name.
function sanitizeText(name) {
  return typeof name === 'string'
    ? name
      .toLowerCase()
      .replace(/\u00df/g, 'ss')
      .replace(/\u00e4/g, 'ae')
      .replace(/\u00f6/g, 'oe')
      .replace(/\u00fc/g, 'ue')
      .replace(/\u00c4/g, 'Ae')
      .replace(/\u00d6/g, 'Oe')
      .replace(/\u00dc/g, 'Ue')
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    : '';
}

// Transform all image urls
function makeProxySrcs(document) {
  const host = 'https://www.eder-gmbh.de/';
  document.querySelectorAll('img').forEach((img) => {
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);
      u.searchParams.append('host', u.origin);
      img.src = `http://localhost:3001${u.pathname}${u.search}`;
    } catch (error) {
      console.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
    }
  });
}

function makeAbsoluteLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const ori = a.href;
      const u = new URL(a.href, 'https://main--eder-group--hlxsites.hlx.page/');

      // Remove .html extension
      if (u.pathname.endsWith('.html')) {
        u.pathname = u.pathname.slice(0, -5);
      }

      a.href = u.toString();

      if (a.textContent === ori) {
        a.textContent = a.href;
      }
    }
  });
}

export default {
  /**
   * Apply DOM pre processing
   * @param {HTMLDocument} document The document
   */
  preprocess: ({ document }) => {
    // try to use the original JPEG image if available
    document.querySelectorAll('img').forEach((img) => {
      if (img.src && img.src.endsWith('.webp')) {
        const jpegPath = img.getAttribute('data-regular');
        if (jpegPath) {
          img.src = jpegPath;
        }
      }
    });

    // convert flaticons to placeholder
    document.querySelectorAll('.staff-headline').forEach((icon) => {
      const flatIcon = icon.querySelector('.flaticon');
      if (flatIcon) {
        icon.textContent = `:${flatIcon.classList[1]}:`;
      }
    });
  },

  /**
   * Apply DOM operations to the provided document and return an array of
   * objects ({ element: HTMLElement, path: string }) to be transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {Array} The { element, path } pairs to be transformed
   */
  transform: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      'iframe',
      'footer',
      '.offcanvas.offcanvas-contact',
      'nav.sidebar-offcanvas',
      'nav.navbar',
      '.breadcrumb',
      '.staff .visible-ma-button',
      '.container-fluid',
      '.element.element-tf_footerbox',
      '.element.element-text',
      '.element.element-dce_dceuid4',
      '.element.element-dce_dceuid28',
      '.news-header',
      '.news-content',
      '.news-gallery',
      '.news-related-wrap',
      '.news-backlink-wrap',
      '.text-muted',
      '#usercentrics-root',
    ]);

    // pre-processing
    [makeProxySrcs, makeAbsoluteLinks].forEach((f) => f.call(null, document));

    const pages = [];

    // convert all contact blocks
    const path = '/profiles/';
    const contactBlocks = document.querySelectorAll(
      '.element.element-shortcut .element.element-dce_dceuid2',
    );
    contactBlocks.forEach((contact) => {
      // prepare page meta data block
      const meta = {};

      // find the contact name/title element, extract meta data and convert tag
      const title = contact.querySelector('.staff-headline');
      if (title) {
        meta.Title = title.textContent.trim();

        const h2 = document.createElement('h2');
        h2.innerHTML = title.innerHTML;
        title.parentNode.replaceChild(h2, title);
      }

      // find the position element, extract for meta description and convert tag
      const position = contact.querySelector('.staff-position');
      if (position) {
        meta.Description = position.textContent;

        const h4 = document.createElement('h4');
        h4.innerHTML = position.innerHTML;
        position.parentNode.replaceChild(h4, position);
      }

      // convert detail rows
      contact.querySelectorAll('.row.detail-text').forEach((detail) => {
        const icon = detail.querySelector('.staff-headline').textContent;
        const text = detail.querySelector('.staff-text');
        detail.innerHTML = '';
        detail.append(icon);
        detail.append(' ');
        detail.append(
          text.firstElementChild ? text.firstElementChild : text.textContent,
        );
      });

      // block indexing for profile documents
      meta.Robots = 'noindex, nofollow';
      contact.append(WebImporter.Blocks.getMetadataBlock(document, meta));

      const page = {
        element: contact,
        path: path.concat(sanitizeText(meta.Title)),
      };
      pages.push(page);
    });
    return pages;
  },
};
