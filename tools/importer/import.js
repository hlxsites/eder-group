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

// convert columns
function transformHeros(document) {
  document.querySelectorAll('.background-image .title').forEach((div) => {
    const cells = [['Hero']];
    const wrapper = div.parentElement;
    if (wrapper.hasAttribute('data-bg')) {
      const bgImgUrl = wrapper.getAttribute('data-bg').startsWith('url(')
        ? wrapper
          .getAttribute('data-bg')
          .substring(4, wrapper.getAttribute('data-bg').length - 1)
        : wrapper.getAttribute('data-bg');
      const image = document.createElement('img');
      image.src = bgImgUrl;
      const container = document.createElement('div');
      container.appendChild(image);
      container.appendChild(wrapper.querySelector('h3'));
      cells.push([container]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      wrapper.replaceWith(table);
    }
  });
}

// convert teaser cards
function transformTeaserCards(document) {
  if (document.querySelector('.container-fluid figure')) {
    const cells = [['Cards  (Teaser)']];
    document.querySelectorAll('.container-fluid figure').forEach((figure) => {
      const container = document.createElement('div');
      const image = figure.querySelector('img.card-background');
      const title = figure.querySelector('.card-title');
      container.appendChild(image);
      container.appendChild(title);

      const row = [container];
      const content = figure.querySelectorAll('.card-content .card-entry');
      if (content) {
        content.forEach((entry) => row.push(entry));
      }
      cells.push(row);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    document.querySelector('.container-fluid figure').replaceWith(table);
  }
}

// convert mini teaser cards
function transformMiniTeaserCards(document) {
  if (document.querySelector('.container-fluid .card')) {
    const cells = [['Cards  (Mini Teaser)']];
    document.querySelectorAll('.container-fluid .card').forEach((div) => {
      const bgImage = div.querySelector('.card-header img.card-background');
      const logoImage = div.querySelector('.card-header img.card-logo');
      const content = div.querySelector('.card-body');
      cells.push([bgImage, logoImage, content]);
    });
    const table = WebImporter.DOMUtils.createTable(cells, document);
    document.querySelector('.container-fluid .card').replaceWith(table);
  }
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

// convert images with lightbox
function transformLightboxImage(document) {
  // detect embed in main content
  document.querySelectorAll('.main-content [data-lightbox]').forEach((link) => {
    const img = link.querySelector('img');
    if (img) {
      const cells = [['Lightbox']];
      cells.push([img]);
      const table = WebImporter.DOMUtils.createTable(cells, document);
      link.replaceWith(table);
    }
  });
}

// convert "coa-button" links to primary / secondary button links
function transformButtons(document) {
  document.querySelectorAll('.main-content .coa-button').forEach((button) => {
    const buttonClass = button.className.replace('coa-button', '').trim();
    if (buttonClass.indexOf('coa') > -1) {
      const wrapper = document.createElement(
        buttonClass.indexOf('coa-filled') > -1 ? 'strong' : 'em',
      );
      const buttonLink = button.innerHTML;
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
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      gallery.replaceWith(table);
    }
  });
}

// remove contact header if present
function cleanUpContactInfoHeader(document) {
  const div = document.querySelector('.news-sidebar .text-muted');
  if (div) {
    const headline = div.nextElementSibling;
    if (headline && headline.classList.contains('element-text') && headline.textContent.indexOf('Kontakt') > -1) {
      headline.remove();
      div.remove();
    }
  }
}

// transform contact info
function transformContactInfo(document) {
  const container = document.querySelector(
    '.news-sidebar .element.element-shortcut',
  );
  if (container) {
    const contacts = container.querySelectorAll('.staff-item');
    if (contacts.length > 0) {
      const cells = [['Contact']];
      contacts.forEach((contact) => {
        // email would be better but does not work as a few only use info@ mail address
        const name = contact.querySelector('.headline-main');
        if (name) {
          cells.push([name.textContent]);
        }
      });
      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    } else {
      container.remove();
    }
  }
}

// inject section delimiter and metadata for sidebar
function cleanUpNBSP(document) {
  const mainContent = document.querySelector('.page-container');
  if (mainContent) {
    mainContent.innerHTML = mainContent.innerHTML.replaceAll('\t&nbsp;', '');
  }
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

/**
 * Special handling for news meta data which are enriched with attributes
 * from CSV sheet.
 */
async function mapNewsMetaAttributes(url, params, meta) {
  if (url.indexOf('/newstermine/pressemeldungen/detail') > -1) {
    if (!window.newsList) {
      // cache news meta data sheet for news imports
      const response = await fetch(
        'https://main--eder-group--hlxsites.hlx.page/export/news-161222.json',
      );
      const json = await response.json();
      window.newsList = json.data;
    }

    // find news entry by page name
    const pageName = params.originalURL.slice(0, -1).split('/').pop();
    const news = window.newsList.find((n) => n.path_segment === pageName);
    if (news) {
      meta.Categories = news.categories;
      meta.Keywords = news.keywords;
      meta.Location = news.location;
      meta['Publication Date'] = news.datetime;
    } else {
      console.warn('News item for %s not found', params.originalURL);
    }
  }
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
    document.querySelectorAll('.card-icon').forEach((icon) => {
      const flatIcon = icon.querySelector('.flaticon');
      if (flatIcon) {
        icon.textContent = `:${flatIcon.classList[1]}:`;
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
  transformDOM: async ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
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

    // special meta data handling for news pages
    await mapNewsMetaAttributes(url, params, meta);

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      'footer',
      '.offcanvas.offcanvas-contact',
      'nav.sidebar-offcanvas',
      'nav.navbar',
      '.container>ol',
      '.staff .visible-ma-button',
      '.element.element-tf_footerbox',
      '#usercentrics-root',
      '.news-backlink-wrap',
    ]);

    // convert all blocks
    [
      cleanUpNBSP,
      injectSidebarSection,
      transformHeros,
      transformEmbeds,
      transformLightboxImage,
      transformButtons,
      transformTeaserCards,
      transformMiniTeaserCards,
      transformImageGallery,
      transformContactInfo,
      cleanUpContactInfoHeader,
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
    document, url, html, params,
  }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};
