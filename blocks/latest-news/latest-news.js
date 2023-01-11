import {
  getNews,
  convertDate,
  customDecorateIcons,
} from '../../scripts/scripts.js';

function convertCategoryToIcon(category) {
  const CATEGORY_ICON_MAPPING = [
    {
      match: ['Profibaumarkt'],
      icon: 'flaticon-paint',
    },
    {
      match: ['Agratec'],
      icon: 'flaticon-tractor',
    },
    {
      match: ['Landtechnik'],
      icon: 'flaticon-tractor',
    },
    {
      match: ['Stapler'],
      icon: 'flaticon-weightlifting',
    },
  ];
  let iconTag = '<span class="icon icon-eder" title="Profitechnik"></span>';

  if (category) {
    const icon = CATEGORY_ICON_MAPPING.find((e) => e.match.some((match) => category.split(',').pop().trim().includes(match)));
    if (icon) {
      iconTag = `<span class="icon icon-${icon.icon}" title="${icon.match[0]}"></span>`;
    }
  }
  return iconTag;
}

function addNewsToList(news, container) {
  news.forEach((newsItem) => {
    // eslint-disable-next-line object-curly-newline
    const { path, title, description, date, categories } = newsItem;
    const newsListItem = document.createElement('article');
    newsListItem.classList.add('news-list-item');
    const icon = convertCategoryToIcon(categories);
    const formatedDate = convertDate(date).toLocaleDateString('de-DE', {
      dateStyle: 'medium',
    });
    newsListItem.innerHTML = `    
      <div class="date">${formatedDate}</div>
      <div class="title">
        <h3><a title="${title}" href="${path}">${title}</a></h3>
      </div>
      <div class="icon">${icon}</div>
      <div class="description"><p>${description}</p></div>
    `;
    container.appendChild(newsListItem);
  });
  customDecorateIcons(container);
}

export default async function decorate(block) {
  const news = await getNews(5);

  if (news) {
    const content = document.createElement('div');
    content.className = 'news-row news-content';
    addNewsToList(news, content);
    block.append(content);

    const footer = document.createElement('div');
    footer.className = 'news-row news-footer';
    footer.innerHTML = `
      <p class="button-container">
        <em><a href="/newstermine/pressemeldungen" class="button secondary">
        Zum Überblick</a>
      </p>
    `;
    block.append(footer);
  }
}
