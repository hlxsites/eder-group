export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  //console.log (block.classList);
  if (block.classList.contains('row')){

    const blockChildren = block.firstElementChild.children;
    for (let i = 0; i < blockChildren.length; i++) {

      // alternate backgroun color
      if ( i % 2 === 0) {
        blockChildren[i].classList.add("gray-bg")
      }



        // add separator
        const children = blockChildren[i].children;
        for (let j = 0; j < children.length; j += 2) {
            if (j == 0 || j == 2) {
              const $left = children[j];
              if ($left) {
                  const hr = document.createElement('hr');
                  blockChildren[i].insertBefore(hr, $left.nextElementSibling);
              }
            }
        }
    }
  }
}
