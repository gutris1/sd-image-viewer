onUiLoaded(function () {
  let imageContainer = document.getElementById("lightboxModal");
  let modalControls = imageContainer.getElementsByClassName("modalControls")[0];
  let DisplayBefore = window.getComputedStyle(imageContainer).display;
  let img = imageContainer.querySelector("img");
  var SB = 'var(--primary-400)';

  const downloadSpan = document.createElement("span");
  downloadSpan.className = "downloadImage cursor";
  downloadSpan.innerHTML = "🡇";
  downloadSpan.title = "Download Image";
  modalControls.appendChild(downloadSpan);

  if (modalControls) {
    downloadSpan.addEventListener("click", function(event) {
      if (img) {
        const imgUrl = img.src;
        const filename = imgUrl.substring(imgUrl.lastIndexOf("/") + 1, imgUrl.lastIndexOf("?"));
        const downloadLink = document.createElement("a");
        downloadLink.href = img.src;
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
      }

      #lightboxModal > img {
        width: auto !important;
        height: auto !important;
        max-width: 100%;
        max-height: 100%;
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
  let lastX = 0;
  let lastY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let Groped = false;
  let GropinTime;

  function imgEL(E) {
    const imgRect = img.getBoundingClientRect();
    if (E.clientX >= imgRect.left && E.clientX <= imgRect.right &&
        E.clientY >= imgRect.top && E.clientY <= imgRect.bottom) { 
      return true; 
    }
    return false;
  }

  function imgClick(E) {
    E.stopPropagation();
  }

  if (imageContainer) {
    img.style.transform = "translate(0px, 0px) scale(0)";
    img.onload = function () {
      imgReset();
      img.style.transform = "translate(0px, 0px) scale(1)";
    };

    img.ondrag = img.ondragend = img.ondragstart = (E) => {
      E.stopPropagation();
      E.preventDefault();
    };

    img.addEventListener("wheel", (E) => {
      if (!imgEL(E)) return;
      E.stopPropagation();
      E.preventDefault();
      img.style.transition = "transform 0.4s ease";
      const centerX = imageContainer.offsetWidth / 2;
      const centerY = imageContainer.offsetHeight / 2;
      const delta = Math.max(-1, Math.min(1, E.wheelDelta || -E.detail));
      const zoomStep = 0.1;
      const zoom = 1 + delta * zoomStep;
      const lastScale = scale;
      scale *= zoom;
      scale = Math.max(0.1, scale);
      const imgCenterX = offsetX + centerX;
      const imgCenterY = offsetY + centerY;
      offsetX = E.clientX - ((E.clientX - imgCenterX) / lastScale) * scale - centerX;
      offsetY = E.clientY - ((E.clientY - imgCenterY) / lastScale) * scale - centerY;
      img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    });

    img.addEventListener("mousedown", (E) => {
      if (!imgEL(E)) return;
      E.preventDefault();
      GropinTime = setTimeout(() => {
        img.style.cursor = "grab";
        img.style.transition = "transform 30ms ease";
        Groped = true;
        lastX = E.clientX - offsetX;
        lastY = E.clientY - offsetY;
      }, 100);
    });

    img.addEventListener("mousemove", (E) => {
      if (!imgEL(E) || !Groped) return;
      E.preventDefault();
      Groping = true;
      img.onclick = imgClick;
      const deltaX = E.clientX - lastX;
      const deltaY = E.clientY - lastY;
      offsetX = deltaX;
      offsetY = deltaY;
      img.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    });

    ['mouseup', 'mouseleave'].forEach((eventType) => {
      img.addEventListener(eventType, (E) => {
        clearTimeout(GropinTime);
        if (!imgEL(E)) return;
        if (!Groped) {
          img.onclick = E.stopPropagation();
          return;
        }
        Groped = false;
        img.style.transition = "transform 0.4s ease";
        img.style.cursor = "auto";
      });
    });
  }

  function imgReset() {
    scale = 1;
    lastScale = scale;
    lastX = 0;
    lastY = 0;
    offsetX = 0;
    offsetY = 0;
    img.style.transform = "translate(0px, 0px) scale(0)";
    img.style.transition = "transform 0.4s ease";
    Groped = false;
  }

  function toggleNextPrev() {
    const imgGallery = gradioApp().querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
    const imgSrc = new Set(Array.from(imgGallery).map(img => img.src));
    const imgPrev = imageContainer.querySelector(".modalPrev");
    const imgNext = imageContainer.querySelector(".modalNext");

    if (imgPrev && imgNext) {
      if (imgSrc.size > 1) {
        imgPrev.style.display = "block";
        imgNext.style.display = "block";
      } else {
        imgPrev.style.display = "none";
        imgNext.style.display = "none";
      }
    }
  }

  function DisplayChange() {
    const DisplayNow = window.getComputedStyle(imageContainer).display;
    if (DisplayNow !== DisplayBefore) {
      DisplayBefore = DisplayNow;
      if (DisplayNow === "flex") {
        toggleNextPrev();
        document.body.style.overflow = "hidden";
      } else if (DisplayNow === "none") {
        document.body.style.overflow = "";
        imgReset();
      }
    }
    requestAnimationFrame(DisplayChange);
  }
  requestAnimationFrame(DisplayChange);
});
