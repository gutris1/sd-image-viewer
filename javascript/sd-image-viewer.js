document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#lightboxModal > .modalControls') && SDImageViewerEL();
});

function SDImageViewerEL() {
  const LightBox = document.getElementById('lightboxModal');
  const ModalControls = LightBox.querySelector('.modalControls');
  const ModalClose = LightBox.querySelector('.modalClose');
  const imgEL = LightBox.querySelector('#modalImage');
  const imgPrev = LightBox.querySelector('.modalPrev');
  const imgNext = LightBox.querySelector('.modalNext');

  const Wrapper = document.createElement('div');
  Wrapper.id = 'modalWrapper';
  Wrapper.prepend(imgEL);
  LightBox.prepend(Wrapper);

  const imgState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    lastLen: 1,
    LastTouch: 0,
    ZoomMomentum: 0,
    MoveMomentum: 0,
    LastZoom: 0,
    SnapMouse: 20,
    SnapTouch: 10,

    TouchGrass: {
      touchScale: false,
      last1X: 0,
      last1Y: 0,
      last2X: 0,
      last2Y: 0,
      delta1X: 0,
      delta1Y: 0,
      delta2X: 0,
      delta2Y: 0,
      scale: 1
    },

    SDImageViewerSnapBack: function(imgEL, LightBox) {
      if (this.scale <= 1) return;

      const imgELW = imgEL.offsetWidth * this.scale;
      const imgELH = imgEL.offsetHeight * this.scale;
      const LightBoxW = LightBox.offsetWidth;
      const LightBoxH = LightBox.offsetHeight;

      if (imgELW <= LightBoxW) {
        const EdgeY = (imgELH - LightBoxH) / 2;
        if (this.offsetY > EdgeY) this.offsetY = EdgeY;
        else if (this.offsetY < -EdgeY) this.offsetY = -EdgeY;

        imgEL.style.transition = 'transform 0.3s ease';
        imgEL.style.transform = `translateY(${this.offsetY}px) scale(${this.scale})`;

      } else if (imgELH <= LightBoxH) {
        const EdgeX = (imgELW - LightBoxW) / 2;
        if (this.offsetX > EdgeX) this.offsetX = EdgeX;
        else if (this.offsetX < -EdgeX) this.offsetX = -EdgeX;

        imgEL.style.transition = 'transform 0.3s ease';
        imgEL.style.transform = `translateX(${this.offsetX}px) scale(${this.scale})`;

      } else {
        const EdgeX = (imgELW - LightBoxW) / 2;
        if (this.offsetX > EdgeX) this.offsetX = EdgeX;
        else if (this.offsetX < -EdgeX) this.offsetX = -EdgeX;

        const EdgeY = (imgELH - LightBoxH) / 2;
        if (this.offsetY > EdgeY) this.offsetY = EdgeY;
        else if (this.offsetY < -EdgeY) this.offsetY = -EdgeY;

        imgEL.style.transition = 'transform 0.3s ease';
        imgEL.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
      }
    },

    SDImageViewerimgReset: function() {
      this.scale = 1;
      this.offsetX = 0;
      this.offsetY = 0;
      this.lastX = 0;
      this.lastY = 0;

      Object.assign(this.TouchGrass, {
        touchScale: false,
        last1X: 0,
        last1Y: 0,
        last2X: 0,
        last2Y: 0,
        delta1X: 0,
        delta1Y: 0,
        delta2X: 0,
        delta2Y: 0,
        scale: 1
      });

      imgEL.style.transition = '';
      imgEL.style.transform = '';
    },

    SDImageViewerCloseZoom: function() {
      setTimeout(() => {
        LightBox.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        document.querySelector('body > gradio-app').style.paddingRight = '0';
        document.body.style.overflow = '';
        LightBox.style.display = 'none';
        this.SDImageViewerimgReset();
        Wrapper.style.transform = '';
        Wrapper.style.opacity = '';
      }, 150);
    }
  };

  window.closeModal = imgState.SDImageViewerCloseZoom.bind(imgState);

  imgEL.onload = () => {
    imgState.SDImageViewerimgReset();
  };

  imgEL.ondrag = imgEL.ondragend = imgEL.ondragstart = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  LightBox.onkeydown = (e) => {
    if (window.getComputedStyle(LightBox).display === 'flex' && e.key === 'Escape') {
      e.preventDefault();
      imgState.SDImageViewerCloseZoom();
    }
  };

  imgPrev.innerHTML = SDImageViewerPrevSVG;
  imgNext.innerHTML = SDImageViewerNextSVG;
  ModalClose.innerHTML = SDImageViewerCloseSVG;

  const downloadSpan = document.createElement('span');
  downloadSpan.className = 'downloadImage cursor';
  downloadSpan.title = 'Download Image';
  downloadSpan.innerHTML = SDImageViewerDownloadSVG;
  ModalControls.appendChild(downloadSpan);

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

  SDImageViewerMouseEvents(imgState);
  SDImageViewerTouchEvents(imgState);
}

function SDImageViewerToggleNextPrevButton() {
  const imgGallery = document.querySelectorAll("div[id^='tab_'] div[id$='_results'] .thumbnail-item > img");
  const imgSrc = new Set(Array.from(imgGallery).map(imgEL => imgEL.src));
  const imgPrev = document.querySelector('.modalPrev');
  const imgNext = document.querySelector('.modalNext');

  if (imgPrev && imgNext) {
    imgSrc.size > 1 ? 
      (imgPrev.style.display = 'flex', imgNext.style.display = 'flex') :
      (imgPrev.style.display = 'none', imgNext.style.display = 'none');
  }
}

function SDImageViewerSwitchImage(f) {
  const Wrapper = document.getElementById('modalWrapper');
  const imgEL = document.getElementById('modalImage');

  if (Wrapper && imgEL) {
    Wrapper.style.transition = f === 'h' ? 'none' : '';
    Wrapper.style.opacity = f === 'h' ? '' : '1';
    Wrapper.style.transform = f === 'h' ? '' : 'translate(0px, 0px) scale(1)';
    imgEL.style.transition = f === 'h' ? 'none' : '';
    imgEL.style.transform = f === 'h' ? 'translate(0, 0) scale(1)' : '';
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

  const AppGradio = document.querySelector('body > gradio-app');
  const LightBox = document.getElementById('lightboxModal');
  const source = e.target || e.srcElement;
  const imgEL = document.getElementById('modalImage');
  const LiveToggle = document.getElementById('modal_toggle_live_preview');

  LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewerLiveSVG : SDImageViewerStaticSVG;
  imgEL.src = source.src;
  if (imgEL.style.display === 'none') LightBox.style.setProperty('background-image', 'url(' + source.src + ')');

  LightBox.style.display = 'flex';
  LightBox.focus();

  let GradioWidth = AppGradio ? AppGradio.offsetWidth : 0;
  document.body.style.overflow = 'hidden';

  LightBox.style.opacity = '1';
  SDImageViewerSwitchImage('s');

  const newWidth = AppGradio.offsetWidth;
  const widthDifference = newWidth - GradioWidth;
  if (widthDifference > 0) AppGradio.style.paddingRight = widthDifference + 'px';
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
      SDImageViewerSwitchImage('h');
      imgEL.src = nextButton.children[0].src;
      if (imgEL.style.display === 'none') LightBox.style.setProperty('background-image', `url(${imgEL.src})`);
      setTimeout(() => (LightBox.focus(), SDImageViewerSwitchImage('s')), 30);
    }
  }
}
