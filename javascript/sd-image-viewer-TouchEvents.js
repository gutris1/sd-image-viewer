function SDImageViewerTouchEvents(imgEL, LightBox, imgState) {
  let MultiGrope = false;
  let velocityX = 0;
  let velocityY = 0;

  LightBox.addEventListener('touchmove', (e) => {
    if (e.target !== imgEL) e.stopPropagation(), e.preventDefault();
  });

  imgEL.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    imgEL.style.transition = 'none';
    velocityX = 0;
    velocityY = 0;

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
        imgState.LastTouch = Date.now();
      }
    }
  });

  imgEL.addEventListener('touchmove', (e) => {
    e.stopPropagation();
    e.preventDefault();
    imgEL.onclick = (e) => e.stopPropagation();
    imgEL.style.transition = 'none';

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

      imgState.offsetX = deltaCenterX - ((deltaCenterX - imgCenterX) / lastScale) * imgState.scale - centerX;
      imgState.offsetY = deltaCenterY - ((deltaCenterY - imgCenterY) / lastScale) * imgState.scale - centerY;
      imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;

    } else if (!imgState.TouchGrass.touchScale) {
      let now = Date.now();
      let currentX = e.targetTouches[0].clientX;
      let currentY = e.targetTouches[0].clientY;
      let deltaX = currentX - imgState.lastX;
      let deltaY = currentY - imgState.lastY;
      let timeDelta = now - imgState.LastTouch;

      velocityX = deltaX / timeDelta;
      velocityY = deltaY / timeDelta;

      imgState.offsetX += deltaX;
      imgState.offsetY += deltaY;
      imgState.lastX = currentX;
      imgState.lastY = currentY;
      imgState.LastTouch = now;

      const imgELW = imgEL.offsetWidth * imgState.scale;
      const imgELH = imgEL.offsetHeight * imgState.scale;
      const imgBoxW = LightBox.offsetWidth;
      const imgBoxH = LightBox.offsetHeight;

      if (imgELW <= imgBoxW) {
        imgState.offsetX = 0;
      } else {
        const EdgeX = (imgELW - imgBoxW) / 2;
        if (imgState.offsetX > EdgeX + imgState.SnapMeter) imgState.offsetX = EdgeX + imgState.SnapMeter;
        else if (imgState.offsetX < -EdgeX - imgState.SnapMeter) imgState.offsetX = -EdgeX - imgState.SnapMeter;
      }

      if (imgELH <= imgBoxH) {
        imgState.offsetY = 0;
      } else {
        const EdgeY = (imgELH - imgBoxH) / 2;
        if (imgState.offsetY > EdgeY + imgState.SnapMeter) imgState.offsetY = EdgeY + imgState.SnapMeter;
        else if (imgState.offsetY < -EdgeY - imgState.SnapMeter) imgState.offsetY = -EdgeY - imgState.SnapMeter;
      }
  
      imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
    }
  });

  imgEL.addEventListener('touchcancel', (e) => {
    e.stopPropagation();
    e.preventDefault();
    imgEL.onclick = undefined;
    imgEL.style.transition = 'none';
    imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
    MultiGrope = false;
    imgState.TouchGrass.touchScale = false;
  });

  imgEL.addEventListener('touchend', (e) => {
    e.stopPropagation();
    imgEL.onclick = undefined;
    imgEL.style.transition = 'none';

    if (e.targetTouches.length === 0) {
      if (MultiGrope) {
        MultiGrope = false;
        imgState.TouchGrass.touchScale = false;
      } else {
        if (!imgState.TouchGrass.touchScale && (Math.abs(velocityX) > 0.05 || Math.abs(velocityY) > 0.05)) {
          TouchMomentum();
        }
      }

      setTimeout(() => {
        imgState.TouchGrass.touchScale = false;
      }, 10);
    }
  });

  function TouchMomentum() {
    let momentumDecay = 0.95;
    let momentumMultiplier = 15;
    let momentumThreshold = 0.05;
  
    if (Math.abs(velocityX) > momentumThreshold || Math.abs(velocityY) > momentumThreshold) {
      imgState.offsetX += velocityX * momentumMultiplier;
      imgState.offsetY += velocityY * momentumMultiplier;
      velocityX *= momentumDecay;
      velocityY *= momentumDecay;
      imgEL.style.transform = `translate(${imgState.offsetX}px, ${imgState.offsetY}px) scale(${imgState.scale})`;
      requestAnimationFrame(TouchMomentum);
    } else {
      velocityX = 0;
      velocityY = 0;
    }
  }
}