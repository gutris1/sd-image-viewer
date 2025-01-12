function SDImageViewerMouseEvents(imgEL, LightBox, ModalClose, imgState) {
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
    }, 100);
  });

  imgEL.addEventListener('mousemove', (e) => {
    if (!Groped) return;

    e.preventDefault();
    imgEL.onclick = (e) => e.stopPropagation();
    LightBox.onclick = (e) => e.stopPropagation();

    const imgELW = imgEL.offsetWidth * imgState.scale;
    const imgELH = imgEL.offsetHeight * imgState.scale;
    const imgBoxW = LightBox.offsetWidth;
    const imgBoxH = LightBox.offsetHeight;

    const deltaX = e.clientX - imgState.lastX;
    const deltaY = e.clientY - imgState.lastY;

    imgEL.style.transition = 'transform 60ms ease';

    if (imgState.scale <= 1) {
      imgState.offsetX = 0;
      imgState.offsetY = 0;
      imgEL.style.transform = `translateX(0px) scale(${imgState.scale})`;

    } else if (imgELW <= imgBoxW && imgELH >= imgBoxH) {
      imgState.offsetY = deltaY;
      const EdgeY = (imgELH - imgBoxH) / 2;
      imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapMeter), -EdgeY - imgState.SnapMeter);
      imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${imgState.scale})`;

    } else if (imgELH <= imgBoxH && imgELW >= imgBoxW) {
      imgState.offsetX = deltaX;
      const EdgeX = (imgELW - imgBoxW) / 2;
      imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapMeter), -EdgeX - imgState.SnapMeter);
      imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${imgState.scale})`;

    } else if (imgELW >= imgBoxW && imgELH >= imgBoxH) {
      imgState.offsetX = deltaX;
      imgState.offsetY = deltaY;

      const EdgeX = (imgELW - imgBoxW) / 2;
      imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapMeter), -EdgeX - imgState.SnapMeter);

      const EdgeY = (imgELH - imgBoxH) / 2;
      imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapMeter), -EdgeY - imgState.SnapMeter);

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
  });

  document.addEventListener('mouseleave', (e) => {
    if (e.target !== LightBox && Groped) {
      imgState.SDImageViewerSnapBack(imgEL, LightBox);
      Groped = false;
      imgEL.style.cursor = 'auto';
    }
  });

  imgEL.addEventListener('wheel', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const currentTime = Date.now();
    const timeDelta = currentTime - imgState.LastZoom;
    imgState.LastZoom = currentTime;
    const centerX = LightBox.offsetWidth / 2;
    const centerY = LightBox.offsetHeight / 2;
    const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    const zoomStep = 0.15;
    const zoom = 1 + delta * zoomStep;
    const lastScale = imgState.scale;
    imgState.scale *= zoom;
    imgState.scale = Math.max(1, Math.min(imgState.scale, 10));
    imgState.ZoomMomentum = delta / (timeDelta * 0.5 || 1);
    imgState.ZoomMomentum = Math.min(Math.max(imgState.ZoomMomentum, -1.5), 1.5);

    const imgELW = imgEL.offsetWidth * imgState.scale;
    const imgELH = imgEL.offsetHeight * imgState.scale;
    const imgBoxW = LightBox.offsetWidth;
    const imgBoxH = LightBox.offsetHeight;

    const momentumFactor = Math.abs(imgState.ZoomMomentum);
    const ZoomTransition = `transform ${0.4 * (1 + momentumFactor)}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
    imgEL.style.transition = ZoomTransition;

    if (imgState.scale <= 1) {
      imgState.offsetX = 0;
      imgState.offsetY = 0;
      imgEL.style.transform = `translate(0px, 0px) scale(${imgState.scale})`;

    } else if (imgELW <= imgBoxW && imgELH >= imgBoxH) {
      const imgCenterY = imgState.offsetY + centerY;
      imgState.offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * imgState.scale - centerY;

      const EdgeY = (imgELH - imgBoxH) / 2;
      if (imgState.offsetY > EdgeY) imgState.offsetY = EdgeY;
      else if (imgState.offsetY < -EdgeY) imgState.offsetY = -EdgeY;

      imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${imgState.scale})`;

    } else if (imgELH <= imgBoxH && imgELW >= imgBoxW) {
      const imgCenterX = imgState.offsetX + centerX;
      imgState.offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * imgState.scale - centerX;

      const EdgeX = (imgELW - imgBoxW) / 2;
      if (imgState.offsetX > EdgeX) imgState.offsetX = EdgeX;
      else if (imgState.offsetX < -EdgeX) imgState.offsetX = -EdgeX;

      imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${imgState.scale})`;

    } else if (imgELW >= imgBoxW && imgELH >= imgBoxH) {
      const imgCenterX = imgState.offsetX + centerX;
      const imgCenterY = imgState.offsetY + centerY;
      imgState.offsetX = e.clientX - ((e.clientX - imgCenterX) / lastScale) * imgState.scale - centerX;
      imgState.offsetY = e.clientY - ((e.clientY - imgCenterY) / lastScale) * imgState.scale - centerY;

      const EdgeX = (imgELW - imgBoxW) / 2;
      if (imgState.offsetX > EdgeX) imgState.offsetX = EdgeX;
      else if (imgState.offsetX < -EdgeX) imgState.offsetX = -EdgeX;

      const EdgeY = (imgELH - imgBoxH) / 2;
      if (imgState.offsetY > EdgeY) imgState.offsetY = EdgeY;
      else if (imgState.offsetY < -EdgeY) imgState.offsetY = -EdgeY;

      imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
    }

    imgState.ZoomMomentum *= 0.5;
  }, { passive: false });
}
