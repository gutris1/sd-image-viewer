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
      const imgBoxW = LightBox.offsetWidth;
      const imgBoxH = LightBox.offsetHeight;

      if (imgELW <= imgBoxW) {
        const EdgeY = (imgELH - imgBoxH) / 2;
        if (this.offsetY > EdgeY) this.offsetY = EdgeY;
        else if (this.offsetY < -EdgeY) this.offsetY = -EdgeY;

        imgEL.style.transition = 'transform 0.3s ease';
        imgEL.style.transform = `translateY(${this.offsetY}px) scale(${this.scale})`;

      } else if (imgELH <= imgBoxH) {
        const EdgeX = (imgELW - imgBoxW) / 2;
        if (this.offsetX > EdgeX) this.offsetX = EdgeX;
        else if (this.offsetX < -EdgeX) this.offsetX = -EdgeX;

        imgEL.style.transition = 'transform 0.3s ease';
        imgEL.style.transform = `translateX(${this.offsetX}px) scale(${this.scale})`;

      } else {
        const EdgeX = (imgELW - imgBoxW) / 2;
        if (this.offsetX > EdgeX) this.offsetX = EdgeX;
        else if (this.offsetX < -EdgeX) this.offsetX = -EdgeX;

        const EdgeY = (imgELH - imgBoxH) / 2;
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

  imgPrev.innerHTML = `
  <svg xmlns='http://www.w3.org/2000/svg' fill='currentColor'
    width='32px' height='32px' viewBox='0 0 24 24'>
    <path
      d='m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1
      1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z'/>
  </svg>
  `;

  imgNext.innerHTML = `
  <svg xmlns='http://www.w3.org/2000/svg' fill='currentColor'
    width='32px' height='32px' viewBox='0 0 24 24'>
    <path
      d='M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1
      1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z'/>
  </svg>
  `;

  const downloadSpan = document.createElement('span');
  downloadSpan.className = 'downloadImage cursor';
  downloadSpan.title = 'Download Image';
  downloadSpan.innerHTML = `
  <svg xmlns='http://www.w3.org/2000/svg'
    width='32' height='32' viewBox='0 0 32 32'>
    <path fill='currentColor' stroke='currentColor' stroke-width='1.8'
      d='M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10
      l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z'/>
  </svg>
  `;

  downloadSpan.addEventListener('click', function(e) {
    if (imgEL) {
      let imgUrl = encodeURI(imgEL.src);
      const start = imgUrl.lastIndexOf('/') + 1;
      const end = imgUrl.indexOf('?') !== -1 ? imgUrl.indexOf('?') : undefined;
      const filename = imgUrl.substring(start, end);
      const downloadLink = document.createElement('a');
      downloadLink.href = imgUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
    e.stopPropagation();
  });

  ModalClose.innerHTML = `
  <svg xmlns='http://www.w3.org/2000/svg' fill='currentColor'
    width='32px' height='32px' viewBox='0 0 512 512'>
    <path fill='currentColor' d='M330.443 256l136.765-136.765c14.058-14.058 14.058-36.85
      0-50.908l-23.535-23.535c-14.058-14.058-36.85-14.058-50.908 0L256 181.557L119.235
      44.792c-14.058-14.058-36.85-14.058-50.908 0L44.792 68.327c-14.058 14.058-14.058
      36.85 0 50.908L181.557 256L44.792 392.765c-14.058 14.058-14.058 36.85 0 50.908l23.535
      23.535c14.058 14.058 36.85 14.058 50.908 0L256 330.443l136.765 136.765c14.058 14.058
      36.85 14.058 50.908 0l23.535-23.535c14.058-14.058 14.058-36.85 0-50.908L330.443 256z'/>
  </svg>
  `;

  ModalControls.appendChild(downloadSpan);
  SDImageViewerMouseEvents(imgState);
  SDImageViewerTouchEvents(imgState);
}

var SDImageViewerStaticSVG = `
  <svg xmlns='http://www.w3.org/2000/svg' width='30px' height='30px' viewBox='0 0 24 24'
    fill='transparent' stroke='currentColor' stroke-width='1.5'
    stroke-linecap='round' stroke-linejoin='round'>
    <rect x='0.802' y='0.846' width='22.352' height='22.352' rx='2' ry='2'/>
    <circle cx='7.632' cy='7.676' r='1.862'/>
    <polyline points='23.154 15.747 16.946 9.539 3.285 23.198'/>
  </svg>
`;

var SDImageViewerLiveSVG = `
  <svg xmlns='http://www.w3.org/2000/svg' width='32px' height='32px' viewBox='0 0 24 24'
    fill='transparent' stroke='currentColor' stroke-width='1.5'
    stroke-linecap='round' stroke-linejoin='round'>
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
`;

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

window.modalLivePreviewToggle = function(event) {
  const LiveToggle = gradioApp().getElementById('modal_toggle_live_preview');
  opts.js_live_preview_in_modal_lightbox = !opts.js_live_preview_in_modal_lightbox;
  LiveToggle.innerHTML = opts.js_live_preview_in_modal_lightbox ? SDImageViewerLiveSVG : SDImageViewerStaticSVG;
  event.stopPropagation();
}

window.showModal = function(event) {
  SDImageViewerToggleNextPrevButton();

  const AppGradio = document.querySelector('body > gradio-app');
  const LightBox = document.getElementById('lightboxModal');
  const source = event.target || event.srcElement;
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
  event.stopPropagation();
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#lightboxModal > .modalControls') && SDImageViewerEL();
});
