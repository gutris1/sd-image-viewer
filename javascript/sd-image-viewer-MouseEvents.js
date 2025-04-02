function SDImageViewerMouseEvents(imgState) {
  const LightBox = document.getElementById('lightboxModal');
  const ModalControls = LightBox.querySelector('.modalControls');
  const ModalClose = LightBox.querySelector('.modalClose');
  const imgEL = LightBox.querySelector('#modalImage');
  const imgPrev = LightBox.querySelector('.modalPrev');
  const imgNext = LightBox.querySelector('.modalNext');

  let GropinTime = null;
  let Groped = false;

  imgEL.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    GropinTime = setTimeout(() => {
      Groped = true;
      imgEL.style.transition = 'transform 0s ease';
      imgEL.style.cursor = 'grab';
      imgState.lastX = e.clientX - imgState.offsetX;
      imgState.lastY = e.clientY - imgState.offsetY;

      ModalControls.style.opacity = '0';
      imgPrev.style.opacity = '0';
      imgNext.style.opacity = '0';
    }, 100);
  });

  imgEL.addEventListener('mousemove', (e) => {
    if (!Groped) return;

    e.preventDefault();
    imgEL.onclick = (e) => e.stopPropagation();
    LightBox.onclick = (e) => e.stopPropagation();

    const imgELW = imgEL.offsetWidth * imgState.scale;
    const imgELH = imgEL.offsetHeight * imgState.scale;
    const LightBoxW = LightBox.offsetWidth;
    const LightBoxH = LightBox.offsetHeight;

    const deltaX = e.clientX - imgState.lastX;
    const deltaY = e.clientY - imgState.lastY;

    imgEL.style.transition = 'transform 60ms ease';

    if (imgState.scale <= 1) {
      imgState.offsetX = 0;
      imgState.offsetY = 0;
      imgEL.style.transform = `translateX(0px) scale(${imgState.scale})`;

    } else if (imgELW <= LightBoxW && imgELH >= LightBoxH) {
      imgState.offsetY = deltaY;
      const EdgeY = (imgELH - LightBoxH) / 2;
      imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapMouse), -EdgeY - imgState.SnapMouse);
      imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${imgState.scale})`;

    } else if (imgELH <= LightBoxH && imgELW >= LightBoxW) {
      imgState.offsetX = deltaX;
      const EdgeX = (imgELW - LightBoxW) / 2;
      imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapMouse), -EdgeX - imgState.SnapMouse);
      imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${imgState.scale})`;

    } else if (imgELW >= LightBoxW && imgELH >= LightBoxH) {
      imgState.offsetX = deltaX;
      imgState.offsetY = deltaY;

      const EdgeX = (imgELW - LightBoxW) / 2;
      imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapMouse), -EdgeX - imgState.SnapMouse);

      const EdgeY = (imgELH - LightBoxH) / 2;
      imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapMouse), -EdgeY - imgState.SnapMouse);

      imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
    }
  });

  document.addEventListener('mouseup', (e) => {
    clearTimeout(GropinTime);
    if (!Groped && e.button === 0) {
      imgEL.onclick = (e) => (e.preventDefault(), imgState.SDImageViewerCloseZoom());
      LightBox.onclick = (e) => (e.preventDefault(), imgState.SDImageViewerCloseZoom());
      ModalClose.onclick = (e) => (e.preventDefault(), imgState.SDImageViewerCloseZoom());
      return;
    }

    imgState.SDImageViewerSnapBack(imgEL, LightBox);
    Groped = false;
    imgEL.style.cursor = 'auto';
    setTimeout(() => (imgEL.style.transition = 'transform 0s ease'), 100);

    ModalControls.style.opacity = '1';
    imgPrev.style.opacity = '1';
    imgNext.style.opacity = '1';
  });

  document.addEventListener('mouseleave', (e) => {
    if (e.target !== LightBox && Groped) {
      imgState.SDImageViewerSnapBack(imgEL, LightBox);
      Groped = false;
      imgEL.style.cursor = 'auto';

      ModalControls.style.opacity = '1';
      imgPrev.style.opacity = '1';
      imgNext.style.opacity = '1';
    }
  });

  imgEL.addEventListener('wheel', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const CTRL = e.ctrlKey || e.metaKey;
    const SHIFT = e.shiftKey;

    const currentTime = Date.now();
    const timeDelta = currentTime - imgState.LastZoom;
    imgState.LastZoom = currentTime;

    const centerX = LightBox.offsetWidth / 2;
    const centerY = LightBox.offsetHeight / 2;
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    const zoomStep = 0.15;
    const zoom = 1 + delta * zoomStep;
    const moveStep = 30 * imgState.scale;
    const lastScale = imgState.scale;

    if (!CTRL && !SHIFT) {
      imgState.scale *= zoom;
      imgState.scale = Math.max(1, Math.min(imgState.scale, 10));
    }

    imgState.ZoomMomentum = delta / (timeDelta * 0.5 || 1);
    imgState.ZoomMomentum = Math.min(Math.max(imgState.ZoomMomentum, -1.5), 1.5);
    const ZoomFactor = Math.abs(imgState.ZoomMomentum);
    const ZoomTransition = `transform ${0.4 * (1 + ZoomFactor)}s cubic-bezier(0.25, 0.1, 0.25, 1)`;

    imgState.MoveMomentum = delta / (timeDelta * 0.1 || 1);
    imgState.MoveMomentum = Math.min(Math.max(imgState.MoveMomentum, -2), 2);
    const MoveFactor = Math.abs(imgState.MoveMomentum);
    const MoveTransition = `transform ${0.2 * (1 + MoveFactor)}s cubic-bezier(0.25, 0.1, 0.25, 1)`;

    imgEL.style.transition = (CTRL || SHIFT) ? MoveTransition : ZoomTransition;
    const SCALE = (CTRL || SHIFT) ? lastScale : imgState.scale;

    const imgELW = imgEL.offsetWidth * imgState.scale;
    const imgELH = imgEL.offsetHeight * imgState.scale;
    const LightBoxW = LightBox.offsetWidth;
    const LightBoxH = LightBox.offsetHeight;

    if (imgState.scale <= 1) {
      imgEL.style.transform = 'translate(0px, 0px) scale(1)';

    } else if (imgELW <= LightBoxW && imgELH >= LightBoxH) {
      if (CTRL) {
        imgState.offsetY -= delta * moveStep;
      } else {
        const imgCenterY = imgState.offsetY + centerY;
        imgState.offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * imgState.scale - centerY;
      }

      const EdgeY = (imgELH - LightBoxH) / 2;
      if (imgState.offsetY > EdgeY) imgState.offsetY = EdgeY;
      else if (imgState.offsetY < -EdgeY) imgState.offsetY = -EdgeY;

      imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${SCALE})`;

    } else if (imgELH <= LightBoxH && imgELW >= LightBoxW) {
      if (SHIFT) {
        imgState.offsetX -= delta * moveStep;
      } else {
        const imgCenterX = imgState.offsetX + centerX;
        imgState.offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * imgState.scale - centerX;
      }

      const EdgeX = (imgELW - LightBoxW) / 2;
      if (imgState.offsetX > EdgeX) imgState.offsetX = EdgeX;
      else if (imgState.offsetX < -EdgeX) imgState.offsetX = -EdgeX;

      imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${SCALE})`;

    } else if (imgELW >= LightBoxW && imgELH >= LightBoxH) {
      if (CTRL) {
        imgState.offsetY -= delta * moveStep;
      } else if (SHIFT) {
        imgState.offsetX -= delta * moveStep;
      } else if (!SHIFT && !CTRL) {
        const imgCenterX = imgState.offsetX + centerX;
        const imgCenterY = imgState.offsetY + centerY;
        imgState.offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * imgState.scale - centerX;
        imgState.offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * imgState.scale - centerY;
      }

      const EdgeX = (imgELW - LightBoxW) / 2;
      if (imgState.offsetX > EdgeX) imgState.offsetX = EdgeX;
      else if (imgState.offsetX < -EdgeX) imgState.offsetX = -EdgeX;

      const EdgeY = (imgELH - LightBoxH) / 2;
      if (imgState.offsetY > EdgeY) imgState.offsetY = EdgeY;
      else if (imgState.offsetY < -EdgeY) imgState.offsetY = -EdgeY;

      imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${SCALE})`;
    }

    imgState.ZoomMomentum *= 0.5;
    imgState.MoveMomentum *= 0.1;
  }, { passive: false });
}
