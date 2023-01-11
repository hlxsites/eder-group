import { getNews, convertDate } from '../../scripts/scripts.js';

function convertCategoryToIcon(category) {

}

function addNewsToList(news, container) {
  news.forEach((newsItem) => {
    const { path, title, description, date } = newsItem;
    const newsListItem = document.createElement('article');
    newsListItem.classList.add('news-list-item');
    newsListItem.innerHTML = `    
      <div class="date">${convertDate(date).toLocaleDateString('de-DE', { dateStyle: 'medium' })}</div>
      <div class="title">
        <h3><a title="${title}" href="${path}">${title}</a></h3>
      </div>
      <div class="icon">Icon</div>
      <div class="description"><p>${description}</p></div>
    `;
    container.appendChild(newsListItem);
  });
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
    footer.textContent = 'Markus was here';
    block.append(footer);
  }
}
