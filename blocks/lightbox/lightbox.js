export default function decorate(block) {
  console.log('in lightbox decorate', block);

  const picture = block.querySelector('picture');

  const lightbox = document.createElement('div');
  block.parentNode.append(lightbox);
  // TODO find a better name than "actual-lightbox"
  lightbox.outerHTML = `<div class="actual-lightbox" aria-hidden="true" >
    <div class="lightbox-content">
        ${picture.outerHTML}
        <a href="#" class="lightbox-close">Close</a>
    </div>
</div>`;

  const actualLightbox = document.querySelector('.actual-lightbox');

  picture.addEventListener('click', (e) => {
    console.log('add block', e);
    actualLightbox.removeAttribute('aria-hidden');
  });

  actualLightbox.querySelector('.lightbox-close').addEventListener('click', () => {
    console.log('close');
    actualLightbox.setAttribute('aria-hidden', '');
  });

/*
  lightbox.addEventListener('click', (e) => {
    console.log('in lightbox close click', e);
    console.log('e.target', e.target);
    lightbox.style.display = 'none';

    console.log('lightbox', lightbox);
    if (e.target !== lightbox) {
      console.log('target is not lightbox');
      lightbox.style.display = 'none';
    } else {
      console.log('target "is" lightbox');
    }
  }); */
}
