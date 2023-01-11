import { readBlockConfig } from '../../scripts/lib-franklin.js';

async function loadYoutubeAPI() {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function decorate(block) {
  loadYoutubeAPI().then(() => {
    const cfg = readBlockConfig(block);
  });
}
