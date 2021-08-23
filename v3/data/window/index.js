/* global Engine, config */

const engine = new Engine();
engine.connect();

document.querySelector('toolbar-view').addEventListener('object', e => {
  const object = e.detail.id;
  if (object === 'close' && config['runtime-report-close']) {
    if (window.onbeforeunload) {
      if (confirm(window.onbeforeunload({})) === false) {
        return;
      }
    }
    parent.postMessage({
      method: 'close'
    }, '*');
  }
  else if (object === 'close') {
    window.close();
  }
  else {
    engine[object]();
  }
});

// remote control
window.onmessage = e => {
  const request = e.data;
  if (request.method === 'resize') {
    config['canvas-width'] = request.width || 600;
    config['canvas-height'] = request.height || 600;
    engine.resize();
  }
  else if (request.method === 'zoom') {
    engine.zoom(request.level);
  }
  else if (request.method === 'download') {
    engine.download(request.filename, request.format);
  }
  else if (request.method === 'hide-toolbar') {
    document.querySelector('toolbar-view').style.visibility = 'hidden';
  }
  else if (request.method === 'show-toolbar') {
    document.querySelector('toolbar-view').style.visibility = 'visible';
  }
};

// load svg and image
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();
  for (const file of [...e.dataTransfer.files]) {
    if (file.type && file.type.startsWith('image/')) {
      engine.import(file);
    }
  }
});
