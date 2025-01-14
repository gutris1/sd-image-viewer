function SDImageViewerTouchEvents(imgEL, LightBox, imgState) {
  const ModalControls = LightBox.querySelector('.modalControls');
  const imgPrev = LightBox.querySelector('.modalPrev');
  const imgNext = LightBox.querySelector('.modalNext');

  let MultiGrope = false;
  let DragSpeed = 1.5;
  let lastDistance = 0;
  let lastScale = 1;

  function imgDistance(touch1, touch2) {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }

  LightBox.addEventListener('touchmove', (e) => {
    if (e.target !== imgEL) e.stopPropagation(), e.preventDefault();
  });

  imgEL.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    imgEL.style.transition = 'none';
    ModalControls.style.opacity = '0';
    imgPrev.style.opacity = '0';
    imgNext.style.opacity = '0';

    if (e.targetTouches[1]) {
      MultiGrope = true;
      imgState.TouchGrass.touchScale = true;
      lastDistance = imgDistance(e.targetTouches[0], e.targetTouches[1]);
      lastScale = imgState.scale;
    } else {
      MultiGrope = false;
      if (!imgState.TouchGrass.touchScale) {
        imgState.lastX = e.targetTouches[0].clientX;
        imgState.lastY = e.targetTouches[0].clientY;
      }
    }
  });

  imgEL.addEventListener('touchmove', (e) => {
    e.stopPropagation();
    e.preventDefault();
    imgEL.onclick = (e) => e.stopPropagation();

    if (e.targetTouches[1]) {
      const currentDistance = imgDistance(e.targetTouches[0], e.targetTouches[1]);
      const zoom = currentDistance / lastDistance;
      const centerX = LightBox.offsetWidth / 2;
      const centerY = LightBox.offsetHeight / 2;
      const pinchCenterX = (e.targetTouches[0].clientX + e.targetTouches[1].clientX) / 2;
      const pinchCenterY = (e.targetTouches[0].clientY + e.targetTouches[1].clientY) / 2;
      const prevScale = imgState.scale;

      imgState.scale = lastScale * zoom;
      imgState.scale = Math.max(1, Math.min(imgState.scale, 10));

      const imgELW = imgEL.offsetWidth * imgState.scale;
      const imgELH = imgEL.offsetHeight * imgState.scale;
      const imgBoxW = LightBox.offsetWidth;
      const imgBoxH = LightBox.offsetHeight;

      if (imgState.scale <= 1) {
        imgState.offsetX = 0;
        imgState.offsetY = 0;
        imgEL.style.transform = `translate(0px, 0px) scale(${imgState.scale})`;

      } else if (imgELW <= imgBoxW && imgELH >= imgBoxH) {
        const imgCenterY = imgState.offsetY + centerY;
        imgState.offsetY = pinchCenterY - ((pinchCenterY - imgCenterY) / prevScale) * imgState.scale - centerY;

        const EdgeY = (imgELH - imgBoxH) / 2;
        if (imgState.offsetY > EdgeY) imgState.offsetY = EdgeY;
        else if (imgState.offsetY < -EdgeY) imgState.offsetY = -EdgeY;

        imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${imgState.scale})`;

      } else if (imgELH <= imgBoxH && imgELW >= imgBoxW) {
        const imgCenterX = imgState.offsetX + centerX;
        imgState.offsetX = pinchCenterX - ((pinchCenterX - imgCenterX) / prevScale) * imgState.scale - centerX;

        const EdgeX = (imgELW - imgBoxW) / 2;
        if (imgState.offsetX > EdgeX) imgState.offsetX = EdgeX;
        else if (imgState.offsetX < -EdgeX) imgState.offsetX = -EdgeX;

        imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${imgState.scale})`;

      } else if (imgELW >= imgBoxW && imgELH >= imgBoxH) {
        const imgCenterX = imgState.offsetX + centerX;
        const imgCenterY = imgState.offsetY + centerY;

        imgState.offsetX = pinchCenterX - ((pinchCenterX - imgCenterX) / prevScale) * imgState.scale - centerX;
        imgState.offsetY = pinchCenterY - ((pinchCenterY - imgCenterY) / prevScale) * imgState.scale - centerY;

        const EdgeX = (imgELW - imgBoxW) / 2;
        const EdgeY = (imgELH - imgBoxH) / 2;

        if (imgState.offsetX > EdgeX) imgState.offsetX = EdgeX;
        else if (imgState.offsetX < -EdgeX) imgState.offsetX = -EdgeX;

        if (imgState.offsetY > EdgeY) imgState.offsetY = EdgeY;
        else if (imgState.offsetY < -EdgeY) imgState.offsetY = -EdgeY;

        imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
      }
    } else if (!imgState.TouchGrass.touchScale) {
      imgEL.style.transition = 'transform 60ms ease';

      const currentX = e.targetTouches[0].clientX;
      const currentY = e.targetTouches[0].clientY;
      const deltaX = (currentX - imgState.lastX) * DragSpeed;
      const deltaY = (currentY - imgState.lastY) * DragSpeed;

      const imgELW = imgEL.offsetWidth * imgState.scale;
      const imgELH = imgEL.offsetHeight * imgState.scale;
      const imgBoxW = LightBox.offsetWidth;
      const imgBoxH = LightBox.offsetHeight;

      if (imgState.scale <= 1) {
        imgState.offsetX = 0;
        imgState.offsetY = 0;
        imgEL.style.transform = `translate(0px, 0px) scale(${imgState.scale})`;

      } else if (imgELW <= imgBoxW && imgELH >= imgBoxH) {
        imgState.offsetY += deltaY;
        const EdgeY = (imgELH - imgBoxH) / 2;
        imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapTouch), -EdgeY - imgState.SnapTouch);
        imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${imgState.scale})`;

      } else if (imgELH <= imgBoxH && imgELW >= imgBoxW) {
        imgState.offsetX += deltaX;
        const EdgeX = (imgELW - imgBoxW) / 2;
        imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapTouch), -EdgeX - imgState.SnapTouch);
        imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${imgState.scale})`;

      } else if (imgELW >= imgBoxW && imgELH >= imgBoxH) {
        imgState.offsetX += deltaX;
        imgState.offsetY += deltaY;

        const EdgeX = (imgELW - imgBoxW) / 2;
        const EdgeY = (imgELH - imgBoxH) / 2;

        imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapTouch), -EdgeX - imgState.SnapTouch);
        imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapTouch), -EdgeY - imgState.SnapTouch);
        imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
      }

      imgState.lastX = currentX;
      imgState.lastY = currentY;
    }
  });

  imgEL.addEventListener('touchcancel', (e) => {
    e.stopPropagation();
    e.preventDefault();

    ModalControls.style.opacity = '1';
    imgPrev.style.opacity = '1';
    imgNext.style.opacity = '1';

    imgEL.onclick = undefined;
    MultiGrope = false;

    imgState.TouchGrass.touchScale = false;
    imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
    imgState.SDImageViewerSnapBack(imgEL, LightBox);
  });

  imgEL.addEventListener('touchend', (e) => {
    e.stopPropagation();
    imgEL.onclick = undefined;
    imgEL.style.transition = 'none';

    ModalControls.style.opacity = '1';
    imgPrev.style.opacity = '1';
    imgNext.style.opacity = '1';

    if (e.targetTouches.length === 0) {
      if (MultiGrope) MultiGrope = false; imgState.TouchGrass.touchScale = false;
      imgState.SDImageViewerSnapBack(imgEL, LightBox);
      setTimeout(() => {
        imgState.TouchGrass.touchScale = false;
      }, 10);
    }
  });
}
