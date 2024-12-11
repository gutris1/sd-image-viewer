onUiLoaded(function () {
  let LightBox = document.getElementById('lightboxModal');
  let BoxControls = LightBox.getElementsByClassName('modalControls')[0];
  let BoxClose = LightBox.querySelector('.modalClose');
  let imgPrev = LightBox.querySelector('.modalPrev');
  let imgNext = LightBox.querySelector('.modalNext');
  let imgEL = LightBox.querySelector('img');

  if (BoxControls) {
    const downloadSpan = document.createElement('span');
    downloadSpan.className = 'downloadImage cursor';
    downloadSpan.title = 'Download Image';
    downloadSpan.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 32 32">
        <path
          fill="currentColor"
          stroke="currentColor"
          stroke-width="1.8"
          d="
            M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10
            l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z
          ">
        </path>
      </svg>
      `;
    BoxControls.appendChild(downloadSpan);

    downloadSpan.addEventListener("click", function(event) {
      if (imgEL) {
        const imgUrl = imgEL.src;
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

    const ControlStyle = document.createElement("style");
    ControlStyle.textContent = `
      #lightboxModal > img:focus {
        outline: none;
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
        color: var(--primary-400) !important;
        pointer-events: auto;
        filter: brightness(1);
        text-shadow: 0 0 7px black !important;
        transition: 0.3s ease;
        position: absolute !important;
        width: auto !important;
      }

      .modalControls span:hover {
        filter: brightness(0.8);
        transform: scale(1.3);
      }

      .modalClose {
        top: 0 !important;
        right: 1.5rem !important;
        font-size: 3.7rem !important;
        margin-left: 0 !important;
      }

      .downloadImage {
        left: 1.3rem !important;
        position: absolute !important;
      }

      .downloadImage svg {
        filter: drop-shadow(0 0 3px black);
      }

      .modalPrev, .modalNext {
        z-index: 9999;
        color: var(--primary-400) !important;
        font-size: 30px !important;
        filter: brightness(1);
        text-shadow: 0 0 7px black !important;
        transition: 0.3s ease !important;
      }

      .modalPrev:hover, .modalNext:hover {
        filter: brightness(0.8);
        background-color: transparent !important;
        background: transparent !important;
        transform: scale(1.4);
      }
    `;

    document.body.appendChild(ControlStyle);
  }

  if (LightBox) {
    Object.assign(LightBox.style, {
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)'
    });

    Object.assign(imgEL.style, {
      width: 'auto',
      height: 'auto',
      cursor: 'auto',
      opacity: '0',
      transition: 'transform 0.3s ease, opacity 0.6s ease',
      transform: 'translate(0px, 0px) scale(0)'
    });

    LightBox.appendChild(imgEL);
    document.body.appendChild(LightBox);

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let lastX = 0;
    let lastY = 0;
    let GropinTime = null;
    let Groped = false;

    imgEL.onload = () => {
      imgReset();
      imgEL.style.opacity = '1';
      imgEL.style.transform = 'translate(0px, 0px) scale(1)';
    };

    imgEL.ondrag = imgEL.ondragend = imgEL.ondragstart = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    imgEL.addEventListener('wheel', (e) => {
      if (!imgEL) return;
      e.preventDefault();
      e.stopPropagation();
      const centerX = LightBox.offsetWidth / 2;
      const centerY = LightBox.offsetHeight / 2;
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
      const zoomStep = 0.1;
      const zoom = 1 + delta * zoomStep;
      const lastScale = scale;
      scale *= zoom;
      scale = Math.max(0.1, scale);
      scale = Math.min(scale, 10);
      const imgCenterX = offsetX + centerX;
      const imgCenterY = offsetY + centerY;
      offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * scale - centerX;
      offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * scale - centerY;
      imgEL.style.transition = 'transform 0.3s ease';
      imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });

    imgEL.addEventListener('mousedown', (e) => {
      e.preventDefault();
      GropinTime = setTimeout(() => {
        Groped = true;
        imgEL.style.transition = 'transform 0s ease';
        imgEL.style.cursor = 'grab';
        lastX = e.clientX - offsetX;
        lastY = e.clientY - offsetY;
      }, 100);
    });

    imgEL.addEventListener('mousemove', (e) => {
      if (!Groped) return;
      e.preventDefault();
      imgEL.onclick = (e) => {
        e.stopPropagation();
      }
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      offsetX = deltaX;
      offsetY = deltaY;
      imgEL.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    });

    imgEL.addEventListener('mouseup', (e) => {
      clearTimeout(GropinTime);
      if (!Groped) {
        imgEL.onclick = (e) => {
          e.stopPropagation();
          imgClose();
        }
        return;
      }
      Groped = false;
      imgEL.style.cursor = 'auto';
      imgEL.style.transition = 'transform 0.3s ease';
    });

    imgEL.addEventListener('mouseleave', (e) => {
      if (Groped) {
        lastX = e.clientX - offsetX;
        lastY = e.clientY - offsetY;
      }
    });

    LightBox.onclick = BoxClose.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      imgClose();
    };

    LightBox.onkeydown = (e) => {
      if (e.key === 'Escape') { 
        e.stopPropagation();
        e.preventDefault();
        imgClose(); 
      }
    };

    function imgClose() {
      LightBox.style.display = 'none';
      document.body.style.overflow = 'auto';
      imgReset();
    }

    function imgReset() {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      lastX = 0;
      lastY = 0;
      Groped = false;

      imgEL.style.transition = 'transform 0.3s ease, opacity 0.6s ease';
      imgEL.style.opacity = '0';
      imgEL.style.transform = 'translate(0px, 0px) scale(0)';
    }
  }

  function toggleNextPrev() {
    const imgGallery = gradioApp().querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
    const imgSrc = new Set(Array.from(imgGallery).map(imgEL => imgEL.src));
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
    if (window.getComputedStyle(LightBox).display === 'flex') {
      toggleNextPrev();
      document.body.style.overflow = 'hidden';
    }
  });

  Watcher.observe(LightBox, { attributes: true, attributeFilter: ['style'] });
});
