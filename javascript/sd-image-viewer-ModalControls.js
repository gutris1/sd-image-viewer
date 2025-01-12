function SDImageViewerModalControls(imgEL, ModalControls, ModalClose) {
  const imgPrev = document.querySelector('#lightboxModal > .modalPrev');
  imgPrev.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
        width="32px" height="32px" viewBox="0 0 24 24">
      <path
        d="m4.431 12.822 13 9A1 1 0 0 0 19 21V3a1
        1 0 0 0-1.569-.823l-13 9a1.003 1.003 0 0 0 0 1.645z"/>
    </svg>
    `;

	const imgNext = document.querySelector('#lightboxModal > .modalNext');
  imgNext.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
        width="32px" height="32px" viewBox="0 0 24 24">
      <path
        d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1
        1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886z"/>
    </svg>
    `;

  const downloadSpan = document.createElement('span');
  downloadSpan.className = 'downloadImage cursor';
  downloadSpan.title = 'Download Image';
  downloadSpan.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"
        width="32" height="32" viewBox="0 0 32 32">
      <path fill="currentColor" stroke="currentColor" stroke-width="1.8"
        d="M26 24v4H6v-4H4v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4zm0-10
        l-1.41-1.41L17 20.17V2h-2v18.17l-7.59-7.58L6 14l10 10l10-10z"/>
    </svg>
    `;
  ModalControls.appendChild(downloadSpan);

  downloadSpan.addEventListener("click", function(e) {
    if (imgEL) {
      let imgUrl = encodeURI(imgEL.src);
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

  ModalClose.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
        width="37px" height="37px" viewBox="0 0 512 512">
      <path fill="currentColor" d="M330.443 256l136.765-136.765c14.058-14.058 14.058-36.85
        0-50.908l-23.535-23.535c-14.058-14.058-36.85-14.058-50.908 0L256 181.557L119.235
        44.792c-14.058-14.058-36.85-14.058-50.908 0L44.792 68.327c-14.058 14.058-14.058
        36.85 0 50.908L181.557 256L44.792 392.765c-14.058 14.058-14.058 36.85 0 50.908l23.535
        23.535c14.058 14.058 36.85 14.058 50.908 0L256 330.443l136.765 136.765c14.058 14.058
        36.85 14.058 50.908 0l23.535-23.535c14.058-14.058 14.058-36.85 0-50.908L330.443 256z"/>
    </svg>
    `;
}

function SDImageViewerToggleNextPrevButton() {
  const imgGallery = document.querySelectorAll('div[id^="tab_"] div[id$="_results"] .thumbnail-item > img');
  const imgSrc = new Set(Array.from(imgGallery).map(imgEL => imgEL.src));
  const imgPrev = document.querySelector('.modalPrev');
  const imgNext = document.querySelector('.modalNext');

  if (imgPrev && imgNext) {
    imgSrc.size > 1 ? 
      (imgPrev.style.display = 'flex', imgNext.style.display = 'flex') :
      (imgPrev.style.display = 'none', imgNext.style.display = 'none');
  }
}