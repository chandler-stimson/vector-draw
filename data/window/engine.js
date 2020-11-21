/* global fabric, initAligningGuidelines, initCenteringGuidelines */

const DEFALUTS = {
  'brush-width': 10,
  'object-width': 200,
  'object-height': 200,
  'object-radius': 100,
  'object-stroke-width': 2,
  'object-angle': 0,
  'object-opacity': 1,
  'object-transparent': false,
  'object-preserve-object-stacking': true,
  'object-font-family': 'arial',
  'object-border-radius-x': 0,
  'object-border-radius-y': 0,
  'object-random-placement': 20,
  'object-control-offset': 20,
  'canvas-width': 800,
  'canvas-height': 600,
  'canvas-zoom': 1,
  'picker-front-color': '#5c6e91',
  'picker-background-color': '#eeeded',
  'snap-edges': true,
  'align-guidelines': true,
  'snap-center': true,
  'scale-step': 0.1,
  'rotate-step': 15,
  'move-step': 10,
  'print-quality': 1,
  'print-retina-scaling': false,
  'print-background-color': '',
  'runtime-resize': false,
  'runtime-tool': 'pen',
  'runtime-remote-download': false,
  'runtime-report-close': false,
  'snap-rotation-angle': 15
};
const args = new URLSearchParams(location.search);

const config = new Proxy({}, {
  get(o, name) {
    const v = args.get(name) || localStorage.getItem(name);
    if (v) {
      if (v === Number(v).toString()) {
        if (!config['runtime-resize'] || (name !== 'canvas-width' && name !== 'canvas-height')) {
          return Number(v);
        }
      }
      else if (v === 'true' || v === 'false') {
        return v === 'true';
      }
      else {
        return v;
      }
    }
    return DEFALUTS[name];
  },
  set(o, name, value) {
    if (config['runtime-resize'] && (name === 'canvas-width' || name === 'canvas-height')) {
      DEFALUTS[name] = value;
    }
    else {
      localStorage.setItem(name, value);
    }
    return true;
  }
});

if (config['print-background-color']) {
  document.body.style.setProperty('--canvas-bg', config['print-background-color']);
}

class CoreEngine {
  active(c, f = () => {}, group = false) {
    const o = this.canvas.getActiveObject();
    if (o) {
      if (o.type === 'activeSelection') {
        if (group) {
          c([o]);
        }
        else {
          const list = [];
          o.forEachObject(e => list.push(e));
          c(list);
        }
      }
      else if (o) {
        c([o]);
      }
    }
    else {
      f();
    }
  }
  refresh() {
    this.canvas.renderAll();
  }
  connect() {
    const c = document.querySelector('canvas');

    const canvas = this.canvas = new fabric.Canvas(c, {
      isDrawingMode: false,
      preserveObjectStacking: config['object-preserve-object-stacking']
    });

    canvas.freeDrawingBrush.width = config['brush-width'];
    canvas.freeDrawingBrush.color = config['picker-front-color'];

    // resize
    if (config['runtime-resize']) {
      const resize = () => {
        config['canvas-width'] = document.documentElement.clientWidth - 52;
        config['canvas-height'] = document.documentElement.offsetHeight;
        this.zoom(config['canvas-zoom']);
      };
      window.addEventListener('resize', resize);
      resize();
    }
    else {
      this.zoom(config['canvas-zoom']);
    }
    //
    if (config['align-guidelines']) {
      initAligningGuidelines(canvas);
    }
    if (config['snap-center']) {
      initCenteringGuidelines(canvas);
    }
    if (config['snap-edges']) {
      snap2edge(canvas, 10);
    }
    const view = document.querySelector('toolbar-view');
    // active on object section
    canvas.on({
      'selection:created': () => {
        view.enable('trash');
        view.enable('shape-view[name=stack]');
      },
      'selection:cleared': () => {
        view.disable('trash');
        view.disable('shape-view[name=stack]');
      },
      'history:append': () => {
        view.enable('undo');
      },
      'history:undo': () => {
        view.enable('redo');
        view[canvas.historyUndo.length ? 'enable' : 'disable']('undo');
      },
      'history:redo': () => {
        view.enable('undo');
        view[canvas.historyRedo.length ? 'enable' : 'disable']('redo');
      },
      'history:clear': () => {
        view.disable('undo');
        view.disable('redo');
      }
    });
    // rotation snap
    canvas.on('object:rotating', ({target}) => {
      let angle = target.angle;
      const locked = (Math.ceil( target.angle / config['snap-rotation-angle'])) * config['snap-rotation-angle'];
      if (Math.abs(angle - locked) < 5 || Math.abs(locked - angle) < 5) {
        angle = locked;
      }
      target.set({
        angle: angle
      });
    });
    // save changes
    {
      const unload = () => window.onbeforeunload = e => {
        const dialogText = 'There are unsaved changes. Would you like to discard any way?';
        e.returnValue = dialogText;
        return dialogText;
      };

      canvas.on('object:added', unload);
      canvas.on('object:removed', unload);
      canvas.on('object:modified', unload);
    }
    // change object color on color change;
    view.get('color-view').style.setProperty('--front-color', config['picker-front-color']);
    view.get('color-view').style.setProperty('--background-color', config['picker-background-color']);
    view.addEventListener('color-changed', e => {
      if (e.detail.type === 'front-color') {
        this.active(os => {
          os.forEach(o => {
            if (o.type === 'line' || o.type === 'path') {
              o.set('stroke', e.detail.value);
            }
            else {
              o.set('fill', e.detail.value);
            }
          });
          this.refresh();
        });
        config['picker-front-color'] = e.detail.value;
        canvas.freeDrawingBrush.color = config['picker-front-color'];
      }
      else {
        this.active(os => {
          os.forEach(o => {
            if (o.type !== 'i-text') {
              o.set('stroke', e.detail.value);
            }
          });
          this.refresh();
        });
        config['picker-background-color'] = e.detail.value;
      }
    });
    // select default tool
    if (config['runtime-tool']) {
      this[config['runtime-tool']]();
    }
  }
  resize() {
    this.canvas.setWidth(config['canvas-width']);
    this.canvas.setHeight(config['canvas-height']);
  }
  zoom(value) {
    this.canvas.setZoom(value);
    this.canvas.setWidth(config['canvas-width'] * value);
    this.canvas.setHeight(config['canvas-height'] * value);
  }
  prepare() {
    this.canvas.isDrawingMode = false;

    return {
      strokeUniform: true,
      fill: config['object-transparent'] ? 'transparent' : config['picker-front-color'],
      stroke: config['picker-background-color'],
      strokeWidth: config['object-stroke-width'],
      opacity: config['object-opacity'],
      angle: config['object-angle'],
      rx: config['object-border-radius-x'],
      ry: config['object-border-radius-y'],
      originX: 'center',
      originY: 'center',
      left: config['canvas-width'] / 2 + (Math.random() - 0.5) * config['object-random-placement'],
      top: config['canvas-height'] / 2 + (Math.random() - 0.5) * config['object-random-placement']
    };
  }
  circle() {
    const radius = Math.min(
      config['object-radius'],
      config['canvas-width'] / 2 - config['object-stroke-width'],
      config['canvas-height'] / 2 - config['object-stroke-width']
    );
    const circle = new fabric.Circle({
      ...this.prepare(),
      radius
    });
    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
  }
  rect() {
    const width = Math.min(
      config['object-width'],
      config['canvas-width'] - config['object-stroke-width']
    );
    const height = Math.min(
      config['object-height'],
      config['canvas-height'] - config['object-stroke-width']
    );
    const rect = new fabric.Rect({
      ...this.prepare(),
      width,
      height
    });
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
  }
  polygon() {
    const edges = Number(prompt('Number of edges', 3));
    if (isNaN(edges) === false && edges > 2) {
      const radius = Math.min(
        config['object-radius'],
        config['canvas-width'] / 2 - config['object-stroke-width'],
        config['canvas-height'] / 2 - config['object-stroke-width']
      );
      const points = Array(edges).fill(0).map((v, i) => ({
        x: radius * Math.sin(Math.PI * 2 / edges * i),
        y: radius * Math.cos(Math.PI * 2 / edges * i)
      }));
      const shape = new fabric.Polygon(points, {
        ...this.prepare()
      });
      this.canvas.add(shape);
      this.canvas.setActiveObject(shape);
    }
  }
  line() {
    const {canvas} = this;
    const width = Math.min(
      config['object-width'],
      config['canvas-width'] - config['object-stroke-width']
    );
    const height = Math.min(
      config['object-height'],
      config['canvas-height'] / this.canvas.getZoom() - config['object-stroke-width']
    );

    const props = this.prepare();
    props.stroke = props.fill;

    const line = new fabric.Line([-1 * width / 2, -1 * height / 2, width / 2, height / 2], {
      ...props,
      objectCaching: false
    });

    canvas.add(line);
    canvas.setActiveObject(line);
  }
  text() {
    const o = this.prepare();
    delete o.stroke;
    o.fill = config['picker-front-color']; // even on transparent mode
    const text = new fabric.IText('Text', {
      ...o,
      fontFamily: config['object-font-family']
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
  }
  pen() {
    this.canvas.isDrawingMode = true;
  }
  hand() {
    this.canvas.isDrawingMode = false;
    this.canvas.discardActiveObject();
    this.refresh();
  }
  trash() {
    const {canvas} = this;
    this.active(os => {
      canvas.discardActiveObject();
      os.forEach(e => canvas.remove(e));
    });
  }
  sendBackwards() {
    this.active(([o]) => this.canvas.sendBackwards(o), undefined, true);
  }
  sendToBack() {
    this.active(([o]) => this.canvas.sendToBack(o), undefined, true);
  }
  bringForward() {
    this.active(([o]) => this.canvas.bringForward(o), undefined, true);
  }
  bringToFront() {
    this.active(([o]) => this.canvas.bringToFront(o), undefined, true);
  }
  undo() {
    this.canvas.undo();
  }
  redo() {
    this.canvas.redo();
  }
  export() {
    const href = 'data:image/svg+xml;utf8,' + encodeURIComponent(this.canvas.toSVG());
    this.download(undefined, 'svg', href);
  }
  download(filename, format = 'png', href) {
    this.canvas.discardActiveObject();
    this.refresh();
    window.onbeforeunload = null;

    if (config['runtime-remote-download']) {
      parent.postMessage({
        method: 'download'
      }, '*');
    }
    else {
      href = href || this.canvas.toDataURL({
        format,
        quality: config['print-quality'],
        enableRetinaScaling: config['print-retina-scaling']
      });

      const a = document.createElement('a');
      a.href = href;
      a.download = 'image.' + format;
      a.click();
    }
  }
  import(file) {
    const {canvas} = this;
    const r = new FileReader();
    r.onload = () => {
      canvas.isDrawingMode = false;
      if (file.type && file.type.startsWith('image/svg')) {
        fabric.loadSVGFromURL(r.result, os => {
          os.forEach(o => canvas.add(o));

          const selection = new fabric.ActiveSelection(os, {canvas});
          canvas.setActiveObject(selection);
          this.refresh();
        });
      }
      else {
        const img = new Image();
        img.src = r.result;
        img.onload = () => {
          const image = new fabric.Image(img);
          image.set({
            left: 10,
            top: 10,
            width: Math.min(img.naturalHeight, config['canvas-width'] - 20),
            height: Math.min(img.naturalWidth, config['canvas-height'] - 20)
          });
          canvas.add(image);
          canvas.setActiveObject(image);
          this.refresh();
        };
      }
    };
    r.readAsDataURL(file);
  }
}
