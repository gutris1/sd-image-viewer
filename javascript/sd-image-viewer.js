function SDImageViewer() {
  const LightBox = document.getElementById('lightboxModal'),
  Control = LightBox.querySelector('.modalControls'),
  ModalClose = LightBox.querySelector('.modalClose'),
  imgEL = LightBox.querySelector('#modalImage'),
  imgPrev = LightBox.querySelector('.modalPrev'),
  imgNext = LightBox.querySelector('.modalNext'),

  Wrapper = document.createElement('div');
  Wrapper.id = 'modalWrapper';
  Wrapper.prepend(imgEL);
  LightBox.prepend(Wrapper);

  imgPrev.innerHTML = SDImageViewerPrevSVG;
  imgNext.innerHTML = SDImageViewerNextSVG;
  ModalClose.innerHTML = SDImageViewerCloseSVG;

  const downloadBtn = document.createElement('span');
  downloadBtn.className = 'downloadImage cursor';
  downloadBtn.title = 'Download Image';
  downloadBtn.innerHTML = SDImageViewerDownloadSVG;
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
    }, 200);
  };

  window.closeModal = imageViewer.state.close;
  ModalClose.onclick = () => window.closeModal;

  window.SDImageViewerReset = imageViewer.state.reset.bind(imageViewer.state);
  imgEL.onload = () => (imgEL.style.transition = '', window.SDImageViewerReset());
}

function SDImageViewerToggleNextPrevButton() {
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
  LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewerLiveSVG : SDImageViewerStaticSVG;
  e.stopPropagation();
}

window.showModal = function(e) {
  SDImageViewerToggleNextPrevButton();

  const app = document.querySelector('body > gradio-app'),
  LightBox = document.getElementById('lightboxModal'),
  Wrapper = LightBox.querySelector('#modalWrapper'),
  source = e.target || e.srcElement,
  imgEL = document.getElementById('modalImage'),

  LiveToggle = document.getElementById('modal_toggle_live_preview');
  if (LiveToggle) LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewerLiveSVG : SDImageViewerStaticSVG;

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

onUiLoaded(() => {
  document.querySelector('#lightboxModal > .modalControls') && SDImageViewer();
});

document.addEventListener('DOMContentLoaded', () => {
  const css = `
    #lightboxModal {
      backdrop-filter: none !important;
    }
  `;

  if (/firefox/i.test(navigator.userAgent)) {
    document.body.append(Object.assign(document.createElement('style'), { innerHTML: css }));
  }
});