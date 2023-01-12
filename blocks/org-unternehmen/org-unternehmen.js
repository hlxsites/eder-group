export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // If this is a 'card' on the page like
  // https://www.eder-gmbh.de/unternehmen/geschaeftsbereiche/
  // if (block.classList.contains('row')) {
  const blockChildren = block.firstElementChild.children;
  for (let i = 0; i < blockChildren.length; i += 1) {
    // alternate backgroun color between cards
    if (i % 2 === 0) {
      blockChildren[i].classList.add('gray-bg');
    } else {
      blockChildren[i].classList.add('white-bg');
    }

    if (block.classList.contains('button-container')) {
      blockChildren[i].classList.add('grey-button-filled');
    }

    // style each card with separators, and buttons styles based on background
    const { children } = blockChildren[i];
    for (let j = 0; j < children.length; j += 1) {
      // Add Style to Buttons
      if (children[j].classList.contains('button-container')) {
        // update classes
        children[j].children[0].classList.remove('primary');
        children[j].children[0].classList.add('coa-button', 'grey-coa-filled');
      }

      if (j === 0 || j === 2) {
        const $left = children[j];
        if ($left) {
          // Add separator
          const hr = document.createElement('hr');
          blockChildren[i].insertBefore(hr, $left.nextElementSibling);
        }
      }
    }
  }
  // }
}
