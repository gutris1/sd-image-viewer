onUiLoaded(() => {
  const LightBox = document.getElementById('lightboxModal'),
  Control = LightBox.querySelector('.modalControls');

  if (Control) {
    const ModalClose = LightBox.querySelector('.modalClose'),
    imgEL = LightBox.querySelector('#modalImage'),
    imgPrev = LightBox.querySelector('.modalPrev'),
    imgNext = LightBox.querySelector('.modalNext'),

    Wrapper = document.createElement('div');
    Wrapper.id = 'modalWrapper';
    Wrapper.prepend(imgEL);
    LightBox.prepend(Wrapper);

    imgPrev.innerHTML = SDImageViewer.prev();
    imgNext.innerHTML = SDImageViewer.next();
    ModalClose.innerHTML = SDImageViewer.close();

    const downloadBtn = document.createElement('span');
    downloadBtn.className = 'downloadImage cursor';
    downloadBtn.title = 'Download Image';
    downloadBtn.innerHTML = SDImageViewer.download();
    downloadBtn.onclick = (e) => {
      if (imgEL) {
        const url = encodeURI(imgEL.src),
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

    Control.append(downloadBtn, imgPrev, imgNext);

    const imageViewer = SharedImageViewer(imgEL, LightBox, {
      persist: true,
      zoomStart: () => Control.classList.add('hide'),
      zoomEnd: () => Control.classList.remove('hide')
    });

    imageViewer.state.close = function () {
      LightBox.classList.remove('display');

      setTimeout(() => {
        LightBox.style.display = '';
        document.querySelector('body > gradio-app').style.paddingRight = '';
        document.body.style.overflow = '';
        Wrapper.classList.remove('display');
        window.SDImageViewerReset();
        imgEL.style.transition = imgEL.style.transform = '';
      }, 200);
    };

    window.closeModal = imageViewer.state.close;
    ModalClose.onclick = () => window.closeModal;

    window.SDImageViewerReset = imageViewer.state.reset.bind(imageViewer.state);
    imgEL.onload = () => (imgEL.style.transition = '', window.SDImageViewerReset());
  }
});

function SDImageViewerNextPrevButton() {
  const imgGallery = document.querySelectorAll("div[id^='tab_'] div[id$='_results'] .thumbnail-item > img"),
  imgSrc = new Set(Array.from(imgGallery).map(imgEL => imgEL.src)),
  lightbox = document.getElementById('lightboxModal'),
  imgPrev = lightbox.querySelector('.modalPrev'),
  imgNext = lightbox.querySelector('.modalNext');

  if (imgPrev && imgNext) {
    imgSrc.size > 1
      ? (imgPrev.style.display = imgNext.style.display = 'flex')
      : (imgPrev.style.display = imgNext.style.display = 'none');
  }
}

window.modalLivePreviewToggle = function(e) {
  const LiveToggle = gradioApp().getElementById('modal_toggle_live_preview');
  opts.js_live_preview_in_modal_lightbox = !opts.js_live_preview_in_modal_lightbox;
  LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewer.live() : SDImageViewer.static();
  e.stopPropagation();
}

window.showModal = function(e) {
  SDImageViewerNextPrevButton();

  const app = document.querySelector('body > gradio-app'),
  LightBox = document.getElementById('lightboxModal'),
  Wrapper = LightBox.querySelector('#modalWrapper'),
  source = e.target || e.srcElement,
  imgEL = document.getElementById('modalImage'),

  LiveToggle = document.getElementById('modal_toggle_live_preview');
  if (LiveToggle) LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewer.live() : SDImageViewer.static();

  imgEL.src = source.src;
  if (imgEL.style.display === 'none') LightBox.style.setProperty('background-image', 'url(' + source.src + ')');

  let g = app ? app.offsetWidth : 0;
  document.body.style.overflow = 'hidden';

  LightBox.style.display = 'flex';
  LightBox.focus();

  setTimeout(() => requestAnimationFrame(() => {
    LightBox.classList.add('display');
    setTimeout(() => Wrapper.classList.add('display'), 50);
  }), 100);

  const n = app.offsetWidth, w = n - g;
  if (w > 0) app.style.paddingRight = w + 'px';
  e.stopPropagation();
}

window.modalImageSwitch = function(offset) {
  const LightBox = document.getElementById('lightboxModal'),
  imgEL = LightBox.querySelector('#modalImage'),
  galleryButtons = all_gallery_buttons();

  if (galleryButtons.length > 1) {
    const result = selected_gallery_index();

    if (result != -1) {
      const nextButton = galleryButtons[negmod((result + offset), galleryButtons.length)];
      nextButton.click();
      imgEL.src = nextButton.children[0].src;
      imgEL.style.transition = imgEL.style.transform = '';
      if (imgEL.style.display === 'none') LightBox.style.setProperty('background-image', `url(${imgEL.src})`);
      LightBox.focus();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (/firefox/i.test(navigator.userAgent)) {
    document.body.append(Object.assign(document.createElement('style'), { textContent: SDImageViewer.css() }));
  }
});

const SDImageViewer = {
css: () => `
#lightboxModal {
  backdrop-filter: none !important;
}
`,

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
<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' width='32px' height='32px' viewBox='0 0 24 24'>
<path d='m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z'/>
</svg>
`,

next: () => `
<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' width='32px' height='32px' viewBox='0 0 24 24'>
<path d='M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z'/>
</svg>
`,

close: () => `
<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' width='32px' height='32px' viewBox='0 0 512 512'>
<path fill='currentColor' d='M330.443 256l136.765-136.765c14.058-14.058 14.058-36.85
0-50.908l-23.535-23.535c-14.058-14.058-36.85-14.058-50.908 0L256 181.557L119.235
44.792c-14.058-14.058-36.85-14.058-50.908 0L44.792 68.327c-14.058 14.058-14.058
36.85 0 50.908L181.557 256L44.792 392.765c-14.058 14.058-14.058 36.85 0 50.908l23.535
23.535c14.058 14.058 36.85 14.058 50.908 0L256 330.443l136.765 136.765c14.058 14.058
36.85 14.058 50.908 0l23.535-23.535c14.058-14.058 14.058-36.85 0-50.908L330.443 256z'/>
</svg>
`,
}