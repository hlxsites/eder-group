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

// inject section delimiter and metadata for sidebar
function injectSidebarSection(document) {
  document.querySelectorAll('.main-content .news-sidebar').forEach((e) => {
    e.before(document.createElement('hr'));
    const cells = [['Section Metadata'], ['style', 'sidebar']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    e.after(table);
    // more elements after the sidebar? yes = add section delimiter
    if (e.parentElement.nextElementSibling.childElementCount > 0) {
       table.after(document.createElement('hr'));
    }
  });
}

// convert embed iframe objects
function transformEmbeds(document) {
  // detect embed in main content
  document.querySelectorAll('.main-content iframe').forEach((iframe) => {
    const iframeSrc = iframe.src;
    const cells = [['Embed']];
    if (iframeSrc) {
      cells.push([iframeSrc]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      iframe.replaceWith(table);
    }
  });
}

// convert "coa-button" links to primary / secondary button links
function transformButtons(document) {
  const BUTTON_MAPPINGS = [
    {
      class: 'red-coa',
      tag: 'em',
    },
    {
      class: 'red-coa-filled',
      tag: 'strong',
    },
  ];

  document.querySelectorAll('.main-content .coa-button').forEach((button) => {
    const buttonLink = button.innerHTML;
    const type = BUTTON_MAPPINGS.find((e) =>
      button.classList.contains(e.class),
    );
    if (type) {
      const wrapper = document.createElement(type.tag);
      wrapper.innerHTML = buttonLink;
      button.replaceWith(wrapper);
    }
  });
}

// image gallery
function transformImageGallery(document) {
  document.querySelectorAll('.news-gallery .flexslider').forEach((gallery) => {
    const cells = [['Gallery']];
    const entries = gallery.querySelectorAll('li.item img');
    if (entries) {
      entries.forEach((entry, i) => {
        entry.alt = `Gallery Image ${i}`;
        cells.push([entry]);
      } )
      
      const table = WebImporter.DOMUtils.createTable(cells, document);
      gallery.replaceWith(table);
    }
  });
}

// inject section delimiter and metadata for sidebar
function cleanUpNBSP(document) {
  const mainContent = document
    .querySelector('.page-container');
  mainContent.innerHTML = mainContent.innerHTML.replaceAll('\t&nbsp;', '');
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
   * Apply DOM pre processing: try to use the original JPEG image if available
   * @param {HTMLDocument} document The document
  */
  preprocess: ({ document }) => {
    document.querySelectorAll('img').forEach((img) => {
      if (img.src && img.src.endsWith('.webp')) {
        const jpegPath = img.getAttribute('data-regular');
        if (jpegPath) {
          img.src = jpegPath;
        }
      }
    });
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => {
    // prepare page meta data block
    const meta = {};

    // find the <title> element
    const title = document.querySelector('title');
    if (title) {
      meta.Title = title.innerHTML
        .replace(/[\n\t]/gm, '')
        .split('|')[0]
        .trim();
    }

    // find the <meta name="description"> element
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      meta.Description = desc.content;
    }

    // find the <meta property="keywords"> element
    const keywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      meta.Tags = keywords.content;
    }

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      '.offcanvas.offcanvas-contact',
      'nav.sidebar-offcanvas',
      'nav.navbar',
      '.container-fluid',
      '.container>ol',
      '.staff .visible-ma-button',
      '.element.element-tf_footerbox',
      '#usercentrics-root',
    ]);

    // convert all blocks
    [
      cleanUpNBSP,
      injectSidebarSection,
      transformEmbeds,
      transformButtons,
      transformImageGallery,
      makeProxySrcs,
      makeAbsoluteLinks,
    ].forEach((f) => f.call(null, document));

    document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    return document.body;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};
