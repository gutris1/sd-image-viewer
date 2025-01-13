function SDImageViewerTouchEvents(imgEL, LightBox, imgState) {
  const ModalControls = LightBox.querySelector('.modalControls');
  const imgPrev = LightBox.querySelector('.modalPrev');
  const imgNext = LightBox.querySelector('.modalNext');

  let MultiGrope = false;
  let DragSpeed = 1.5;

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
      imgState.TouchGrass.last1X = e.targetTouches[0].clientX;
      imgState.TouchGrass.last1Y = e.targetTouches[0].clientY;
      imgState.TouchGrass.last2X = e.targetTouches[1].clientX;
      imgState.TouchGrass.last2Y = e.targetTouches[1].clientY;
      imgState.TouchGrass.scale = imgState.scale;
      imgState.lastLen = Math.sqrt(
        Math.pow(imgState.TouchGrass.last2X - imgState.TouchGrass.last1X, 2) +
        Math.pow(imgState.TouchGrass.last2Y - imgState.TouchGrass.last1Y, 2)
      );
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
    imgEL.style.transition = 'transform 60ms ease';

    if (e.targetTouches[1]) {
      imgState.TouchGrass.delta1X = e.targetTouches[0].clientX;
      imgState.TouchGrass.delta1Y = e.targetTouches[0].clientY;
      imgState.TouchGrass.delta2X = e.targetTouches[1].clientX;
      imgState.TouchGrass.delta2Y = e.targetTouches[1].clientY;
      let centerX = LightBox.offsetWidth / 2;
      let centerY = LightBox.offsetHeight / 2;
      let deltaLen = Math.sqrt(
        Math.pow(imgState.TouchGrass.delta2X - imgState.TouchGrass.delta1X, 2) +
        Math.pow(imgState.TouchGrass.delta2Y - imgState.TouchGrass.delta1Y, 2)
      );

      let zoom = deltaLen / imgState.lastLen;
      let lastScale = imgState.scale;
      imgState.scale = imgState.TouchGrass.scale * zoom;
      imgState.scale = Math.max(1, imgState.scale);
      imgState.scale = Math.min(imgState.scale, 10);

      let deltaCenterX = imgState.TouchGrass.delta1X + (imgState.TouchGrass.delta2X - imgState.TouchGrass.delta1X) / 2;
      let deltaCenterY = imgState.TouchGrass.delta1Y + (imgState.TouchGrass.delta2Y - imgState.TouchGrass.delta1Y) / 2;
      let imgCenterX = imgState.offsetX + centerX;
      let imgCenterY = imgState.offsetY + centerY;

      const imgELW = imgEL.offsetWidth * imgState.scale;
      const imgELH = imgEL.offsetHeight * imgState.scale;
      const imgBoxW = LightBox.offsetWidth;
      const imgBoxH = LightBox.offsetHeight;

      let newOffsetX = deltaCenterX - ((deltaCenterX - imgCenterX) / lastScale) * imgState.scale - centerX;
      let newOffsetY = deltaCenterY - ((deltaCenterY - imgCenterY) / lastScale) * imgState.scale - centerY;

      if (imgState.scale <= 1) {
        imgState.offsetX = 0;
        imgState.offsetY = 0;
        imgEL.style.transform = `translate(0px, 0px) scale(${imgState.scale})`;

      } else if (imgELW <= imgBoxW && imgELH >= imgBoxH) {
        imgState.offsetX = 0;
        imgState.offsetY = newOffsetY;
        const EdgeY = (imgELH - imgBoxH) / 2;
        imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapTouch), -EdgeY - imgState.SnapTouch);
        imgEL.style.transform = `translateY(${imgState.offsetY}px) scale(${imgState.scale})`;

      } else if (imgELH <= imgBoxH && imgELW >= imgBoxW) {
        imgState.offsetX = newOffsetX;
        imgState.offsetY = 0;
        const EdgeX = (imgELW - imgBoxW) / 2;
        imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapTouch), -EdgeX - imgState.SnapTouch);
        imgEL.style.transform = `translateX(${imgState.offsetX}px) scale(${imgState.scale})`;

      } else if (imgELW >= imgBoxW && imgELH >= imgBoxH) {
        imgState.offsetX = newOffsetX;
        imgState.offsetY = newOffsetY;

        const EdgeX = (imgELW - imgBoxW) / 2;
        imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapTouch), -EdgeX - imgState.SnapTouch);

        const EdgeY = (imgELH - imgBoxH) / 2;
        imgState.offsetY = Math.max(Math.min(imgState.offsetY, EdgeY + imgState.SnapTouch), -EdgeY - imgState.SnapTouch);

        imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
      }

    } else if (!imgState.TouchGrass.touchScale) {
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
        imgState.offsetX = Math.max(Math.min(imgState.offsetX, EdgeX + imgState.SnapTouch), -EdgeX - imgState.SnapTouch);

        const EdgeY = (imgELH - imgBoxH) / 2;
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
