function SDImageViewer() {
  const LightBox = document.getElementById('lightboxModal');
  const Control = LightBox.querySelector('.modalControls');
  const ModalClose = LightBox.querySelector('.modalClose');
  const imgEL = LightBox.querySelector('#modalImage');
  const imgPrev = LightBox.querySelector('.modalPrev');
  const imgNext = LightBox.querySelector('.modalNext');
  const pointer = 'sd-image-viewer-pointer-events-none';

  const Wrapper = document.createElement('div');
  Wrapper.id = 'modalWrapper';
  Wrapper.prepend(imgEL);
  LightBox.prepend(Wrapper);

  imgPrev.innerHTML = SDImageViewerPrevSVG;
  imgNext.innerHTML = SDImageViewerNextSVG;
  ModalClose.innerHTML = SDImageViewerCloseSVG;

  const downloadSpan = document.createElement('span');
  downloadSpan.className = 'downloadImage cursor';
  downloadSpan.title = 'Download Image';
  downloadSpan.innerHTML = SDImageViewerDownloadSVG;
  downloadSpan.onclick = (e) => {
    if (imgEL) {
      let imgUrl = encodeURI(imgEL.src);
      const filename = imgUrl.split('/').pop().split('?')[0];
      const downloadLink = document.createElement('a');
      downloadLink.href = imgUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
    e.stopPropagation();
  };

  Control.append(downloadSpan, imgPrev, imgNext);

  const imageViewer = SharedImageViewer(imgEL, LightBox, Control, Wrapper, {
    noPointer: pointer, persist: true
  });

  imageViewer.state.close = function () {
    LightBox.style.opacity = '';
    requestAnimationFrame(() => setTimeout(() => {
      LightBox.style.display = 'none';
      document.querySelector('body > gradio-app').style.paddingRight = '';
      document.body.style.overflow = Wrapper.style.transform = '';
      window.SDImageViewerReset();
    }, 100));
  };

  window.closeModal = imageViewer.state.close;
  ModalClose.onclick = () => window.closeModal;

  window.SDImageViewerReset = imageViewer.state.reset.bind(imageViewer.state);
  imgEL.onload = () => (imgEL.style.transition = '', window.SDImageViewerReset());
}

function SDImageViewerToggleNextPrevButton() {
  const imgGallery = document.querySelectorAll("div[id^='tab_'] div[id$='_results'] .thumbnail-item > img");
  const imgSrc = new Set(Array.from(imgGallery).map(imgEL => imgEL.src));

  const lightbox = document.getElementById('lightboxModal');
  const imgPrev = lightbox.querySelector('.modalPrev');
  const imgNext = lightbox.querySelector('.modalNext');

  if (imgPrev && imgNext) {
    imgSrc.size > 1
      ? (imgPrev.style.display = 'flex', imgNext.style.display = 'flex')
      : (imgPrev.style.display = 'none', imgNext.style.display = 'none');
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

  const app = document.querySelector('body > gradio-app');
  const LightBox = document.getElementById('lightboxModal');
  const Wrapper = LightBox.querySelector('#modalWrapper');
  const source = e.target || e.srcElement;
  const imgEL = document.getElementById('modalImage');

  const LiveToggle = document.getElementById('modal_toggle_live_preview');
  if (LiveToggle) LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewerLiveSVG : SDImageViewerStaticSVG;

  imgEL.src = source.src;
  if (imgEL.style.display === 'none') LightBox.style.setProperty('background-image', 'url(' + source.src + ')');

  let g = app ? app.offsetWidth : 0;
  document.body.style.overflow = 'hidden';

  LightBox.style.display = 'flex';
  LightBox.focus();

  requestAnimationFrame(() => setTimeout(() => {
    LightBox.style.opacity = '1';
    setTimeout(() => Wrapper.style.transform = 'translate(0px, 0px) scale(1)', 50);
  }, 50));

  const n = app.offsetWidth;
  const w = n - g;
  if (w > 0) app.style.paddingRight = w + 'px';
  e.stopPropagation();
}

window.modalImageSwitch = function(offset) {
  const LightBox = document.getElementById('lightboxModal');
  const imgEL = document.getElementById('modalImage');
  var galleryButtons = all_gallery_buttons();

  if (galleryButtons.length > 1) {
    var result = selected_gallery_index();

    if (result != -1) {
      var nextButton = galleryButtons[negmod((result + offset), galleryButtons.length)];
      nextButton.click();
      imgEL.src = nextButton.children[0].src;
      imgEL.style.transition = imgEL.style.transform = '';
      if (imgEL.style.display === 'none') LightBox.style.setProperty('background-image', `url(${imgEL.src})`);
      LightBox.focus();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#lightboxModal > .modalControls') && SDImageViewer();

  if (/firefox/i.test(navigator.userAgent)) {
    const bg = document.createElement('style');
    bg.innerHTML = `#lightboxModal { backdrop-filter: none !important; }`;
    document.body.append(bg);
  }
});
