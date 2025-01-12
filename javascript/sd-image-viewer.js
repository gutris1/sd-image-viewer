function SDImageViewerimgEL(imgEL, LightBox, ModalClose) {
  const imgState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    lastLen: 1,
    LastTouch: 0,
    ZoomMomentum: 0,
    LastZoom: 0,
    SnapMeter: 20,

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

    SDImageViewerCloseZoom: function() {
      LightBoxNone = true;

      setTimeout(() => {
        LightBox.style.opacity = '';
      }, 50);

      setTimeout(() => {
        document.querySelector('body > gradio-app').style.paddingRight = '0';
        document.body.style.overflow = '';
        document.querySelector('#lightboxModal').style.display = "none";
      }, 100);

      setTimeout(() => {
        this.SDImageViewerimgReset();
        imgEL.style.transform = 'translate(0px, 0px) scale(0)';
        LightBoxNone = false;
      }, 150);
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

      imgEL.style.transition = 'transform 0.3s ease';
    }
  };

  window.closeModal = imgState.SDImageViewerCloseZoom.bind(imgState);

  imgEL.onload = () => {
    imgState.SDImageViewerimgReset();
    imgEL.style.transform = 'translate(0px, 0px) scale(1)';
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

  SDImageViewerMouseEvents(imgEL, LightBox, ModalClose, imgState);
  SDImageViewerTouchEvents(imgEL, LightBox, imgState);
}

let LightBoxNone = false;

onUiLoaded(function () {
  let LightBox = document.querySelector('#lightboxModal');
  let ModalControls = LightBox.querySelector('.modalControls');
  let ModalClose = LightBox.querySelector('.modalClose');
  let imgEL = LightBox.querySelector('img');
  let GradioApp = document.querySelector('body > gradio-app');

  if (ModalControls) {
    SDImageViewerModalControls(imgEL, ModalControls, ModalClose);
    SDImageViewerimgEL(imgEL, LightBox, ModalClose);
  }

  const watcher = new MutationObserver(() => {
    if (LightBoxNone) return;
    let GradioWidth = GradioApp ? GradioApp.offsetWidth : 0;

    if (window.getComputedStyle(LightBox).display === 'flex') {
      LightBox.style.opacity = '1';
      document.body.style.overflow = 'hidden';
      SDImageViewerToggleNextPrevButton();
      setTimeout(() => {
        imgEL.style.transform = 'translate(0px, 0px) scale(1)';
      }, 300);

      const newWidth = GradioApp.offsetWidth;
      const widthDifference = newWidth - GradioWidth;
      if (widthDifference > 0) {
        GradioApp.style.paddingRight = widthDifference + 'px';
      }
    }
  });

  watcher.observe(LightBox, { attributes: true, attributeFilter: ['style'] });
});
