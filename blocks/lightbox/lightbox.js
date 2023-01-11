export default function decorate(block) {
  console.log('in lightbox decorate', block);

  const picture = block.querySelector('picture');

  const lightbox = document.createElement('div');
  lightbox.classList.add('actual-lightbox');
  lightbox.innerHTML = `<div class="lightbox-content">
    ${picture.outerHTML}
    <a href="#" class="lightbox-close">Close</a>
</div>`;

  block.append(lightbox);

  block.addEventListener('click', () => {
    lightbox.style.display = 'block';
  });

  lightbox.addEventListener('click', (e) => {
    console.log('in lightbox close click', e);
    if (e.target !== lightbox) {
      console.log('target is not lightbox');
      lightbox.style.display = 'none';
    } else {
      console.log('target "is" lightbox');
    }
  });
}
