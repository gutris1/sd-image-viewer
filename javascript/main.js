let SDImageViewerTimeout;

function SDImageViewer() {
  const lightBox = document.getElementById('lightboxModal'),
  controls = lightBox.querySelector('.modalControls'),
  closeBtn = lightBox.querySelector('.modalClose'),
  img = lightBox.querySelector('#modalImage'),
  prevBtn = lightBox.querySelector('.modalPrev'),
  nextBtn = lightBox.querySelector('.modalNext'),

  imgWrapper = document.createElement('div');
  imgWrapper.id = 'modalWrapper';
  imgWrapper.prepend(img);
  lightBox.prepend(imgWrapper);

  [lightBox, img, prevBtn, nextBtn].forEach(el => el.removeEventListener('keydown', modalKeyHandler, true));
  [img, prevBtn, nextBtn].forEach(el => el.removeAttribute('tabindex'));

  prevBtn.removeEventListener('click', modalPrevImage, true);
  nextBtn.removeEventListener('click', modalNextImage, true);

  prevBtn.innerHTML = SDImageViewerVar.prev();
  nextBtn.innerHTML = SDImageViewerVar.next();
  closeBtn.innerHTML = SDImageViewerVar.close();

  const downloadBtn = document.createElement('span');
  downloadBtn.className = 'downloadImage cursor';
  downloadBtn.title = 'Download Image';
  downloadBtn.innerHTML = SDImageViewerVar.download();
  downloadBtn.onclick = (e) => {
    if (img) {
      const url = encodeURI(img.src),
      name = url.split('/').pop().split('?')[0],
      link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    e.stopPropagation();
  };

  controls.append(downloadBtn, prevBtn, nextBtn);
  lightBox.onkeydown = closeBtn.onclick = null;

  lightBox._click = () => {};
  lightBox.onclick = (e) => lightBox._click(e);

  const viewer = new SDImageScriptsViewer(img, lightBox, controls, {
    persist: true,
    dragStart: () => controls.classList.add('hide'),
    dragEnd: () => controls.classList.remove('hide')
  });

  viewer.close = function () {
    clearTimeout(SDImageViewerTimeout);
    SDImageViewerTimeout = null;

    lightBox.className = '';
    setTimeout(() => gradioApp().style.paddingRight = document.body.style.overflow = '', 50);

    setTimeout(() => {
      lightBox.style.display = imgWrapper.className = '';
      lightBox._click = lightBox.onmousedown = lightBox.onkeydown = closeBtn.onclick = null;
      window.SDImageViewerReset();
      img.removeAttribute('style');
    }, 150);
  };

  window.closeModal = viewer.close
  window.SDImageViewerReset = viewer.reset.bind(viewer);

  img.onload = () => {
    img.style.transform = '';
    window.SDImageViewerReset();
  };

  prevBtn.onclick = (e) => (window.modalImageSwitch(-1), e.stopPropagation());
  nextBtn.onclick = (e) => (window.modalImageSwitch(1), e.stopPropagation());
}

function SDImageViewerToggleNextPrev() {
  const imgGallery = document.querySelectorAll("div[id^='tab_'] div[id$='_results'] .thumbnail-item > img"),
  imgSrc = new Set(Array.from(imgGallery).map(img => img.src)),
  prevBtn = document.querySelector('#lightboxModal .modalPrev'),
  nextBtn = document.querySelector('#lightboxModal .modalNext');

  if (prevBtn && nextBtn) {
    imgSrc.size > 1
      ? (prevBtn.style.display = nextBtn.style.display = 'flex')
      : (prevBtn.style.display = nextBtn.style.display = 'none');
  }
}

function SDImageViewerLivePreview() {
  const liveToggle = document.getElementById('modal_toggle_live_preview');
  liveToggle && (liveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewerVar.live() : SDImageViewerVar.static());
}

window.modalLivePreviewToggle = function(e) {
  opts.js_live_preview_in_modal_lightbox = !opts.js_live_preview_in_modal_lightbox;
  SDImageViewerLivePreview();
  e && e.stopPropagation();
};

window.modalImageSwitch = function(offset) {
  let galleryButtons = all_gallery_buttons();

  if (galleryButtons.length > 1) {
    let result = selected_gallery_index();

    if (result != -1) {
      let nextButton = galleryButtons[negmod((result + offset), galleryButtons.length)];
      nextButton.click();

      window.SDImageViewerReset();
      const lightBox = document.getElementById('lightboxModal'),
      img = lightBox.querySelector('#modalImage');
      img.style.transition = 'none';
      img.style.transform = '';
      img.src = nextButton.children[0].src;

      if (img.style.display === 'none') lightBox.style.setProperty('background-image', `url(${img.src})`);
      setTimeout(() => lightBox.focus(), 10);
    }
  }
}

window.showModal = function(e) {
  SDImageViewerToggleNextPrev();
  SDImageViewerLivePreview();

  const lightBox = document.getElementById('lightboxModal'),
  closeBtn = lightBox.querySelector('.modalClose'),
  imgWrapper = lightBox.querySelector('#modalWrapper'),
  img = lightBox.querySelector('#modalImage'),
  imgSrc = e.target || e.srcElement;

  img.src = imgSrc.src;
  if (img.style.display === 'none') lightBox.style.setProperty('background-image', 'url(' + imgSrc.src + ')');

  let g = gradioApp().offsetWidth;
  document.body.style.overflow = 'hidden';

  lightBox.style.display = 'flex';
  lightBox.focus();

  setTimeout(() => requestAnimationFrame(() => lightBox.className = imgWrapper.className = 'display'), 100);
  clearTimeout(SDImageViewerTimeout);

  SDImageViewerTimeout = setTimeout(() => {
    lightBox._click = e => e.target === lightBox && window.closeModal();
    closeBtn.onclick = () => window.closeModal();
    lightBox.onkeydown = (e) => {
      switch (e.key) {
        case 'Escape': e.preventDefault(), e.stopPropagation(), window.closeModal(); break;
        case 'ArrowRight': window.modalImageSwitch(1), e.stopPropagation(); break;
        case 'ArrowLeft': window.modalImageSwitch(-1), e.stopPropagation(); break;
        case 's': lightBox.querySelector('.modalControls > .downloadImage').click(), e.stopPropagation(); break;
      }
    };
  }, 150);

  const n = gradioApp().offsetWidth, w = n - g;
  if (w > 0) gradioApp().style.paddingRight = w + 'px';
  e.stopPropagation();
}

onUiLoaded(() => {
  if (document.querySelector('#lightboxModal > .modalControls')) SDImageViewer()
});

const SDImageViewerVar = {
static: () => `
<svg xmlns='http://www.w3.org/2000/svg' width='30px' height='30px' viewBox='0 0 24 24' fill='transparent'
stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>
<rect x='0.802' y='0.846' width='22.352' height='22.352' rx='2' ry='2'/>
<circle cx='7.632' cy='7.676' r='1.862'/>
<polyline points='23.154 15.747 16.946 9.539 3.285 23.198'/>
</svg>
`,

live: () => `
<svg xmlns='http://www.w3.org/2000/svg' width='32px' height='32px' viewBox='0 0 24 24' fill='transparent'
stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>
<path d='M 7.263 3.393 L 7.263 2.803 M 7.263 2.803 C 7.263 1.698 8.158 0.803 9.263
0.803 L 21.153 0.803 C 22.258 0.803 23.153 1.698 23.153 2.803 L 23.153 14.693 C 23.153
15.798 22.258 16.693 21.153 16.693 M 21.153 16.693 L 20.251 16.693'/>
<path d='M 4.098 5.924 C 4.098 4.819 4.993 3.924 6.098 3.924 L 17.988 3.924 C 19.093
3.924 19.988 4.819 19.988 5.924 L 19.988 17.814 C 19.988 18.919 19.093 19.814 17.988
19.814 L 16.813 19.814 M 4.098 7.138 L 4.098 5.924'/>
<path d='M 2.802 7.308 H 14.692 A 2 2 0 0 1 16.692 9.308 V 21.198 A 2 2 0 0 1 14.692
23.198 H 2.802 A 2 2 0 0 1 0.802 21.198 V 9.308 A 2 2 0 0 1 2.802 7.308 Z'/>
<circle cx='5.658' cy='12.163' r='1.324'/>
<polyline points='16.692 17.901 12.279 13.488 2.567 23.198'/>
</svg>
`,

download: () => `
<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
<path fill='currentColor' stroke='currentColor' stroke-width='1.8'
d='M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10
l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z'/>
</svg>
`,

prev: () => `
<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
width="32px" height="32px" viewBox="0 0 30 45">
<path d="M 27.23 40.814 C 27.211 42.672 24.948 43.677 23.55 42.479 L 3.815 25.042 C 2.442 23.51 2.396 21.578 3.829 20.109 L 23.55 2.688 C 25.291 1.221 27.247 2.26 27.23 4.352 L 27.23 40.814 Z"/>
</svg>
`,

next: () => `
<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
width="32px" height="32px" viewBox="0 0 30 45">
<path d="M 2.77 40.814 C 2.789 42.672 5.052 43.677 6.45 42.479 L 26.185 25.042 C 27.558 23.51 27.604 21.578 26.171 20.109 L 6.45 2.688 C 4.709 1.221 2.753 2.26 2.77 4.352 L 2.77 40.814 Z"/>
</svg>
`,

close: () => `
<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"
stroke="currentColor" style="fill-rule: evenodd; clip-rule: evenodd; stroke-linecap: round; stroke-linejoin: round;">
<g transform="matrix(1.14096,-0.140958,-0.140958,1.14096,-0.0559523,0.0559523)">
<path d="M18,6L6.087,17.913" style="fill: none; fill-rule: nonzero; stroke-width: 5px;"/>
</g>
<path d="M4.364,4.364L19.636,19.636" style="fill: none; fill-rule: nonzero; stroke-width: 5px;"/>
</svg>
`,
}