if (document.querySelector('iframe.dronpg')) {
  document.querySelector('iframe.dronpg').focus();
  alert('There is an active editor on this page');
}
else {
  const iframe = document.createElement('iframe');
  iframe.classList.add('dronpg');
  iframe.src = chrome.runtime.getURL(
    '/data/window/index.html?print-background-color=transparent&runtime-resize=true&runtime-remote-download=true&runtime-report-close=true'
  );
  iframe.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    overflow: hidden;
    border: none;
  `;
  document.body.appendChild(iframe);
  window.focus();
  iframe.focus();

  window.onmessage = e => {
    console.log(e.data);
    if (e.data && e.data.method === 'download') {
      iframe.contentWindow.postMessage({method: 'hide-toolbar'}, '*');
      setTimeout(() => {
        chrome.runtime.sendMessage({
          method: 'download'
        }, href => {
          iframe.contentWindow.postMessage({method: 'show-toolbar'}, '*');
          const a = document.createElement('a');
          a.href = href;
          a.download = document.title + '.png';
          a.click();
        });
      }, 200);
    }
    else if (e.data && e.data.method === 'close') {
      iframe.remove();
      window.onmessage = undefined;
    }
  };
}

// do not add ;
true
