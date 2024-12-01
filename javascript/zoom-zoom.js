onUiLoaded(function () {
  let imageContainer = document.getElementById('lightboxModal');
  let modalControls = imageContainer.getElementsByClassName('modalControls')[0];
  let DisplayBefore = window.getComputedStyle(imageContainer).display;
  let img = imageContainer.querySelector('img');

  const modalClose = imageContainer.querySelector('.modalClose');

  const downloadSpan = document.createElement('span');
  downloadSpan.className = 'downloadImage cursor';
  downloadSpan.innerHTML = '🡇';
  downloadSpan.title = 'Download Image';
  modalControls.appendChild(downloadSpan);

  var SB = 'var(--primary-400)';

  if (modalControls) {
    downloadSpan.addEventListener("click", function(event) {
      if (img) {
        const imgUrl = img.src;
        const filename = imgUrl.substring(imgUrl.lastIndexOf("/") + 1, imgUrl.lastIndexOf("?"));
        const downloadLink = document.createElement("a");
        downloadLink.href = imgUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      event.stopPropagation();
    });

    const Controlsmodal = document.createElement("style");
    Controlsmodal.textContent = `
      #lightboxModal {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        backdrop-filter: blur(10px);
        background-color: rgba(0, 0, 0, 0.7) !important;
        transition: opacity 0.2s ease;
      }

      #lightboxModal > img {
        width: auto !important;
        height: auto !important;
        max-width: 100%;
        max-height: 100%;
        transform: translate(0px, 0px) scale(0);
        transition: transform 0.5s ease;
      }

      .modalZoom, .modalSave, .modalTileImage, .modalToggleLivePreview {
        display: none !important;
      }

      .modalControls {
        pointer-events: none;
      }

      .modalControls:hover {
        background-color: transparent !important;
        background: transparent !important;
      }

      .modalControls span {
        z-index: 9999;
        color: ${SB} !important;
        position: relative;
        pointer-events: auto;
        filter: brightness(1);
        text-shadow: 0px 0px 0.5rem black !important;
        transition: 0.3s ease;
      }

      .modalControls span:hover {
        filter: brightness(0.7);
        text-shadow: 0px 0px 1rem black !important;
        transform: scale(1.3);
      }

      .modalClose {
        font-size: 50px !important;
      }

      .modalPrev, .modalNext {
        z-index: 9999;
        color: ${SB} !important;
        font-size: 30px !important;
        filter: brightness(1);
        text-shadow: 0px 0px 0.5rem black !important;
      }

      .modalPrev:hover, .modalNext:hover {
        filter: brightness(0.7);
        background-color: transparent !important;
        background: transparent !important;
        text-shadow: 0px 0px 1rem black !important;
        transform: scale(1.3);
      }

      .downloadImage {
        font-size: 40px !important;
        left: 30px !important;
        position: absolute !important;
      }
    `;
    document.head.appendChild(Controlsmodal);
  }

  let scale = 1;
  let lastScale = scale;
  let lastX = 0;
  let lastY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let centerX = 0;
  let centerY = 0;
  let delta = 0;
  let Groped = false;
  let GropinTime;

  function imgEL(e) {
    const imgRect = img.getBoundingClientRect();
    if (e.clientX >= imgRect.left && e.clientX <= imgRect.right &&
        e.clientY >= imgRect.top && e.clientY <= imgRect.bottom) { 
      return true; 
    }
    return false;
  }

  img.onload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    imgReset();
    img.style.transform = 'translate(0px, 0px) scale(1)';
  };

  img.ondrag = img.ondragend = img.ondragstart = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  img.addEventListener('wheel', (e) => {
    if (!imgEL(e)) return;
    e.preventDefault();
    e.stopPropagation();
    img.style.transition = 'transform 0.3s ease';
    centerX = imageContainer.offsetWidth / 2;
    centerY = imageContainer.offsetHeight / 2;
    delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    const zoomStep = 0.1;
    const zoom = 1 + delta * zoomStep;
    lastScale = scale;
    scale *= zoom;
    scale = Math.max(0.1, scale);
    const imgCenterX = offsetX + centerX;
    const imgCenterY = offsetY + centerY;
    offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * scale - centerX;
    offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * scale - centerY;
    img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  });

  img.addEventListener('mousedown', (e) => {
    e.preventDefault();

    GropinTime = setTimeout(() => {
      Groped = true;
      img.style.transition = 'transform 60ms ease';
      img.style.cursor = 'grab';
      lastX = e.clientX - offsetX;
      lastY = e.clientY - offsetY;
    }, 100);
  });

  img.addEventListener('mousemove', (e) => {
    if (!Groped) return;
    e.preventDefault();
    img.onclick = (e) => {
      e.stopPropagation();
    }

    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;
    offsetX = deltaX;
    offsetY = deltaY;
    img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
  });

  img.addEventListener('mouseup', (e) => {
    clearTimeout(GropinTime);

    if (!Groped) {
      img.onclick = (e) => {
        e.stopPropagation();
        imgClose();
      }
      return;
    }

    Groped = false;
    img.style.cursor = 'auto';
    img.style.transition = 'transform 0.3s ease';
  });

  img.addEventListener('mouseleave', (e) => {
    if (Groped) {
      lastX = e.clientX - offsetX;
      lastY = e.clientY - offsetY;
    }
  });

  imageContainer.onclick = modalClose.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    imgClose();
  }

  function imgClose() {
    document.body.style.overflow = '';
    imageContainer.style.transition = 'opacity 0.5s ease';
    img.style.transform = 'translate(0px, 0px) scale(0)';
    imageContainer.style.opacity = '0';

    setTimeout(() => {
      imageContainer.style.display = 'none';
      imgReset();
      imageContainer.style.transition = '';
      imageContainer.style.opacity = '1';
    }, 200);
  }

  function imgReset() {
    scale = 1;
    lastScale = scale;
    lastX = 0;
    lastY = 0;
    offsetX = 0;
    offsetY = 0;
    Groped = false;
    centerX = 0;
    centerY = 0;
    delta = 0;

    img.style.transform = 'translate(0px, 0px) scale(0)';
    img.style.transition = 'transform 0.5s ease';
  }

  function toggleNextPrev() {
    const imgGallery = gradioApp().querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
    const imgSrc = new Set(Array.from(imgGallery).map(img => img.src));
    const imgPrev = imageContainer.querySelector('.modalPrev');
    const imgNext = imageContainer.querySelector('.modalNext');

    if (imgPrev && imgNext) {
      if (imgSrc.size > 1) {
        imgPrev.style.display = 'block';
        imgNext.style.display = 'block';
      } else {
        imgPrev.style.display = 'none';
        imgNext.style.display = 'none';
      }
    }
  }

  const Watcher = new MutationObserver(() => {
    const DisplayNow = window.getComputedStyle(imageContainer).display;
    if (DisplayNow !== DisplayBefore) {
      DisplayBefore = DisplayNow;
      if (DisplayNow === 'flex') {
        toggleNextPrev();
        document.body.style.overflow = 'hidden';
      } else if (DisplayNow === 'none') {
        return;
      }
    }
  });

  Watcher.observe(imageContainer, { attributes: true, attributeFilter: ['style'] });
});
