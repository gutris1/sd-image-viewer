function ifimgEL(imgEL, LightBox, BoxClose) {
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastLen = 1;
  let GropinTime = null;
  let Groped = false;
  let velocityX = 0;
  let velocityY = 0;
  let LastTouch = 0;
  let ZoomMomentum = 0;
  let LastZoom = 0;
  let MultiGrope = false;
  let SnapMeter = 20;

  imgEL.onload = () => {
    imgReset();
    imgEL.offsetHeight;
    imgEL.style.opacity = '1';
    imgEL.style.transform = 'translate(0px, 0px) scale(1)';
  };

  imgEL.ondrag = imgEL.ondragend = imgEL.ondragstart = (e) => {
    e.stopPropagation(); e.preventDefault();
  };

  imgEL.addEventListener('wheel', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const currentTime = Date.now();
    const timeDelta = currentTime - LastZoom;
    LastZoom = currentTime;
    const centerX = LightBox.offsetWidth / 2;
    const centerY = LightBox.offsetHeight / 2;
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    const zoomStep = 0.15;
    const zoom = 1 + delta * zoomStep;
    const lastScale = scale;
    scale *= zoom;
    scale = Math.max(1, Math.min(scale, 10));
    ZoomMomentum = delta / (timeDelta * 0.5 || 1);
    ZoomMomentum = Math.min(Math.max(ZoomMomentum, -1.5), 1.5);

    const imgELW = imgEL.offsetWidth * scale;
    const imgELH = imgEL.offsetHeight * scale;
    const imgBoxW = LightBox.offsetWidth;
    const imgBoxH = LightBox.offsetHeight;

    if (scale <= 1) {
      offsetX = 0;
      offsetY = 0;
    } else if (imgELW <= imgBoxW) {
      const imgCenterY = offsetY + centerY;
      offsetX = 0;
      offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * scale - centerY;

      const EdgeY = (imgELH - imgBoxH) / 2;
      if (offsetY > EdgeY) {
        offsetY = EdgeY;
      } else if (offsetY < -EdgeY) {
        offsetY = -EdgeY;
      }
    } else {
      const imgCenterX = offsetX + centerX;
      const imgCenterY = offsetY + centerY;
      offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * scale - centerX;
      offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * scale - centerY;

      const EdgeX = (imgELW - imgBoxW) / 2;
      if (offsetX > EdgeX) {
        offsetX = EdgeX;
      } else if (offsetX < -EdgeX) {
        offsetX = -EdgeX;
      }

      const EdgeY = (imgELH - imgBoxH) / 2;
      if (offsetY > EdgeY) {
        offsetY = EdgeY;
      } else if (offsetY < -EdgeY) {
        offsetY = -EdgeY;
      }
    }

    const momentumFactor = Math.abs(ZoomMomentum);
    const ZoomTransition = `transform ${0.4 * (1 + momentumFactor)}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
    imgEL.style.transition = ZoomTransition;
    imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    ZoomMomentum *= 0.5;
  }, { passive: false });

  imgEL.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
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
    imgEL.onclick = (e) => e.stopPropagation();
    LightBox.onclick = (e) => e.stopPropagation();

    const imgELW = imgEL.offsetWidth * scale;
    const imgELH = imgEL.offsetHeight * scale;
    const imgBoxW = LightBox.offsetWidth;
    const imgBoxH = LightBox.offsetHeight;
    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;

    imgEL.style.transition = 'transform 60ms ease';

    if (scale <= 1) {
      offsetX = 0;
      offsetY = 0;
      imgEL.style.transform = `translateX(0px) scale(${scale})`;
    } else if (imgELW <= imgBoxW) { 
      offsetY = deltaY;
      const EdgeY = (imgELH - imgBoxH) / 2;
      if (deltaY > EdgeY + SnapMeter) {
        offsetY = EdgeY + SnapMeter;
      } else if (deltaY < -EdgeY - SnapMeter) {
        offsetY = -EdgeY - SnapMeter;
      }

      imgEL.style.transform = `translateY(${offsetY}px) scale(${scale})`;
    } else { 
      offsetX = deltaX;
      offsetY = deltaY;

      const EdgeX = (imgELW - imgBoxW) / 2;
      if (deltaX > EdgeX + SnapMeter) {
        offsetX = EdgeX + SnapMeter;
      } else if (deltaX < -EdgeX - SnapMeter) {
        offsetX = -EdgeX - SnapMeter;
      }

      const EdgeY = (imgELH - imgBoxH) / 2;
      if (deltaY > EdgeY + SnapMeter) {
        offsetY = EdgeY + SnapMeter;
      } else if (deltaY < -EdgeY - SnapMeter) {
        offsetY = -EdgeY - SnapMeter;
      }

      imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
  });

  document.addEventListener('mouseup', (e) => {
    clearTimeout(GropinTime);
    if (!Groped && e.button === 0) {
      imgEL.onclick = closeZoom;
      LightBox.onclick = closeZoom;
      BoxClose.onclick = closeZoom;
      return;
    }
    SnapBack(imgEL, LightBox);
    Groped = false;
    imgEL.style.cursor = 'auto';
    setTimeout(() => {
      imgEL.style.transition = 'transform 0s ease';
    }, 100);
  });

  document.addEventListener('mouseleave', (e) => {
    if (e.target !== LightBox && Groped) {
      SnapBack(imgEL, LightBox);
      Groped = false;
      imgEL.style.cursor = 'auto';
    }
  });

  LightBox.onkeydown = (e) => {
    if (!Groped && e.target === LightBox && e.key === 'Escape') {
      closeZoom();
    }
  };

  function SnapBack(imgEL, LightBox) {
    if (scale <= 1) return;

    const imgELW = imgEL.offsetWidth * scale;
    const imgELH = imgEL.offsetHeight * scale;
    const imgBoxW = LightBox.offsetWidth;
    const imgBoxH = LightBox.offsetHeight;

    if (imgELW <= imgBoxW) {
      const EdgeY = (imgELH - imgBoxH) / 2;
      if (offsetY > EdgeY) {
        offsetY = EdgeY;
      } else if (offsetY < -EdgeY) {
        offsetY = -EdgeY;
      }

      imgEL.style.transition = 'transform 0.3s ease';
      imgEL.style.transform = `translateY(${offsetY}px) scale(${scale})`;

    } else {
      const EdgeX = (imgELW - imgBoxW) / 2;
      if (offsetX > EdgeX) {
        offsetX = EdgeX;
      } else if (offsetX < -EdgeX) {
        offsetX = -EdgeX;
      }

      const EdgeY = (imgELH - imgBoxH) / 2;
      if (offsetY > EdgeY) {
        offsetY = EdgeY;
      } else if (offsetY < -EdgeY) {
        offsetY = -EdgeY;
      }

      imgEL.style.transition = 'transform 0.3s ease';
      imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
  }

  function imgReset() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    lastX = 0;
    lastY = 0;
    Groped = false;

    Object.assign(TouchGrass, {
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
    imgEL.style.opacity = '';
    imgEL.style.transform = '';
  }

  const TouchGrass = {
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
  };

  imgEL.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    imgEL.style.transition = 'none';
    velocityX = 0; 
    velocityY = 0;

    if (e.targetTouches[1]) {
      MultiGrope = true;
      TouchGrass.touchScale = true;
      TouchGrass.last1X = e.targetTouches[0].clientX;
      TouchGrass.last1Y = e.targetTouches[0].clientY;
      TouchGrass.last2X = e.targetTouches[1].clientX;
      TouchGrass.last2Y = e.targetTouches[1].clientY;
      TouchGrass.scale = scale;
      lastLen = Math.sqrt(
        Math.pow(TouchGrass.last2X - TouchGrass.last1X, 2) +
        Math.pow(TouchGrass.last2Y - TouchGrass.last1Y, 2)
      );
    } else {
      MultiGrope = false;
      
      if (!TouchGrass.touchScale) {
        lastX = e.targetTouches[0].clientX;
        lastY = e.targetTouches[0].clientY;
        LastTouch = Date.now();
      }
    }
  });

  LightBox.addEventListener('touchmove', (e) => {
    if (e.target !== imgEL) e.stopPropagation(), e.preventDefault();
  });

  imgEL.addEventListener('touchmove', (e) => {
    e.stopPropagation();
    e.preventDefault();
    imgEL.onclick = (e) => e.stopPropagation();
    imgEL.style.transition = 'none';

    if (e.targetTouches[1]) {
      TouchGrass.delta1X = e.targetTouches[0].clientX;
      TouchGrass.delta1Y = e.targetTouches[0].clientY;
      TouchGrass.delta2X = e.targetTouches[1].clientX;
      TouchGrass.delta2Y = e.targetTouches[1].clientY;
      let centerX = LightBox.offsetWidth / 2;
      let centerY = LightBox.offsetHeight / 2;
      let deltaLen = Math.sqrt(
        Math.pow(TouchGrass.delta2X - TouchGrass.delta1X, 2) +
        Math.pow(TouchGrass.delta2Y - TouchGrass.delta1Y, 2)
      );

      let zoom = deltaLen / lastLen;
      let lastScale = scale;
      scale = TouchGrass.scale * zoom;
      scale = Math.max(0.1, scale);
      scale = Math.min(scale, 10);
      let deltaCenterX = TouchGrass.delta1X + (TouchGrass.delta2X - TouchGrass.delta1X) / 2;
      let deltaCenterY = TouchGrass.delta1Y + (TouchGrass.delta2Y - TouchGrass.delta1Y) / 2;
      let imgCenterX = offsetX + centerX;
      let imgCenterY = offsetY + centerY;
      offsetX = deltaCenterX - ((deltaCenterX - imgCenterX) / lastScale) * scale - centerX;
      offsetY = deltaCenterY - ((deltaCenterY - imgCenterY) / lastScale) * scale - centerY;
      imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

    } else if (!TouchGrass.touchScale) {
      let now = Date.now();
      let currentX = e.targetTouches[0].clientX;
      let currentY = e.targetTouches[0].clientY;
      let deltaX = currentX - lastX;
      let deltaY = currentY - lastY;
      let timeDelta = now - LastTouch;

      velocityX = deltaX / timeDelta;
      velocityY = deltaY / timeDelta;
      offsetX += deltaX;
      offsetY += deltaY;
      lastX = currentX;
      lastY = currentY;
      LastTouch = now;

      imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
  });

  imgEL.addEventListener('touchcancel', (e) => {
    e.stopPropagation();
    e.preventDefault();
    imgEL.onclick = undefined;
    imgEL.style.transition = 'none';
    imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    MultiGrope = false;
    TouchGrass.touchScale = false;
  });

  imgEL.addEventListener('touchend', (e) => {
    e.stopPropagation();
    imgEL.onclick = undefined;
    imgEL.style.transition = 'none';

    if (e.targetTouches.length === 0) {
      if (MultiGrope) {
        MultiGrope = false;
        TouchGrass.touchScale = false;
      } else {
        if (!TouchGrass.touchScale && (Math.abs(velocityX) > 0.05 || Math.abs(velocityY) > 0.05)) {
          function TouchMomentum() {
            let momentumDecay = 0.95;
            let momentumMultiplier = 15;
            let momentumThreshold = 0.05;
            
            if (Math.abs(velocityX) > momentumThreshold || Math.abs(velocityY) > momentumThreshold) {
              offsetX += velocityX * momentumMultiplier;
              offsetY += velocityY * momentumMultiplier;
              velocityX *= momentumDecay;
              velocityY *= momentumDecay;
              imgEL.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
              requestAnimationFrame(TouchMomentum);
            } else {
              velocityX = 0; 
              velocityY = 0; 
            }
          }

          TouchMomentum();
        }
      }

      setTimeout(() => {
        TouchGrass.touchScale = false;
      }, 10);
    }
  });

  function closeZoom() {
    LightBox.style.display = 'none';
    document.body.style.overflow = 'auto';
    imgReset();
  }
}

function toggleNextPrev() {
  let imgGallery = document.querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
  let imgSrc = new Set(Array.from(imgGallery).map(imgEL => imgEL.src));
  let imgPrev = document.querySelector('.modalPrev');
  let imgNext = document.querySelector('.modalNext');

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

function ifBoxControls(BoxControls, imgEL) {
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

  downloadSpan.addEventListener("click", function(e) {
    if (imgEL) {
      const imgUrl = imgEL.src;
      const start = imgUrl.lastIndexOf("/") + 1;
      const end = imgUrl.indexOf("?") !== -1 ? imgUrl.indexOf("?") : undefined;
      const filename = imgUrl.substring(start, end);
      const downloadLink = document.createElement("a");
      downloadLink.href = imgUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
    e.stopPropagation();
  });
}

onUiLoaded(function () {
  let LightBox = gradioApp().getElementById('lightboxModal');
  let BoxControls = LightBox.getElementsByClassName('modalControls')[0];
  let BoxClose = LightBox.querySelector('.modalClose');
  let imgEL = LightBox.querySelector('img');

  if (BoxControls) {
    ifBoxControls(BoxControls, imgEL);
    ifimgEL(imgEL, LightBox, BoxClose);
  }

  const Watcher = new MutationObserver(() => {
    if (window.getComputedStyle(LightBox).display === 'flex') {
      toggleNextPrev();
      document.body.style.overflow = 'hidden';
    }
  });

  Watcher.observe(LightBox, { attributes: true, attributeFilter: ['style'] });
});
